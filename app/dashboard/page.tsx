"use client"

import { useState } from "react"
import { AppointmentCalendar } from "@/components/calendar/appointment-calendar"
import { AppointmentDialog } from "@/components/calendar/appointment-dialog"
import type { AppointmentWithRelations, Client, Service, StaffMember } from "@/lib/types/database"
import type { AppointmentFormData } from "@/components/calendar/appointment-dialog"

// Mock data for development
const mockStaff: StaffMember[] = [
  {
    id: "1",
    salon_id: "salon-1",
    first_name: "Анна",
    last_name: "Коваль",
    phone: "+380 (67) 123-45-67",
    email: "anna@example.com",
    specialization: "Майстер манікюру",
    color: "#3b82f6",
    is_active: true,
    work_schedule: {},
    salary_type: "percentage",
    salary_value: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    salon_id: "salon-1",
    first_name: "Марія",
    last_name: "Петренко",
    phone: "+380 (50) 234-56-78",
    email: "maria@example.com",
    specialization: "Перукар",
    color: "#ec4899",
    is_active: true,
    work_schedule: {},
    salary_type: "percentage",
    salary_value: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    salon_id: "salon-1",
    first_name: "Олена",
    last_name: "Сидоренко",
    phone: "+380 (63) 345-67-89",
    email: "olena@example.com",
    specialization: "Косметолог",
    color: "#8b5cf6",
    is_active: true,
    work_schedule: {},
    salary_type: "percentage",
    salary_value: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockClients: Client[] = [
  {
    id: "1",
    salon_id: "salon-1",
    first_name: "Олена",
    last_name: "Коваленко",
    phone: "+380 (67) 111-22-33",
    email: "olena@example.com",
    loyalty_points: 150,
    loyalty_tier: "gold",
    total_spent: 15000,
    total_visits: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    salon_id: "salon-1",
    first_name: "Наталія",
    last_name: "Шевченко",
    phone: "+380 (50) 222-33-44",
    email: "natalia@example.com",
    loyalty_points: 80,
    loyalty_tier: "silver",
    total_spent: 8000,
    total_visits: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockServices: Service[] = [
  {
    id: "1",
    salon_id: "salon-1",
    name: "Манікюр класичний",
    description: "Класичний манікюр з покриттям",
    duration: 60,
    price: 1500,
    repeat_interval_days: 21,
    sms_reminder_days_before: 7,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    salon_id: "salon-1",
    name: "Стрижка жіноча",
    description: "Жіноча стрижка будь-якої складності",
    duration: 90,
    price: 2500,
    repeat_interval_days: 28,
    sms_reminder_days_before: 7,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    salon_id: "salon-1",
    name: "Чистка обличчя",
    description: "Комплексна чистка обличчя",
    duration: 120,
    price: 3500,
    repeat_interval_days: 21,
    sms_reminder_days_before: 7,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockAppointments: AppointmentWithRelations[] = [
  {
    id: "1",
    salon_id: "salon-1",
    client_id: "1",
    staff_id: "1",
    service_id: "1",
    start_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    status: "confirmed",
    price: 1500,
    discount: 0,
    final_price: 1500,
    payment_status: "pending",
    reminder_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: mockClients[0],
    staff: mockStaff[0],
    service: mockServices[0],
  },
  {
    id: "2",
    salon_id: "salon-1",
    client_id: "2",
    staff_id: "2",
    service_id: "2",
    start_time: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    status: "scheduled",
    price: 2500,
    discount: 0,
    final_price: 2500,
    payment_status: "pending",
    reminder_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: mockClients[1],
    staff: mockStaff[1],
    service: mockServices[1],
  },
]

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>(mockAppointments)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string>()
  const [selectedStartTime, setSelectedStartTime] = useState<Date>()

  const handleCreateAppointment = (staffId: string, startTime: Date) => {
    setSelectedStaffId(staffId)
    setSelectedStartTime(startTime)
    setDialogOpen(true)
  }

  const handleAppointmentClick = (appointment: AppointmentWithRelations) => {
    console.log("Appointment clicked:", appointment)
    // TODO: Open appointment details dialog
  }

  const handleSubmitAppointment = async (data: AppointmentFormData) => {
    console.log("Creating appointment:", data)
    
    // TODO: Call Supabase API
    // For now, just add to mock data
    const service = mockServices.find((s) => s.id === data.service_id)
    const client = mockClients.find((c) => c.id === data.client_id)
    const staff = mockStaff.find((s) => s.id === data.staff_id)
    
    if (service && client && staff) {
      const endTime = new Date(data.start_time)
      endTime.setMinutes(endTime.getMinutes() + service.duration)
      
      const newAppointment: AppointmentWithRelations = {
        id: String(Date.now()),
        salon_id: "salon-1",
        client_id: data.client_id,
        staff_id: data.staff_id,
        service_id: data.service_id,
        start_time: data.start_time.toISOString(),
        end_time: endTime.toISOString(),
        status: "scheduled",
        notes: data.notes,
        client_notes: data.client_notes,
        price: service.price,
        discount: 0,
        final_price: service.price,
        payment_status: "pending",
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client,
        staff,
        service,
      }
      
      setAppointments([...appointments, newAppointment])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Електронний журнал</h1>
        <p className="text-muted-foreground">
          Керування записами та розкладом майстрів
        </p>
      </div>

      <AppointmentCalendar
        appointments={appointments}
        staff={mockStaff}
        onCreateAppointment={handleCreateAppointment}
        onAppointmentClick={handleAppointmentClick}
      />

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clients={mockClients}
        services={mockServices}
        staff={mockStaff}
        defaultStaffId={selectedStaffId}
        defaultStartTime={selectedStartTime}
        onSubmit={handleSubmitAppointment}
      />
    </div>
  )
}
