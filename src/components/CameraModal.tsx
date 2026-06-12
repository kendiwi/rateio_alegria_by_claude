import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

interface CameraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (dataUrl: string) => void
}

export function CameraModal({ open, onOpenChange, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let currentStream: MediaStream | null = null

    if (open) {
      setError('')
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          currentStream = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch((e) => console.error('Video play error:', e))
          }
        })
        .catch((err) => {
          console.error('Camera error:', err)
          setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
        })
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [open])

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth || 640
      canvas.height = videoRef.current.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        onCapture(dataUrl)
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader className="mb-2">
          <DialogTitle>Tirar Foto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 bg-black rounded-lg overflow-hidden relative min-h-[300px]">
          {error ? (
            <p className="text-red-400 text-sm text-center p-6">{error}</p>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[60vh] object-cover scale-x-[-1]"
              playsInline
              muted
            />
          )}
        </div>
        <DialogFooter className="mt-2 flex sm:justify-center">
          <Button onClick={handleCapture} disabled={!!error} className="w-full gap-2">
            <Camera className="h-4 w-4" /> Capturar Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
