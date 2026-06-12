import { useState, useMemo } from 'react'
import { useApp } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { calculateSettlement } from '@/lib/settlement'
import { ArrowRightLeft, Landmark } from 'lucide-react'
import { toast } from 'sonner'

export default function Settlement() {
  const { activeEvent, participants, globalCaixaBalance, setSubsidy, donations } = useApp()
  const [subsidyInput, setSubsidyInput] = useState('')

  const simulatedSubsidy = parseFloat(subsidyInput.replace(',', '.')) || 0

  const settlement = useMemo(() => {
    if (!activeEvent) return null
    return calculateSettlement({
      allParticipants: participants,
      activeParticipantIds: activeEvent.participantIds,
      transactions: activeEvent.transactions,
      caixaBalance: globalCaixaBalance,
      subsidy: activeEvent.subsidy || 0,
      recentDonations: donations.map(d => ({ participant_id: d.participant_id, description: d.description, date: d.date })),
    })
  }, [participants, activeEvent, globalCaixaBalance, donations])

  const simulatedSettlement = useMemo(() => {
    if (!activeEvent || !subsidyInput) return null
    return calculateSettlement({
      allParticipants: participants,
      activeParticipantIds: activeEvent.participantIds,
      transactions: activeEvent.transactions,
      caixaBalance: globalCaixaBalance,
      subsidy: simulatedSubsidy,
      recentDonations: donations.map(d => ({ participant_id: d.participant_id, description: d.description, date: d.date })),
    })
  }, [participants, activeEvent, globalCaixaBalance, donations, simulatedSubsidy, subsidyInput])

  if (!activeEvent || !settlement) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in text-center space-y-4">
        <ArrowRightLeft className="h-16 w-16 text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-800">Rateio Indisponível</h2>
        <p className="text-slate-500">Inicie um evento para visualizar e calcular o rateio.</p>
      </div>
    )
  }

  const applySubsidy = () => {
    if (isNaN(simulatedSubsidy) || simulatedSubsidy < 0) { toast.error('Valor de subsídio inválido.'); return }
    if (simulatedSubsidy > globalCaixaBalance) { toast.error('Subsídio excede o saldo do caixa.'); return }
    setSubsidy(simulatedSubsidy)
    setSubsidyInput('')
    toast.success(`Subsídio de ${formatCurrency(simulatedSubsidy)} aplicado ao evento.`)
  }

  const maxSubsidy = Math.max(0, globalCaixaBalance)
  const currentSubsidy = activeEvent.subsidy || 0
  const rateioParticipants = participants.filter(p => activeEvent.participantIds.includes(p.id) && (p.role === 'membro' || p.role === 'avulso'))

  const processed = activeEvent.transactions.filter(t => t.status === 'processed' && t.type === 'expense')
  const totalCafe = processed.filter(t => (t as any).category === 'cafe').reduce((s, t) => s + t.amount, 0)
  const totalAlmoco = processed.filter(t => (t as any).category === 'almoco').reduce((s, t) => s + t.amount, 0)
  const totalDoacao = processed.filter(t => (t as any).category === 'doacao').reduce((s, t) => s + t.amount, 0)
  const cafeCount = rateioParticipants.filter(p => p.cafe).length
  const almocoCount = rateioParticipants.filter(p => p.almoco).length
  const doacaoCount = rateioParticipants.filter(p => p.doacao).length
  const subFrac = settlement.totalExpenses > 0 ? Math.min(1, currentSubsidy / settlement.totalExpenses) : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cálculo do Rateio</h1>
        <p className="text-muted-foreground mt-1">Acompanhamento em tempo real dos gastos e saldos.</p>
      </div>

      {/* Purple summary banner */}
      <Card className="bg-purple-700 text-white border-purple-600 overflow-hidden relative shadow-md">
        <div className="absolute right-0 top-0 h-full w-48 bg-purple-600/30 -skew-x-12 translate-x-8" />
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-white/90 text-base font-medium">Resumo do Rateio</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-purple-200 text-xs font-medium mb-1">Gastos Totais</p>
              <p className="text-2xl font-bold">{formatCurrency(settlement.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs font-medium mb-1">Custo a Ratear</p>
              <p className="text-2xl font-bold">{formatCurrency(Math.max(0, settlement.totalExpenses - currentSubsidy))}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs font-medium mb-1">Média/Pessoa</p>
              <p className="text-2xl font-bold">{formatCurrency(settlement.finalAvg)}</p>
            </div>
          </div>
          {currentSubsidy > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-500/50 flex items-center gap-2 text-sm text-purple-200">
              <Landmark className="h-4 w-4" />
              Subsídio aplicado: {formatCurrency(currentSubsidy)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subsidy injection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Injetar Subsídio do Caixa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Landmark className="h-4 w-4 text-emerald-600" />
            Saldo disponível no caixa: <span className="font-semibold text-emerald-700">{formatCurrency(maxSubsidy)}</span>
          </div>

          <div>
            <input
              type="range"
              min={0}
              max={maxSubsidy}
              step={10}
              value={subsidyInput ? Math.min(simulatedSubsidy, maxSubsidy) : currentSubsidy}
              onChange={e => setSubsidyInput(e.target.value)}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>R$ 0</span>
              <span>{formatCurrency(maxSubsidy)}</span>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Valor do Subsídio (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={maxSubsidy}
                placeholder={currentSubsidy > 0 ? String(currentSubsidy) : '0'}
                value={subsidyInput}
                onChange={e => setSubsidyInput(e.target.value)}
              />
            </div>
            {subsidyInput && simulatedSettlement && (
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-purple-600">Nova Média Simulada</Label>
                <div className="h-10 flex items-center px-3 border rounded-md bg-purple-50 text-purple-700 font-semibold">
                  {formatCurrency(simulatedSettlement.finalAvg)}
                </div>
              </div>
            )}
            <Button onClick={applySubsidy} disabled={!subsidyInput} className="bg-purple-600 hover:bg-purple-700 h-10">
              Aplicar ao Evento
            </Button>
          </div>

          {currentSubsidy > 0 && (
            <p className="text-xs text-slate-500">
              Subsídio atual aplicado: <span className="font-semibold text-purple-700">{formatCurrency(currentSubsidy)}</span>
              {' '}—{' '}
              <button className="text-red-500 underline hover:no-underline" onClick={() => { setSubsidy(0); toast.success('Subsídio removido.') }}>
                Remover
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Individual balances table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Saldos Finais Individuais</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {settlement.balances.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum participante no rateio.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-4 py-3 font-medium text-slate-600">Participante</th>
                    <th className="px-4 py-3 font-medium text-amber-600 text-right">Café</th>
                    <th className="px-4 py-3 font-medium text-blue-600 text-right">Almoço</th>
                    <th className="px-4 py-3 font-medium text-pink-600 text-right">Doação</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Taxa</th>
                    <th className="px-4 py-3 font-medium text-red-600 text-right">T.Desp</th>
                    <th className="px-4 py-3 font-medium text-green-600 text-right">T.Pago</th>
                    <th className="px-4 py-3 font-medium text-slate-800 text-right">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {settlement.balances.map(b => {
                    const aportes = activeEvent.transactions
                      .filter(t => t.type === 'aporte' && t.participantId === b.id && t.status !== 'error')
                      .reduce((s, t) => s + t.amount, 0)

                    const cafeShare = b.isParticipant && b.cafe && cafeCount > 0 ? (totalCafe * (1 - subFrac)) / cafeCount : null
                    const almocoShare = b.isParticipant && b.almoco && almocoCount > 0 ? (totalAlmoco * (1 - subFrac)) / almocoCount : null
                    const doacaoShare = b.isParticipant && b.doacao && doacaoCount > 0 ? (totalDoacao * (1 - subFrac)) / doacaoCount : null

                    const totalDebt = b.shareOfExpenses + (b.fixedFee || 0)
                    const finalBalance = aportes - totalDebt

                    return (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800">{b.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{b.role}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-amber-700">
                          {cafeShare !== null ? formatCurrency(cafeShare) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-700">
                          {almocoShare !== null ? formatCurrency(almocoShare) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-pink-700">
                          {doacaoShare !== null ? formatCurrency(doacaoShare) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {b.role === 'membro' ? (
                            <span className="font-medium text-slate-700">{formatCurrency(b.fixedFee || 0)}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {totalDebt > 0 ? formatCurrency(totalDebt) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {aportes > 0 ? formatCurrency(aportes) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${finalBalance > 0.01 ? 'text-green-600' : finalBalance < -0.01 ? 'text-red-600' : 'text-slate-500'}`}>
                            {finalBalance > 0.01 ? '+' : ''}{formatCurrency(finalBalance)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
