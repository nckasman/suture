"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false })

export default function TranscriptEdit({ params }: { params: { id: string } }) {
  const [transcript, setTranscript] = useState("Initial transcript text...")

  // Mock video URL
  const videoUrl = "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Edit Transcript: Project {params.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-800">Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video mb-4">
              <ReactPlayer url={videoUrl} controls width="100%" height="100%" />
            </div>
            <div className="space-x-2">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Preview Changes</Button>
              <Button variant="outline">Undo</Button>
              <Button variant="outline">Revert to Previous Version</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-800">Edit Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="h-[300px] mb-4" />
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Apply AI Suggestions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

