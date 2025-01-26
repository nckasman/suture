import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Login() {
  return (
    <div className="container mx-auto max-w-md p-4">
      <Card className="border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Log In</Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full mb-2">
              Continue with Google
            </Button>
            <Button variant="link" className="w-full text-purple-600 hover:text-purple-700">
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

