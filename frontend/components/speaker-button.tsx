import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, Edit2, Trash2 } from "lucide-react"

interface SpeakerButtonProps {
  speaker: {
    id: number
    name: string
  }
  isSelected: boolean
  onSelect: () => void
  onRename: (id: number, newName: string) => void
  onDelete: (id: number) => void
  isAllButton?: boolean
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({
  speaker,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  isAllButton = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(speaker.name)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
        setIsRenaming(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isRenaming])

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isAllButton) {
      e.preventDefault()
      setIsMenuOpen(true)
    }
  }

  const handleRename = () => {
    setIsRenaming(true)
  }

  const handleConfirmRename = () => {
    onRename(speaker.id, newName)
    setIsRenaming(false)
    setIsMenuOpen(false)
  }

  const handleCancelRename = () => {
    setNewName(speaker.name)
    setIsRenaming(false)
  }

  const handleDelete = () => {
    onDelete(speaker.id)
    setIsMenuOpen(false)
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant={isSelected ? "default" : "outline"}
        size="sm"
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        className={`
          ${isSelected 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 shadow-sm' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
          }
        `}
      >
        {speaker.name}
      </Button>
      {isMenuOpen && !isAllButton && (
        <div
          ref={menuRef}
          className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-sm z-10"
        >
          {isRenaming ? (
            <div className="p-2 w-full">
              <Input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mb-2"
              />
              <div className="flex justify-end space-x-2">
                <Button size="sm" variant="ghost" onClick={handleCancelRename}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmRename}>
                  <Check className="w-4 h-4 mr-1" />
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handleRename}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 flex items-center"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

