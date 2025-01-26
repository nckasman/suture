import { ArrowLeft, Share2, MonitorPlay, Heart, Undo, Redo } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ProjectNav({ projectId }: { projectId: string }) {
  return (
    <div className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4 h-14">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm font-medium">Project {projectId}</span>
      </div>
      <div className="flex items-center px-4 h-14 gap-2">
        <Button variant="ghost" size="icon">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <MonitorPlay className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button className="ml-2">Export</Button>
      </div>
    </div>
  )
}

