import { useState } from 'react'
import { useApp, ParticipantRole, Participant } from '@/store/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RoleTag } from '@/components/ui/RoleTag'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, UserPlus, Coffee, Utensils, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

function ParticipationToggles({ p, onToggle }: { p: Participant; onToggle: (field: 'cafe' | 'almoco' | 'doacao', val: boolean) => void }) {
  if (p.role === 'doador') return null
  return (
    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
      <button
        onClick={() => onToggle('cafe', !p.cafe)}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${p.cafe ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400 line-through'}`}
        title="Café da manhã"
      >
        <Coffee className="h-3 w-3" /> Café
      </button>
      <button
        onClick={() => onToggle('almoco', !p.almoco)}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${p.almoco ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400 line-through'}`}
        title="Almoço"
      >
        <Utensils className="h-3 w-3" /> Almoço
      </button>
      <button
        onClick={() => onToggle('doacao', !p.doacao)}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${p.doacao ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-400 line-through'}`}
        title="Doação"
      >
        <Heart className="h-3 w-3" /> Doação
      </button>
    </div>
  )
}

export default function Participants() {
  const { participants, addParticipant, updateParticipant, toggleParticipantStatus, deleteParticipant } = useApp()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<ParticipantRole>('membro')
  const [newCafe, setNewCafe] = useState(true)
  const [newAlmoco, setNewAlmoco] = useState(true)
  const [newDoacao, setNewDoacao] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) { toast.error('O nome é obrigatório.'); return }
    try {
      await addParticipant({
        name,
        role,
        is_active: true,
        phone: '',
        photo_url: '',
        cafe: role === 'doador' ? false : newCafe,
        almoco: role === 'doador' ? false : newAlmoco,
        doacao: role === 'doador' ? true : newDoacao,
      })
      toast.success('Participante adicionado com sucesso!')
      setIsAddModalOpen(false)
      setName(''); setRole('membro'); setNewCafe(true); setNewAlmoco(true); setNewDoacao(false)
    } catch {
      toast.error('Erro ao adicionar participante.')
    }
  }

  const handleToggle = (id: string, field: 'cafe' | 'almoco' | 'doacao', val: boolean) => {
    updateParticipant(id, { [field]: val })
  }

  // Counts for summary
  const active = participants.filter(p => p.is_active)
  const membros = active.filter(p => p.role === 'membro')
  const avulsos = active.filter(p => p.role === 'avulso')
  const doadores = active.filter(p => p.role === 'doador')
  const cafeCount = active.filter(p => p.role !== 'doador' && p.cafe).length
  const almocoCount = active.filter(p => p.role !== 'doador' && p.almoco).length
  const doacaoCount = active.filter(p => p.role !== 'doador' && p.doacao).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Participantes</h1>
          <p className="text-muted-foreground mt-1">Gerencie as pessoas e o que cada um consome no evento.</p>
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
                <Label>Tipo</Label>
                <Select value={role} onValueChange={v => setRole(v as ParticipantRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="membro">Membro fixo (taxa R$25 + rateio)</SelectItem>
                    <SelectItem value="avulso">Avulso (só rateio)</SelectItem>
                    <SelectItem value="doador">Apenas Doador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {role !== 'doador' && (
                <div className="space-y-2">
                  <Label>Participa em</Label>
                  <div className="flex flex-col gap-2 pl-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={newCafe} onCheckedChange={v => setNewCafe(!!v)} />
                      <Coffee className="h-4 w-4 text-amber-600" />
                      <span className="text-sm">Café da manhã</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={newAlmoco} onCheckedChange={v => setNewAlmoco(!!v)} />
                      <Utensils className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Almoço</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={newDoacao} onCheckedChange={v => setNewDoacao(!!v)} />
                      <Heart className="h-4 w-4 text-pink-600" />
                      <span className="text-sm">Doação</span>
                    </label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Adicionar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">{membros.length} membros fixos</span>
        <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">{avulsos.length} avulsos</span>
        {doadores.length > 0 && <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-medium">{doadores.length} doadores</span>}
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium"><Coffee className="inline h-3 w-3 mr-1" />{cafeCount} no café</span>
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium"><Utensils className="inline h-3 w-3 mr-1" />{almocoCount} no almoço</span>
        <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-medium"><Heart className="inline h-3 w-3 mr-1" />{doacaoCount} na doação</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map(p => (
          <Card key={p.id} className={`overflow-hidden transition-all duration-200 ${!p.is_active ? 'opacity-60 bg-slate-50' : 'bg-white hover:shadow-md'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-slate-100 shadow-sm shrink-0">
                  <AvatarImage src={p.photo_url} />
                  <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-800 truncate block">{p.name}</span>
                  <div className="mt-0.5"><RoleTag role={p.role} className="scale-90 origin-left" /></div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Switch checked={p.is_active} onCheckedChange={() => toggleParticipantStatus(p.id)} title={p.is_active ? 'Desativar' : 'Ativar'} />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500"
                    onClick={() => { if (confirm(`Deseja remover ${p.name}?`)) deleteParticipant(p.id) }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <ParticipationToggles p={p} onToggle={(field, val) => handleToggle(p.id, field, val)} />
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
