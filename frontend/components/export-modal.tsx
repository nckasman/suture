import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState("mp4")
  const [quality, setQuality] = useState("high")

  const handleExport = () => {
    // Implement export logic here
    console.log(`Exporting in ${format} format with ${quality} quality`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>Choose your export settings</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="format" className="text-right">
              Format
            </label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="mov">MOV</SelectItem>
                <SelectItem value="avi">AVI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quality" className="text-right">
              Quality
            </label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (480p)</SelectItem>
                <SelectItem value="medium">Medium (720p)</SelectItem>
                <SelectItem value="high">High (1080p)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

