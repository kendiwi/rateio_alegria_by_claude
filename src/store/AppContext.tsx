import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

export type ParticipantRole = 'membro' | 'avulso' | 'doador'

export type Participant = {
  id: string
  name: string
  phone: string
  photo_url: string
  is_active: boolean
  role: ParticipantRole
  cafe: boolean
  almoco: boolean
  doacao: boolean
}

export type TransactionStatus = 'processed' | 'pending' | 'error'
export type TransactionType = 'expense' | 'aporte'

export type Transaction = {
  id: string
  participantId: string
  description: string
  amount: number
  date: string
  origin: 'whatsapp' | 'manual'
  status: TransactionStatus
  type: TransactionType
  rawMessage?: string
}

export type GroupEvent = {
  id: string
  name: string
  eventDate?: string
  photoUrl?: string
  createdAt: string
  closedAt?: string
  status: 'active' | 'closed'
  participantIds: string[]
  transactions: Transaction[]
  subsidy: number
  snapshot?: {
    initialCaixa: number
    totalExpenses: number
    totalFixedFees?: number
    totalAportes?: number
    appliedSubsidy: number
    finalCaixa: number
    balances: Array<{
      id: string
      name: string
      spent: number
      fixedFee?: number
      finalBalance: number
      subCredit: number
    }>
    expenseDetails?: Array<{ participantName: string; description: string; amount: number }>
    aporteDetails?: Array<{ participantName: string; description: string; amount: number }>
    donationDetails?: Array<{ participantName: string; description: string }>
  }
}

export type Donation = {
  id: string
  participant_id: string
  description: string
  amount: number
  date: string
  created_at: string
}

interface AppState {
  participants: Participant[]
  isLoadingParticipants: boolean
  donations: Donation[]
  isLoadingDonations: boolean
  globalCaixaBalance: number
  activeEvent: GroupEvent | null
  pastEvents: GroupEvent[]
  addParticipant: (p: Omit<Participant, 'id'>) => Promise<void>
  updateParticipant: (id: string, updates: Partial<Omit<Participant, 'id'>>) => Promise<void>
  toggleParticipantStatus: (id: string) => Promise<void>
  deleteParticipant: (id: string) => Promise<void>
  addDonation: (d: Omit<Donation, 'id' | 'created_at'>) => Promise<void>
  deleteDonation: (id: string) => Promise<void>
  startEvent: (name: string, participantIds: string[], eventDate?: string, photoUrl?: string) => void
  closeEvent: (s: NonNullable<GroupEvent['snapshot']>) => Promise<GroupEvent | null>
  updateEventParticipants: (ids: string[]) => void
  deleteEvent: (id: string) => void
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void
  updateTransactionStatus: (id: string, status: TransactionStatus) => void
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'date'>>) => void
  deleteTransaction: (id: string) => void
  setSubsidy: (amount: number) => void
}

const STORAGE_PREFIX = 'rateio_alegria_'

const loadState = <T,>(k: string, def: T): T => {
  try {
    const s = localStorage.getItem(STORAGE_PREFIX + k)
    return s ? JSON.parse(s) : def
  } catch {
    return def
  }
}

const saveState = (k: string, v: unknown) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + k, JSON.stringify(v))
  } catch (e) {
    if (e instanceof DOMException && e.name.includes('Quota')) {
      toast.error('Armazenamento cheio! Remova algumas fotos antigas para salvar novos dados.')
    }
  }
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [participants, setParticipants] = useState<Participant[]>(() => loadState('participants', []))
  const [donations, setDonations] = useState<Donation[]>(() => loadState('donations', []))
  const [globalCaixaBalance, setGlobalCaixaBalance] = useState<number>(() => loadState('globalCaixaBalance', 0))
  const [activeEvent, setActiveEvent] = useState<GroupEvent | null>(() => loadState('activeEvent', null))
  const [pastEvents, setPastEvents] = useState<GroupEvent[]>(() => loadState('pastEvents', []))

  useEffect(() => { saveState('participants', participants) }, [participants])
  useEffect(() => { saveState('donations', donations) }, [donations])
  useEffect(() => { saveState('globalCaixaBalance', globalCaixaBalance) }, [globalCaixaBalance])
  useEffect(() => { saveState('activeEvent', activeEvent) }, [activeEvent])
  useEffect(() => { saveState('pastEvents', pastEvents) }, [pastEvents])

  const addParticipant = async (p: Omit<Participant, 'id'>) => {
    const newParticipant: Participant = { ...p, id: crypto.randomUUID() }
    setParticipants(prev => {
      const updated = [...prev, newParticipant].sort((a, b) => a.name.localeCompare(b.name))
      return updated
    })
    if (newParticipant.is_active) {
      setActiveEvent(prev => {
        if (prev && !prev.participantIds.includes(newParticipant.id)) {
          return { ...prev, participantIds: [...prev.participantIds, newParticipant.id] }
        }
        return prev
      })
    }
  }

  const updateParticipant = async (id: string, updates: Partial<Omit<Participant, 'id'>>) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  const toggleParticipantStatus = async (id: string) => {
    const participant = participants.find(p => p.id === id)
    if (!participant) return
    const newStatus = !participant.is_active
    setParticipants(prev => prev.map(p => (p.id === id ? { ...p, is_active: newStatus } : p)))
    setActiveEvent(prev => {
      if (!prev) return prev
      if (newStatus && !prev.participantIds.includes(id)) {
        return { ...prev, participantIds: [...prev.participantIds, id] }
      } else if (!newStatus && prev.participantIds.includes(id)) {
        return { ...prev, participantIds: prev.participantIds.filter(pid => pid !== id) }
      }
      return prev
    })
  }

  const deleteParticipant = async (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
    setActiveEvent(prev => {
      if (prev && prev.participantIds.includes(id)) {
        return { ...prev, participantIds: prev.participantIds.filter(pid => pid !== id) }
      }
      return prev
    })
  }

  const addDonation = async (d: Omit<Donation, 'id' | 'created_at'>) => {
    const newDonation: Donation = {
      ...d,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setDonations(prev =>
      [newDonation, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )
  }

  const deleteDonation = async (id: string) => {
    setDonations(prev => prev.filter(d => d.id !== id))
  }

  const startEvent = (name: string, participantIds: string[], eventDate?: string, photoUrl?: string) => {
    setActiveEvent({
      id: Math.random().toString(36).substring(2, 9),
      name,
      eventDate: eventDate || new Date().toISOString(),
      photoUrl: photoUrl || '',
      createdAt: new Date().toISOString(),
      status: 'active',
      participantIds,
      transactions: [],
      subsidy: 0,
    })
  }

  const closeEvent = async (snapshot: NonNullable<GroupEvent['snapshot']>) => {
    if (!activeEvent) return null
    const closed: GroupEvent = {
      ...activeEvent,
      status: 'closed',
      closedAt: new Date().toISOString(),
      snapshot,
    }
    setPastEvents(prev => [closed, ...prev])
    setGlobalCaixaBalance(snapshot.finalCaixa)
    setDonations([])
    setActiveEvent(null)
    return closed
  }

  const updateEventParticipants = (ids: string[]) => {
    if (activeEvent) setActiveEvent({ ...activeEvent, participantIds: ids })
  }

  const deleteEvent = (id: string) => {
    setPastEvents(prev => prev.filter(evt => evt.id !== id))
  }

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    if (activeEvent)
      setActiveEvent({
        ...activeEvent,
        transactions: [
          { ...t, id: Math.random().toString(36).substring(2, 9), date: new Date().toISOString() },
          ...activeEvent.transactions,
        ],
      })
  }

  const updateTransactionStatus = (id: string, status: TransactionStatus) => {
    if (activeEvent)
      setActiveEvent({
        ...activeEvent,
        transactions: activeEvent.transactions.map(t => (t.id === id ? { ...t, status } : t)),
      })
  }

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, 'id' | 'date'>>) => {
    if (activeEvent)
      setActiveEvent({
        ...activeEvent,
        transactions: activeEvent.transactions.map(t => (t.id === id ? { ...t, ...updates } : t)),
      })
  }

  const deleteTransaction = (id: string) => {
    if (activeEvent)
      setActiveEvent({
        ...activeEvent,
        transactions: activeEvent.transactions.filter(t => t.id !== id),
      })
  }

  const setSubsidy = (amount: number) => {
    if (activeEvent) setActiveEvent({ ...activeEvent, subsidy: amount })
  }

  return (
    <AppContext.Provider
      value={{
        participants,
        isLoadingParticipants: false,
        donations,
        isLoadingDonations: false,
        globalCaixaBalance,
        activeEvent,
        pastEvents,
        addParticipant,
        updateParticipant,
        toggleParticipantStatus,
        deleteParticipant,
        addDonation,
        deleteDonation,
        startEvent,
        closeEvent,
        updateEventParticipants,
        deleteEvent,
        addTransaction,
        updateTransactionStatus,
        updateTransaction,
        deleteTransaction,
        setSubsidy,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
