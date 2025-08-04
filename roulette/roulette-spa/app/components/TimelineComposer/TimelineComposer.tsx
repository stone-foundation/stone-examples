import { useState } from 'react'
import { Post } from '../../models/Post'
import { User } from '../../models/User'
import { Spinner } from '../Spinner/Spinner'
import { Color, POST_COLORS } from '../../constants'
import { ColorSelector } from '../ColorSelector/ColorSelector'
import { PostTextInput } from '../PostTextInput/PostTextInput'
import { MediaUploader } from '../MediaUploader/MediaUploader'

interface TimelineComposerProps {
  currentUser: User
  onPost: (payload: Partial<Post>, file?: File) => Promise<void>
}

export const TimelineComposer = ({ onPost, currentUser }: TimelineComposerProps) => {
  const [text, setText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [image, setImage] = useState<File | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<Color | undefined>()

  const handleSubmit = () => {
    if (!text.trim() && !image) return

    const coloredText = selectedColor ? 'colored' : 'text'
    const type = image ? 'image' : coloredText
    
    setIsSaving(true)

    onPost({ content: text.trim(), type, visibility: 'public', backgroundColor: selectedColor }, image)
      .then(() => {
        setText('')
        setImage(undefined)
        setSelectedColor(undefined)
      })
      .catch(err => {
        setError('Erreur lors de la publication. Veuillez réessayer.')
        console.error('Error saving post:', err)
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  return (
    <div className="bg-neutral-800 p-4 rounded-xl mb-4 shadow border border-white/5 w-full">
      <h3 className="text-white text-md font-semibold mb-2">Bonjour {currentUser.username}, exprime-toi !</h3>
      <PostTextInput value={text} onChange={setText} />

      {error && (
        <p className="text-red-500 inline-block text-sm mt-2 border border-red-500/20 bg-red-500/10 p-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-4 mt-4">
        <MediaUploader onSelect={v => setImage(v)} />
        <ColorSelector colors={POST_COLORS} selected={selectedColor} onSelect={v => setSelectedColor(v === selectedColor ? undefined : v)} />
        <button
          onClick={handleSubmit}
          disabled={isSaving || (!text.trim() && !image)}
          className="flex items-center gap-2 ml-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publier
          {isSaving && <Spinner />}
        </button>
      </div>
    </div>
  )
}
