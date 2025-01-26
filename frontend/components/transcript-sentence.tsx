import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Check, Trash2 } from "lucide-react"

interface WordData {
  text: string
  index: number
  startChar: number
  endChar: number
}

interface TranscriptSentenceProps {
  speaker: string
  speakerColor: string
  timestamp: number
  end_time: number
  text: string
  isCurrentSentence: boolean
  onEdit: (oldText: string, newText: string, editPayload: EditPayload | DeletePayload) => void
}

interface EditPayload {
  start_word_index: number
  end_word_index: number
  new_text: string
}

interface DeletePayload {
  start_word_index: number
  end_word_index: number
}

export const TranscriptSentence: React.FC<TranscriptSentenceProps> = ({
  speaker,
  speakerColor,
  timestamp,
  end_time,
  text,
  isCurrentSentence,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [showEditButton, setShowEditButton] = useState(false)
  const sentenceRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [wordStartIndex, setWordStartIndex] = useState<number>(0)
  const [wordEndIndex, setWordEndIndex] = useState<number>(0)
  const [originalWords, setOriginalWords] = useState<WordData[]>([])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sentenceRef.current && !sentenceRef.current.contains(event.target as Node)) {
        setSelectedText("")
        setIsEditing(false)
        setShowEditButton(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    const wordsArray = text.split(' ')
    let charPosition = 0
    const wordsData: WordData[] = wordsArray.map((word, index) => {
      const wordData = {
        text: word,
        index,
        startChar: charPosition,
        endChar: charPosition + word.length
      }
      charPosition += word.length + 1 // +1 for space
      return wordData
    })
    setOriginalWords(wordsData)
  }, [])

  const getWordIndices = (startChar: number, endChar: number) => {
    const startWord = originalWords.find(word => 
      startChar >= word.startChar && startChar <= word.endChar
    )
    const endWord = originalWords.find(word => 
      endChar >= word.startChar && endChar <= word.endChar
    )
    
    return {
      startWordIndex: startWord?.index ?? 0,
      endWordIndex: endWord?.index ?? 0
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0)
      const startOffset = range.startOffset
      const endOffset = range.endOffset
      const fullText = text

      let expandedStart = startOffset
      while (expandedStart > 0 && fullText[expandedStart - 1] !== " ") {
        expandedStart--
      }

      let expandedEnd = endOffset
      while (expandedEnd < fullText.length && fullText[expandedEnd] !== " ") {
        expandedEnd++
      }

      const { startWordIndex, endWordIndex } = getWordIndices(expandedStart, expandedEnd)
      
      setWordStartIndex(startWordIndex)
      setWordEndIndex(endWordIndex)
      setSelectedText(fullText.slice(expandedStart, expandedEnd))
      setSelectionStart(expandedStart)
      setSelectionEnd(expandedEnd)
      setShowEditButton(true)
    } else {
      setSelectedText("")
      setShowEditButton(false)
    }
  }

  const handleEdit = () => {
    setEditText(selectedText)
    setIsEditing(true)
  }

  const handleEditConfirm = () => {
    const newText = text.slice(0, selectionStart) + editText + text.slice(selectionEnd)
    const editPayload: EditPayload = {
      start_word_index: wordStartIndex,
      end_word_index: wordEndIndex,
      new_text: editText
    }
    console.log('Edit Payload:', editPayload);
    console.log('Original words being modified:', originalWords.slice(wordStartIndex, wordEndIndex + 1));
    onEdit(text, newText, editPayload)
    setIsEditing(false)
    setSelectedText("")
    setShowEditButton(false)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditText("")
    setShowEditButton(false)
  }

  const handleDelete = () => {
    const newText = text.slice(0, selectionStart) + text.slice(selectionEnd)
    const deletePayload: DeletePayload = {
      start_word_index: wordStartIndex,
      end_word_index: wordEndIndex
    }
    console.log('Delete Payload:', deletePayload);
    console.log('Original words being deleted:', originalWords.slice(wordStartIndex, wordEndIndex + 1));
    onEdit(text, newText, deletePayload)
    setShowEditButton(false)
  }

  return (
    <div className="p-3 mb-1 rounded-md relative" ref={sentenceRef}>
      <div className="flex items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base" style={{ color: speakerColor }}>
            {speaker}
          </span>
          {showEditButton && !isEditing && (
            <div className="bg-white border border-gray-200 rounded-md shadow-sm flex z-10">
              <button
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handleEdit}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-100 flex items-center"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
        <span className="font-mono text-sm text-gray-500 ml-auto">
          {new Date(timestamp * 1000).toISOString().substr(11, 8)}
        </span>
      </div>
      <div className="relative">
        <div className="transcript-text text-lg text-gray-800 leading-normal relative" onMouseUp={handleTextSelection}>
          {text}
        </div>
      </div>
      {isEditing && (
        <div className="mt-2 space-y-2">
          <Input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEditConfirm}>
              <Check className="w-4 h-4 mr-1" />
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

