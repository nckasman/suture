import { Wand2, Edit3, Share2, Download, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

interface ToolsSidebarProps {
  projectId: string
}

export function ToolsSidebar({ projectId }: ToolsSidebarProps) {
  const tools = [
    { icon: Wand2, label: "Magic tools", href: "#" },
    { icon: Edit3, label: "Edit", href: `/project/${projectId}/edit` },
    { icon: Share2, label: "Share", href: `/project/${projectId}/share` },
    { icon: Download, label: "Export", href: `/project/${projectId}/export` },
    { icon: MessageSquare, label: "AI Assistant", href: `/project/${projectId}/chat` },
  ]

  return (
    <div className="fixed right-0 top-0 h-full w-16 flex flex-col items-center border-l bg-background pt-20 gap-6">
      {tools.map((Tool, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Link href={Tool.href}>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Tool.icon className="h-5 w-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={18}>
            {Tool.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

