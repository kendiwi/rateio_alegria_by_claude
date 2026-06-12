import { useState } from 'react'
import { useApp, GroupEvent } from '@/store/AppContext'
import { StatCards } from '@/components/dashboard/StatCards'
import { ExpenseChart } from '@/components/dashboard/ExpenseChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { DonationsList } from '@/components/dashboard/DonationsList'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { StartEventModal } from '@/components/events/StartEventModal'
import { CloseEventModal } from '@/components/events/CloseEventModal'
import { EventSummaryModal } from '@/components/events/EventSummaryModal'
import { PreviewSummaryModal } from '@/components/events/PreviewSummaryModal'
import { Play, Archive, Landmark, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Index() {
  const { activeEvent, globalCaixaBalance, pastEvents, deleteEvent } = useApp()
  const [justClosedEvent, setJustClosedEvent] = useState<GroupEvent | null>(null)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  return (
    <div className="space-y-8 animate-fade-in-up">
      {justClosedEvent && (
        <EventSummaryModal
          event={justClosedEvent}
          open={!!justClosedEvent}
          onOpenChange={(open) => {
            if (!open) setJustClosedEvent(null)
          }}
        />
      )}

      <Card className="bg-emerald-600 text-white shadow-md border-emerald-500 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-48 bg-emerald-500/30 -skew-x-12 translate-x-8" />
        <CardContent className="p-6 flex items-center justify-between relative z-10">
          <div>
            <p className="text-emerald-100 font-medium mb-1 flex items-center gap-2">
              <Landmark className="h-4 w-4" /> Fundo do Caixa Global
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              {formatCurrency(globalCaixaBalance)}
            </h2>
          </div>
          <Archive className="h-16 w-16 text-emerald-400 opacity-40" />
        </CardContent>
      </Card>

      {activeEvent ? (
        <div className="space-y-6 animate-slide-down">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border">
            <div>
              <div className="flex items-center gap-4">
                {activeEvent.photoUrl ? (
                  <Avatar className="h-14 w-14 border-2 border-emerald-500 shadow-sm">
                    <AvatarImage src={activeEvent.photoUrl} className="object-cover" />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                      {activeEvent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{activeEvent.name}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Evento em {formatShortDate(activeEvent.eventDate || activeEvent.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PreviewSummaryModal />
              <CloseEventModal onSuccess={(evt) => setJustClosedEvent(evt)} />
            </div>
          </div>

          <StatCards event={activeEvent} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <ExpenseChart event={activeEvent} />
            </div>
            <div className="md:col-span-1">
              <RecentActivity event={activeEvent} />
            </div>
            <div className="md:col-span-1">
              <DonationsList />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50 py-16 flex flex-col items-center justify-center text-center shadow-inner">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Play className="h-10 w-10 ml-1" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800">
              Nenhum evento ativo no momento
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Inicie um novo ciclo de evento para começar a registrar despesas, definir os
              participantes e calcular o rateio do grupo.
            </p>
            <StartEventModal />
          </Card>

          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Histórico de Eventos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((evt) => (
                  <Card
                    key={evt.id}
                    className="opacity-90 hover:opacity-100 transition-opacity hover:shadow-md flex flex-col relative group"
                  >
                    <CardHeader className="pb-3 border-b bg-slate-50/50 relative">
                      <div className="flex items-center gap-3 pr-8">
                        {evt.photoUrl && (
                          <Avatar className="h-12 w-12 border border-slate-200 shadow-sm shrink-0">
                            <AvatarImage src={evt.photoUrl} className="object-cover" />
                            <AvatarFallback>{evt.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <CardTitle className="text-lg text-slate-700 leading-tight">
                            {evt.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {formatShortDate(evt.eventDate || evt.createdAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEventToDelete(evt.id)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Gastos Totais:</span>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(evt.snapshot?.totalExpenses || 0)}
                          </span>
                        </div>
                        {evt.snapshot?.totalAportes && evt.snapshot.totalAportes > 0 ? (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Aportes:</span>
                            <span className="font-semibold text-green-600">
                              +{formatCurrency(evt.snapshot.totalAportes)}
                            </span>
                          </div>
                        ) : null}
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Subsídio Aplicado:</span>
                          <span className="font-semibold text-emerald-600">
                            -{formatCurrency(evt.snapshot?.appliedSubsidy || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <EventSummaryModal
                        event={evt}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                          >
                            <Share2 className="h-4 w-4" /> Ver Resumo WhatsApp
                          </Button>
                        }
                      />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja excluir este evento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (eventToDelete) {
                  deleteEvent(eventToDelete)
                  toast.success('Evento excluído com sucesso.')
                  setEventToDelete(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
