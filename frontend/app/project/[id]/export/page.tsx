"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExportPage({ params }: { params: { id: string } }) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleExport = () => {
    setExporting(true)
    // Simulating export progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)
      if (currentProgress >= 100) {
        clearInterval(interval)
        setExporting(false)
      }
    }, 500)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Export Project: {params.id}</h1>
      <Card className="border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-800">Export Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Video Quality</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (480p)</SelectItem>
                <SelectItem value="medium">Medium (720p)</SelectItem>
                <SelectItem value="high">High (1080p)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">File Format</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="mov">MOV</SelectItem>
                <SelectItem value="avi">AVI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="captions" />
            <label htmlFor="captions" className="text-sm font-medium text-gray-700">
              Include captions
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="watermark" />
            <label htmlFor="watermark" className="text-sm font-medium text-gray-700">
              Add watermark
            </label>
          </div>
          {exporting ? (
            <div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-gray-500">Exporting... {progress}%</p>
            </div>
          ) : (
            <Button onClick={handleExport} className="w-full text-white">
              Start Export
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

