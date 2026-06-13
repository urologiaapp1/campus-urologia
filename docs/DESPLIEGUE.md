# Guía de despliegue (todo gratis)

## 1. Supabase (base de datos y usuarios) — 5 min

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (plan Free).
2. Ve a **SQL Editor** → pega todo el contenido de `supabase/schema.sql` → **Run**.
3. Ve a **Authentication → Users → Add user**: crea tu usuario con `info@urologiasur.cl` y una contraseña.
4. Vuelve al SQL Editor y ejecuta:
   ```sql
   update public.profiles set role = 'admin', full_name = 'Administrador'
   where id = (select id from auth.users where email = 'info@urologiasur.cl');
   ```
5. En **Project Settings → API** copia: `Project URL`, `anon public key` y `service_role key`.

## 2. Probar localmente — 2 min

```bash
cd campus-urologiasur
npm install
cp .env.example .env.local    # pega las 3 llaves de Supabase
npm run dev                   # abre http://localhost:3000
```

Ingresa con tu usuario admin → menú **Administración**.

## 3. GitHub — 3 min

```bash
git init && git add . && git commit -m "Campus Urología Sur v1"
```
Crea un repositorio **privado** en github.com y sigue las instrucciones de "push an existing repository".

## 4. Vercel — 3 min

1. En [vercel.com](https://vercel.com) (plan Hobby, gratis): **Add New → Project** → importa el repo de GitHub.
2. En **Environment Variables** agrega las 3 variables de `.env.example` con sus valores reales.
3. **Deploy**. Tu plataforma quedará en `https://tu-proyecto.vercel.app` (puedes conectar un dominio propio, p. ej. `campus.urologiasur.cl`, gratis en Vercel).

Cada `git push` redespliega automáticamente.

## 5. Cargar contenido desde Google Drive

Para **cada video o documento**:

1. Súbelo a tu Google Drive.
2. Clic derecho → **Compartir** → "Cualquier persona con el enlace" → rol **Lector**.
3. En la misma ventana, ⚙️ (Configuración) → **desmarca** "Los lectores y comentaristas pueden ver la opción para descargar, imprimir y copiar". *Este paso es la protección principal.*
4. Copia el enlace y pégalo al crear el subcontenido en **Administración → Contenido**.

## Flujo de trabajo diario

- **Admin** crea programas, usuarios (alumnos/editores) y matricula alumnos.
- **Editores** arman temas, subcontenidos y quizzes.
- **Alumnos** entran con su email/contraseña, ven solo sus programas, avanzan y rinden quizzes.

## Límites de los planes gratuitos (referencia)

- Vercel Hobby: 100 GB de transferencia/mes — los videos NO pasan por Vercel (van directo de Google a cada alumno), así que no consumen esta cuota.
- Supabase Free: 500 MB de base de datos (~millones de registros de texto, de sobra) y 50.000 usuarios activos/mes.
- Drive: 15 GB por cuenta Google; pueden usarse varias cuentas de administradores a la vez.
