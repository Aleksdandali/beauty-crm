#!/bin/bash

# ==============================================
# ПОЛНЫЙ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ
# ==============================================

set -e

echo "🚀 Beauty CRM - Автоматический деплой"
echo "======================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==============================================
# ШАГ 1: Проверка переменных окружения
# ==============================================
echo -e "${BLUE}📋 Шаг 1: Проверка конфигурации...${NC}"

if [ -z "$DATABASE_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_PASSWORD не установлен${NC}"
    echo "Установите: export DATABASE_PASSWORD='your_password'"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN не установлен${NC}"
    echo "Установите: export VERCEL_TOKEN='your_token'"
    exit 1
fi

echo -e "${GREEN}✅ Конфигурация OK${NC}"
echo ""

# ==============================================
# ШАГ 2: Применение SQL миграции
# ==============================================
echo -e "${BLUE}📊 Шаг 2: Применение SQL миграции к Supabase...${NC}"

# Проверяем наличие psql
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql не найден. Устанавливаю PostgreSQL client...${NC}"
    
    # Для macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install libpq
        export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
    else
        echo "Установите PostgreSQL client вручную"
        exit 1
    fi
fi

# Connection string для Supabase
DB_URL="postgresql://postgres:${DATABASE_PASSWORD}@db.aspcqolpluoyrjfdbrso.supabase.co:5432/postgres"

echo "Подключаюсь к базе данных..."
psql "$DB_URL" -f supabase/migrations/001_initial_schema.sql

echo -e "${GREEN}✅ SQL миграция применена${NC}"
echo ""

# ==============================================
# ШАГ 3: Деплой на Vercel
# ==============================================
echo -e "${BLUE}🌐 Шаг 3: Деплой на Vercel...${NC}"

# Проверяем наличие Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Устанавливаю Vercel CLI..."
    npm i -g vercel
fi

# Логинимся через токен
export VERCEL_ORG_ID=""
export VERCEL_PROJECT_ID=""

echo "Деплоим проект..."
vercel --token="$VERCEL_TOKEN" \
  --env NEXT_PUBLIC_SUPABASE_URL="https://aspcqolpluoyrjfdbrso.supabase.co" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcGNxb2xwbHVveXJqZmRicnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTk3NjYsImV4cCI6MjA4NTY5NTc2Nn0.Drzk8Q9o3c0pXA5ANPO7iLL76dTPZ4ntRC7sXlOPi8A" \
  --prod \
  --yes

echo -e "${GREEN}✅ Деплой завершен${NC}"
echo ""

# ==============================================
# ШАГ 4: Создание тестовых данных
# ==============================================
echo -e "${BLUE}📦 Шаг 4: Создание тестовых данных...${NC}"

psql "$DB_URL" << 'EOF'
-- Создаем тестовый салон
INSERT INTO salons (id, name, address, phone, email)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Салон "Красота"',
  'г. Москва, ул. Примерная, д. 1',
  '+7 (999) 123-45-67',
  'info@beauty-salon.com'
) ON CONFLICT DO NOTHING;

-- Создаем услуги
INSERT INTO services (salon_id, name, description, duration, price, cost)
SELECT 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  name, description, duration, price, cost
FROM (VALUES
  ('Маникюр классический', 'Классический маникюр с покрытием', 60, 1500, 300),
  ('Стрижка женская', 'Женская стрижка любой сложности', 90, 2500, 200),
  ('Чистка лица', 'Комплексная чистка лица', 120, 3500, 500)
) AS t(name, description, duration, price, cost)
ON CONFLICT DO NOTHING;

-- Создаем мастеров
INSERT INTO staff_members (salon_id, first_name, last_name, phone, email, specialization, color)
SELECT 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  first_name, last_name, phone, email, specialization, color
FROM (VALUES
  ('Анна', 'Иванова', '+7 (999) 123-45-67', 'anna@example.com', 'Мастер по маникюру', '#3b82f6'),
  ('Мария', 'Петрова', '+7 (999) 234-56-78', 'maria@example.com', 'Парикмахер', '#ec4899'),
  ('Елена', 'Сидорова', '+7 (999) 345-67-89', 'elena@example.com', 'Косметолог', '#8b5cf6')
) AS t(first_name, last_name, phone, email, specialization, color)
ON CONFLICT DO NOTHING;

EOF

echo -e "${GREEN}✅ Тестовые данные созданы${NC}"
echo ""

# ==============================================
# ГОТОВО!
# ==============================================
echo -e "${GREEN}🎉 ДЕПЛОЙ ЗАВЕРШЕН!${NC}"
echo ""
echo "📱 Ваше приложение доступно на Vercel"
echo "🗄️  База данных настроена на Supabase"
echo ""
echo "Следующие шаги:"
echo "1. Создайте пользователя в Supabase Authentication"
echo "2. Свяжите пользователя с салоном через salon_users"
echo "3. Войдите в приложение!"
echo ""
