import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import WaitlistForm from '@/components/WaitlistForm';
import EnrollButton from '@/components/EnrollButton';

export const dynamic = 'force-dynamic';

const KIND_LABEL = { diplomado: 'Diplomado', magister: 'Magíster', curso: 'Curso' };
const KIND_COLOR = {
  diplomado: 'bg-brand-50 text-brand-700',
  magister: 'bg-purple-50 text-purple-700',
  curso: 'bg-green-50 text-green-700',
};

const FEATURES = [
  { icon: '🎓', title: 'Contenido clínico especializado', desc: 'Videos, documentos y casos clínicos curados por expertos en urología.' },
  { icon: '✅', title: 'Evaluaciones seguras', desc: 'Quizzes calificados en el servidor. Tus respuestas nunca llegan al navegador.' },
  { icon: '🤖', title: 'Tutor IA 24/7', desc: 'Pregunta sobre el contenido en cualquier momento. Respuestas basadas en el material del programa.' },
  { icon: '🏆', title: 'Certificación verificable', desc: 'Certificados con código único y QR verificable públicamente.' },
  { icon: '💬', title: 'Comunidad médica', desc: 'Tópicos clínicos, comentarios y discusión entre pares con anonimización automática.' },
  { icon: '📱', title: 'Acceso en cualquier dispositivo', desc: 'Plataforma web optimizada para móvil e instalable como app.' },
];

export default async function Home() {
  const supabase = createClient();

  const { data: programs } = await supabase
    .from('programs')
    .select('id, slug, title, description, kind, is_free, program_prices(id, name, amount_clp, is_active, valid_until)')
    .eq('published', true)
    .order('created_at');

  // Verificar si hay sesión activa para mostrar CTA correcta
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-cyan-700 px-8 py-16 text-white">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-100 mb-4">
            Campus Urología Sur
          </span>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Formación de posgrado en urología
          </h1>
          <p className="mt-4 text-lg text-brand-100 leading-relaxed">
            Diplomados y programas de magíster diseñados por expertos.
            Contenido protegido, evaluaciones seguras y comunidad médica activa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link href="/dashboard" className="btn bg-white text-brand-800 hover:bg-brand-50 font-bold">
                Ir al dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn bg-white text-brand-800 hover:bg-brand-50 font-bold">
                  Acceso alumnos
                </Link>
                <a href="#programas" className="btn border border-white/40 text-white hover:bg-white/10">
                  Ver programas ↓
                </a>
              </>
            )}
          </div>
        </div>
        {/* Decoración */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 right-32 h-40 w-40 rounded-full bg-white/5" />
      </section>

      {/* Características */}
      <section>
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Una plataforma diseñada para médicos
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Cada detalle pensado para la educación médica de posgrado
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programas */}
      <section id="programas">
        <h2 className="text-2xl font-bold text-slate-900">Programas disponibles</h2>
        <p className="mt-1 text-sm text-slate-500">
          Inscríbete o regístrate en lista de espera
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {(programs || []).map((p) => {
            const activePrice = p.program_prices?.find(
              (pr) => pr.is_active && (!pr.valid_until || new Date(pr.valid_until) > new Date())
            );

            return (
              <div key={p.id} className="card flex flex-col overflow-hidden">
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${KIND_COLOR[p.kind] || 'bg-slate-100 text-slate-600'}`}>
                      {KIND_LABEL[p.kind] || p.kind}
                    </span>
                    {p.is_free && (
                      <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700">
                        Gratuito
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-4">
                    {p.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-5">
                  {p.is_free ? (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-green-600">Gratuito</span>
                      {user ? (
                        <Link href="/dashboard" className="btn-primary text-sm">
                          Ver mis programas
                        </Link>
                      ) : (
                        <Link href="/login" className="btn-primary text-sm">
                          Solicitar acceso
                        </Link>
                      )}
                    </div>
                  ) : activePrice ? (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-2xl font-black text-brand-700">
                          ${activePrice.amount_clp?.toLocaleString('es-CL')}
                        </p>
                        <p className="text-xs text-slate-400">CLP · {activePrice.name}</p>
                      </div>
                      {user ? (
                        <EnrollButton programId={p.id} priceId={activePrice.id} />
                      ) : (
                        <Link href="/login" className="btn-primary text-sm shrink-0">
                          Iniciar sesión para inscribirse
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-2">
                        Próximamente · Regístrate para ser notificado
                      </p>
                      <WaitlistForm programId={p.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {(!programs || programs.length === 0) && (
            <p className="text-sm text-slate-500 col-span-2">Aún no hay programas publicados.</p>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="rounded-3xl bg-slate-900 px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-bold">¿Tienes preguntas?</h2>
        <p className="mt-2 text-slate-400">
          Contáctanos y te ayudamos a elegir el programa adecuado para tu formación.
        </p>
        <a
          href="mailto:info@urologiasur.cl"
          className="btn mt-6 bg-white text-slate-900 hover:bg-slate-100 font-bold"
        >
          info@urologiasur.cl
        </a>
      </section>
    </div>
  );
}
