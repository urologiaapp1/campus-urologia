# Cómo probar el Campus Urología Sur

## 1. Ejecutar SQL en Supabase (en este orden exacto)

Ve a **Supabase → SQL Editor** y ejecuta cada archivo en orden:

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `supabase/schema.sql` | Tablas base, RLS, triggers, funciones helper |
| 2 | `supabase/migration_topicos.sql` | Tablas de comunidad: topics, comments, ratings |
| 3 | `supabase/migration_fase1.sql` | Perfiles extendidos, quiz_answer_keys, certificates |
| 4 | `supabase/migration_fase2.sql` | Cohortes, tareas, banco de preguntas, insignias + triggers |
| 5 | `supabase/migration_fase3.sql` | Notificaciones in-app, anuncios de programa |
| 6 | `supabase/migration_fase4.sql` | Clases en vivo, flashcards, encuesta NPS |
| 7 | `supabase/migration_fase5_ai.sql` | pgvector, embeddings, historial de chat con tutor IA |
| 8 | `supabase/migration_fase6_payments.sql` | Precios, órdenes de pago, waitlist, auto-matrícula |
| 9 | `supabase/seed_reconstructiva.sql` | Programa "Cirugía Reconstructiva Uretral" + 15 módulos |
| 10 | `supabase/seed_topicos_club.sql` | 9 tópicos clínicos del Club de la Uretra |

> ⚠️ Si ya ejecutaste los primeros archivos en una sesión anterior, **no los repitas**. Cada migración es aditiva.

---

## 2. Crear el primer usuario administrador

```sql
-- 1. Primero crea el usuario desde Supabase Auth > Users > Add User
-- (usa info@urologiasur.cl o el email que prefieras)
-- 2. Luego promuévelo a admin:
UPDATE profiles
SET role = 'admin', full_name = 'Administrador'
WHERE id = (SELECT id FROM auth.users WHERE email = 'info@urologiasur.cl');
```

---

## 3. Variables de entorno

```bash
cd campus-urologiasur
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Opcionales — la plataforma funciona sin estas:
RESEND_API_KEY=re_xxxx              # Notificaciones email (gratis 3.000/mes)
EMAIL_FROM=Campus US <tu@dominio.cl>
NEXT_PUBLIC_SITE_URL=https://campus.urologiasur.cl
```

---

## 4. Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 5. Recorrido de prueba sugerido

### Como administrador

1. **Login** en `/login`
2. **Administración → Programas**: revisar el programa "Cirugía Reconstructiva Uretral" sembrado
3. **Administración → Usuarios**: crear un usuario estudiante de prueba
4. **Administración → Usuarios**: matricular al estudiante en el programa
5. **Programa → módulo → lección**: agregar una URL de Drive (video o documento)
   - En Drive: compartir → Cualquiera con el enlace → Lector → desactivar descarga
6. **Lección → Quiz**: crear preguntas de quiz con respuestas correctas
7. **Administración → Libro de notas**: revisar progreso y notas
8. **Administración → Cohortes** (Fase 2): crear cohorte con fechas de inicio/fin

### Como estudiante (ventana incógnito)

1. **Login** con la cuenta del estudiante creado
2. **Dashboard**: ver programa matriculado con barra de progreso e insignias
3. **Programa**: navegar módulos y lecciones
4. **Lección**: ver contenido embebido (Drive), marcar como completada
5. **Quiz**: responder y ver puntaje (respuestas correctas nunca llegan al browser)
6. **Completar todas las lecciones + aprobar quizzes** → aparece "Obtener certificado"
7. **Certificado**: código único `US-XXXXXXXXXX`, verificable en `/certificado/[code]`
8. **Tópicos de módulo** (`/tema/[id]/topicos`): crear tópico con checklist de anonimización
9. **Tópico**: comentar, calificar con estrellas, ver Drive embebido
10. **Buscar** (`/buscar`): buscar por palabra en lecciones y tópicos
11. **Mi perfil** (`/perfil`): editar nombre, especialidad, institución, país

---

## 6. Mapa de rutas

### Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con programas publicados |
| `/login` | Inicio de sesión |
| `/recuperar` | Solicitar reset de contraseña |
| `/restablecer` | Establecer nueva contraseña |
| `/certificado/[code]` | Verificación pública de certificado |

### Autenticadas
| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Mis programas con progreso e insignias |
| `/perfil` | Editar perfil personal |
| `/buscar` | Búsqueda global de contenidos |
| `/programa/[slug]` | Detalle del programa |
| `/leccion/[id]` | Visor de lección + quiz |
| `/tema/[id]/topicos` | Tópicos de la comunidad |
| `/topico/[id]` | Tópico individual con comentarios y rating |

### Autenticadas (continuación)
| Ruta | Descripción |
|------|-------------|
| `/ranking` | Tabla de líderes (score compuesto) |
| `/usuario/[id]` | Perfil público con insignias |
| `/tarea/[id]` | Detalle y entrega de tarea |
| `/tema/[id]/tareas` | Tareas del módulo |
| `/tema/[id]/clases` | Clases en vivo del módulo |
| `/tema/[id]/flashcards` | Modo estudio de flashcards |

### Staff (admin/editor)
| Ruta | Descripción |
|------|-------------|
| `/admin` | Gestión de programas + estadísticas |
| `/admin/programa/[id]` | Editor de contenido |
| `/admin/programa/[id]/anuncios` | Anuncios con notificación automática |
| `/admin/leccion/[id]/quiz` | Editor de quiz seguro |
| `/admin/leccion/[id]/flashcards` | CRUD de flashcards por módulo |
| `/admin/usuarios` | Crear usuarios + matrículas |
| `/admin/notas` | Libro de notas + exportar CSV |
| `/admin/cohortes` | Gestión de cohortes |
| `/admin/tareas` | Gestión de tareas y rúbricas |
| `/admin/banco` | Banco de preguntas filtrable |
| `/admin/clases/nueva` | Programar clase en vivo |
| `/admin/estadisticas/[id]` | KPIs, progreso, quizzes, NPS |

---

## 7. API Routes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/users` | Crear usuario (admin, service role) |
| POST | `/api/quiz/grade` | Calificar quiz (server-side, seguro) |
| POST | `/api/certificates` | Generar/recuperar certificado |
| POST | `/api/notify/comment` | Email al autor del tópico |
| POST | `/api/assignments/submit` | Entregar tarea |
| POST | `/api/assignments/grade` | Calificar tarea con rúbrica |
| GET  | `/api/admin/export-notas` | Exportar libro de notas como CSV |

---

## 8. Protección de contenido Drive

4 capas de protección:

1. **Drive**: "disable download" para lectores en el archivo
2. **RLS**: solo usuarios matriculados ven `drive_file_id`
3. **Visor**: endpoint `/preview` de Drive (sin botón de descarga)
4. **Frontend**: overlay + right-click deshabilitado + CSS `select-none`

---

## 9. Seguridad del quiz

Las respuestas correctas **nunca llegan al navegador**:

- `quiz_questions`: solo enunciado y opciones (sin índice correcto)
- `quiz_answer_keys`: RLS staff-only
- `/api/quiz/grade`: usa service role; devuelve solo `{ score, passed }`

---

## 10. Despliegue en producción

Ver `docs/DESPLIEGUE.md` para el paso a paso con Vercel + GitHub + Supabase.

---

## 11. Estado de desarrollo

### ✅ Fase 1 — Completo
- Autenticación, roles, matrículas
- Contenido jerárquico (programas → módulos → lecciones)
- Visor Drive protegido (4 capas)
- Quizzes con calificación server-side segura
- Certificados con código único y QR verificable
- Comunidad: tópicos, comentarios, ratings por estrellas
- Libro de notas, perfil, búsqueda global
- PWA (instalable en móvil/escritorio)
- Notificaciones email (Resend, sin SDK)
- Anonimización obligatoria en casos clínicos
- Recuperación de contraseña

### ✅ Fase 2 — Completo
- Cohortes con calendario académico y conteo de matrículas
- Tareas con rúbricas evaluadas por docentes
- Banco de preguntas filtrable por programa y dificultad
- Gamificación: 9 insignias con triggers automáticos
- Tabla de líderes con score compuesto (lecciones + quizzes + tópicos + insignias)
- Perfil público por usuario con insignias y actividad

### ✅ Fase 3 — Completo
- Notificaciones in-app con polling cada 60s (badge rojo)
- Anuncios de programa con notificación automática a matriculados
- Notificaciones por nueva insignia, tarea calificada, clase programada

### ✅ Fase 4 — Completo
- Clases en vivo con estado EN VIVO, próximas y pasadas
- Flashcards con modo estudio (flip) y seguimiento de dominio
- Encuesta NPS al obtener certificado (lazy-loaded modal)
- Panel NPS en estadísticas con gauge visual y desglose

### ✅ Fase 5 — Completo
- Rate limiting in-memory (sin dependencias externas)
- Páginas de error: 404, error boundary, loading skeleton
- Exportar libro de notas como CSV (compatible con Excel)
- Estadísticas por programa: KPIs, progreso, distribución notas, NPS

### ✅ Fase 6 — Completo
- **Tutor IA con RAG**: pgvector + OpenAI embeddings + Claude Haiku para respuestas contextuales
- **Indexación de lecciones** desde panel admin con chunks de 800 chars y solapamiento
- **Chat streaming** con Server-Sent Events, historial guardado en BD
- **Pagos con Stripe**: Checkout Session, webhook verificado con Web Crypto (sin SDK)
- **Auto-matrícula** al confirmarse el pago via trigger de base de datos
- **Precios por programa**: múltiples precios, early bird con fecha de expiración
- **Lista de espera** pública con exportación CSV
- **Landing page** rediseñada: hero, características, precios por programa, waitlist, CTA
- **Admin comercial**: gestión de precios y lista de espera por programa

### 📅 Próximas fases
- Visor DICOM, video quirúrgico anotado
- Multi-tenant (varias instituciones)
- App móvil nativa (Expo)
