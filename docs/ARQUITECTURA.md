# Arquitectura — Campus Urología Sur

## Stack (100% gratuito)

| Capa | Tecnología | Plan |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | — |
| Hosting | Vercel | Hobby (gratis) |
| Código | GitHub | Gratis |
| Base de datos + Auth + Roles | Supabase (Postgres + RLS) | Free tier (500 MB DB, 50k usuarios) |
| Videos y documentos | **Google Drive de los administradores** | 15 GB gratis por cuenta (ampliable con más cuentas) |
| Estilos | Tailwind CSS | — |

La base de datos **no almacena archivos**, solo metadatos (IDs de Drive). Por eso el free tier alcanza de sobra.

## Modelo de datos

```
profiles (rol: admin | editor | student)
programs (diplomado | magister)        ← creado por admin/editor
 └─ modules (temas)
     └─ lessons (subcontenidos: video | documento | texto)
         ├─ drive_file_id  → visor embebido
         └─ quizzes → quiz_questions
enrollments (alumno ↔ programa)         ← matrícula controlada por admin
lesson_progress (alumno ↔ lección completada)
quiz_attempts (intentos y notas)
```

## Roles y permisos (Supabase RLS — se aplican en la base de datos, no solo en la UI)

- **admin**: todo — crea usuarios, matricula, gestiona programas y contenido.
- **editor**: crea/edita programas, temas, subcontenidos y quizzes. No gestiona usuarios.
- **student**: solo ve programas en los que está matriculado; registra su progreso e intentos de quiz.
- Sin sesión: solo la página pública con el catálogo de programas publicados (sin contenido).

## Flujo de contenido con Google Drive

1. El admin/editor sube el video o PDF a **su propio Drive**.
2. En Drive: clic derecho → Compartir → "Cualquier persona con el enlace: **Lector**" y en ⚙️ **desactivar "Los lectores pueden descargar, imprimir y copiar"**.
3. Pega el enlace de Drive en el panel de administración; la plataforma extrae el ID automáticamente.
4. El alumno ve el archivo dentro de la web mediante el visor embebido (`drive.google.com/file/d/ID/preview`), que respeta la restricción de descarga de Drive (videos sin botón de descarga, PDFs sin descargar/imprimir).

## Protección del contenido ("no fácilmente robable")

Capas aplicadas:

1. **Drive**: descarga/impresión/copia desactivadas para lectores (la protección principal, ocurre en servidores de Google).
2. **Matrícula obligatoria**: el visor solo se renderiza para alumnos matriculados (verificado en servidor).
3. **Visor blindado en la web**: capa transparente sobre el botón "abrir en ventana nueva" del iframe, clic derecho deshabilitado, selección de texto bloqueada, sin enlaces directos al archivo visibles.
4. El ID de Drive nunca se muestra como enlace clicable.

**Honestidad técnica**: ningún sistema (ni Netflix) impide al 100% la grabación de pantalla. Estas capas igualan la protección de plataformas comerciales: detienen la descarga directa y la copia casual, que es el 95% del problema.

## Páginas

- `/` — landing pública con catálogo de programas publicados.
- `/login` — acceso (cuentas creadas por el admin; sin registro abierto).
- `/dashboard` — programas del alumno con % de avance.
- `/programa/[slug]` — malla del programa: temas y subcontenidos, progreso.
- `/leccion/[id]` — visor protegido + marcar completada + quiz.
- `/admin` — panel: programas, temas, lecciones, quizzes, usuarios y matrículas.

## Escalabilidad de almacenamiento

Cada administrador aporta su Drive (15 GB gratis). Los archivos quedan distribuidos entre cuentas; la plataforma solo guarda el ID, por lo que se pueden mezclar cuentas sin límite. Si un día se necesita más, basta una cuenta Google One o Workspace sin tocar el código.
