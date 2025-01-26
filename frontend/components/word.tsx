import type React from "react"

interface WordProps {
  word: string
  isSelected?: boolean
}

export const Word: React.FC<WordProps> = ({ word, isSelected = false }) => {
  return <span className={`inline-block rounded-sm p-0.5 ${isSelected ? "bg-blue-200" : ""}`}>{word}</span>
}

