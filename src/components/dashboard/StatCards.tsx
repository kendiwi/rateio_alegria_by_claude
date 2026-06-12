import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  Wallet,
  Users,
  AlertCircle,
  TrendingUp,
  Landmark,
  UserCheck,
  User,
  ArrowDownToLine,
} from 'lucide-react'
import { GroupEvent, useApp } from '@/store/AppContext'
import { useMemo } from 'react'
import { calculateSettlement } from '@/lib/settlement'

export function StatCards({ event }: { event: GroupEvent }) {
  const { donations, participants, globalCaixaBalance } = useApp()

  const stats = useMemo(() => {
    const recentDonations = donations.filter(
      (d) => new Date(d.created_at) >= new Date(event.createdAt),
    )

    const res = calculateSettlement({
      allParticipants: participants,
      activeParticipantIds: event.participantIds,
      transactions: event.transactions,
      caixaBalance: globalCaixaBalance,
      subsidy: event.subsidy,
      recentDonations,
    })

    const validActiveParticipants = participants.filter(
      (p) => event.participantIds.includes(p.id) && p.role !== 'doador',
    )
    const membroCount = validActiveParticipants.filter((p) => p.role === 'membro').length
    const avulsoCount = validActiveParticipants.filter((p) => p.role === 'avulso').length

    const pendingCount = event.transactions.filter((t) => t.status !== 'processed').length

    return {
      novoCaixa: globalCaixaBalance + res.totalAportes - res.actualSub,
      totalAportes: res.totalAportes,
      totalExpenses: res.totalExpenses,
      actualSub: res.actualSub,
      activeCount: validActiveParticipants.length,
      membroAvg: res.finalAvg + (membroCount > 0 ? 25 : 0),
      avulsoAvg: res.finalAvg,
      membroCount,
      avulsoCount,
      pendingCount,
      aportesCount: event.transactions.filter(
        (t) => t.type === 'aporte' && t.status === 'processed',
      ).length,
    }
  }, [event, participants, globalCaixaBalance, donations])

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novo Saldo do Caixa</CardTitle>
          <Landmark className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">
            {formatCurrency(stats.novoCaixa)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Projeção com evento atual</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aportes Caixa</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalAportes)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.aportesCount} registro(s) no evento
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Eventos</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">Custo Bruto Total</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Subsidiado Atual</CardTitle>
          <ArrowDownToLine className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(stats.actualSub)}</div>
          <p className="text-xs text-muted-foreground mt-1">Desconto aplicado do caixa</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pessoas no Rateio</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Participantes elegíveis</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média por Membro</CardTitle>
          <UserCheck className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(stats.membroAvg)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Baseado em {stats.membroCount} membro(s)
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média por Avulso</CardTitle>
          <User className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(stats.avulsoAvg)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Baseado em {stats.avulsoCount} avulso(s)
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendências</CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{stats.pendingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Transações pendentes/erros</p>
        </CardContent>
      </Card>
    </div>
  )
}
