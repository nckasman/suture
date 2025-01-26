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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState("view")

  const handleShare = () => {
    // Implement share logic here
    console.log(`Sharing with ${email} with ${permission} permission`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>Invite others to collaborate on this project</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right">
              Email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="permission" className="text-right">
              Permission
            </label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleShare}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

