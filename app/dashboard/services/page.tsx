"use client"

import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
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
import type { Service } from "@/lib/types/database"

// Mock data
const mockServices: Service[] = [
  {
    id: "1",
    salon_id: "salon-1",
    name: "Маникюр классический",
    description: "Классический маникюр с покрытием гель-лаком",
    duration: 60,
    price: 1500,
    cost: 300,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    salon_id: "salon-1",
    name: "Маникюр с дизайном",
    description: "Маникюр с художественным дизайном",
    duration: 90,
    price: 2500,
    cost: 400,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    salon_id: "salon-1",
    name: "Стрижка женская",
    description: "Женская стрижка любой сложности",
    duration: 90,
    price: 2500,
    cost: 200,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    salon_id: "salon-1",
    name: "Окрашивание волос",
    description: "Окрашивание профессиональными красителями",
    duration: 180,
    price: 5000,
    cost: 1500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    salon_id: "salon-1",
    name: "Чистка лица",
    description: "Комплексная чистка лица",
    duration: 120,
    price: 3500,
    cost: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    salon_id: "salon-1",
    name: "Массаж лица",
    description: "Расслабляющий массаж лица",
    duration: 60,
    price: 2000,
    cost: 200,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function ServicesPage() {
  const [services] = useState<Service[]>(mockServices)

  const calculateMargin = (price: number, cost?: number) => {
    if (!cost) return 0
    return Math.round(((price - cost) / price) * 100)
  }

  const getTotalRevenue = () => {
    return services.reduce((sum, service) => sum + service.price, 0)
  }

  const getAveragePrice = () => {
    if (services.length === 0) return 0
    return Math.round(getTotalRevenue() / services.length)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Послуги</h1>
          <p className="text-muted-foreground">
            Керування послугами и прайс-листом
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Додати послугу
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього послуг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя цена</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAveragePrice().toLocaleString("ru-RU")} ₴
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Мин. цена</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.min(...services.map((s) => s.price)).toLocaleString("ru-RU")} ₴
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Макс. цена</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...services.map((s) => s.price)).toLocaleString("ru-RU")} ₴
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead className="text-center">Тривалість</TableHead>
              <TableHead className="text-right">Ціна</TableHead>
              <TableHead className="text-right">Себестоимость</TableHead>
              <TableHead className="text-right">Маржа</TableHead>
              <TableHead className="text-center">Статус</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="max-w-xs">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm">
                    <span className="font-medium">{service.duration}</span>
                    <span className="text-muted-foreground"> мин</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {service.price.toLocaleString("ru-RU")} ₴
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {service.cost ? `${service.cost.toLocaleString("ru-RU")} ₴` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {service.cost ? (
                    <Badge
                      variant="outline"
                      className={
                        calculateMargin(service.price, service.cost) > 70
                          ? "bg-green-100 text-green-800"
                          : calculateMargin(service.price, service.cost) > 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {calculateMargin(service.price, service.cost)}%
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={service.is_active ? "default" : "secondary"}
                  >
                    {service.is_active ? "Активна" : "Неактивна"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
