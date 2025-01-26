import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TranscriptSentence } from "@/components/transcript-sentence"
import { SpeakerButton } from "@/components/speaker-button"
import type { Speaker, Sentence } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2 } from "lucide-react"

interface TranscriptionCardProps {
  speakers: Speaker[]
  selectedSpeaker: string | null
  setSelectedSpeaker: (id: string | null) => void
  filteredSentences: Sentence[]
  currentTime: number
  handleTranscriptionClick: (timestamp: number) => void
  updateSentence: (index: number, newText: string, editPayload?: EditPayload | DeletePayload) => void
  updateSpeaker: (id: number, newName: string) => void
  deleteSpeaker: (id: number) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onApplyEdits: () => void
  hasEdits: boolean
}

export const TranscriptionCard: React.FC<TranscriptionCardProps> = ({
  speakers,
  selectedSpeaker,
  setSelectedSpeaker,
  filteredSentences,
  currentTime,
  handleTranscriptionClick,
  updateSentence,
  updateSpeaker,
  deleteSpeaker,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onApplyEdits,
  hasEdits,
}) => {
  const [speakerColors, setSpeakerColors] = useState<{ [key: string]: string }>({})

  const getSpeakerColor = (speakerName: string) => {
    if (!speakerColors[speakerName]) {
      const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F06292",
        "#AED581",
        "#7986CB",
        "#4DB6AC",
        "#FFF176",
      ]
      const newColor = colors[Object.keys(speakerColors).length % colors.length]
      setSpeakerColors((prevColors) => ({ ...prevColors, [speakerName]: newColor }))
    }
    return speakerColors[speakerName]
  }

  const handleSpeakerRename = (id: number, newName: string) => {
    updateSpeaker(id, newName)
  }

  const handleSpeakerDelete = (id: number) => {
    deleteSpeaker(id)
  }

  const handleSentenceEdit = useCallback(
    (index: number, oldText: string, newText: string, editPayload: EditPayload | DeletePayload) => {
      console.log('TranscriptionCard received edit payload:', editPayload);
      
      if (newText.trim() === "") {
        // Remove the sentence if it's empty
        updateSentence(index, "", editPayload);
        
        // Check if this was the last sentence for this speaker
        const currentSpeaker = filteredSentences[index].speaker;
        const remainingSentences = filteredSentences.filter(
          (s, i) => i !== index && s.speaker === currentSpeaker
        );

        if (remainingSentences.length === 0) {
          const speakerToDelete = speakers.find((s) => s.name === currentSpeaker);
          if (speakerToDelete) {
            deleteSpeaker(speakerToDelete.id);
          }
        }
      } else {
        // Update the sentence
        console.log('Calling updateSentence with payload:', editPayload);
        updateSentence(index, newText, editPayload);
      }
    },
    [filteredSentences, speakers, updateSentence, deleteSpeaker]
  );

  return (
    <Card className="lg:col-span-2 border-gray-200 shadow-md">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-800">Transcription</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} className="flex items-center">
                <Undo2 className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo} className="flex items-center">
                <Redo2 className="w-4 h-4 mr-2" />
                Redo
              </Button>
              <Button 
                size="sm"
                onClick={onApplyEdits}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
              >
                Apply Edits
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <SpeakerButton
              speaker={{ id: 0, name: "All" }}
              isSelected={selectedSpeaker === null}
              onSelect={() => setSelectedSpeaker(null)}
              onRename={() => {}}
              onDelete={() => {}}
              isAllButton={true}
            />
            {speakers.map((speaker) => (
              <SpeakerButton
                key={speaker.id}
                speaker={speaker}
                isSelected={selectedSpeaker === speaker.name}
                onSelect={() => setSelectedSpeaker(selectedSpeaker === speaker.name ? null : speaker.name)}
                onRename={(id, newName) => handleSpeakerRename(id, newName)}
                onDelete={(id) => handleSpeakerDelete(id)}
                isAllButton={false}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {filteredSentences.map((sentence, index) => (
            <TranscriptSentence
              key={index}
              speaker={sentence.speaker}
              speakerColor={getSpeakerColor(sentence.speaker)}
              timestamp={sentence.start_time}
              end_time={sentence.end_time}
              text={sentence.text}
              isCurrentSentence={
                currentTime >= sentence.start_time &&
                currentTime < (filteredSentences[index + 1]?.start_time || Number.POSITIVE_INFINITY)
              }
              onEdit={(oldText, newText, editPayload) => handleSentenceEdit(index, oldText, newText, editPayload)}
            />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

