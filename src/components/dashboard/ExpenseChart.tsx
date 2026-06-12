import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
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
        const firstName = p?.name?.split(' ')[0] || '?'
        return { name: firstName, full: p?.name || '?', value: spent }
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v}`}
                  width={55}
                />
                <Tooltip
                  formatter={(v: number, _: string, entry: any) => [formatCurrency(v), entry.payload.full]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
