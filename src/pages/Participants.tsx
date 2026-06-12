import { useState } from 'react'
import { useApp, ParticipantRole } from '@/store/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { RoleTag } from '@/components/ui/RoleTag'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Participants() {
  const { participants, addParticipant, toggleParticipantStatus, deleteParticipant } = useApp()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<ParticipantRole>('membro')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) { toast.error('O nome é obrigatório.'); return }
    try {
      await addParticipant({ name, role, is_active: true, phone: '', photo_url: '', cafe: true, almoco: true, doacao: false })
      toast.success('Participante adicionado com sucesso!')
      setIsAddModalOpen(false)
      setName('')
      setRole('membro')
    } catch {
      toast.error('Erro ao adicionar participante.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Participantes</h1>
          <p className="text-muted-foreground mt-1">Gerencie as pessoas que fazem parte do grupo e dos rateios.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4" /> Novo Participante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Participante</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do participante" autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Categoria (Papel)</Label>
                <Select value={role} onValueChange={v => setRole(v as ParticipantRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="membro">Membro</SelectItem>
                    <SelectItem value="avulso">Avulso</SelectItem>
                    <SelectItem value="doador">Doador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Adicionar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map(p => (
          <Card key={p.id} className={`overflow-hidden transition-all duration-200 ${!p.is_active ? 'opacity-60 bg-slate-50' : 'bg-white hover:shadow-md'}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-slate-100 shadow-sm">
                <AvatarImage src={p.photo_url} />
                <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                  <div className="mt-1"><RoleTag role={p.role} className="scale-90 origin-left" /></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Switch checked={p.is_active} onCheckedChange={() => toggleParticipantStatus(p.id)} title={p.is_active ? 'Desativar' : 'Ativar'} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500"
                  onClick={() => { if (confirm(`Deseja remover ${p.name}?`)) deleteParticipant(p.id) }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {participants.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed rounded-xl bg-slate-50">
            Nenhum participante cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
