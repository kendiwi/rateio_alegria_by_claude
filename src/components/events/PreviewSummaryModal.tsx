import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/store/AppContext'
import { generateEventSummaryText } from '@/lib/summary'
import { Check, Eye, Copy, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { calculateSettlement } from '@/lib/settlement'

export function PreviewSummaryModal() {
  const { activeEvent, participants, donations, globalCaixaBalance } = useApp()

  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('Carregando pré-visualização...')

  useEffect(() => {
    if (open && activeEvent) {
      try {
        const recentDonations = donations.filter(
          (d) => new Date(d.created_at) >= new Date(activeEvent.createdAt),
        )

        const res = calculateSettlement({
          allParticipants: participants,
          activeParticipantIds: activeEvent.participantIds,
          transactions: activeEvent.transactions,
          caixaBalance: globalCaixaBalance,
          subsidy: activeEvent.subsidy,
          recentDonations,
        })

        const snapshot = {
          initialCaixa: globalCaixaBalance,
          totalExpenses: res.totalExpenses,
          appliedSubsidy: res.actualSub,
          totalFixedFees: res.totalFixedFees,
          totalAportes: res.totalAportes,
          finalCaixa: globalCaixaBalance - res.actualSub + res.totalAportes,
          balances: res.balances.map((b) => ({
            id: b.id,
            name: b.name,
            role: b.role,
            spent: b.spent,
            fixedFee: b.fixedFee,
            shareOfExpenses: b.shareOfExpenses,
            cafeShare: b.cafeShare,
            almocoShare: b.almocoShare,
            doacaoShare: b.doacaoShare,
            finalBalance: b.finalBalance,
            subCredit: b.subCredit,
          })),
          expenseDetails: res.expenseDetails,
          aporteDetails: res.aporteDetails,
          donationDetails: res.donationDetails,
        }

        const previewEvent = { ...activeEvent, snapshot }
        setText(generateEventSummaryText(previewEvent))
      } catch (err) {
        console.error('Erro ao gerar prévia:', err)
        setText(
          'Não foi possível gerar a pré-visualização completa no momento.\nPor favor, feche o evento para ver o resumo final.',
        )
      }
    }
  }, [open, activeEvent, participants, donations, globalCaixaBalance])

  if (!activeEvent) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copiado! Agora é só colar no WhatsApp.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Falha ao copiar o resumo.')
    }
  }

  const handleShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span className="hidden sm:inline">Pré-visualizar WhatsApp</span>
          <span className="sm:hidden">Pré-visualizar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5 text-slate-500" /> Prévia do Resumo
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <ScrollArea className="h-[380px] w-full rounded-md border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <pre className="text-sm whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
              {text}
            </pre>
          </ScrollArea>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCopy} className="w-full sm:w-auto gap-2">
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button
            onClick={handleShare}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white gap-2 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
