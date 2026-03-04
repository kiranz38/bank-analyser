import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

export default function ExamplePreview() {
  return (
    <Card className="mt-8 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="h-4 w-4" />
          Example Analysis Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Monthly Leak</p>
            <p className="text-xl font-bold text-destructive">$347</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Annual Savings</p>
            <p className="text-xl font-bold text-success">$4,164</p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { name: 'Subscriptions', value: '$89/mo' },
            { name: 'Food Delivery', value: '$156/mo' },
            { name: 'Fees', value: '$42/mo' },
          ].map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat.name}</span>
              <span className="font-medium">{cat.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Detected subscriptions:</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">Netflix $15.99</Badge>
            <Badge variant="secondary">Spotify $12.99</Badge>
            <Badge variant="secondary">Gym $49.99</Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This is a sample result. Upload your statement to see your personalized analysis.
        </p>
      </CardContent>
    </Card>
  )
}
