import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShareCollaboration({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Share Project: {params.id}</h1>
      <Card className="border-gray-200 shadow-md mb-4">
        <CardHeader>
          <CardTitle className="text-gray-800">Invite Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input type="email" placeholder="Enter email address" className="flex-grow" />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="edit">Edit Access</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Invite</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-800">Collaboration History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-700">User1 edited the transcript - 2 hours ago</p>
            <p className="text-gray-700">User2 viewed the project - 1 day ago</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

