"use client"

import { useState } from "react"
import { format, isPast, isToday, isTomorrow, isThisWeek } from "date-fns"
import { uk } from "date-fns/locale"
import { Phone, Mail, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RepeatVisitReminderWithRelations } from "@/lib/types/database"

// Mock дані
const mockReminders: RepeatVisitReminderWithRelations[] = [
  {
    id: "1",
    salon_id: "salon-1",
    client_id: "1",
    last_appointment_id: "apt-1",
    service_id: "svc-1",
    staff_id: "staff-1",
    last_visit_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recommended_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
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
    service: {
      id: "svc-1",
      salon_id: "salon-1",
      name: "Манікюр класичний",
      duration: 60,
      price: 1500,
      repeat_interval_days: 21,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    staff: {
      id: "staff-1",
      salon_id: "salon-1",
      first_name: "Анна",
      last_name: "Коваль",
      color: "#3b82f6",
      is_active: true,
      work_schedule: {},
      salary_type: "percentage",
      salary_value: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "2",
    salon_id: "salon-1",
    client_id: "2",
    last_appointment_id: "apt-2",
    service_id: "svc-2",
    staff_id: "staff-2",
    last_visit_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recommended_date: new Date().toISOString().split('T')[0],
    status: "sms_sent",
    sms_sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
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
    service: {
      id: "svc-2",
      salon_id: "salon-1",
      name: "Стрижка жіноча",
      duration: 90,
      price: 2500,
      repeat_interval_days: 28,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    staff: {
      id: "staff-2",
      salon_id: "salon-1",
      first_name: "Марія",
      last_name: "Петренко",
      color: "#ec4899",
      is_active: true,
      work_schedule: {},
      salary_type: "percentage",
      salary_value: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "3",
    salon_id: "salon-1",
    client_id: "3",
    last_appointment_id: "apt-3",
    service_id: "svc-3",
    staff_id: "staff-3",
    last_visit_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    recommended_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: "3",
      salon_id: "salon-1",
      first_name: "Катерина",
      last_name: "Бондаренко",
      phone: "+380 (63) 333-44-55",
      email: "kate@example.com",
      loyalty_points: 30,
      loyalty_tier: "bronze",
      total_spent: 3000,
      total_visits: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    service: {
      id: "svc-3",
      salon_id: "salon-1",
      name: "Чистка обличчя",
      duration: 120,
      price: 3500,
      repeat_interval_days: 21,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">⏳ Очікує</Badge>
    case "sms_sent":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">📱 SMS відправлено</Badge>
    case "called":
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">📞 Зателефоновано</Badge>
    case "scheduled":
      return <Badge variant="outline" className="bg-green-100 text-green-800">✅ Записано</Badge>
    case "completed":
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">✓ Завершено</Badge>
    case "cancelled":
      return <Badge variant="outline" className="bg-red-100 text-red-800">✗ Скасовано</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getPriorityBadge = (date: string) => {
  const reminderDate = new Date(date)
  
  if (isPast(reminderDate)) {
    return <Badge variant="destructive">🔥 Прострочено</Badge>
  }
  if (isToday(reminderDate)) {
    return <Badge className="bg-orange-500">⚡ Сьогодні</Badge>
  }
  if (isTomorrow(reminderDate)) {
    return <Badge className="bg-yellow-500">📅 Завтра</Badge>
  }
  if (isThisWeek(reminderDate)) {
    return <Badge variant="outline">📆 Цього тижня</Badge>
  }
  return <Badge variant="secondary">📅 Запланов</Badge>
}

export default function RepeatVisitsPage() {
  const [reminders, setReminders] = useState<RepeatVisitReminderWithRelations[]>(mockReminders)
  const [activeTab, setActiveTab] = useState("all")

  const filteredReminders = reminders.filter((r) => {
    const date = new Date(r.recommended_date)
    
    switch (activeTab) {
      case "overdue":
        return isPast(date) && r.status === "pending"
      case "today":
        return isToday(date) && r.status !== "completed" && r.status !== "cancelled"
      case "week":
        return isThisWeek(date) && r.status !== "completed" && r.status !== "cancelled"
      case "pending":
        return r.status === "pending"
      default:
        return true
    }
  })

  const stats = {
    total: reminders.length,
    overdue: reminders.filter(r => isPast(new Date(r.recommended_date)) && r.status === "pending").length,
    today: reminders.filter(r => isToday(new Date(r.recommended_date))).length,
    week: reminders.filter(r => isThisWeek(new Date(r.recommended_date))).length,
    scheduled: reminders.filter(r => r.status === "scheduled").length,
  }

  const handleSendSMS = (reminderId: string) => {
    console.log("Відправка SMS для:", reminderId)
    // TODO: Інтеграція SMS API
    setReminders(reminders.map(r => 
      r.id === reminderId 
        ? { ...r, status: "sms_sent" as const, sms_sent_at: new Date().toISOString() }
        : r
    ))
  }

  const handleCall = (reminderId: string) => {
    console.log("Відмітити як зателефоновано:", reminderId)
    setReminders(reminders.map(r => 
      r.id === reminderId 
        ? { ...r, status: "called" as const, called_at: new Date().toISOString() }
        : r
    ))
  }

  const handleCreateAppointment = (reminder: RepeatVisitReminderWithRelations) => {
    console.log("Створення запису для:", reminder.client?.first_name)
    // TODO: Відкрити діалог створення запису з заповненими даними
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Повторні візити</h1>
        <p className="text-muted-foreground">
          Нагадування клієнтам про наступний візит
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прострочені</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Потребують уваги</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сьогодні</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Цього тижня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.week}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Записано</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Всі ({stats.total})</TabsTrigger>
          <TabsTrigger value="overdue">Прострочені ({stats.overdue})</TabsTrigger>
          <TabsTrigger value="today">Сьогодні ({stats.today})</TabsTrigger>
          <TabsTrigger value="week">Тиждень ({stats.week})</TabsTrigger>
          <TabsTrigger value="pending">Очікують</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пріоритет</TableHead>
                  <TableHead>Клієнт</TableHead>
                  <TableHead>Послуга</TableHead>
                  <TableHead>Майстер</TableHead>
                  <TableHead>Останній візит</TableHead>
                  <TableHead>Рекомендована дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Немає нагадувань в цій категорії
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>
                        {getPriorityBadge(reminder.recommended_date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {reminder.client?.first_name} {reminder.client?.last_name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3" />
                            {reminder.client?.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{reminder.service?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Інтервал: {reminder.service?.repeat_interval_days} днів
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: reminder.staff?.color }}
                          />
                          <span className="text-sm">
                            {reminder.staff?.first_name} {reminder.staff?.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(reminder.last_visit_date), "dd MMM yyyy", { locale: uk })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {format(new Date(reminder.recommended_date), "dd MMM yyyy", { locale: uk })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reminder.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {reminder.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendSMS(reminder.id)}
                                title="Відправити SMS"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCall(reminder.id)}
                                title="Зателефонувати"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleCreateAppointment(reminder)}
                            title="Створити запис"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
