# Campus Urología Sur

Plataforma de diplomados y magíster en salud. Costo de operación: **$0** (Vercel + Supabase + GitHub free tiers; archivos en Google Drive de los administradores).

- `docs/COMPARATIVA.md` — por qué esta solución vs Moodle/Teachable/etc.
- `docs/ARQUITECTURA.md` — diseño técnico, modelo de datos y protección de contenido.
- `docs/DESPLIEGUE.md` — guía paso a paso para dejarla en línea.

## Funciones

- Roles: **admin** (todo), **editor** (contenido), **alumno** (solo programas matriculados).
- Jerarquía: Programa (diplomado/magíster/curso) → Temas → Subcontenidos (video, documento o texto).
- Videos y documentos alojados en el **Google Drive de cada administrador**; la web solo los visualiza con un visor embebido protegido (sin descarga, sin clic derecho, sin enlace directo).
- Matrícula controlada por administradores; sin registro abierto.
- Progreso por lección y quizzes con nota y porcentaje de aprobación.
- Seguridad real en la base de datos (Supabase Row Level Security), no solo en la interfaz.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con las llaves de Supabase
npm run dev                  # http://localhost:3000
```

Antes ejecuta `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase (ver `docs/DESPLIEGUE.md`).
