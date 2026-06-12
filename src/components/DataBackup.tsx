import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Upload, DatabaseBackup } from 'lucide-react'
import { toast } from 'sonner'

const STORAGE_PREFIX = 'rateio_alegria_'
const STORAGE_KEYS = ['participants', 'donations', 'globalCaixaBalance', 'activeEvent', 'pastEvents']

export function DataBackup() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const backup: Record<string, unknown> = {
        version: 1,
        exportedAt: new Date().toISOString(),
      }
      for (const key of STORAGE_KEYS) {
        const raw = localStorage.getItem(STORAGE_PREFIX + key)
        if (raw !== null) {
          try {
            backup[key] = JSON.parse(raw)
          } catch {
            backup[key] = raw
          }
        }
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rateio-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Backup exportado com sucesso!')
    } catch {
      toast.error('Erro ao exportar backup.')
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string)
        if (typeof data !== 'object' || !data) throw new Error('Formato inválido')

        let imported = 0
        for (const key of STORAGE_KEYS) {
          if (key in data) {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data[key]))
            imported++
          }
        }

        if (imported === 0) throw new Error('Nenhum dado reconhecido no arquivo.')

        toast.success(`Backup importado! ${imported} itens restaurados. Recarregando...`)
        setTimeout(() => window.location.reload(), 1000)
      } catch (err: any) {
        toast.error(`Erro ao importar: ${err?.message || 'arquivo inválido'}`)
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImport}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Backup dos dados">
            <DatabaseBackup className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Backup dos Dados</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExport} className="gap-2 cursor-pointer">
            <Download className="h-4 w-4" /> Exportar JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-2 cursor-pointer">
            <Upload className="h-4 w-4" /> Importar JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
