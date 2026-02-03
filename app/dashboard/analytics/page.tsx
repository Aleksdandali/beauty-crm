import { BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Аналитика</h1>
        <p className="text-muted-foreground">
          Отчеты и статистика работы салона
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Модуль в разработке</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Здесь будут отчеты по выручке, популярности услуг, эффективности мастеров
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
