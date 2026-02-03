import { DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Финансы</h1>
        <p className="text-muted-foreground">
          Касса, расходы и зарплаты
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Модуль в разработке</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Здесь будет управление финансами, касса, расчет зарплат и отчетность
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
