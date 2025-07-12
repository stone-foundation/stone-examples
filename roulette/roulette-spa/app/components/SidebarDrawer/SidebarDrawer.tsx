import { X } from "lucide-react"
import { SidebarMenu } from "../SidebarMenu/SidebarMenu"

interface SidebarDrawerProps {
  open: boolean
  onClose: () => void
}

export const SidebarDrawer = ({ open, onClose }: SidebarDrawerProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute top-0 left-0 h-full w-72 bg-[#0d3a43] shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-6 border-b border-white/10">
          <span className="text-white font-semibold">Opération Adrénaline</span>
          <button onClick={onClose} className="text-white">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-full pt-4 pb-12 md:pb-0">
          <SidebarMenu />
        </div>
      </div>
    </div>
  )
}
