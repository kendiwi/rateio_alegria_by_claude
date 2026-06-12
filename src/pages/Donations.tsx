import { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HeartHandshake, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Donations() {
  const { participants, donations, isLoadingDonations, addDonation, deleteDonation } = useApp()
  const [openAdd, setOpenAdd] = useState(false)

  const [addParticipantId, setAddParticipantId] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddDonation = async () => {
    if (!addParticipantId || !addDescription.trim() || !addDate) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)
    try {
      let dateIso = new Date().toISOString()
      if (addDate) {
        const d = new Date(`${addDate}T12:00:00`)
        if (!isNaN(d.getTime())) {
          dateIso = d.toISOString()
        }
      }

      await addDonation({
        participant_id: addParticipantId,
        description: addDescription.trim(),
        amount: 0,
        date: dateIso,
      })

      toast.success('Doação registrada com sucesso!')
      setOpenAdd(false)
      setAddParticipantId('')
      setAddDescription('')
      setAddDate(new Date().toISOString().split('T')[0])
    } catch (err: any) {
      toast.error(err?.message || 'Ocorreu um erro inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDonation = async (id: string) => {
    try {
      await deleteDonation(id)
      toast.success('Doação removida.')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao remover doação')
    }
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Doações e Brindes</CardTitle>
          <CardDescription>
            Registre as contribuições de itens ou brindes feitas pelos participantes ao grupo.
          </CardDescription>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" /> Registrar Doação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Doação de Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Participante / Doador <span className="text-red-500">*</span></Label>
                <Select value={addParticipantId} onValueChange={setAddParticipantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione quem doou" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.role === 'doador' ? '(Doador)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Item Doado / Descrição <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ex: Fardo de refrigerante, Pacote de copos..."
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data <span className="text-red-500">*</span></Label>
                <Input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAdd(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleAddDonation} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Doação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoadingDonations ? (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4 border">
              <HeartHandshake className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhuma doação registrada</h3>
            <p className="text-muted-foreground max-w-sm">
              Inicie adicionando contribuições para valorizar quem ajuda o grupo.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Doador</TableHead>
                <TableHead>Item Doado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => {
                const p = participants.find((part) => part.id === d.participant_id)
                return (
                  <TableRow key={d.id} className="group">
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(d.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={p?.photo_url} />
                          <AvatarFallback>{p?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{p?.name || 'Desconhecido'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{d.description}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteDonation(d.id)}
                        title="Remover doação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
