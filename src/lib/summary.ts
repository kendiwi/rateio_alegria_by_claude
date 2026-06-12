import { GroupEvent } from '@/store/AppContext'
import { formatCurrency } from '@/lib/utils'

export function generateEventSummaryText(event: GroupEvent): string {
  if (!event.snapshot || !event.snapshot.balances) {
    return 'Resumo não disponível para este evento legado.'
  }

  const snap = event.snapshot
  const date = new Date(event.closedAt || event.createdAt).toLocaleDateString('pt-BR')

  let text = `*📊 RESUMO DO EVENTO*\n`
  text += `📌 *${event.name}*\n`
  text += `📅 Encerrado em: ${date}\n\n`

  if (snap.aporteDetails && snap.aporteDetails.length > 0) {
    text += `*💰 APORTES AO CAIXA*\n`
    text += `-----------------------------------\n`
    snap.aporteDetails.forEach(a => {
      text += `• ${a.participantName} - ${a.description} | ${formatCurrency(a.amount || 0)}\n`
    })
    text += `\n`
  }

  if (snap.expenseDetails && snap.expenseDetails.length > 0) {
    text += `*💸 GASTOS INDIVIDUAIS*\n`
    text += `-----------------------------------\n`
    snap.expenseDetails.forEach(e => {
      text += `• *${e.participantName}*\n`
      text += `  ${e.description} | ${formatCurrency(e.amount || 0)}\n`
    })
    text += `\n`
  }

  text += `*⚖️ RATEIO FINAL (ACERTOS)*\n`
  text += `-----------------------------------\n`
  snap.balances.forEach(bItem => {
    const b = bItem as any
    const action =
      b.finalBalance > 0.01 ? '🟢 Recebe' : b.finalBalance < -0.01 ? '🔴 Paga  ' : '⚪ Quitado'
    const val = Math.abs(b.finalBalance || 0)
    let line = `${action} ${formatCurrency(val)} -> *${b.name}*`
    const details = []
    if (b.fixedFee && b.fixedFee > 0) details.push(`Inclui ${formatCurrency(b.fixedFee)} p/ Instituição`)
    if (b.categoriesParticipated && b.categoriesParticipated.length > 0) details.push(`Rateio: ${b.categoriesParticipated.join(', ')}`)
    if (details.length > 0) line += `\n   _(${details.join(' | ')})_`
    text += `${line}\n`
  })
  text += `-----------------------------------\n\n`

  text += `*🏦 EVOLUÇÃO DO CAIXA GLOBAL*\n`
  text += `-----------------------------------\n`
  text += `  Saldo Anterior: ${formatCurrency(snap.initialCaixa || 0)}\n`
  if (snap.totalAportes && snap.totalAportes > 0) text += `(+) Aportes ao Caixa: ${formatCurrency(snap.totalAportes || 0)}\n`
  if (snap.appliedSubsidy && snap.appliedSubsidy > 0) text += `(-) Subsídio Utilizado: ${formatCurrency(snap.appliedSubsidy || 0)}\n`
  text += `(=) Saldo Atualizado: ${formatCurrency(snap.finalCaixa || 0)}\n`
  text += `-----------------------------------\n\n`

  if (snap.totalFixedFees && snap.totalFixedFees > 0) {
    text += `*🎗️ DOAÇÃO INSTITUIÇÃO CÂNCER*\n`
    text += `-----------------------------------\n`
    text += `Total Arrecadado: ${formatCurrency(snap.totalFixedFees)}\n`
    text += `_(Valor repassado externamente, não entra no caixa)_\n`
    text += `-----------------------------------\n\n`
  }

  text += `*🎁 DOAÇÕES E BRINDES*\n`
  text += `-----------------------------------\n`
  if (snap.donationDetails && snap.donationDetails.length > 0) {
    snap.donationDetails.forEach(d => { text += `- ${d.description} (${d.participantName})\n` })
  } else {
    text += `Nenhuma doação registrada\n`
  }
  text += `-----------------------------------\n`

  return text
}
