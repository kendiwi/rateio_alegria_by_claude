import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/store/AppContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Gift } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DonationsList() {
  const { donations, participants } = useApp()

  return (
    <Card className="col-span-1 lg:col-span-1 flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-500" /> Doações do Ciclo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {donations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Sem doações registradas neste ciclo.
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-4 -mr-4">
            <div className="space-y-4">
              {donations.map((d) => {
                const participant = participants.find((p) => p.id === d.participant_id)
                return (
                  <div key={d.id} className="flex items-center gap-3 animate-slide-down">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={participant?.photo_url} />
                      <AvatarFallback>{participant?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p
                        className="text-sm font-medium leading-none truncate"
                        title={d.description}
                      >
                        {d.description}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {participant?.name.split(' ')[0]} • {formatDate(d.date).split(' ')[0]}
                      </p>
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
