/**
 * POST /api/simulator/evaluate
 * Evalúa el razonamiento clínico del estudiante con IA.
 * Body: { session_id }
 * Devuelve: { score: 0-100, feedback: string }
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';

const EVAL_PROMPT = (profile, objectives, conversation) =>
  `Eres un docente de medicina evaluando a un médico en formación en una simulación clínica.

Perfil real del paciente (diagnóstico correcto y hallazgos):
${profile}

${objectives ? `Objetivos de aprendizaje: ${objectives}\n` : ''}
Conversación de la simulación:
${conversation}

Evalúa el razonamiento clínico del médico considerando:
1. ¿Realizó una anamnesis completa y sistemática?
2. ¿Preguntó por antecedentes, factores de riesgo y síntomas asociados relevantes?
3. ¿Solicitó los exámenes o exploraciones apropiadas?
4. ¿Llegó al diagnóstico correcto o propuso diagnósticos diferenciales razonables?
5. ¿El plan de manejo propuesto fue adecuado?

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto adicional):
{"score": <entero 0-100>, "feedback": "<retroalimentación en español, 3-5 oraciones, menciona aciertos y áreas de mejora>"}`;

async function callAI(provider, apiKey, prompt) {
  if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512 },
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'openai' || provider === 'groq') {
    const endpoint = provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const model = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens: 512, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  throw new Error(`Proveedor desconocido: ${provider}`);
}

export async function POST(request) {
  const { profile, user } = await getSessionProfile();
  if (!profile) return Response.json({ error: 'No autenticado' }, { status: 401 });

  const { session_id } = await request.json();
  if (!session_id) return Response.json({ error: 'session_id requerido' }, { status: 400 });

  const admin = createAdminClient();

  // Cargar sesión — verificando que pertenezca al usuario
  const { data: session } = await admin
    .from('simulation_sessions')
    .select('id, user_id, case_id, messages, status')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single();

  if (!session) return Response.json({ error: 'Sesión no encontrada' }, { status: 404 });
  if (session.messages.length < 2) {
    return Response.json({ error: 'La consulta tiene muy pocas interacciones para evaluar' }, { status: 400 });
  }

  // Cargar patient_profile con service role (nunca llega al cliente)
  const { data: clinicalCase } = await admin
    .from('clinical_cases')
    .select('patient_profile, learning_objectives')
    .eq('id', session.case_id)
    .single();

  if (!clinicalCase) return Response.json({ error: 'Caso no encontrado' }, { status: 404 });

  // BYOK
  const { data: aiKey } = await admin
    .from('user_ai_keys')
    .select('provider, api_key_encrypted')
    .eq('user_id', user.id)
    .maybeSingle();

  const provider = aiKey?.provider || 'gemini';
  const apiKey = aiKey?.api_key_encrypted || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: 'Clave de IA no configurada' }, { status: 503 });
  }

  const conversation = session.messages
    .map((m) => `${m.role === 'user' ? 'Médico' : 'Paciente'}: ${m.content}`)
    .join('\n');

  const prompt = EVAL_PROMPT(clinicalCase.patient_profile, clinicalCase.learning_objectives, conversation);

  try {
    const rawText = await callAI(provider, apiKey, prompt);
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('La IA no devolvió JSON válido');

    const { score, feedback } = JSON.parse(match[0]);

    await admin
      .from('simulation_sessions')
      .update({ score, feedback, status: 'completed' })
      .eq('id', session_id);

    return Response.json({ score, feedback });
  } catch (err) {
    return Response.json({ error: 'Error al evaluar: ' + err.message }, { status: 500 });
  }
}
