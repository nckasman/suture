import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Settings() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Account Settings</h1>
      <Card className="border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-800">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <Input type="text" defaultValue="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input type="email" defaultValue="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Video Quality</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Save Changes</Button>
          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

