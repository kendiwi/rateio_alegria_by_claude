import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useApp, GroupEvent } from '@/store/AppContext'
import { calculateSettlement } from '@/lib/settlement'
import { formatCurrency } from '@/lib/utils'
import { Archive, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function CloseEventModal({ onSuccess }: { onSuccess?: (event: GroupEvent) => void }) {
  const [open, setOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const { activeEvent, globalCaixaBalance, participants, closeEvent, donations } = useApp()

  const snapshot = useMemo(() => {
    if (!activeEvent) return null

    const recentDonations = donations.filter(
      (d) => new Date(d.created_at) >= new Date(activeEvent.createdAt),
    )

    const baseData = {
      allParticipants: participants,
      activeParticipantIds: activeEvent.participantIds,
      transactions: activeEvent.transactions,
      caixaBalance: globalCaixaBalance,
      subsidy: activeEvent.subsidy,
      recentDonations,
    }

    const res = calculateSettlement(baseData)

    return {
      initialCaixa: globalCaixaBalance,
      totalExpenses: res.totalExpenses,
      appliedSubsidy: res.actualSub,
      totalFixedFees: res.totalFixedFees,
      totalAportes: res.totalAportes,
      finalCaixa: globalCaixaBalance - res.actualSub + res.totalAportes,
      balances: res.balances.map((b) => ({
        id: b.id,
        name: b.name,
        spent: b.spent,
        fixedFee: b.fixedFee,
        finalBalance: b.finalBalance,
        subCredit: b.subCredit,
      })),
      expenseDetails: res.expenseDetails,
      aporteDetails: res.aporteDetails,
      donationDetails: res.donationDetails,
    }
  }, [activeEvent, globalCaixaBalance, participants, donations])

  if (!activeEvent || !snapshot) return null

  const pendingCount = activeEvent.transactions.filter((t) => t.status === 'pending').length

  const handleClose = async () => {
    setIsClosing(true)
    try {
      const closed = await closeEvent(snapshot)
      setOpen(false)
      if (closed && onSuccess) {
        onSuccess(closed)
      } else {
        toast.success('Evento fechado com sucesso! Saldo atualizado e doações resetadas.')
      }
    } catch {
      toast.error('Erro ao fechar o evento.')
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isClosing && setOpen(val)}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2 shadow-sm">
          <Archive className="h-4 w-4" /> Fechar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Confirmar Fechamento do Evento</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Ao fechar o evento, os dados atuais serão arquivados, o fundo de caixa global será
            atualizado e as <strong>doações do ciclo atual serão limpas</strong>.
          </p>

          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md flex gap-2 items-start text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Existem <strong>{pendingCount} transações pendentes</strong> que serão ignoradas no
                cálculo final. Revise as despesas se necessário.
              </p>
            </div>
          )}

          <div className="bg-slate-50 border rounded-lg p-4 space-y-3 text-sm">
            <h4 className="font-semibold text-slate-800 mb-2">Resumo Financeiro do Caixa</h4>
            <div className="flex justify-between">
              <span className="text-slate-600">Saldo Atual do Caixa</span>
              <span className="font-medium">{formatCurrency(snapshot.initialCaixa)}</span>
            </div>
            {snapshot.totalAportes > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Total de Aportes ao Caixa</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(snapshot.totalAportes)}
                </span>
              </div>
            )}
            {snapshot.appliedSubsidy > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Subsídio Utilizado (Saída)</span>
                <span className="font-medium text-amber-600">
                  -{formatCurrency(snapshot.appliedSubsidy)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 mt-1">
              <span className="font-bold text-slate-800">Novo Saldo do Caixa</span>
              <span className="font-bold text-slate-800 text-base">
                {formatCurrency(snapshot.finalCaixa)}
              </span>
            </div>
          </div>

          {snapshot.totalFixedFees > 0 && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex justify-between items-center text-sm">
              <span className="text-purple-900 font-medium">Repasse Inst. Câncer</span>
              <div className="text-right">
                <span className="font-bold text-purple-700 block">
                  {formatCurrency(snapshot.totalFixedFees)}
                </span>
                <span className="text-[10px] text-purple-600/70 uppercase tracking-wider font-bold">
                  Isolado do Caixa
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isClosing}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleClose} disabled={isClosing}>
            {isClosing ? 'Fechando...' : 'Confirmar e Arquivar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
