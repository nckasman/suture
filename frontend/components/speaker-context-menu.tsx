import type React from "react"
import { Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SpeakerContextMenuProps {
  position: { x: number; y: number }
  onRename: () => void
  onDelete: () => void
}

export const SpeakerContextMenu: React.FC<SpeakerContextMenuProps> = ({ position, onRename, onDelete }) => {
  return (
    <div
      className="fixed bg-white shadow-md rounded-md flex flex-col p-1 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Button variant="ghost" size="sm" onClick={onRename} className="text-gray-700 hover:bg-gray-100 justify-start">
        <Edit2 className="h-4 w-4 mr-2" />
        Rename
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} className="text-gray-700 hover:bg-gray-100 justify-start">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  )
}

