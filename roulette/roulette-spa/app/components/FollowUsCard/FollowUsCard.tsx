import { CameraIcon, MusicIcon } from 'lucide-react'

export function FollowUsCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-md p-4 text-white text-sm space-y-3">
      <h3 className="text-base font-semibold">Suivez-nous</h3>
      <p className="text-white/70 text-sm">
        Pour rester informé des lives, résultats et temps forts de l'événement.
      </p>

      <div>
        <a
          href="https://www.tiktok.com/@operationadrenaline"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#010101] text-white px-4 py-2 rounded-md hover:bg-black/80 transition mb-2"
        >
          <MusicIcon size={16} />
          TikTok
        </a>

        <a
          href="https://www.instagram.com/operationadrenaline"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          <CameraIcon size={16} />
          Instagram
        </a>
      </div>
    </div>
  )
}
