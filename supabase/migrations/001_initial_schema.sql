-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- САЛОНЫ (Multi-tenant root table)
-- ============================================
CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ПОЛЬЗОВАТЕЛИ САЛОНОВ
-- ============================================
CREATE TABLE salon_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL, -- связь с auth.users
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- owner, admin, master, reception, staff
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(auth_user_id, salon_id)
);

-- ============================================
-- КЛИЕНТЫ
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(20),
  notes TEXT,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier VARCHAR(50) DEFAULT 'bronze', -- bronze, silver, gold, platinum
  total_spent DECIMAL(10, 2) DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  last_visit_date TIMESTAMPTZ,
  avatar_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска клиентов
CREATE INDEX idx_clients_salon_id ON clients(salon_id);
CREATE INDEX idx_clients_phone ON clients(salon_id, phone);
CREATE INDEX idx_clients_email ON clients(salon_id, email);
CREATE INDEX idx_clients_name ON clients(salon_id, first_name, last_name);

-- ============================================
-- КАТЕГОРИИ УСЛУГ
-- ============================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- УСЛУГИ
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- в минутах
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2), -- себестоимость для расчета маржи
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_salon_id ON services(salon_id);
CREATE INDEX idx_services_category_id ON services(category_id);

-- ============================================
-- МАСТЕРА (СОТРУДНИКИ)
-- ============================================
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES salon_users(id) ON DELETE SET NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  specialization TEXT,
  avatar_url TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6', -- цвет для календаря
  is_active BOOLEAN DEFAULT true,
  -- Настройки рабочего графика
  work_schedule JSONB DEFAULT '{
    "monday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "thursday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "friday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "saturday": {"enabled": true, "start": "10:00", "end": "16:00"},
    "sunday": {"enabled": false, "start": "10:00", "end": "16:00"}
  }',
  -- Настройки зарплаты
  salary_type VARCHAR(50) DEFAULT 'percentage', -- percentage, fixed, hourly
  salary_value DECIMAL(10, 2) DEFAULT 50, -- процент или фиксированная сумма
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_salon_id ON staff_members(salon_id);

-- ============================================
-- СВЯЗЬ МАСТЕРОВ И УСЛУГ
-- ============================================
CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(staff_id, service_id)
);

-- ============================================
-- ЗАПИСИ (APPOINTMENTS)
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled, no_show
  notes TEXT,
  client_notes TEXT,
  -- Финансовые данные
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partially_paid
  payment_method VARCHAR(50), -- cash, card, online
  -- Уведомления
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_start_time ON appointments(salon_id, start_time);
CREATE INDEX idx_appointments_status ON appointments(salon_id, status);

-- ============================================
-- ТОВАРЫ И СКЛАД
-- ============================================
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'pcs', -- pcs, ml, gr, kg
  quantity DECIMAL(10, 2) DEFAULT 0,
  min_quantity DECIMAL(10, 2) DEFAULT 0, -- минимальный остаток для уведомления
  cost_price DECIMAL(10, 2),
  sell_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_salon_id ON products(salon_id);

-- ============================================
-- СПИСАНИЕ МАТЕРИАЛОВ
-- ============================================
CREATE TABLE product_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТРАНЗАКЦИИ (КАССА)
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- income, expense, salary
  category VARCHAR(100), -- service, product, salary, rent, utilities, etc
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- cash, card, online
  description TEXT,
  created_by UUID REFERENCES salon_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_salon_id ON transactions(salon_id);
CREATE INDEX idx_transactions_type ON transactions(salon_id, type);
CREATE INDEX idx_transactions_date ON transactions(salon_id, created_at);

-- ============================================
-- ИСТОРИЯ ПОСЕЩЕНИЙ
-- ============================================
CREATE TABLE visit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL,
  amount_paid DECIMAL(10, 2),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visit_history_client_id ON visit_history(client_id);
CREATE INDEX idx_visit_history_salon_id ON visit_history(salon_id);

-- ============================================
-- ТРИГГЕРЫ ДЛЯ UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salon_users_updated_at BEFORE UPDATE ON salon_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Включаем RLS на всех таблицах
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;

-- Функция для получения salon_id текущего пользователя
CREATE OR REPLACE FUNCTION get_user_salon_id()
RETURNS UUID AS $$
  SELECT salon_id FROM salon_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Политики для salons
CREATE POLICY "Users can view their own salon" ON salons FOR SELECT USING (id = get_user_salon_id());
CREATE POLICY "Users can update their own salon" ON salons FOR UPDATE USING (id = get_user_salon_id());

-- Политики для salon_users
CREATE POLICY "Users can view their salon's users" ON salon_users FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can insert salon users" ON salon_users FOR INSERT WITH CHECK (salon_id = get_user_salon_id());
CREATE POLICY "Users can update salon users" ON salon_users FOR UPDATE USING (salon_id = get_user_salon_id());

-- Политики для clients
CREATE POLICY "Users can view their salon's clients" ON clients FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can insert clients" ON clients FOR INSERT WITH CHECK (salon_id = get_user_salon_id());
CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can delete clients" ON clients FOR DELETE USING (salon_id = get_user_salon_id());

-- Политики для service_categories
CREATE POLICY "Users can view their salon's categories" ON service_categories FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage categories" ON service_categories FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для services
CREATE POLICY "Users can view their salon's services" ON services FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage services" ON services FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для staff_members
CREATE POLICY "Users can view their salon's staff" ON staff_members FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage staff" ON staff_members FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для staff_services
CREATE POLICY "Users can view staff services" ON staff_services FOR SELECT USING (
  EXISTS (SELECT 1 FROM staff_members WHERE id = staff_services.staff_id AND salon_id = get_user_salon_id())
);
CREATE POLICY "Users can manage staff services" ON staff_services FOR ALL USING (
  EXISTS (SELECT 1 FROM staff_members WHERE id = staff_services.staff_id AND salon_id = get_user_salon_id())
);

-- Политики для appointments
CREATE POLICY "Users can view their salon's appointments" ON appointments FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage appointments" ON appointments FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для product_categories
CREATE POLICY "Users can view product categories" ON product_categories FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage product categories" ON product_categories FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для products
CREATE POLICY "Users can view their salon's products" ON products FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage products" ON products FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для product_usage
CREATE POLICY "Users can view product usage" ON product_usage FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can track product usage" ON product_usage FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для transactions
CREATE POLICY "Users can view transactions" ON transactions FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage transactions" ON transactions FOR ALL USING (salon_id = get_user_salon_id());

-- Политики для visit_history
CREATE POLICY "Users can view visit history" ON visit_history FOR SELECT USING (salon_id = get_user_salon_id());
CREATE POLICY "Users can manage visit history" ON visit_history FOR ALL USING (salon_id = get_user_salon_id());
