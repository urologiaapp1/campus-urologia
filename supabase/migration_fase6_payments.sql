-- =============================================================================
-- FASE 6: Sistema de Pagos
-- Ejecutar DESPUÉS de migration_fase5_ai.sql
-- =============================================================================

-- ── Precios por programa ──────────────────────────────────────────────────────
-- Permite tener múltiples precios (ej: precio normal + precio early bird)
CREATE TABLE IF NOT EXISTS program_prices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT 'Precio estándar',
  amount_clp      int  NOT NULL,              -- monto en pesos chilenos
  stripe_price_id text,                        -- ID del precio en Stripe
  is_active       boolean DEFAULT true,
  valid_until     timestamptz,                 -- null = sin expiración
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE program_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active prices"
  ON program_prices FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Staff manage prices"
  ON program_prices FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

-- ── Órdenes de pago ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id          uuid NOT NULL REFERENCES programs(id),
  price_id            uuid REFERENCES program_prices(id),
  amount_clp          int  NOT NULL,
  currency            text NOT NULL DEFAULT 'clp',
  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id   text UNIQUE,            -- Checkout Session ID
  stripe_payment_intent text,
  metadata            jsonb,
  paid_at             timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS payment_orders_stripe_session_idx ON payment_orders(stripe_session_id);

ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own orders"
  ON payment_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users create own orders"
  ON payment_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff read all orders"
  ON payment_orders FOR SELECT
  USING (is_staff());

-- ── Lista de espera (waitlist) ────────────────────────────────────────────────
-- Para capturar interesados antes de abrir inscripciones
CREATE TABLE IF NOT EXISTS program_waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  notes       text,
  notified    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(program_id, email)
);

ALTER TABLE program_waitlist ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede inscribirse en la lista de espera (no requiere auth)
CREATE POLICY "Anyone can join waitlist"
  ON program_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff manage waitlist"
  ON program_waitlist FOR ALL
  USING (is_staff());

-- ── Trigger: matricular automáticamente al pagar ──────────────────────────────
CREATE OR REPLACE FUNCTION auto_enroll_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status <> 'paid' THEN
    INSERT INTO enrollments(user_id, program_id)
    VALUES (NEW.user_id, NEW.program_id)
    ON CONFLICT (user_id, program_id) DO NOTHING;

    PERFORM create_notification(
      NEW.user_id,
      'info',
      '¡Pago confirmado!',
      'Tu matrícula ha sido procesada. Ya puedes acceder al programa.',
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_enroll_on_payment ON payment_orders;
CREATE TRIGGER trg_auto_enroll_on_payment
  AFTER UPDATE ON payment_orders
  FOR EACH ROW EXECUTE FUNCTION auto_enroll_on_payment();

-- Agregar columna is_free a programs para indicar programas gratuitos
ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT false;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS stripe_product_id text;
