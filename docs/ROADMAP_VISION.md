# Visión y Roadmap — Campus Urología Sur

> Objetivo: pasar de "plataforma de cursos" a **la referencia latinoamericana en formación médica de postgrado**: el rigor de un magíster, la comunidad del Club de la Uretra, y tecnología que ninguna universidad tradicional ofrece. Escalable, multi-organización, y construida para que otras sociedades científicas quieran usarla.

---

## 1. Lo que ya tenemos (v1)

Roles admin/editor/alumno · programas → temas → subcontenidos · visores protegidos sobre Drive · matrícula controlada · progreso · quizzes · tópicos comunitarios con comentarios y calificación · costo $0.

---

## 2. Mejoras inmediatas (completan el v1 — semanas)

| Mejora | Por qué importa |
|---|---|
| **Recuperación de contraseña** | Imprescindible antes de alumnos reales (Supabase ya lo trae, falta la página) |
| **Corrección de quizzes en servidor** | Hoy un alumno técnico podría ver las respuestas inspeccionando la red |
| **Certificados PDF con verificación QR** | El diploma digital verificable en `campus.urologiasur.cl/verificar/CODIGO` da seriedad institucional |
| **Libro de notas del docente** | Vista consolidada: avance, notas, intentos y participación de cada alumno por programa |
| **Notificaciones por email** (Resend, gratis 3.000/mes) | Nuevos tópicos, respuestas a tus casos, recordatorios de avance |
| **Perfil del alumno** | Foto, especialidad, institución, país — base de la comunidad |
| **Búsqueda global** | Encontrar lecciones y tópicos por palabra clave (Postgres full-text, gratis) |
| **PWA móvil** | Instalable en el teléfono sin pasar por App Store; los médicos estudian desde el celular |
| **Módulo de anonimización** ⚠️ | Crítico en medicina: checklist y advertencia obligatoria al subir casos clínicos (sin nombres, sin RUT, imágenes sin metadatos). Protege legalmente a la institución |

## 3. Lo mejor de la docencia online (1–3 meses)

- **Cohortes y calendario académico**: generaciones de alumnos con fechas, contenido que se desbloquea por semana (drip content), hitos y deadlines — lo que diferencia un diplomado serio de "videos sueltos".
- **Clases en vivo integradas**: botón "unirse a la clase" (Zoom/Meet embebido), registro automático de asistencia, y la grabación queda publicada como lección al terminar.
- **Tareas con entrega y rúbricas**: el alumno sube su trabajo (a Drive, mismo modelo), el docente corrige con rúbrica y retroalimentación escrita o en audio.
- **Banco de preguntas + exámenes**: preguntas etiquetadas por tema y dificultad, exámenes aleatorizados con tiempo límite, intentos controlados, preguntas de imagen ("¿qué muestra esta UCG?").
- **Gamificación con criterio académico**: insignias por hitos (primer caso publicado, 10 opiniones valoradas, programa completado), ranking de contribuidores del mes en la comunidad — no puntos infantiles, sino reputación profesional tipo Stack Overflow.
- **Repaso espaciado (flashcards)**: el sistema reaparece conceptos en intervalos crecientes; demostradamente lo más efectivo para retención en medicina (estilo Anki, integrado al contenido).
- **Analítica docente**: qué video abandonan a los 3 minutos, qué pregunta falla el 80%, qué alumnos llevan 2 semanas sin entrar (alerta de deserción).

## 4. Lo mejor de un magíster/diplomado real (2–4 meses)

- **Malla curricular con prerrequisitos**: el Tema 7 se desbloquea al aprobar el Tema 6; módulos electivos y obligatorios; créditos por módulo.
- **Syllabus y cuerpo docente**: página pública por programa con objetivos, bibliografía, horas y perfiles de los profesores (clave para vender el programa).
- **Evaluación sumativa completa**: ponderaciones configurables (40% exámenes, 30% tareas, 20% participación en tópicos, 10% asistencia), acta de notas final, escala configurable (1–7 chilena).
- **Proyecto final / tesina** con flujo de revisión: propuesta → tutor asignado → entregas parciales → defensa por videollamada → acta.
- **Secretaría académica**: admisión online con documentos (título, CV), lista de espera, convalidaciones, certificados de alumno regular.
- **Pagos y matrícula online**: Webpay/Khipu/Mercado Pago para Chile y LATAM + Stripe internacional; cuotas, becas y códigos de descuento; boleta automática.
- **Créditos de educación médica continua (CME/CEC)**: registrar horas certificadas y emitir constancias compatibles con sociedades científicas y acreditación — enorme diferenciador para médicos que necesitan acreditar formación continua.

## 5. Específico de medicina: lo que nadie más tiene (3–6 meses)

- **Casos clínicos interactivos ramificados**: "paciente de 24 años con PFUI… ¿qué haces?" → cada decisión abre consecuencias y termina en debriefing con la evidencia. El formato de aprendizaje clínico más potente que existe.
- **Visor DICOM integrado** (OHIF, open source): subir la UCG o el TAC real (anonimizado) y que los alumnos lo recorran como en el PACS, no como foto estática.
- **Video quirúrgico anotado**: marcas de tiempo comentables ("min 12:40 — atención a la arteria bulbar"), capítulos, ángulos múltiples. Los tópicos del Club ya muestran que la cirugía se enseña con video.
- **Club de revistas integrado**: subir el paper (DOI → metadatos automáticos vía Crossref), discusión estructurada PICO, votación de la evidencia — digitaliza lo que el Club de la Uretra ya hace por WhatsApp.
- **Tele-proctoring**: sesiones en vivo donde un experto comenta una cirugía transmitida — el paso natural para una red como la del Club (Costa Rica, Argentina, Honduras, Chile…).
- **Biblioteca con búsqueda PubMed** embebida y carpetas por tema.

## 6. Inteligencia artificial (el salto futurista — 4–8 meses)

- **Tutor IA del programa** (API de Claude): responde dudas usando *solo* el contenido del programa y los tópicos del club como fuente (RAG), cita la lección exacta, y deriva al docente lo que no sabe. Disponible 24/7 en español y portugués.
- **Generación automática de material**: subes el video de la clase → transcripción automática (subtítulos en es/pt/en), resumen, glosario y borrador de quiz que el docente solo revisa y aprueba. Reduce 10× el trabajo de los editores.
- **Búsqueda semántica**: "¿cómo manejo una estenosis cercana al esfínter?" encuentra la lección, el caso del Club y el paper relevante aunque no compartan palabras exactas (pgvector en Supabase, gratis).
- **Asistente de casos**: al redactar un tópico, la IA sugiere datos faltantes ("¿incluiste la uroflujometría?"), verifica anonimización y propone etiquetas.
- **Análisis predictivo de deserción**: detecta patrones de abandono y dispara intervenciones (email del tutor, plan de recuperación).
- **Simulador de examen oral**: la IA hace de paciente o de comisión examinadora por voz, con rúbrica automática — entrenamiento ilimitado para la defensa final.

## 7. Escalabilidad: que otros quieran usarla (6–12 meses)

- **Multi-organización (multi-tenant)**: cada sociedad científica o clínica tiene su espacio (`campus.sociedadX.org`), con su marca, sus programas y sus admins, sobre la misma infraestructura. Urología Sur pasa de "tener una plataforma" a "ser la plataforma".
- **Marketplace de programas**: catálogo cruzado donde un urólogo de Honduras descubre el diplomado chileno; comisión por matrícula como modelo de ingresos.
- **SSO académico**: login con Google, ORCID e institucional.
- **Almacenamiento por niveles**: Drive (gratis, hoy) → Cloudflare R2 + Bunny Stream o Mux cuando haya ingresos: streaming adaptativo, **marca de agua dinámica con el email del alumno sobre el video** (el mayor disuasivo real de piratería) y DRM Widevine si se necesita nivel Netflix.
- **Interoperabilidad educativa**: exportar/importar SCORM y LTI para conectarse con Moodle/Canvas universitarios (necesario si una universidad quiere convalidar el diplomado).
- **API pública + webhooks** y conectores Zapier/Make.
- **App móvil nativa** (Expo/React Native) con descargas offline cifradas — la feature más pedida en educación médica LATAM por la conectividad variable.

## 8. Integraciones recomendadas (resumen)

| Categoría | Herramienta | Costo inicial |
|---|---|---|
| Email transaccional | Resend | Gratis (3k/mes) |
| Clases en vivo | Zoom/Meet embebido | Gratis (40 min) / API pagada |
| Pagos Chile/LATAM | Webpay, Khipu, Mercado Pago | Comisión por venta |
| Pagos internacional | Stripe | Comisión por venta |
| WhatsApp (notificaciones y bot del campus) | WhatsApp Business API | Bajo |
| Video profesional | Bunny Stream / Mux | ~US$10–50/mes al crecer |
| IA | Claude API | Por uso |
| Búsqueda semántica | Supabase pgvector | Gratis |
| Imágenes médicas | OHIF Viewer | Gratis (open source) |
| Papers | Crossref/PubMed APIs | Gratis |
| Credenciales digitales | Open Badges / Credly | Gratis / bajo |
| Analytics | PostHog | Gratis (1M eventos) |
| Monitoreo de errores | Sentry | Gratis |
| Calendario | Google Calendar API | Gratis |

## 9. Orden sugerido de construcción

1. **Fase 1 (ya)** — Mejoras inmediatas (§2): son pocas semanas y dejan la plataforma lista para alumnos reales y pagados.
2. **Fase 2** — Cohortes + clases en vivo + tareas + certificados QR (§3–4): con esto ya es un diplomado completo vendible.
3. **Fase 3** — Pagos + secretaría académica + CME (§4): ingresos y formalidad institucional.
4. **Fase 4** — Casos interactivos + video anotado + club de revistas (§5): el diferenciador médico que nadie en LATAM tiene junto.
5. **Fase 5** — IA (§6): tutor, generación de contenido, búsqueda semántica.
6. **Fase 6** — Multi-tenant + marketplace + app móvil (§7): escala regional.

Cada fase es usable por sí sola; ninguna rompe lo anterior. El costo se mantiene en $0 hasta la Fase 3, donde los pagos financian el resto.

## 10. El principio rector

Las plataformas genéricas (Moodle, Teachable) enseñan *contenido*. La medicina se aprende con **casos, comunidad y maestros** — exactamente lo que el Club de la Uretra ya demuestra cada día por WhatsApp, pero disperso y efímero. Esta plataforma convierte esa conversación en conocimiento estructurado, evaluable, certificable y permanente. Ese es el foso competitivo: nadie puede copiar la comunidad.
