import { Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">
          Настройки салона и профиля
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Settings className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Модуль в разработке</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Здесь будут настройки салона, рабочего времени, уведомлений и профиля
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
