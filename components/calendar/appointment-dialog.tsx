"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Client, Service, StaffMember } from "@/lib/types/database"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  services: Service[]
  staff: StaffMember[]
  defaultStaffId?: string
  defaultStartTime?: Date
  onSubmit: (data: AppointmentFormData) => void
}

export interface AppointmentFormData {
  client_id: string
  staff_id: string
  service_id: string
  start_time: Date
  notes?: string
  client_notes?: string
}

export function AppointmentDialog({
  open,
  onOpenChange,
  clients,
  services,
  staff,
  defaultStaffId,
  defaultStartTime,
  onSubmit,
}: AppointmentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(defaultStartTime || new Date())
  const [time, setTime] = useState(
    defaultStartTime ? format(defaultStartTime, "HH:mm") : "10:00"
  )
  const [clientId, setClientId] = useState("")
  const [staffId, setStaffId] = useState(defaultStaffId || "")
  const [serviceId, setServiceId] = useState("")
  const [notes, setNotes] = useState("")
  const [clientNotes, setClientNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !clientId || !staffId || !serviceId) {
      return
    }

    const [hours, minutes] = time.split(":").map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)

    onSubmit({
      client_id: clientId,
      staff_id: staffId,
      service_id: serviceId,
      start_time: startTime,
      notes,
      client_notes: clientNotes,
    })

    // Reset form
    setClientId("")
    setStaffId(defaultStaffId || "")
    setServiceId("")
    setNotes("")
    setClientNotes("")
    onOpenChange(false)
  }

  const selectedService = services.find((s) => s.id === serviceId)
  const price = selectedService?.price || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
          <DialogDescription>
            Создайте новую запись для клиента
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Client Selection */}
            <div className="grid gap-2">
              <Label htmlFor="client">Клиент *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Staff Selection */}
            <div className="grid gap-2">
              <Label htmlFor="staff">Мастер *</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите мастера" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Selection */}
            <div className="grid gap-2">
              <Label htmlFor="service">Услуга *</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.duration} мин - {service.price} ₽
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Дата *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Время *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Price Display */}
            {selectedService && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span>Длительность:</span>
                  <span className="font-medium">{selectedService.duration} минут</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Стоимость:</span>
                  <span className="font-medium">{price} ₽</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Заметки мастера</Label>
              <Textarea
                id="notes"
                placeholder="Дополнительная информация для мастера..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clientNotes">Пожелания клиента</Label>
              <Textarea
                id="clientNotes"
                placeholder="Особые пожелания клиента..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Создать запись</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
