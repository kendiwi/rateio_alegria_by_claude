import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useApp, GroupEvent } from '@/store/AppContext'
import { formatCurrency } from '@/lib/utils'

export function ExpenseChart({ event }: { event: GroupEvent }) {
  const { participants } = useApp()

  const data = useMemo(() => {
    return event.participantIds
      .map((id) => {
        const p = participants.find((p) => p.id === id)
        const spent = event.transactions
          .filter((t) => t.participantId === id && t.status === 'processed' && t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0)
        return { name: p?.name || '?', value: spent }
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [event.participantIds, event.transactions, participants])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Gasto Bruto por Participante</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma despesa processada ainda neste evento.
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ChartContainer config={{ value: { label: 'Gasto', color: 'hsl(var(--primary))' } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `R$ ${val}`}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)' }}
                    content={<ChartTooltipContent formatter={(v: number) => formatCurrency(v)} />}
                  />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
