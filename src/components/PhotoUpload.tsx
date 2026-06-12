import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, Camera, Trash2 } from 'lucide-react'
import { CameraModal } from './CameraModal'
import { ImageCropperModal } from './ImageCropperModal'

interface PhotoUploadProps {
  value: string
  onChange: (val: string) => void
  nameFallback?: string
}

export function PhotoUpload({ value, onChange, nameFallback = '?' }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [rawImage, setRawImage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setRawImage(reader.result as string)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (dataUrl: string) => {
    setRawImage(dataUrl)
  }

  const handleCropConfirm = (croppedUrl: string) => {
    onChange(croppedUrl)
    setRawImage('')
  }

  const handleCropCancel = () => {
    setRawImage('')
  }

  const handleCropKeepOriginal = () => {
    onChange(rawImage)
    setRawImage('')
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <Avatar className="h-24 w-24 border-2 border-slate-100 shadow-sm">
        <AvatarImage src={value} className="object-cover" />
        <AvatarFallback className="text-3xl bg-slate-100 text-slate-500 uppercase">
          {nameFallback.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 min-w-[110px]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" /> Upload
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 min-w-[110px]"
          onClick={() => setIsCameraOpen(true)}
        >
          <Camera className="h-4 w-4 mr-2" /> Câmera
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => onChange('')}
            title="Remover foto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CameraModal
        open={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onCapture={handleCameraCapture}
      />

      <ImageCropperModal
        open={!!rawImage}
        imageUrl={rawImage}
        onCrop={handleCropConfirm}
        onCancel={handleCropCancel}
        onKeepOriginal={handleCropKeepOriginal}
      />
    </div>
  )
}
