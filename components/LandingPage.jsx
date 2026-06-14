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
            Campus Urología Chile
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
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          {/* Encabezado al estilo Apple: subtítulo arriba en small caps */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              Proceso de admisión
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              ¿Cómo funciona?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Tres pasos para empezar tu formación
            </p>
          </div>

          {/* Gradiente compartido entre pasos */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="how-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0e7490"/>
                <stop offset="100%" stopColor="#22d3ee"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Pasos con conectores */}
          <div className="mt-14 flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-0">
            {HOW.map((h, i) => (
              <div key={h.step} className="contents">
                {/* Paso */}
                <div className="flex flex-1 flex-col items-center text-center">
                  {/* Número en anillo */}
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="absolute inset-0" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="30" stroke="#e2e8f0" strokeWidth="1.5"/>
                      <circle
                        cx="32" cy="32" r="30"
                        stroke="url(#how-grad)"
                        strokeWidth="1.5"
                        strokeDasharray="188"
                        strokeDashoffset={188 - (188 * (i + 1)) / HOW.length}
                        strokeLinecap="round"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                      />
                    </svg>
                    <span className="relative z-10 text-lg font-black text-brand-700">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">{h.title}</h3>
                  <p className="mt-2 max-w-[180px] text-sm leading-relaxed text-slate-500">{h.desc}</p>
                </div>

                {/* Conector (solo entre pasos, no después del último) */}
                {i < HOW.length - 1 && (
                  <div className="flex items-center justify-center sm:mt-8 sm:w-16 sm:flex-none">
                    {/* Vertical en móvil */}
                    <div className="flex h-10 flex-col items-center gap-[3px] sm:hidden">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <span key={k} className="h-1 w-0.5 rounded-full bg-brand-200" />
                      ))}
                    </div>
                    {/* Horizontal en desktop */}
                    <div className="hidden items-center gap-[3px] sm:flex">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <span key={k} className="h-0.5 w-1 rounded-full bg-brand-200" />
                      ))}
                      <svg className="h-3 w-3 text-brand-300" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 2l4 4-4 4"/>
                      </svg>
                    </div>
                  </div>
                )}
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-elev-1 transition-all duration-300 hover:shadow-elev-3 hover:-translate-y-1">

      {/* Banner — gradiente limpio sin overlay oscuro */}
      <div className={`relative h-32 bg-gradient-to-br ${c.color}`}>
        {/* Ruido sutil para dar profundidad sin oscurecer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

        {/* Ícono flotante */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-5xl opacity-90 drop-shadow-sm select-none">
          {c.icon}
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-5 flex items-center gap-2">
          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm">
            {KIND_LABEL[c.kind] || c.kind}
          </span>
          {c.level && (
            <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              {c.level}
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold leading-snug text-slate-900 line-clamp-2">{c.title}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-3">
          {c.description}
        </p>

        {/* Meta */}
        {(c.duration || c.modules) && (
          <div className="mt-3 flex flex-wrap gap-3">
            {c.duration && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6"/><path d="M8 4.5v3.5l2 2"/>
                </svg>
                {c.duration}
              </span>
            )}
            {c.modules && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="2.5" rx="1"/><rect x="2" y="7" width="12" height="2.5" rx="1"/><rect x="2" y="11" width="8" height="2.5" rx="1"/>
                </svg>
                {c.modules} módulos
              </span>
            )}
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
                    <span className="ml-1 text-xs font-normal text-slate-400">CLP</span>
                  </p>
                </div>
                <Link href={user ? `/programa/${c.slug}` : '/login'} className="btn-primary text-xs">
                  {user ? 'Ver programa' : 'Inscribirse'}
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Próximamente</span>
                <Link href={`/programa/${c.slug}`} className="btn-secondary text-xs">Ver más</Link>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                Próximamente
              </span>
              <button
                onClick={() => document.getElementById('programas')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Notificarme
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
