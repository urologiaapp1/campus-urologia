'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ── Cursos de ejemplo visuales ──────────────────────────────── */
const SAMPLE_COURSES = [
  {
    id: 'sample-1',
    title: 'Diplomado en Cirugía Reconstructiva Uretral',
    description: 'Programa de formación avanzada en técnicas de uretroplastia, injertos de mucosa bucal, manejo del liquen escleroso y cirugía posterior traumática. Basado en el Textbook of Martins 2020 y el Club de la Uretra.',
    kind: 'diplomado',
    duration: '6 meses',
    modules: 12,
    level: 'Avanzado',
    color: 'from-brand-600 to-cyan-600',
    icon: '🔬',
    slug: 'cirugia-reconstructiva-uretral',
    isReal: false,
  },
  {
    id: 'sample-2',
    title: 'Urolitiasis: del Diagnóstico a la Intervención',
    description: 'Manejo integral de la litiasis urinaria. Evaluación metabólica, litotripsia extracorpórea, ureteroscopía flexible y cirugía percutánea. Casos clínicos reales con análisis de evidencia.',
    kind: 'diplomado',
    duration: '4 meses',
    modules: 8,
    level: 'Intermedio',
    color: 'from-indigo-600 to-violet-600',
    icon: '⚡',
    slug: null,
    isReal: false,
  },
  {
    id: 'sample-3',
    title: 'Oncología Urológica: Próstata y Vejiga',
    description: 'Diagnóstico, estadificación y tratamiento del cáncer de próstata y vejiga. Prostatectomía radical robótica, cistectomía con derivación urinaria, inmunoterapia y seguimiento oncológico.',
    kind: 'magister',
    duration: '12 meses',
    modules: 20,
    level: 'Avanzado',
    color: 'from-purple-600 to-pink-600',
    icon: '🎯',
    slug: null,
    isReal: false,
  },
  {
    id: 'sample-4',
    title: 'Incontinencia y Suelo Pélvico',
    description: 'Diagnóstico urodinámico, cabestrillos suburetrales, esfínter artificial, tratamiento de la vejiga hiperactiva e incontinencia femenina y masculina post-prostatectomía.',
    kind: 'curso',
    duration: '3 meses',
    modules: 6,
    level: 'Intermedio',
    color: 'from-emerald-600 to-teal-600',
    icon: '💧',
    slug: null,
    isReal: false,
  },
  {
    id: 'sample-5',
    title: 'Endoscopía Urológica Avanzada',
    description: 'Cistoscopía, ureteroscopía rígida y flexible, resección transuretral de próstata y vejiga, láser Holmium y litotripsia intracorpórea. Técnica y prevención de complicaciones.',
    kind: 'curso',
    duration: '2 meses',
    modules: 5,
    level: 'Básico-Intermedio',
    color: 'from-amber-500 to-orange-600',
    icon: '🔭',
    slug: null,
    isReal: false,
  },
];

const KIND_LABEL = { diplomado: 'Diplomado', magister: 'Magíster', curso: 'Curso' };
const KIND_COLOR = {
  diplomado: 'bg-brand-100 text-brand-700',
  magister: 'bg-purple-100 text-purple-700',
  curso: 'bg-emerald-100 text-emerald-700',
};
const LEVEL_COLOR = {
  'Básico': 'bg-green-50 text-green-700',
  'Básico-Intermedio': 'bg-green-50 text-green-700',
  'Intermedio': 'bg-amber-50 text-amber-700',
  'Avanzado': 'bg-red-50 text-red-700',
};

const STATS = [
  { value: '1.200+', label: 'Médicos formados' },
  { value: '15', label: 'Programas disponibles' },
  { value: '98%', label: 'Tasa de satisfacción' },
  { value: '24/7', label: 'Acceso al contenido' },
];

const HOW = [
  { step: '01', title: 'Elige tu programa', desc: 'Navega el catálogo y filtra por especialidad, duración y nivel.' },
  { step: '02', title: 'Inscríbete', desc: 'Pago seguro, código de acceso o matrícula directa según el programa.' },
  { step: '03', title: 'Aprende a tu ritmo', desc: 'Accede al contenido, interactúa con el tutor IA y completa las evaluaciones.' },
];

/* ── Componente de código de acceso ─────────────────────────── */
function AccessCodeSection({ isLoggedIn }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus('loading');
    const res = await fetch('/api/enroll/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('ok');
      setMsg(data.message || '¡Acceso concedido! Redirigiendo…');
      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
    } else {
      setStatus('error');
      setMsg(data.error || 'Código inválido o expirado.');
    }
  }

  return (
    <section className="rounded-3xl bg-gradient-to-br from-brand-900 to-brand-700 px-8 py-14 text-white">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
          🔑
        </div>
        <h2 className="text-2xl font-bold">¿Tienes un código de acceso?</h2>
        <p className="mt-2 text-brand-200">
          Si tu institución o un docente te entregó un código, ingrésalo aquí para matricularte directamente.
        </p>
        {!isLoggedIn ? (
          <div className="mt-6 rounded-2xl bg-white/10 p-5">
            <p className="text-sm text-brand-200">Primero inicia sesión para usar tu código.</p>
            <Link href="/login" className="btn mt-3 bg-white text-brand-800 hover:bg-brand-50 font-bold">
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus(null); }}
              placeholder="XXXXXXXX"
              maxLength={20}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-lg font-mono font-bold uppercase tracking-widest text-white placeholder-white/40 outline-none focus:border-white focus:bg-white/20 sm:flex-1"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !code.trim()}
              className="w-full rounded-xl bg-white px-6 py-3 font-bold text-brand-800 transition hover:bg-brand-50 disabled:opacity-50 sm:w-auto"
            >
              {status === 'loading' ? '…' : 'Acceder'}
            </button>
          </form>
        )}
        {msg && (
          <p className={`mt-3 text-sm font-medium ${status === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export default function LandingPage({ programs, user }) {
  const [query, setQuery] = useState('');

  // Combinar cursos reales con ejemplos (ejemplos solo si hay < 3 reales)
  const realCourses = (programs || []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    kind: p.kind,
    duration: null,
    modules: null,
    level: null,
    color: p.kind === 'magister' ? 'from-purple-600 to-pink-600'
         : p.kind === 'curso' ? 'from-emerald-600 to-teal-600'
         : 'from-brand-600 to-cyan-600',
    icon: p.kind === 'magister' ? '🎓' : p.kind === 'curso' ? '📋' : '🔬',
    slug: p.slug,
    isReal: true,
    price: p.program_prices?.find((pr) => pr.is_active && (!pr.valid_until || new Date(pr.valid_until) > new Date())),
    is_free: p.is_free,
  }));

  const displayCourses = realCourses.length >= 3
    ? realCourses
    : [...realCourses, ...SAMPLE_COURSES.filter((s) => !realCourses.some((r) => r.slug === s.slug))];

  const filtered = useMemo(() => {
    if (!query.trim()) return displayCourses;
    const q = query.toLowerCase();
    return displayCourses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );
  }, [query, displayCourses]);

  return (
    <div className="-mx-4 -mt-8">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-cyan-700 px-6 py-20 text-white">
        {/* Círculos decorativos */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-64 w-64 rounded-full bg-cyan-400/10" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Campus Urología Sur
          </span>

          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Formación de posgrado<br />
            <span className="text-brand-300">en urología</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-100 leading-relaxed">
            Diplomados, magísteres y cursos diseñados por especialistas.
            Aprende a tu ritmo con contenido protegido, evaluaciones seguras
            y comunidad médica activa.
          </p>

          {/* Buscador */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="flex items-center rounded-2xl bg-white shadow-xl shadow-black/20">
              <span className="pl-4 text-slate-400">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cursos, diplomados, especialidades…"
                className="flex-1 rounded-2xl bg-transparent px-3 py-4 text-sm text-slate-800 outline-none placeholder-slate-400"
              />
              {query && (
                <button onClick={() => setQuery('')} className="pr-4 text-slate-300 hover:text-slate-500">✕</button>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn bg-white text-brand-800 hover:bg-brand-50 font-bold shadow-lg">
                Ir a mis programas →
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn bg-white text-brand-800 hover:bg-brand-50 font-bold shadow-lg">
                  Acceso alumnos
                </Link>
                <a href="#programas" className="btn border border-white/30 text-white backdrop-blur hover:bg-white/10">
                  Ver programas ↓
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-brand-600">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cursos ────────────────────────────────────────────── */}
      <section id="programas" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {query ? `Resultados para "${query}"` : 'Programas disponibles'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} {filtered.length === 1 ? 'programa encontrado' : 'programas encontrados'}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-3xl">🔍</p>
              <p className="mt-3 font-medium text-slate-700">Sin resultados para "{query}"</p>
              <button onClick={() => setQuery('')} className="mt-3 text-sm text-brand-600 hover:underline">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CourseCard key={c.id} course={c} user={user} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">¿Cómo funciona?</h2>
          <p className="mt-2 text-center text-sm text-slate-500">Tres pasos para empezar tu formación</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {HOW.map((h) => (
              <div key={h.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-xl font-black text-brand-600">
                  {h.step}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{h.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Código de acceso ──────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <AccessCodeSection isLoggedIn={!!user} />
        </div>
      </section>

      {/* ── Características ───────────────────────────────────── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Una plataforma diseñada para médicos
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🔬', title: 'Contenido clínico especializado', desc: 'Videos, documentos y casos curados por expertos en urología.' },
              { icon: '✅', title: 'Evaluaciones seguras', desc: 'Quizzes calificados en el servidor. Las respuestas nunca llegan al navegador.' },
              { icon: '🤖', title: 'Tutor IA 24/7', desc: 'Asistente inteligente entrenado con el contenido del programa.' },
              { icon: '🏆', title: 'Certificación verificable', desc: 'Certificados con código único y QR verificable públicamente.' },
              { icon: '💬', title: 'Comunidad médica', desc: 'Tópicos clínicos con anonimización automática de datos sensibles.' },
              { icon: '🩺', title: 'Simulador de paciente', desc: 'Practica tu anamnesis con pacientes virtuales generados por IA.' },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-md">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-900 to-brand-700 px-6 py-14 text-center text-white">
        <h2 className="text-2xl font-bold">¿Tienes preguntas?</h2>
        <p className="mt-2 text-brand-200">Contáctanos y te ayudamos a elegir el programa adecuado.</p>
        <a href="mailto:info@urologiasur.cl"
          className="btn mt-6 bg-white text-brand-800 hover:bg-brand-50 font-bold shadow-lg">
          info@urologiasur.cl
        </a>
      </section>

    </div>
  );
}

/* ── Card de curso ───────────────────────────────────────────── */
function CourseCard({ course: c, user }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Banner de color */}
      <div className={`relative h-36 bg-gradient-to-br ${c.color} p-5 text-white`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              {KIND_LABEL[c.kind] || c.kind}
            </span>
            {c.level && (
              <span className="rounded-lg bg-black/20 px-2.5 py-1 text-xs font-medium">
                {c.level}
              </span>
            )}
          </div>
          <span className="text-4xl">{c.icon}</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{c.title}</h3>
        <p className="mt-2 flex-1 text-xs text-slate-500 leading-relaxed line-clamp-3">
          {c.description}
        </p>

        {/* Meta */}
        {(c.duration || c.modules) && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            {c.duration && <span>⏱ {c.duration}</span>}
            {c.modules && <span>📚 {c.modules} módulos</span>}
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          {c.isReal ? (
            c.is_free ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600">Gratuito</span>
                <Link href={user ? '/dashboard' : '/login'} className="btn-primary text-xs">
                  {user ? 'Ver programa' : 'Solicitar acceso'}
                </Link>
              </div>
            ) : c.price ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-black text-brand-700">
                    ${c.price.amount_clp?.toLocaleString('es-CL')}
                  </p>
                  <p className="text-xs text-slate-400">CLP</p>
                </div>
                <Link href={user ? `/programa/${c.slug}` : '/login'} className="btn-primary text-xs">
                  {user ? 'Ver programa' : 'Inscribirse'}
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Próximamente</span>
                <Link href={`/programa/${c.slug}`} className="btn-secondary text-xs">Ver más</Link>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                Próximamente
              </span>
              <button
                onClick={() => document.getElementById('programas')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs text-brand-600 hover:underline"
              >
                Lista de espera
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
