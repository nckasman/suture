"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SideNav } from "@/components/side-nav"
import { TopBar } from "@/components/top-bar"
import { ExportModal } from "@/components/export-modal"
import { LLMChatWindow } from "@/components/llm-chat-window"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ShareModal } from "@/components/share-modal"
import { TranscriptionCard } from "@/components/transcription-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import type { Project, Speaker, Transcription, Sentence } from "@/types/project"
import { api } from '@/lib/api-client'

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false })

interface HistoryState {
  sentences: Sentence[]
  speakers: Speaker[]
}

interface ProjectVersion {
  id: string
  status: string
  transcript: Transcription[]
  word_by_word_transcript: string[]
  video_id: string | null
}

export interface EditPayload {
  type: 'edit';
  start_word_index: number;
  end_word_index: number;
  new_text: string;
}

export interface DeletePayload {
  type: 'delete';
  start_word_index: number;
  end_word_index: number;
}

interface EditOperation {
  type: 'edit' | 'delete';
  payload: {
    start_word_index: number;
    end_word_index: number;
    new_text?: string;
  };
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [currentVersion, setCurrentVersion] = useState<ProjectVersion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null)
  const [sentences, setSentences] = useState<Sentence[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [undoHistory, setUndoHistory] = useState<HistoryState[]>([])
  const [redoHistory, setRedoHistory] = useState<HistoryState[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [pendingEdits, setPendingEdits] = useState<EditOperation[]>([])
  const router = useRouter()

  const fetchProject = useCallback(async () => {
    console.log('Starting fetch project request:', params.id)
    const { data, error } = await api.getProject(params.id)
    if (error) {
      console.error("Fetch project request error:", error)
      setError("Failed to fetch project. Please try again.")
      return null
    }
    console.log('Fetch project request completed successfully')
    if (data) {
      setProject(data)
      return data
    }
    return null
  }, [params.id])

  const fetchVersion = useCallback(async (projectId: string, versionId: string) => {
    console.log('Starting fetch version request:', versionId)
    const { data: versionData, error: versionError } = await api.getVersion(projectId, versionId)
    if (versionError) {
      console.error("Fetch version request error:", versionError)
      setError("Failed to fetch version details. Please try again.")
      return null
    }
    console.log('Fetch version request completed successfully')
    if (versionData) {
      setCurrentVersion(versionData)
      // Fetch video URL
      console.log('Starting fetch video URL request')
      const response = await api.getVideoUrl(versionData.video_id)
      if ('error' in response || !response.data) {
        console.error("Fetch video URL request error:", response.error || "No data received")
        setError("Failed to fetch video URL. Please try again.")
        return null
      }
      console.log('Fetch video URL request completed successfully')
      setVideoUrl(response.data.url)
    }
    return versionData
  }, [])

  const checkProjectStatus = useCallback(async () => {
    const projectData = await fetchProject()
    if (projectData && projectData.current_version_id) {
      const versionData = await fetchVersion(projectData.id, projectData.current_version_id)
      if (versionData && versionData.status === "completed") {
        setIsLoading(false)
        return true
      }
    }
    return false
  }, [fetchProject, fetchVersion])

  useEffect(() => {
    const pollProjectStatus = async () => {
      const isReady = await checkProjectStatus()
      if (!isReady) {
        setTimeout(pollProjectStatus, 5000) // Poll every 5 seconds
      }
    }

    pollProjectStatus()

    return () => {
      // Clean up any ongoing requests or timers if needed
    }
  }, [checkProjectStatus])

  const constructSentences = useCallback((transcript: Transcription[]): Sentence[] => {
    const sentences: Sentence[] = []
    let currentSentence = ""
    let currentSpeaker = ""
    let startTime = 0

    transcript.forEach((word, index) => {
      if (currentSpeaker !== word.speaker) {
        if (currentSentence) {
          sentences.push({
            text: currentSentence.trim(),
            speaker: currentSpeaker,
            start_time: startTime,
            end_time: word.start_time,
          })
        }
        currentSentence = ""
        currentSpeaker = word.speaker
        startTime = word.start_time
      }

      currentSentence += (currentSentence ? " " : "") + word.text

      if (
        word.text.endsWith(".") ||
        word.text.endsWith("!") ||
        word.text.endsWith("?") ||
        index === transcript.length - 1
      ) {
        sentences.push({
          text: currentSentence.trim(),
          speaker: currentSpeaker,
          start_time: startTime,
          end_time: word.end_time,
        })

        currentSentence = ""
        startTime = word.end_time
      }
    })

    return sentences
  }, [])

  useEffect(() => {
    if (currentVersion && currentVersion.transcript) {
      const initialSentences = constructSentences(currentVersion.transcript)
      setSentences(initialSentences)
      const uniqueSpeakers = Array.from(new Set(initialSentences.map((s) => s.speaker)))
      setSpeakers(uniqueSpeakers.map((name, index) => ({ id: index + 1, name })))
    }
  }, [currentVersion, constructSentences])

  const filteredSentences = selectedSpeaker ? sentences.filter((s) => s.speaker === selectedSpeaker) : sentences

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds)
  }

  const handleTranscriptionClick = (timestamp: number) => {
    setCurrentTime(timestamp)
  }

  const updateSentence = useCallback(
    (index: number, newText: string, editPayload?: EditPayload | DeletePayload) => {
      setUndoHistory((prev) => [...prev, { sentences, speakers }])
      setRedoHistory([])
      setSentences((prev) => {
        const newSentences = [...prev]
        newSentences[index] = { ...newSentences[index], text: newText }
        return newSentences
      })
      
      if (editPayload) {
        console.log('Received edit payload:', editPayload);
        
        const newEdit: EditOperation = {
          type: editPayload.type,
          payload: {
            start_word_index: editPayload.start_word_index,
            end_word_index: editPayload.end_word_index,
            ...('new_text' in editPayload && { new_text: editPayload.new_text })
          }
        };
        
        console.log('Adding new edit operation:', newEdit);
        
        setPendingEdits(prev => {
          const updatedEdits = [...prev, newEdit];
          console.log('Updated pending edits:', updatedEdits);
          return updatedEdits;
        });
      }
    },
    [sentences, speakers],
  )

  const updateSpeaker = useCallback(
    (id: number, newName: string) => {
      setUndoHistory((prev) => [...prev, { sentences, speakers }])
      setRedoHistory([])
      setSpeakers((prev) => {
        const newSpeakers = [...prev]
        const speakerIndex = newSpeakers.findIndex((s) => s.id === id)
        if (speakerIndex !== -1) {
          const oldName = newSpeakers[speakerIndex].name
          newSpeakers[speakerIndex] = { ...newSpeakers[speakerIndex], name: newName }
          setSentences((prevSentences) =>
            prevSentences.map((s) => (s.speaker === oldName ? { ...s, speaker: newName } : s)),
          )
        }
        return newSpeakers
      })
    },
    [sentences, speakers],
  )

  const deleteSpeaker = useCallback(
    (id: number) => {
      setUndoHistory((prev) => [...prev, { sentences, speakers }])
      setRedoHistory([])
      setSpeakers((prev) => {
        const newSpeakers = prev.filter((s) => s.id !== id)
        const deletedSpeaker = prev.find((s) => s.id === id)
        if (deletedSpeaker) {
          setSentences((prevSentences) => prevSentences.filter((s) => s.speaker !== deletedSpeaker.name))
        }
        return newSpeakers
      })
      setSelectedSpeaker((prev) => (prev === speakers.find((s) => s.id === id)?.name ? null : prev))
    },
    [sentences, speakers],
  )

  const handleUndo = useCallback(() => {
    if (undoHistory.length > 0) {
      const prevState = undoHistory[undoHistory.length - 1]
      setRedoHistory((prev) => [...prev, { sentences, speakers }])
      setSentences(prevState.sentences)
      setSpeakers(prevState.speakers)
      setUndoHistory((prev) => prev.slice(0, -1))
      // Remove the last edit operation
      setPendingEdits(prev => prev.slice(0, -1))
    }
  }, [sentences, speakers, undoHistory])

  const handleRedo = useCallback(() => {
    if (redoHistory.length > 0) {
      const nextState = redoHistory[redoHistory.length - 1]
      setUndoHistory((prev) => [...prev, { sentences, speakers }])
      setSentences(nextState.sentences)
      setSpeakers(nextState.speakers)
      setRedoHistory((prev) => prev.slice(0, -1))
      // Add back the edit operation
      // Note: You might want to store edit operations in redo history as well
    }
  }, [sentences, speakers, redoHistory])

  const handleApplyEdits = async () => {
    console.log('Current pending edits:', pendingEdits);
    
    try {
      const payload = {
        commands: pendingEdits.map(edit => {
          const baseCommand = {
            start_word_index: edit.payload.start_word_index,
            end_word_index: edit.payload.end_word_index,
          };

          if (edit.type === 'edit') {
            return {
              ...baseCommand,
              new_text: edit.payload.new_text ?? ""
            };
          }

          // For delete operations, return only start_word_index and end_word_index
          return baseCommand;
        })
      };

      console.log('Sending payload to API:', payload);

      const { data: newVersionData, error } = await api.batchEdit(
        params.id,
        currentVersion?.id || '',
        payload
      );

      if (error || !newVersionData) {
        throw new Error(error || 'Failed to apply edits');
      }

      // Update the current version with the new data
      setCurrentVersion(newVersionData);

      // Fetch and update the video URL if there's a new video_id
      if (newVersionData.video_id) {
        const { data: videoData } = await api.getVideoUrl(newVersionData.video_id);
        if (videoData) {
          setVideoUrl(videoData.url);
        }
      }
      
      // Clear pending edits and history
      setPendingEdits([]);
      setUndoHistory([]);
      setRedoHistory([]);

    } catch (error) {
      console.error("Failed to apply edits:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-lg">Project is processing...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
        <Button onClick={() => router.refresh()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!project || !currentVersion) {
    return <div className="flex justify-center">No project data available.</div>
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <TopBar showBackButton={true} />
        <SideNav
          projectId={params.id}
          onExportClick={() => setIsExportModalOpen(true)}
          onShareClick={() => setIsShareModalOpen(true)}
          onChatClick={() => setIsChatWindowOpen(true)}
        />
        <div className="ml-16 pt-14">
          <div className="p-4 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-sm text-gray-600">Last modified: {new Date(project.created_at).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 overflow-hidden rounded-lg shadow-md">
                {videoUrl ? (
                  <ReactPlayer url={videoUrl} width="100%" height="auto" controls onProgress={handleProgress} />
                ) : (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <p>Video not available</p>
                  </div>
                )}
              </div>

              <TranscriptionCard
                speakers={speakers}
                selectedSpeaker={selectedSpeaker}
                setSelectedSpeaker={setSelectedSpeaker}
                filteredSentences={filteredSentences}
                currentTime={currentTime}
                handleTranscriptionClick={handleTranscriptionClick}
                updateSentence={updateSentence}
                updateSpeaker={updateSpeaker}
                deleteSpeaker={deleteSpeaker}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoHistory.length > 0}
                canRedo={redoHistory.length > 0}
                onApplyEdits={handleApplyEdits}
                hasEdits={pendingEdits.length > 0}
              />
            </div>

            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-800">Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Project ID: {project.id}</p>
                <p className="text-gray-700">Description: {project.description}</p>
                <p className="text-gray-700">Status: {currentVersion.status}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <LLMChatWindow isOpen={isChatWindowOpen} onClose={() => setIsChatWindowOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </TooltipProvider>
  )
}

