-- ============================================
-- ПЛАНУВАННЯ ПОВТОРНИХ ВІЗИТІВ
-- ============================================

-- Додаємо налаштування повторних візитів до послуг
ALTER TABLE services ADD COLUMN IF NOT EXISTS repeat_interval_days INTEGER DEFAULT 21;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sms_reminder_days_before INTEGER DEFAULT 7;

-- Таблиця нагадувань про повторні візити
CREATE TABLE IF NOT EXISTS repeat_visit_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  last_appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  
  -- Дати
  last_visit_date DATE NOT NULL,
  recommended_date DATE NOT NULL,
  
  -- Статус
  status VARCHAR(50) DEFAULT 'pending', -- pending, sms_sent, called, scheduled, completed, cancelled
  
  -- Комунікація
  sms_sent_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  called_at TIMESTAMPTZ,
  
  -- Новий запис (якщо створено)
  new_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- Нотатки
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_repeat_reminders_salon_id ON repeat_visit_reminders(salon_id);
CREATE INDEX IF NOT EXISTS idx_repeat_reminders_client_id ON repeat_visit_reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_repeat_reminders_status ON repeat_visit_reminders(salon_id, status);
CREATE INDEX IF NOT EXISTS idx_repeat_reminders_date ON repeat_visit_reminders(salon_id, recommended_date);

-- RLS
ALTER TABLE repeat_visit_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view repeat reminders" ON repeat_visit_reminders 
  FOR SELECT USING (salon_id = get_user_salon_id());
  
CREATE POLICY "Users can manage repeat reminders" ON repeat_visit_reminders 
  FOR ALL USING (salon_id = get_user_salon_id());

-- Тригер для автоматичного оновлення
CREATE TRIGGER update_repeat_reminders_updated_at 
  BEFORE UPDATE ON repeat_visit_reminders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функція для автоматичного створення нагадування після завершення візиту
CREATE OR REPLACE FUNCTION create_repeat_visit_reminder()
RETURNS TRIGGER AS $$
DECLARE
  service_interval INTEGER;
BEGIN
  -- Тільки для завершених візитів
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Отримуємо інтервал повторення для послуги
    SELECT repeat_interval_days INTO service_interval
    FROM services
    WHERE id = NEW.service_id;
    
    -- Якщо налаштовано інтервал - створюємо нагадування
    IF service_interval IS NOT NULL AND service_interval > 0 THEN
      INSERT INTO repeat_visit_reminders (
        salon_id,
        client_id,
        last_appointment_id,
        service_id,
        staff_id,
        last_visit_date,
        recommended_date,
        status
      ) VALUES (
        NEW.salon_id,
        NEW.client_id,
        NEW.id,
        NEW.service_id,
        NEW.staff_id,
        NEW.start_time::DATE,
        (NEW.start_time::DATE + service_interval * INTERVAL '1 day')::DATE,
        'pending'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер на appointments
CREATE TRIGGER auto_create_repeat_reminder
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_repeat_visit_reminder();

-- Коментарі
COMMENT ON TABLE repeat_visit_reminders IS 'Нагадування про повторні візити клієнтів';
COMMENT ON COLUMN services.repeat_interval_days IS 'Рекомендований інтервал повторення послуги (днів)';
COMMENT ON COLUMN services.sms_reminder_days_before IS 'За скільки днів до рекомендованої дати відправити SMS';
