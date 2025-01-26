"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  showBackButton?: boolean
}

export function TopBar({ showBackButton = false }: TopBarProps) {
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b flex items-center px-4 z-10">
      {showBackButton && (
        <Button variant="ghost" size="icon" className="mr-4" onClick={() => router.replace("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <div className="flex-grow flex justify-center">
        <Link href="/" className="pointer-events-auto">
          <h1 className="text-3xl font-bold tracking-tight text-black select-none logo">suture.ai</h1>
        </Link>
      </div>
    </div>
  )
}

