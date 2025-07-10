import { useState } from 'react'
import { Color, POST_COLORS } from '../../constants'
import { ColorSelector } from '../ColorSelector/ColorSelector'
import { PostTextInput } from '../PostTextInput/PostTextInput'
import { MediaUploader } from '../MediaUploader/MediaUploader'
import { DropdownFilter, DropdownFilterOption } from '../DropdownFilter/DropdownFilter'

interface TimelineComposerProps {
  userName: string
  onPost: (payload: {
    image?: File
    team?: string
    type?: string
    content: string
    backgroundColor?: string
  }) => void
  isJudge?: boolean
  eventTypes?: DropdownFilterOption[]
  availableTeams?: DropdownFilterOption[]
}

export const TimelineComposer = ({
  onPost,
  userName,
  isJudge = false,
  eventTypes = [],
  availableTeams = [],
}: TimelineComposerProps) => {
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | undefined>()
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<Color | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<string | undefined>()

  const handleSubmit = () => {
    if (!text.trim() && !image) return
    onPost({ content: text.trim(), image, backgroundColor: selectedColor, team: selectedTeam, type: selectedEvent })
    setText('')
    setImage(undefined)
    setSelectedTeam(undefined)
    setSelectedColor(undefined)
    setSelectedEvent(undefined)
  }

  return (
    <div className="bg-neutral-800 p-4 rounded-xl mb-6 shadow border border-white/5 w-full">
      <h3 className="text-white text-md font-semibold mb-2">Bonjour {userName}, exprime-toi !</h3>
      <PostTextInput value={text} onChange={setText} />

      <div className="flex flex-wrap gap-4 mt-4">
        <MediaUploader onSelect={v => setImage(v)} />
        <ColorSelector colors={POST_COLORS} selected={selectedColor} onSelect={setSelectedColor} />
        {isJudge && (
          <>
            <DropdownFilter
              options={eventTypes}
              placeholder="Type d'événement"
              value={selectedEvent}
              onChange={setSelectedEvent}
            />
            <DropdownFilter
              options={availableTeams}
              placeholder="Équipe"
              value={selectedTeam}
              onChange={setSelectedTeam}
            />
          </>
        )}
        <button
          onClick={handleSubmit}
          className="ml-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Publier
        </button>
      </div>
    </div>
  )
}
