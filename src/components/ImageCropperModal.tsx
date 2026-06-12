import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface ImageCropperModalProps {
  open: boolean
  imageUrl: string
  onCrop: (dataUrl: string) => void
  onCancel: () => void
  onKeepOriginal: () => void
}

export function ImageCropperModal({
  open,
  imageUrl,
  onCrop,
  onCancel,
  onKeepOriginal,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const imgRef = useRef<HTMLImageElement>(null)

  const C = 256
  const [dimensions, setDimensions] = useState({ W: C, H: C, baseScale: 1 })

  useEffect(() => {
    if (open && imageUrl) {
      setZoom(1)
      const img = new Image()
      img.onload = () => {
        const baseScale = Math.max(C / img.width, C / img.height)
        const W = img.width * baseScale
        const H = img.height * baseScale
        setDimensions({ W, H, baseScale })
        setPan({ x: (C - W) / 2, y: (C - H) / 2 })
      }
      img.src = imageUrl
    }
  }, [open, imageUrl])

  useEffect(() => {
    const { W, H } = dimensions
    const currentW = W * zoom
    const currentH = H * zoom
    setPan((prev) => ({
      x: Math.max(C - currentW, Math.min(0, prev.x)),
      y: Math.max(C - currentH, Math.min(0, prev.y)),
    }))
  }, [zoom, dimensions])

  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true)
    dragStart.current = { x: clientX, y: clientY, panX: pan.x, panY: pan.y }
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    const dx = clientX - dragStart.current.x
    const dy = clientY - dragStart.current.y
    const { W, H } = dimensions
    const currentW = W * zoom
    const currentH = H * zoom

    setPan({
      x: Math.max(C - currentW, Math.min(0, dragStart.current.panX + dx)),
      y: Math.max(C - currentH, Math.min(0, dragStart.current.panY + dy)),
    })
  }

  const handlePointerUp = () => setIsDragging(false)

  const handleCrop = () => {
    const canvas = document.createElement('canvas')
    canvas.width = C
    canvas.height = C
    const ctx = canvas.getContext('2d')
    if (ctx && imgRef.current) {
      ctx.drawImage(imgRef.current, pan.x, pan.y, dimensions.W * zoom, dimensions.H * zoom)
      onCrop(canvas.toDataURL('image/jpeg', 0.9))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>Ajustar Foto</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 my-4">
          <div
            className="relative overflow-hidden bg-slate-900 rounded-full border-2 border-slate-200 shadow-sm cursor-move touch-none"
            style={{ width: C, height: C }}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              className="max-w-none absolute pointer-events-none origin-top-left"
              style={{
                width: dimensions.W * zoom,
                height: dimensions.H * zoom,
                transform: `translate(${pan.x}px, ${pan.y}px)`,
              }}
              draggable={false}
            />
            <div className="absolute inset-0 pointer-events-none border-4 border-primary/20 rounded-full"></div>
          </div>

          <div className="w-full max-w-[256px] space-y-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([val]) => setZoom(val)}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2 mt-4 sm:space-x-2">
          <Button
            variant="ghost"
            onClick={onKeepOriginal}
            className="w-full sm:w-auto text-muted-foreground sm:mr-auto"
          >
            Usar Original
          </Button>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" onClick={onCancel} className="flex-1 sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleCrop} className="flex-1 sm:w-auto">
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
