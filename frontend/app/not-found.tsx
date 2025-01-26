import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <Card className="border-gray-200 shadow-md w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900">Oops! Page not found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl mb-8 text-gray-700">The page you're looking for doesn't exist or has been moved.</p>
          <div className="space-x-4">
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Go to Home</Button>
            </Link>
            <Button variant="outline">Contact Support</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

