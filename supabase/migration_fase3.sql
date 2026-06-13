-- ============================================================
-- FASE 3: Notificaciones in-app y Anuncios de programa
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. NOTIFICACIONES IN-APP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,    -- 'nuevo_comentario' | 'nueva_insignia' | 'tarea_calificada' | 'anuncio'
  title       text NOT NULL,
  body        text,
  link        text,             -- ruta interna, ej: /topico/XXX
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread ON notifications(user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver mis notificaciones" ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "marcar leída" ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- insertar notificaciones: solo SECURITY DEFINER functions (triggers / API con service role)
CREATE POLICY "insertar notificación" ON notifications FOR INSERT TO authenticated
  WITH CHECK (is_staff());

-- Función utilitaria para crear notificaciones (SECURITY DEFINER para triggers)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type    text,
  p_title   text,
  p_body    text DEFAULT NULL,
  p_link    text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications(user_id, type, title, body, link)
  VALUES (p_user_id, p_type, p_title, p_body, p_link);
END;
$$;

-- Trigger: nueva insignia → notificación
CREATE OR REPLACE FUNCTION trg_notify_new_badge()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_badge badges%ROWTYPE;
BEGIN
  SELECT * INTO v_badge FROM badges WHERE id = NEW.badge_id;
  PERFORM create_notification(
    NEW.user_id,
    'nueva_insignia',
    '¡Obtuviste una insignia! ' || v_badge.icon || ' ' || v_badge.name,
    v_badge.description,
    '/dashboard'
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_badge ON user_badges;
CREATE TRIGGER trg_notify_badge
  AFTER INSERT ON user_badges
  FOR EACH ROW EXECUTE FUNCTION trg_notify_new_badge();

-- Trigger: tarea calificada → notificación al alumno
CREATE OR REPLACE FUNCTION trg_notify_graded()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_sub submissions%ROWTYPE;
  v_asn assignments%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM submissions WHERE id = NEW.submission_id;
  SELECT * INTO v_asn FROM assignments WHERE id = v_sub.assignment_id;
  PERFORM create_notification(
    v_sub.student_id,
    'tarea_calificada',
    'Tu tarea fue calificada: ' || v_asn.title,
    NULL,
    '/tarea/' || v_asn.id
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_graded ON submission_grades;
-- Solo notificar al insertar la primera calificación (no en actualizaciones)
CREATE TRIGGER trg_notify_graded
  AFTER INSERT ON submission_grades
  FOR EACH ROW EXECUTE FUNCTION trg_notify_graded();

-- ────────────────────────────────────────────────────────────
-- 2. ANUNCIOS DE PROGRAMA
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES profiles(id),
  title       text NOT NULL,
  body        text NOT NULL,
  pinned      boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver anuncios" ON announcements FOR SELECT TO authenticated
  USING (
    is_staff() OR
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.program_id = announcements.program_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "publicar anuncios" ON announcements FOR INSERT TO authenticated
  WITH CHECK (is_staff());
CREATE POLICY "editar anuncios" ON announcements FOR UPDATE TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "eliminar anuncios" ON announcements FOR DELETE TO authenticated
  USING (is_staff());

-- Trigger: nuevo anuncio → notificación a todos los matriculados
CREATE OR REPLACE FUNCTION trg_notify_announcement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id uuid;
BEGIN
  FOR v_user_id IN
    SELECT user_id FROM enrollments WHERE program_id = NEW.program_id
  LOOP
    IF v_user_id <> NEW.author_id THEN
      PERFORM create_notification(
        v_user_id,
        'anuncio',
        '📢 ' || NEW.title,
        substring(NEW.body, 1, 120),
        '/programa/' || (SELECT slug FROM programs WHERE id = NEW.program_id)
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_announcement ON announcements;
CREATE TRIGGER trg_notify_announcement
  AFTER INSERT ON announcements
  FOR EACH ROW EXECUTE FUNCTION trg_notify_announcement();
