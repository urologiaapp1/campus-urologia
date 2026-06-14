-- Recordatorio de contraseña (hint) en perfil de usuario
-- No almacena la contraseña real, solo una frase recordatoria
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_hint TEXT;
