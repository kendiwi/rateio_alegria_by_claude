import { useState } from 'react'
import { useApp, TransactionType, TransactionCategory } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, Coffee, Utensils, Heart } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORY_LABELS: Record<string, string> = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço',
  doacao: 'Doação',
}

const CATEGORY_COLORS: Record<string, string> = {
  cafe: 'bg-amber-100 text-amber-800',
  almoco: 'bg-blue-100 text-blue-800',
  doacao: 'bg-pink-100 text-pink-800',
}

function CategoryBadge({ category }: { category?: TransactionCategory }) {
  if (!category) return <span className="text-slate-400 text-xs">—</span>
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700'}`}>
      {category === 'cafe' && <Coffee className="h-3 w-3" />}
      {category === 'almoco' && <Utensils className="h-3 w-3" />}
      {category === 'doacao' && <Heart className="h-3 w-3" />}
      {CATEGORY_LABELS[category]}
    </span>
  )
}

export default function Expenses() {
  const { activeEvent, participants, addTransaction, deleteTransaction } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryStr, setCategoryStr] = useState<string>('none')
  const [participantId, setParticipantId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const category: TransactionCategory = (categoryStr === 'none' ? null : categoryStr) as TransactionCategory

  if (!activeEvent) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-fade-in">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Nenhum evento ativo</h2>
          <p className="text-slate-500">Inicie um evento na página principal para registrar despesas.</p>
        </div>
      </div>
    )
  }

  const activeParticipants = participants.filter(p => activeEvent.participantIds.includes(p.id))
  const filteredParticipants = activeParticipants.filter(p => {
    if (type === 'expense') return p.role === 'membro' || p.role === 'avulso'
    return true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!participantId || !description || !amount) { toast.error('Preencha todos os campos.'); return }
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) { toast.error('Valor inválido.'); return }
    addTransaction({
      participantId,
      description,
      amount: numAmount,
      type,
      category: type === 'expense' ? category : null,
      origin: 'manual',
      status: 'processed',
    })
    toast.success(type === 'expense' ? 'Despesa registrada!' : 'Aporte registrado!')
    setParticipantId(''); setDescription(''); setAmount(''); setCategoryStr('none'); setIsModalOpen(false)
  }

  const openModal = () => {
    setType('expense'); setCategoryStr('none'); setParticipantId(''); setDescription(''); setAmount('')
    setIsModalOpen(true)
  }

  const expenses = activeEvent.transactions.filter(t => t.type === 'expense')
  const aportes = activeEvent.transactions.filter(t => t.type === 'aporte')
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0)
  const totalAp = aportes.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Despesas & Aportes</h1>
          <p className="text-muted-foreground mt-1">Evento: {activeEvent.name}</p>
        </div>
        <Button onClick={openModal} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Lançamento Manual
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-red-500">Total Despesas</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalExp)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-green-600">Total Aportes</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalAp)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-500">Lançamentos</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">{activeEvent.transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Lançamentos</CardTitle>
          <CardDescription>Todas as despesas e aportes do evento atual.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activeEvent.transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum lançamento registrado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-4 py-3 font-medium text-slate-600">Data</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Participante</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Descrição</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Categoria</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Tipo</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Valor</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-center">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeEvent.transactions.map(t => {
                    const p = participants.find(x => x.id === t.participantId)
                    return (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50 group">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatShortDate(t.date)}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{p?.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-700">{t.description}</td>
                        <td className="px-4 py-3">
                          {t.type === 'expense' ? <CategoryBadge category={t.category} /> : <span className="text-slate-400 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'aporte' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.type === 'aporte' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {t.type === 'aporte' ? 'Aporte' : 'Despesa'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${t.type === 'aporte' ? 'text-green-600' : 'text-slate-800'}`}>
                          {t.type === 'aporte' ? '+' : ''}{formatCurrency(t.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={t.status === 'processed' ? 'default' : t.status === 'error' ? 'destructive' : 'secondary'}
                            className={t.status === 'processed' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' : ''}>
                            {t.status === 'processed' ? 'OK' : t.status === 'pending' ? 'Pend.' : 'Erro'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon" onClick={() => { deleteTransaction(t.id); toast.success('Lançamento excluído.') }}
                            className="h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Lançamento Manual</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={val => { setType(val as TransactionType); setCategoryStr('none'); setParticipantId('') }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="aporte">Aporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'expense' && (
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoryStr} onValueChange={setCategoryStr}>
                  <SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    <SelectItem value="cafe">Café da Manhã</SelectItem>
                    <SelectItem value="almoco">Almoço</SelectItem>
                    <SelectItem value="doacao">Doação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Participante</Label>
              <Select value={participantId} onValueChange={setParticipantId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {filteredParticipants.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Ex: Carnes, Bebidas..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
