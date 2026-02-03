"use client"

import { useState } from "react"
import { Plus, Phone, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { StaffMember } from "@/lib/types/database"

// Mock data
const mockStaff: StaffMember[] = [
  {
    id: "1",
    salon_id: "salon-1",
    first_name: "Анна",
    last_name: "Иванова",
    phone: "+7 (999) 123-45-67",
    email: "anna@example.com",
    specialization: "Мастер по маникюру",
    color: "#3b82f6",
    is_active: true,
    work_schedule: {
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: true, start: "09:00", end: "18:00" },
      thursday: { enabled: true, start: "09:00", end: "18:00" },
      friday: { enabled: true, start: "09:00", end: "18:00" },
      saturday: { enabled: true, start: "10:00", end: "16:00" },
      sunday: { enabled: false, start: "10:00", end: "16:00" },
    },
    salary_type: "percentage",
    salary_value: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    salon_id: "salon-1",
    first_name: "Мария",
    last_name: "Петрова",
    phone: "+7 (999) 234-56-78",
    email: "maria@example.com",
    specialization: "Парикмахер",
    color: "#ec4899",
    is_active: true,
    work_schedule: {
      monday: { enabled: true, start: "10:00", end: "19:00" },
      tuesday: { enabled: true, start: "10:00", end: "19:00" },
      wednesday: { enabled: true, start: "10:00", end: "19:00" },
      thursday: { enabled: true, start: "10:00", end: "19:00" },
      friday: { enabled: true, start: "10:00", end: "19:00" },
      saturday: { enabled: true, start: "11:00", end: "17:00" },
      sunday: { enabled: false, start: "11:00", end: "17:00" },
    },
    salary_type: "percentage",
    salary_value: 55,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    salon_id: "salon-1",
    first_name: "Елена",
    last_name: "Сидорова",
    phone: "+7 (999) 345-67-89",
    email: "elena@example.com",
    specialization: "Косметолог",
    color: "#8b5cf6",
    is_active: true,
    work_schedule: {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "17:00" },
      saturday: { enabled: false, start: "09:00", end: "17:00" },
      sunday: { enabled: false, start: "09:00", end: "17:00" },
    },
    salary_type: "percentage",
    salary_value: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    salon_id: "salon-1",
    first_name: "Ольга",
    last_name: "Новикова",
    phone: "+7 (999) 456-78-90",
    email: "olga@example.com",
    specialization: "Массажист",
    color: "#10b981",
    is_active: true,
    work_schedule: {
      monday: { enabled: true, start: "11:00", end: "20:00" },
      tuesday: { enabled: true, start: "11:00", end: "20:00" },
      wednesday: { enabled: true, start: "11:00", end: "20:00" },
      thursday: { enabled: true, start: "11:00", end: "20:00" },
      friday: { enabled: true, start: "11:00", end: "20:00" },
      saturday: { enabled: true, start: "12:00", end: "18:00" },
      sunday: { enabled: false, start: "12:00", end: "18:00" },
    },
    salary_type: "percentage",
    salary_value: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const getSalaryTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    percentage: "% от выручки",
    fixed: "Фиксированная",
    hourly: "Почасовая",
  }
  return labels[type] || type
}

const getWorkingDays = (schedule: Record<string, any>) => {
  const days = Object.values(schedule).filter((day: any) => day.enabled)
  return days.length
}

export default function StaffPage() {
  const [staff] = useState<StaffMember[]>(mockStaff)

  const getInitials = (member: StaffMember) => {
    return `${member.first_name[0]}${member.last_name?.[0] || ""}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Співробітники</h1>
          <p className="text-muted-foreground">
            Керування мастерами и персоналом салона
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Додати співробітника
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього співробітников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активних</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter((s) => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Записів сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Всього по салону</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Виручка сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28,500 ₴</div>
            <p className="text-xs text-muted-foreground">+15% к вчера</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div
              className="h-2"
              style={{ backgroundColor: member.color }}
            />
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {member.specialization}
                      </p>
                    </div>
                    <Badge variant={member.is_active ? "default" : "secondary"}>
                      {member.is_active ? "Активен" : "Неактивен"}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Робочих днів: {getWorkingDays(member.work_schedule)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Тип оплати
                      </p>
                      <p className="font-medium">
                        {getSalaryTypeLabel(member.salary_type)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Ставка</p>
                      <p className="font-medium">
                        {member.salary_type === "percentage"
                          ? `${member.salary_value}%`
                          : `${member.salary_value.toLocaleString("ru-RU")} ₴`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Детальніше
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
