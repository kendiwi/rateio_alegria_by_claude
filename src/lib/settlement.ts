import { Participant, Transaction } from '@/store/AppContext'

export type SettlementBaseData = {
  allParticipants: Participant[]
  activeParticipantIds: string[]
  transactions: Transaction[]
  caixaBalance: number
  subsidy: number
  recentDonations?: Array<{
    participant_id: string
    description: string
    date: string
  }>
}

interface ExtTransaction extends Transaction {
  category?: 'cafe' | 'almoco' | 'doacao' | null
}

export function calculateSettlement(data: SettlementBaseData) {
  const allParticipants = data.allParticipants
  const activeParticipantIds = data.activeParticipantIds
  const transactions = data.transactions as ExtTransaction[]
  const caixaBalance = data.caixaBalance
  const subsidy = data.subsidy
  const recentDonations = data.recentDonations || []

  const processed = transactions.filter(t => t.status === 'processed')

  const totalExpenses = processed
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)

  const totalAportes = processed
    .filter(t => t.type === 'aporte')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)

  const actualSub = Math.min(subsidy || 0, Math.max(0, caixaBalance || 0))
  const subFraction = totalExpenses > 0 ? actualSub / totalExpenses : 0
  const effectiveSubFraction = Math.min(1, subFraction)

  const cafeExpenses = processed
    .filter(t => t.type === 'expense' && t.category === 'cafe')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const almocoExpenses = processed
    .filter(t => t.type === 'expense' && t.category === 'almoco')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const doacaoExpenses = processed
    .filter(t => t.type === 'expense' && t.category === 'doacao')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const generalExpenses = processed
    .filter(t => t.type === 'expense' && !t.category)
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)

  const netCafeExpenses = cafeExpenses * (1 - effectiveSubFraction)
  const netAlmocoExpenses = almocoExpenses * (1 - effectiveSubFraction)
  const netDoacaoExpenses = doacaoExpenses * (1 - effectiveSubFraction)
  const netGeneralExpenses = generalExpenses * (1 - effectiveSubFraction)

  const activeValidParticipants = allParticipants.filter(
    p =>
      activeParticipantIds.includes(p.id) &&
      p.is_active !== false &&
      (p.role === 'membro' || p.role === 'avulso'),
  )
  const activeCount = activeValidParticipants.length

  const cafeParticipantsCount = activeValidParticipants.filter(p => p.cafe).length
  const almocoParticipantsCount = activeValidParticipants.filter(p => p.almoco).length
  const doacaoParticipantsCount = activeValidParticipants.filter(p => p.doacao).length
  const generalParticipantsCount = activeCount

  const cafeAvg = cafeParticipantsCount > 0 ? netCafeExpenses / cafeParticipantsCount : 0
  const almocoAvg = almocoParticipantsCount > 0 ? netAlmocoExpenses / almocoParticipantsCount : 0
  const doacaoAvg = doacaoParticipantsCount > 0 ? netDoacaoExpenses / doacaoParticipantsCount : 0
  const generalAvg = generalParticipantsCount > 0 ? netGeneralExpenses / generalParticipantsCount : 0

  const maxFinalAvg = cafeAvg + almocoAvg + doacaoAvg + generalAvg
  const finalAvg = isNaN(maxFinalAvg) || !isFinite(maxFinalAvg) ? 0 : maxFinalAvg

  let subPerPerson = activeCount > 0 ? actualSub / activeCount : 0
  if (isNaN(subPerPerson) || !isFinite(subPerPerson)) subPerPerson = 0

  const balances = allParticipants
    .filter(p => {
      const spent = processed
        .filter(t => t.type === 'expense' && t.participantId === p.id)
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
      return (
        (p.role === 'membro' && p.is_active !== false) ||
        (activeParticipantIds.includes(p.id) &&
          p.is_active !== false &&
          (p.role === 'membro' || p.role === 'avulso')) ||
        spent > 0
      )
    })
    .map(p => {
      const isParticipant =
        activeParticipantIds.includes(p.id) &&
        p.is_active !== false &&
        (p.role === 'membro' || p.role === 'avulso')
      const isMember = p.role === 'membro' && p.is_active !== false
      const fixedFee = isMember ? 25 : 0

      const spent = processed
        .filter(t => t.type === 'expense' && t.participantId === p.id)
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0)

      let shareOfExpenses = 0
      const categoriesParticipated: string[] = []

      if (isParticipant) {
        if (p.cafe) { shareOfExpenses += cafeAvg; if (cafeAvg > 0) categoriesParticipated.push('Café') }
        if (p.almoco) { shareOfExpenses += almocoAvg; if (almocoAvg > 0) categoriesParticipated.push('Almoço') }
        if (p.doacao) { shareOfExpenses += doacaoAvg; if (doacaoAvg > 0) categoriesParticipated.push('Doação') }
        if (generalAvg > 0) { shareOfExpenses += generalAvg; categoriesParticipated.push('Geral') }
      }

      const finalBalance = spent - shareOfExpenses - fixedFee

      const pCafeShare = isParticipant && p.cafe ? cafeAvg : 0
      const pAlmocoShare = isParticipant && p.almoco ? almocoAvg : 0
      const pDoacaoShare = isParticipant && p.doacao ? doacaoAvg : 0
      const pGeneralShare = isParticipant ? generalAvg : 0

      return {
        ...p,
        isParticipant,
        isMember,
        fixedFee,
        shareOfExpenses,
        categoriesParticipated,
        cafeShare: pCafeShare,
        almocoShare: pAlmocoShare,
        doacaoShare: pDoacaoShare,
        generalShare: pGeneralShare,
        spent,
        finalBalance: isNaN(finalBalance) ? 0 : finalBalance,
        subCredit: isParticipant ? subPerPerson : 0,
      }
    })
    .sort((a, b) => b.finalBalance - a.finalBalance)

  const totalFixedFees = balances.reduce((acc, b) => acc + (b.fixedFee || 0), 0)

  const expenseDetails = processed
    .filter(t => t.type === 'expense')
    .map(t => {
      const p = allParticipants.find(p => p.id === t.participantId)
      return { participantName: p?.name || 'Desconhecido', description: t.description, amount: Number(t.amount) || 0 }
    })

  const aporteDetails = processed
    .filter(t => t.type === 'aporte')
    .map(t => {
      const p = allParticipants.find(p => p.id === t.participantId)
      return { participantName: p?.name || 'Desconhecido', description: t.description, amount: Number(t.amount) || 0 }
    })

  const donationDetails = recentDonations.map(d => {
    const p = allParticipants.find(p => p.id === d.participant_id)
    return { participantName: p?.name || 'Desconhecido', description: d.description }
  })

  return { totalExpenses, totalAportes, actualSub, finalAvg, subPerPerson, balances, totalFixedFees, expenseDetails, aporteDetails, donationDetails }
}
