# Comparativa de plataformas LMS — Urología Sur

Evaluación frente al requisito: diplomados/magíster en salud, roles admin/editor, contenido alojado en Google Drive de los administradores, visualización embebida protegida, **costo $0** (Vercel + GitHub + Supabase free tier).

| Criterio | **Plataforma propia** (Next.js + Supabase + Vercel + Drive) | Moodle / MoodleCloud | Open edX | Teachable | Thinkific | Google Classroom |
|---|---|---|---|---|---|---|
| Costo | **$0** (free tiers) | Self-host: gratis pero requiere servidor (~US$10–30/mes); MoodleCloud desde ~US$130/año (50 usuarios) | Gratis (open source) pero hosting complejo y caro | Desde US$29/mes + 7,5% comisión en plan básico; sin plan gratis | Desde US$36/mes; plan gratis muy limitado (1 curso) | Gratis |
| Almacenamiento en Drive de admins | **Sí, por diseño** | Posible vía enlaces, sin visor integrado protegido | No nativo | No (suben a su nube) | No | Sí, pero sin control fino |
| Visor embebido "anti-descarga" | **Sí**: iframe `/preview` + bloqueo de descarga en Drive + capa de protección | Parcial, requiere plugins | Parcial | El contenido vive en su plataforma | Ídem | No (alumnos acceden al archivo directo en Drive) |
| Roles admin / editor de contenido | **Sí, a medida** | Sí (muy completo) | Sí | Limitado por plan | Limitado por plan | Solo profesor/alumno |
| Jerarquía programa → tema → subcontenido | **Sí, a medida** | Sí | Sí | Sí (cursos/secciones) | Sí | Débil |
| Matrícula controlada por admin | **Sí** | Sí | Sí | Sí | Sí | Sí |
| Quizzes y progreso | **Sí (v1)** | Sí (muy completo) | Sí | Sí | Sí | Básico |
| Marca propia / dominio | **Total** | Sí (self-host) | Sí | Solo en planes caros | Solo en planes caros | No |
| Mantenimiento técnico | Bajo-medio (tú controlas el código) | Alto (self-host) | Muy alto | Nulo | Nulo | Nulo |

## Conclusión

- **Teachable/Thinkific**: descartadas — sin plan gratuito real, comisiones, y el contenido se aloja en sus servidores (no en tu Drive).
- **Moodle**: el LMS más completo, pero requiere servidor pago y no resuelve nativamente el visor protegido sobre Drive.
- **Open edX**: sobredimensionado y caro de operar para esta escala.
- **Google Classroom**: gratis y usa Drive, pero los alumnos acceden a los archivos directamente (fáciles de copiar) y no permite marca propia ni estructura de diplomado/magíster.
- **Plataforma propia**: única opción que cumple los 3 requisitos duros simultáneamente: costo $0, almacenamiento en Drive de los administradores, y visores embebidos con protección. Es lo que se construye en este proyecto.

Fuentes de precios (junio 2026): [Teachable pricing](https://www.learningrevolution.net/teachable-pricing/), [Thinkific vs Teachable](https://www.learnworlds.com/thinkific-vs-teachable-pricing/), [Comparativa LMS 2026](https://www.schoolmaker.com/blog/lms-pricing).
