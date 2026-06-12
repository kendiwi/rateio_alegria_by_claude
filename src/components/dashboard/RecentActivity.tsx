import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useApp, GroupEvent } from '@/store/AppContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

export function RecentActivity({ event }: { event: GroupEvent }) {
  const { participants } = useApp()
  const recent = [...event.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Transações do Evento</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {recent.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Sem atividades.</div>
        ) : (
          <ScrollArea className="h-[250px] pr-4 -mr-4">
            <div className="space-y-4">
              {recent.map((transaction) => {
                const participant = participants.find((p) => p.id === transaction.participantId)
                const isError = transaction.status === 'error'
                const isAporte = transaction.type === 'aporte'

                return (
                  <div key={transaction.id} className="flex items-center gap-4 animate-slide-down">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={participant?.photo_url} />
                      <AvatarFallback>{participant?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p
                        className="text-sm font-medium leading-none truncate"
                        title={transaction.description}
                      >
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant?.name.split(' ')[0]} •{' '}
                        {formatDate(transaction.date).split(' ')[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${isError ? 'text-destructive' : isAporte ? 'text-green-600' : ''}`}
                      >
                        {isError
                          ? 'Inválido'
                          : isAporte
                            ? `+ ${formatCurrency(transaction.amount)}`
                            : formatCurrency(transaction.amount)}
                      </div>
                      <Badge
                        variant={
                          transaction.status === 'processed'
                            ? 'default'
                            : transaction.status === 'error'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={`text-[10px] px-1.5 py-0 mt-1 ${isAporte && transaction.status === 'processed' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : ''}`}
                      >
                        {transaction.status === 'processed'
                          ? isAporte
                            ? 'Aporte'
                            : 'Despesa'
                          : transaction.status === 'error'
                            ? 'Erro'
                            : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
