export interface Salon {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  settings?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SalonUser {
  id: string
  salon_id: string
  auth_user_id: string
  email: string
  full_name?: string
  role: 'owner' | 'admin' | 'master' | 'reception' | 'staff'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  salon_id: string
  first_name: string
  last_name?: string
  phone: string
  email?: string
  date_of_birth?: string
  gender?: string
  notes?: string
  loyalty_points: number
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  total_spent: number
  total_visits: number
  last_visit_date?: string
  avatar_url?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  salon_id: string
  name: string
  description?: string
  sort_order: number
  created_at: string
}

export interface Service {
  id: string
  salon_id: string
  category_id?: string
  name: string
  description?: string
  duration: number
  price: number
  cost?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StaffMember {
  id: string
  salon_id: string
  user_id?: string
  first_name: string
  last_name?: string
  phone?: string
  email?: string
  specialization?: string
  avatar_url?: string
  color: string
  is_active: boolean
  work_schedule: Record<string, any>
  salary_type: 'percentage' | 'fixed' | 'hourly'
  salary_value: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  salon_id: string
  client_id: string
  staff_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  client_notes?: string
  price: number
  discount: number
  final_price: number
  payment_status: 'pending' | 'paid' | 'partially_paid'
  payment_method?: string
  reminder_sent: boolean
  reminder_sent_at?: string
  created_at: string
  updated_at: string
}

export interface AppointmentWithRelations extends Appointment {
  client?: Client
  staff?: StaffMember
  service?: Service
}

export interface Product {
  id: string
  salon_id: string
  category_id?: string
  name: string
  description?: string
  sku?: string
  barcode?: string
  unit: string
  quantity: number
  min_quantity: number
  cost_price?: number
  sell_price?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  salon_id: string
  appointment_id?: string
  client_id?: string
  staff_id?: string
  type: 'income' | 'expense' | 'salary'
  category?: string
  amount: number
  payment_method?: string
  description?: string
  created_by?: string
  created_at: string
}
