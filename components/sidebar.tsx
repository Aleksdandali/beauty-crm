"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Calendar, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3,
  Settings,
  Scissors,
  UserCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Календар", href: "/dashboard", icon: Calendar },
  { name: "Клієнти", href: "/dashboard/clients", icon: Users },
  { name: "Послуги", href: "/dashboard/services", icon: Scissors },
  { name: "Співробітники", href: "/dashboard/staff", icon: UserCircle },
  { name: "Склад", href: "/dashboard/inventory", icon: Package },
  { name: "Фінанси", href: "/dashboard/finance", icon: DollarSign },
  { name: "Аналітика", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Налаштування", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Scissors className="mr-2 h-6 w-6" />
        <span className="text-xl font-bold">Beauty CRM</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
