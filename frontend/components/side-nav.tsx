import { Share2, Download, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SideNavProps {
  projectId: string
  onExportClick: () => void
  onShareClick: () => void
  onChatClick: () => void
}

export function SideNav({ projectId, onExportClick, onShareClick, onChatClick }: SideNavProps) {
  const tools = [
    { icon: Share2, label: "Share", onClick: onShareClick },
    { icon: Download, label: "Export", onClick: onExportClick },
    { icon: MessageSquare, label: "AI Assistant", onClick: onChatClick },
  ]

  return (
    <div className="fixed left-0 top-14 h-full w-16 flex flex-col items-center border-r bg-background pt-6 gap-6">
      {tools.map((Tool, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={Tool.onClick}>
              <Tool.icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={18}>
            {Tool.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

