import { Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Склад</h1>
        <p className="text-muted-foreground">
          Керування товарами и матеріалами
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Модуль в розробці</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Здесь будет учет товаров, матеріалов, списание и контроль остатков
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
