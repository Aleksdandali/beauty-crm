"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addMinutes, isSameDay } from "date-fns"
import { ru } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AppointmentWithRelations, StaffMember } from "@/lib/types/database"

interface AppointmentCalendarProps {
  appointments: AppointmentWithRelations[]
  staff: StaffMember[]
  onCreateAppointment: (staffId: string, startTime: Date) => void
  onAppointmentClick: (appointment: AppointmentWithRelations) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00
const DAYS_TO_SHOW = 7

export function AppointmentCalendar({
  appointments,
  staff,
  onCreateAppointment,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const weekStart = startOfWeek(currentDate, { locale: ru })
  const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => addDays(weekStart, i))

  const getAppointmentsForStaffAndTime = (
    staffId: string,
    day: Date,
    hour: number
  ) => {
    return appointments.filter((apt) => {
      const aptStart = new Date(apt.start_time)
      return (
        apt.staff_id === staffId &&
        isSameDay(aptStart, day) &&
        aptStart.getHours() === hour
      )
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "no_show":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: "Заплановано",
      confirmed: "Підтверджено",
      in_progress: "Виконується",
      completed: "Завершено",
      cancelled: "Скасовано",
      no_show: "Не прийшов",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
                  Сьогодні
                </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(weekStart, "LLLL yyyy", { locale: ru })}
        </h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Новий запис
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header with days */}
            <div className="flex border-b bg-muted/50">
              <div className="w-32 flex-shrink-0 border-r p-2 text-sm font-medium">
                Майстер
              </div>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex-1 min-w-[120px] border-r p-2 text-center",
                    isSameDay(day, new Date()) && "bg-primary/10"
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, "EEE", { locale: ru })}
                  </div>
                  <div className={cn(
                    "text-lg font-semibold",
                    isSameDay(day, new Date()) && "text-primary"
                  )}>
                    {format(day, "d", { locale: ru })}
                  </div>
                </div>
              ))}
            </div>

            {/* Staff rows */}
            {staff.map((staffMember) => (
              <div key={staffMember.id} className="flex border-b">
                <div className="w-32 flex-shrink-0 border-r p-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: staffMember.color }}
                    />
                    <div className="text-sm font-medium truncate">
                      {staffMember.first_name} {staffMember.last_name}
                    </div>
                  </div>
                </div>
                {days.map((day) => (
                  <div
                    key={`${staffMember.id}-${day.toISOString()}`}
                    className={cn(
                      "flex-1 min-w-[120px] border-r p-1",
                      isSameDay(day, new Date()) && "bg-primary/5"
                    )}
                  >
                    <div className="space-y-1">
                      {HOURS.map((hour) => {
                        const dayAppointments = getAppointmentsForStaffAndTime(
                          staffMember.id,
                          day,
                          hour
                        )
                        return (
                          <div
                            key={hour}
                            className="relative min-h-[60px] cursor-pointer rounded border border-transparent p-1 hover:border-primary/50 hover:bg-muted/50"
                            onClick={() =>
                              onCreateAppointment(
                                staffMember.id,
                                new Date(day.setHours(hour, 0, 0, 0))
                              )
                            }
                          >
                            {dayAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className={cn(
                                  "mb-1 cursor-pointer rounded border p-1 text-xs",
                                  getStatusColor(apt.status)
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onAppointmentClick(apt)
                                }}
                              >
                                <div className="font-medium truncate">
                                  {format(new Date(apt.start_time), "HH:mm")}
                                </div>
                                <div className="truncate">
                                  {apt.client?.first_name} {apt.client?.last_name}
                                </div>
                                <div className="truncate text-muted-foreground">
                                  {apt.service?.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Заплановано
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Підтверджено
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Виконується
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Завершено
          </Badge>
        </div>
      </div>
    </div>
  )
}
