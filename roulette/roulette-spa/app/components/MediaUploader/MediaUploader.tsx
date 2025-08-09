import { useEffect, useRef, useState } from 'react'
import { XIcon, ImageIcon } from 'lucide-react'

interface MediaUploaderProps {
  resetTrigger?: number
  onSelect: (file: File | undefined) => void
}

export const MediaUploader = ({ onSelect, resetTrigger }: MediaUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(undefined)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? undefined
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      onSelect(file)
    }
  }

  const removeFile = () => {
    onSelect(undefined)
    setPreview(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      onSelect(undefined)
      setPreview(undefined)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [resetTrigger])

  return (
    <div className="relative">
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ImageIcon size={18} />
          Ajouter une image
        </button>
      ) : (
        <div className="relative mt-2 w-full">
          <img
            src={preview}
            alt="preview"
            className="w-full rounded-md object-cover border border-white/10"
          />
          <button
            type="button"
            onClick={removeFile}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition"
            aria-label="Retirer"
          >
            <XIcon size={16} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
