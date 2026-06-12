import { useState } from 'react'
import { useApp, TransactionType } from '@/store/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RoleTag } from '@/components/ui/RoleTag'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { Trash2, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { toast } from 'sonner'

export default function Expenses() {
  const { activeEvent, participants, addTransaction, deleteTransaction } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [participantId, setParticipantId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

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
    addTransaction({ participantId, description, amount: numAmount, type, origin: 'manual', status: 'processed' })
    toast.success(type === 'expense' ? 'Despesa registrada!' : 'Aporte registrado!')
    setParticipantId(''); setDescription(''); setAmount(''); setIsAdding(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Despesas & Aportes</h1>
          <p className="text-muted-foreground mt-1">Evento: {activeEvent.name}</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Novo Lançamento
        </Button>
      </div>

      {isAdding && (
        <Card className="border-emerald-200 shadow-sm animate-slide-down">
          <CardHeader className="pb-4 bg-emerald-50/50">
            <CardTitle className="text-lg text-emerald-800">Adicionar Novo Lançamento</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={val => { setType(val as TransactionType); setParticipantId('') }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="aporte">Aporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select value={participantId} onValueChange={setParticipantId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {filteredParticipants.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">{p.name}<RoleTag role={p.role} className="ml-2 scale-90 origin-left" /></div>
                        </SelectItem>
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
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Lançamentos</CardTitle>
          <CardDescription>Todas as despesas e aportes do evento atual.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeEvent.transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nenhum lançamento registrado ainda.</div>
          ) : (
            <div className="space-y-3">
              {activeEvent.transactions.map(t => {
                const p = participants.find(x => x.id === t.participantId)
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${t.type === 'aporte' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'aporte' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{t.description}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <span>{p?.name || 'Desconhecido'}</span>
                          <RoleTag role={p?.role} className="scale-75 origin-left" />
                          <span>•</span>
                          <span>{formatShortDate(t.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${t.type === 'aporte' ? 'text-green-600' : 'text-slate-800'}`}>
                        {t.type === 'aporte' ? '+' : ''}{formatCurrency(t.amount)}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => { deleteTransaction(t.id); toast.success('Lançamento excluído.') }}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
