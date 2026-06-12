import { GroupEvent } from '@/store/AppContext'
import { formatCurrency } from '@/lib/utils'

function fmtVal(val: number | undefined | null): string {
  if (val === undefined || val === null || val === 0) return '     -'
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pad(str: string, len: number, right = false): string {
  const s = str.slice(0, len)
  return right ? s.padStart(len) : s.padEnd(len)
}

function fmtCol(val: number | undefined | null, width: number): string {
  if (!val || val === 0) return pad('-', width, true)
  const s = Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const signed = val < 0 ? `-${s}` : s
  return pad(signed, width, true)
}

function fmtColSigned(val: number | undefined | null, width: number): string {
  if (!val || val === 0) return pad('-', width, true)
  const s = Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const signed = val >= 0 ? `+${s}` : `-${s}`
  return pad(signed, width, true)
}

export function generateEventSummaryText(event: GroupEvent): string {
  if (!event.snapshot || !event.snapshot.balances) {
    return 'Resumo não disponível para este evento.'
  }

  const snap = event.snapshot
  const date = new Date(event.closedAt || event.createdAt).toLocaleDateString('pt-BR')
  const SEP = '-----------------------------------'

  let text = `📊 RESUMO DO EVENTO\n`
  text += `📌 ${event.name}\n`
  text += `📅 Encerrado em: ${date}\n`

  // Doações e brindes
  text += `\n🎁 DOAÇÕES E BRINDES\n${SEP}\n`
  if (snap.donationDetails && snap.donationDetails.length > 0) {
    snap.donationDetails.forEach(d => {
      text += `- ${d.description} (${d.participantName})\n`
    })
  } else {
    text += `Nenhuma doação registrada\n`
  }

  // Aportes ao caixa
  if (snap.aporteDetails && snap.aporteDetails.length > 0) {
    text += `\n💰 APORTES AO CAIXA\n${SEP}\n`
    snap.aporteDetails.forEach(a => {
      text += `* ${a.participantName} - ${a.description} | ${formatCurrency(a.amount || 0)}\n`
    })
  }

  // Doação Instituição Câncer
  if (snap.totalFixedFees && snap.totalFixedFees > 0) {
    text += `\n🎗️ DOAÇÃO INSTIT. CÂNCER\n${SEP}\n`
    text += `Total Arrecadado: ${formatCurrency(snap.totalFixedFees)}\n`
    text += `(Valor repassado externamente)\n`
  }

  // Rateio — tabela monospace
  text += `\n⚖️ RATEIO FINAL POR PARTICIPANTE\n`
  text += `(Composição de Custos)\n`
  text += `${SEP}\n`
  text += `\`\`\`\n`

  const N = 20, C = 6, T = 7, F = 10
  const header =
    pad('NOME', N) + '|' +
    pad('CAFE', C, true) + '|' +
    pad('ALMO', C, true) + '|' +
    pad('DOAC', C, true) + '|' +
    pad('TAXA', C, true) + '|' +
    pad('T.DESP', T, true) + '|' +
    pad('T.PAGO', T, true) + '|' +
    ' FINAL'
  text += header + '\n'
  text += '-'.repeat(header.length) + '\n'

  snap.balances.forEach(bItem => {
    const b = bItem as any
    const name = pad(b.name || '', N)
    const cafe  = fmtCol(b.cafeShare, C)
    const almo  = fmtCol(b.almocoShare, C)
    const doac  = fmtCol(b.doacaoShare, C)
    const taxa  = fmtCol(b.fixedFee, C)
    const desp  = fmtCol(-(b.shareOfExpenses + (b.fixedFee || 0)), T)
    const pago  = fmtColSigned(b.spent, T)
    const final = Math.abs(b.finalBalance || 0)
    const finalStr = final.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const emoji = (b.finalBalance || 0) > 0.01 ? '🟢' : (b.finalBalance || 0) < -0.01 ? '🔴' : '⚪'
    text += `${name}|${cafe}|${almo}|${doac}|${taxa}|${desp}|${pago}|${emoji} ${finalStr}\n`
  })

  text += `\nLegenda:\n[🔴] Valor a Pagar (Débito)\n[🟢] Valor a Receber (Crédito)\n`
  text += `\`\`\`\n`

  // Evolução do caixa
  text += `\n🏦 EVOLUÇÃO DO CAIXA GLOBAL\n${SEP}\n`
  text += `  Saldo Anterior: ${formatCurrency(snap.initialCaixa || 0)}\n`
  if (snap.totalAportes && snap.totalAportes > 0)
    text += `(+) Aportes ao Caixa: ${formatCurrency(snap.totalAportes)}\n`
  if (snap.appliedSubsidy && snap.appliedSubsidy > 0)
    text += `(-) Subsídio Utilizado: ${formatCurrency(snap.appliedSubsidy)}\n`
  text += `(=) Saldo Atualizado: ${formatCurrency(snap.finalCaixa || 0)}\n`
  text += SEP

  return text
}
