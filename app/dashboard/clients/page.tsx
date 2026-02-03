"use client"

import { useState } from "react"
import { Plus, Search, Phone, Mail, Calendar, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Client } from "@/lib/types/database"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

// Mock data
const mockClients: Client[] = [
  {
    id: "1",
    salon_id: "salon-1",
    first_name: "Олена",
    last_name: "Коваленко",
    phone: "+380 (67) 111-22-33",
    email: "olena@example.com",
    date_of_birth: "1990-05-15",
    gender: "female",
    loyalty_points: 150,
    loyalty_tier: "gold",
    total_spent: 15000,
    total_visits: 12,
    last_visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Віддає перевагу майстру Анні",
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
    date_of_birth: "1985-08-22",
    gender: "female",
    loyalty_points: 80,
    loyalty_tier: "silver",
    total_spent: 8000,
    total_visits: 6,
    last_visit_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    salon_id: "salon-1",
    first_name: "Катерина",
    last_name: "Бондаренко",
    phone: "+380 (63) 333-44-55",
    email: "kate@example.com",
    date_of_birth: "1995-03-10",
    gender: "female",
    loyalty_points: 30,
    loyalty_tier: "bronze",
    total_spent: 3000,
    total_visits: 2,
    last_visit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    salon_id: "salon-1",
    first_name: "Ірина",
    last_name: "Мельник",
    phone: "+380 (95) 444-55-66",
    email: "iryna@example.com",
    date_of_birth: "1988-11-30",
    gender: "female",
    loyalty_points: 200,
    loyalty_tier: "platinum",
    total_spent: 25000,
    total_visits: 20,
    last_visit_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "VIP клієнт, любить комплексні процедури",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const getLoyaltyColor = (tier: string) => {
  switch (tier) {
    case "platinum":
      return "bg-slate-900 text-white"
    case "gold":
      return "bg-yellow-500 text-white"
    case "silver":
      return "bg-gray-400 text-white"
    case "bronze":
      return "bg-orange-700 text-white"
    default:
      return "bg-gray-200 text-gray-800"
  }
}

const getLoyaltyLabel = (tier: string) => {
  const labels: Record<string, string> = {
    platinum: "Платина",
    gold: "Золото",
    silver: "Серебро",
    bronze: "Бронза",
  }
  return labels[tier] || tier
}

export default function ClientsPage() {
  const [clients] = useState<Client[]>(mockClients)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase()
    return (
      client.first_name.toLowerCase().includes(query) ||
      client.last_name?.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.email?.toLowerCase().includes(query)
    )
  })

  const getInitials = (client: Client) => {
    return `${client.first_name[0]}${client.last_name?.[0] || ""}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Клієнти</h1>
          <p className="text-muted-foreground">
            Керування базою клієнтів салону
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Додати клієнта
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всього клієнтів</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нових за місяць</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+20% до минулого</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP клієнти</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.loyalty_tier === "platinum").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Середній чек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,850 ₴</div>
            <p className="text-xs text-muted-foreground">+5% до минулого</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук за ім'ям, телефоном або email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Клієнт</TableHead>
              <TableHead>Контакти</TableHead>
              <TableHead>Програма лояльності</TableHead>
              <TableHead>Візити</TableHead>
              <TableHead>Витрачено</TableHead>
              <TableHead>Останній візит</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={client.avatar_url} />
                      <AvatarFallback>{getInitials(client)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {client.first_name} {client.last_name}
                      </div>
                      {client.notes && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {client.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {client.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge className={getLoyaltyColor(client.loyalty_tier)}>
                      <Award className="mr-1 h-3 w-3" />
                      {getLoyaltyLabel(client.loyalty_tier)}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {client.loyalty_points} баллов
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">{client.total_visits}</div>
                    <div className="text-xs text-muted-foreground">візитів</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {client.total_spent.toLocaleString("ru-RU")} ₴
                  </div>
                </TableCell>
                <TableCell>
                  {client.last_visit_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(client.last_visit_date), "dd MMM yyyy", {
                        locale: ru,
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Детальніше
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
