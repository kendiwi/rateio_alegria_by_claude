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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useApp } from '@/store/AppContext'
import { Play, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PhotoUpload } from '@/components/PhotoUpload'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function StartEventModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [photoUrl, setPhotoUrl] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { participants, startEvent } = useApp()

  const eligibleParticipants = useMemo(() => {
    return participants.filter((p) => p.is_active && (p.role === 'membro' || p.role === 'avulso'))
  }, [participants])

  const allSelected =
    eligibleParticipants.length > 0 && selectedIds.length === eligibleParticipants.length

  const handleStart = () => {
    if (!name.trim()) { toast.error('Informe o nome do evento.'); return }
    if (!date) { toast.error('Informe a data do evento.'); return }
    if (selectedIds.length === 0) { toast.error('Selecione pelo menos um participante.'); return }

    startEvent(name, selectedIds, date.toISOString(), photoUrl)
    toast.success('Novo ciclo de evento iniciado!')
    setOpen(false)
    setName('')
    setDate(new Date())
    setPhotoUrl('')
    setSelectedIds([])
  }

  const toggleParticipant = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(eligibleParticipants.map((p) => p.id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Play className="h-5 w-5" /> Iniciar Novo Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Iniciar Novo Ciclo de Evento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="flex flex-col items-center gap-2">
            <Label>Foto do Evento</Label>
            <PhotoUpload value={photoUrl} onChange={setPhotoUrl} nameFallback={name || 'E'} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="eventName">Nome do Evento</Label>
            <Input
              id="eventName"
              placeholder="Ex: Churrasco de Domingo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Data do Evento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy') : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Selecione os Participantes</Label>
              {eligibleParticipants.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={toggleSelectAll}
                >
                  {allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Quem vai participar deste rateio? (Membros e Avulsos)
            </div>
            <ScrollArea className="h-[200px] rounded-md border p-2 bg-white">
              {eligibleParticipants.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum participante elegível encontrado.
                </div>
              ) : (
                <div className="space-y-1">
                  {eligibleParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      <Checkbox
                        id={`p-${p.id}`}
                        checked={selectedIds.includes(p.id)}
                        onCheckedChange={() => toggleParticipant(p.id)}
                      />
                      <Label
                        htmlFor={`p-${p.id}`}
                        className="flex items-center gap-3 cursor-pointer flex-1 w-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={p.photo_url} />
                          <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium flex-1 truncate">{p.name}</span>
                        <Badge
                          variant={p.role === 'membro' ? 'default' : 'secondary'}
                          className={cn(
                            'text-[10px] uppercase px-2 py-0 h-5 border-none font-semibold',
                            p.role === 'membro'
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                          )}
                        >
                          {p.role}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
            Começar Evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
