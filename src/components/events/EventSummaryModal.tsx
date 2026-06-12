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
import { ScrollArea } from '@/components/ui/scroll-area'
import { GroupEvent } from '@/store/AppContext'
import { generateEventSummaryText } from '@/lib/summary'
import { Check, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  event: GroupEvent
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function EventSummaryModal({ event, open, onOpenChange, trigger }: Props) {
  const [copied, setCopied] = useState(false)
  const text = generateEventSummaryText(event)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copiado! Agora é só colar no WhatsApp.')
      setTimeout(() => setCopied(false), 2000)

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, '_blank')
    } catch {
      toast.error('Falha ao compartilhar o resumo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="h-5 w-5 text-[#25D366]" /> Resumo para WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <ScrollArea className="h-[320px] w-full rounded-md border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <pre className="text-sm whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
              {text}
            </pre>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            onClick={handleShare}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white gap-2 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Compartilhado!' : 'Compartilhar no WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
