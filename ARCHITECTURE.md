# Архитектура Beauty CRM

Техническая документация по архитектуре системы.

## 🏗️ Общая архитектура

Beauty CRM построена на современном JAMstack подходе с серверным рендерингом:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Next.js 14 App (React)                    │   │
│  │  • Server Components (RSC)                           │   │
│  │  • Client Components                                 │   │
│  │  • Tailwind CSS + Shadcn/UI                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  • Static Generation (SSG)                                   │
│  • Server-Side Rendering (SSR)                              │
│  • API Routes (Middleware)                                  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
│  ┌────────────────┬──────────────────┬────────────────┐     │
│  │  PostgreSQL    │   Auth Service   │  Storage API   │     │
│  │  • Tables      │   • JWT Tokens   │  • Files       │     │
│  │  • RLS         │   • Sessions     │  • Images      │     │
│  │  • Functions   │   • Providers    │                │     │
│  └────────────────┴──────────────────┴────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Структура проекта

```
beauty-crm/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home (redirect to dashboard)
│   ├── login/                   # Auth pages
│   │   └── page.tsx
│   └── dashboard/               # Main application
│       ├── layout.tsx           # Dashboard layout with sidebar
│       ├── page.tsx             # Calendar (appointments)
│       ├── clients/             # Client management
│       ├── services/            # Services management
│       ├── staff/               # Staff management
│       ├── inventory/           # Inventory (coming soon)
│       ├── finance/             # Finance (coming soon)
│       ├── analytics/           # Analytics (coming soon)
│       └── settings/            # Settings (coming soon)
├── components/
│   ├── ui/                      # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── calendar/                # Custom calendar components
│   │   ├── appointment-calendar.tsx
│   │   └── appointment-dialog.tsx
│   ├── sidebar.tsx              # Navigation sidebar
│   └── header.tsx               # Top header with search
├── lib/
│   ├── supabase/                # Supabase clients
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Auth middleware
│   ├── types/                   # TypeScript types
│   │   └── database.ts          # Database types
│   └── utils.ts                 # Utility functions
├── supabase/
│   └── migrations/              # Database migrations
│       └── 001_initial_schema.sql
├── middleware.ts                # Next.js middleware (auth)
└── ...config files
```

## 🔐 Аутентификация и авторизация

### Поток аутентификации:

1. **Пользователь входит** → Email/Password → Supabase Auth
2. **Supabase создает JWT токен** → Сохраняется в cookie
3. **Middleware проверяет токен** → На каждом запросе
4. **RLS политики применяются** → На уровне базы данных

### Multi-tenancy архитектура:

```sql
-- Каждая таблица имеет salon_id
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  salon_id UUID NOT NULL, -- Ключ для изоляции данных
  ...
);

-- Функция получения salon_id текущего пользователя
CREATE FUNCTION get_user_salon_id()
RETURNS UUID AS $$
  SELECT salon_id 
  FROM salon_users 
  WHERE auth_user_id = auth.uid() 
  LIMIT 1;
$$;

-- RLS политика для полной изоляции
CREATE POLICY "Users see only their salon data"
ON clients FOR SELECT
USING (salon_id = get_user_salon_id());
```

**Гарантии безопасности:**
- ✅ Один салон никогда не видит данные другого
- ✅ Изоляция на уровне базы данных (не приложения)
- ✅ Невозможно обойти через API

## 🗄️ Модель данных

### Основные сущности:

```
Salon (Салон)
  ├── SalonUsers (Пользователи салона)
  ├── Clients (Клиенты)
  ├── StaffMembers (Сотрудники)
  │     └── StaffServices (Связь с услугами)
  ├── Services (Услуги)
  │     └── ServiceCategories (Категории)
  ├── Appointments (Записи)
  │     ├── → Client
  │     ├── → StaffMember
  │     └── → Service
  ├── Products (Товары)
  │     ├── → ProductCategories
  │     └── ProductUsage (Списание)
  ├── Transactions (Финансы)
  └── VisitHistory (История)
```

### Ключевые связи:

- **One-to-Many**: Salon → Clients, Salon → Staff
- **Many-to-Many**: Staff ↔ Services (через staff_services)
- **Composite**: Appointment объединяет Client, Staff, Service

## 🎨 UI/UX паттерны

### Компонентная архитектура:

```tsx
// Server Component (по умолчанию)
// Загружает данные на сервере
export default async function ClientsPage() {
  const clients = await getClients() // Server-side fetch
  return <ClientsTable clients={clients} />
}

// Client Component
// Интерактивные элементы
'use client'
export function ClientsTable({ clients }) {
  const [search, setSearch] = useState('')
  // ... interactive logic
}
```

### Паттерн "Optimistic UI":

```tsx
// 1. Обновляем UI сразу
setClients([...clients, newClient])

// 2. Отправляем запрос
const result = await createClient(newClient)

// 3. Откатываем при ошибке
if (result.error) {
  setClients(clients)
  toast.error('Ошибка')
}
```

## 📊 Управление состоянием

### Текущий подход (MVP):

- **Local State**: useState для компонентов
- **Server State**: Direct fetch в Server Components
- **Form State**: Controlled components

### Рекомендации для масштабирования:

```tsx
// Для сложного состояния:
// 1. Tanstack Query (React Query)
const { data, isLoading } = useQuery({
  queryKey: ['clients'],
  queryFn: getClients
})

// 2. Zustand для глобального состояния
const useStore = create((set) => ({
  salon: null,
  setSalon: (salon) => set({ salon })
}))
```

## 🔄 Паттерны работы с данными

### Server-Side Fetching:

```tsx
// app/dashboard/clients/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  return <ClientsList clients={clients} />
}
```

### Client-Side Mutations:

```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

async function createAppointment(data) {
  const supabase = createClient()
  
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return appointment
}
```

### Real-time подписки (для будущего):

```tsx
useEffect(() => {
  const supabase = createClient()
  
  const channel = supabase
    .channel('appointments')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'appointments' 
      },
      (payload) => {
        // Обновляем UI в реальном времени
        handleAppointmentChange(payload)
      }
    )
    .subscribe()
  
  return () => { channel.unsubscribe() }
}, [])
```

## 🚀 Производительность

### Оптимизации:

1. **Static Generation**: Страницы с редко меняющимися данными
2. **Server Components**: Меньше JavaScript на клиенте
3. **Lazy Loading**: Компоненты и роуты загружаются по требованию
4. **Image Optimization**: Next.js Image component
5. **Database Indexes**: На часто используемых полях

### Кэширование:

```tsx
// Кэширование запросов (Next.js)
export const revalidate = 60 // Revalidate every 60 seconds

// Кэширование на уровне Supabase
const { data } = await supabase
  .from('services')
  .select('*')
  .cache(300) // 5 минут
```

## 📱 Адаптивность

### Breakpoints:

```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-First подход:

```tsx
<div className="
  grid 
  grid-cols-1      /* Mobile: 1 column */
  md:grid-cols-2   /* Tablet: 2 columns */
  lg:grid-cols-3   /* Desktop: 3 columns */
">
```

## 🔮 Планируемые улучшения

### Краткосрочные:

1. **API интеграция**: Подключение к реальной Supabase
2. **Валидация форм**: Zod + React Hook Form
3. **Toast уведомления**: Sonner или react-hot-toast
4. **Loading states**: Skeleton screens
5. **Error boundaries**: Обработка ошибок

### Среднесрочные:

1. **Real-time**: Живое обновление календаря
2. **File uploads**: Загрузка фото клиентов/сотрудников
3. **Email notifications**: Напоминания о записях
4. **SMS notifications**: Интеграция SMS шлюза
5. **Export/Import**: Excel/CSV экспорт данных

### Долгосрочные:

1. **Mobile app**: React Native
2. **Payment integration**: Stripe/Paddle
3. **Online booking**: Публичная страница записи
4. **Analytics dashboard**: Продвинутая аналитика
5. **Multi-language**: i18n поддержка

## 🧪 Тестирование (Рекомендации)

```typescript
// Unit tests: Vitest
describe('calculateLoyaltyPoints', () => {
  it('should calculate points correctly', () => {
    expect(calculateLoyaltyPoints(1000)).toBe(10)
  })
})

// Integration tests: Playwright
test('should create appointment', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=Новая запись')
  // ...
})

// E2E tests: Cypress
cy.visit('/login')
cy.get('[type=email]').type('test@example.com')
cy.get('[type=password]').type('password')
cy.get('button[type=submit]').click()
cy.url().should('include', '/dashboard')
```

## 📊 Мониторинг

### Метрики для отслеживания:

- **Performance**: Web Vitals (LCP, FID, CLS)
- **Errors**: Sentry/LogRocket
- **Analytics**: Vercel Analytics / Google Analytics
- **Database**: Supabase Dashboard logs

## 🔒 Безопасность

### Чеклист безопасности:

- ✅ RLS включен на всех таблицах
- ✅ HTTPS only в production
- ✅ Environment variables для секретов
- ✅ CORS настроен правильно
- ✅ Rate limiting на auth endpoints
- ✅ Input validation на клиенте и сервере
- ✅ XSS protection (React автоматически)
- ✅ CSRF tokens (Next.js middleware)

## 📚 Полезные ресурсы

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Shadcn/UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Архитектура создана с фокусом на:**
- 🚀 Производительность
- 🔐 Безопасность
- 📈 Масштабируемость
- 🛠️ Поддерживаемость
- 💡 Современные best practices
