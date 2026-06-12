import { Badge } from '@/components/ui/badge'
import { ParticipantRole } from '@/store/AppContext'
import { cn } from '@/lib/utils'

export function RoleTag({
  role,
  className,
}: {
  role?: ParticipantRole | string | null
  className?: string
}) {
  if (role === 'membro') {
    return (
      <Badge
        variant="secondary"
        className={cn('bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200', className)}
      >
        💙 Membro
      </Badge>
    )
  }
  if (role === 'avulso') {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
          className,
        )}
      >
        💛 Avulso
      </Badge>
    )
  }
  if (role === 'doador') {
    return (
      <Badge
        variant="secondary"
        className={cn('bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200', className)}
      >
        🩶 Doador
      </Badge>
    )
  }
  return null
}
