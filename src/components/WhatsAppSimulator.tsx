import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/store/AppContext'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'

export function WhatsAppSimulator() {
  const [open, setOpen] = useState(false)
  const [participantId, setParticipantId] = useState('')
  const [message, setMessage] = useState('')
  const { participants, activeEvent, addTransaction, addDonation } = useApp()

  const handleSimulate = async () => {
    if (!participantId || !message) {
      toast.error('Preencha remetente e texto.')
      return
    }

    const donationRegex =
      /(?:doa[cç][aã]o(?: financeira)? de .*? no valor de|(.*?)\s+doou)\s*(?:R\$)?\s*(\d+(?:[.,]\d{1,2})?)/i
    const donationMatch = message.match(donationRegex)

    if (donationMatch) {
      const valueStr = donationMatch[2] || donationMatch[1]
      const val = valueStr.match(/(\d+(?:[.,]\d{1,2})?)/)
      if (val) {
        const parsedVal = parseFloat(val[1].replace(',', '.'))
        try {
          await addDonation({
            participant_id: participantId,
            description: message.substring(0, 50),
            amount: parsedVal,
            date: new Date().toISOString(),
          })
          toast.success('Doação registrada globalmente no Caixa!')
          setOpen(false)
          setMessage('')
          setParticipantId('')
        } catch {
          toast.error('Erro ao processar doação.')
        }
        return
      }
    }

    const regex = /R?\$\s*(\d+(?:[.,]\d{1,2})?)|(\d+(?:[.,]\d{1,2})?)/
    const match = message.match(regex)

    if (match) {
      const amount = parseFloat((match[1] || match[2]).replace(',', '.'))
      const desc = message.replace(match[0], '').trim() || 'Despesa via WhatsApp'
      addTransaction({
        participantId,
        description: desc,
        amount,
        origin: 'whatsapp',
        status: 'processed',
        type: 'expense',
      })
      toast.success('Despesa processada com sucesso no Evento!')
    } else {
      addTransaction({
        participantId,
        description: message,
        amount: 0,
        origin: 'whatsapp',
        status: 'error',
        type: 'expense',
      })
      toast.error('Não foi possível extrair o valor da mensagem.')
    }

    setOpen(false)
    setMessage('')
    setParticipantId('')
  }

  const activeMembers = participants.filter((p) => activeEvent?.participantIds.includes(p.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
          disabled={!activeEvent}
        >
          <MessageCircle className="h-4 w-4" /> Simular WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Simular Mensagem Recebida</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="participant">Remetente (Apenas ativos no evento)</Label>
            <Select value={participantId} onValueChange={setParticipantId}>
              <SelectTrigger id="participant">
                <SelectValue placeholder="Selecione quem enviou" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Texto da Mensagem</Label>
            <Input
              id="message"
              placeholder="Ex: Jorge doou 350 ou R$ 50 Uber"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSimulate}>Enviar Mensagem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
