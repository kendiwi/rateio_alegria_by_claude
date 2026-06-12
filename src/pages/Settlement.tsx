import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RoleTag } from '@/components/ui/RoleTag'
import { formatCurrency } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, ArrowRightLeft } from 'lucide-react'

export default function Settlement() {
  const { activeEvent, participants } = useApp()

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in text-center space-y-4">
        <ArrowRightLeft className="h-16 w-16 text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-800">Rateio Indisponível</h2>
        <p className="text-slate-500">Inicie um evento para visualizar e calcular o rateio.</p>
      </div>
    )
  }

  const activeParticipants = participants.filter(p => activeEvent.participantIds.includes(p.id))
  const expenses = activeEvent.transactions.filter(t => t.type === 'expense' && t.status !== 'error')
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const rateioParticipants = activeParticipants.filter(p => p.role === 'membro' || p.role === 'avulso')
  const rateioAmount =
    rateioParticipants.length > 0
      ? (totalExpenses - (activeEvent.subsidy || 0)) / rateioParticipants.length
      : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resumo do Rateio</h1>
        <p className="text-muted-foreground mt-1">Acompanhamento em tempo real dos gastos e saldos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Total de Gastos</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">{formatCurrency(totalExpenses)}</h2>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-600">Pessoas no Rateio</p>
            <h2 className="text-3xl font-bold text-blue-700 mt-2">{rateioParticipants.length}</h2>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-emerald-600">Cota por Pessoa</p>
            <h2 className="text-3xl font-bold text-emerald-700 mt-2">{formatCurrency(rateioAmount)}</h2>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <InfoIcon className="h-4 w-4 !text-amber-600" />
        <AlertTitle className="font-semibold text-amber-800">Cálculo Automático</AlertTitle>
        <AlertDescription className="text-amber-700/80">
          Os valores são atualizados automaticamente sempre que você ativa/desativa um participante ou registra um novo gasto. Apenas Membros e Avulsos dividem as despesas.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Balanço Individual</CardTitle>
          <CardDescription>Quem pagou o que, e quanto deve receber ou pagar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeParticipants.map(p => {
              const pExpenses = expenses
                .filter(e => e.participantId === p.id)
                .reduce((sum, e) => sum + e.amount, 0)
              let finalBalance = pExpenses
              if (p.role === 'membro' || p.role === 'avulso') finalBalance -= rateioAmount

              return (
                <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <RoleTag role={p.role} className="scale-75 origin-left h-5" />
                      </div>
                      <p className="text-sm text-slate-500">Gastou: {formatCurrency(pExpenses)}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${finalBalance > 0.01 ? 'bg-green-100 text-green-700' : finalBalance < -0.01 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {finalBalance > 0.01 ? `Recebe ${formatCurrency(finalBalance)}` : finalBalance < -0.01 ? `Paga ${formatCurrency(Math.abs(finalBalance))}` : 'Quitado'}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
