"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopBar } from "@/components/top-bar"
import { useToast } from "@/components/ui/use-toast"

const uploadToS3 = async (file: File, url: string) => {
  console.log('Starting S3 upload request')
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
      },
      body: file,
    })

    if (response.ok) {
      console.log("S3 upload request completed successfully")
      return true
    } else {
      console.error("S3 upload request failed:", response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error("S3 upload request error:", error)
    return false
  }
}

const getPresignedUrl = async () => {
  console.log('Starting presigned URL request')
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_extension: "mp4" }),
  }

  try {
    const response = await fetch("http://3.93.212.99/upload-url", options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('Presigned URL request completed successfully')
    return { url: data.upload_url, video_id: data.video_id }
  } catch (error) {
    console.error("Presigned URL request error:", error)
    throw error
  }
}

const createProject = async (name: string, description: string, video_id: string) => {
  console.log('Starting create project request')
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, video_id }),
  }

  try {
    const response = await fetch("http://3.93.212.99/projects", options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.success) {
      console.log('Create project request completed successfully')
      return data
    } else {
      throw new Error("Project creation failed")
    }
  } catch (error) {
    console.error("Create project request error:", error)
    throw error
  }
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      if (selectedFile.type === "video/mp4") {
        setFile(selectedFile)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an MP4 file.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !projectName || !projectDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setProgress(0)

    const uploadInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(uploadInterval)
          return 90
        }
        return prevProgress + 10
      })
    }, 500)

    try {
      const { url: preSignedUrl, video_id } = await getPresignedUrl()

      const uploadSuccess = await uploadToS3(file, preSignedUrl)

      if (uploadSuccess) {
        setProgress(100)

        await createProject(projectName, projectDescription, video_id)

        toast({
          title: "Project created",
          description: "Your new project has been created successfully.",
        })
        router.push(`/`)
      } else {
        throw new Error("Failed to upload file to S3")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating your project. Please try again.",
        variant: "destructive",
      })
    } finally {
      clearInterval(uploadInterval)
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar showBackButton={true} />
      <div className="container mx-auto max-w-md p-4 pt-20">
        <Card className="border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Create New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {file ? (
                <div className="aspect-video relative">
                  <Image
                    src="/placeholder.svg?height=180&width=320&text=Video+Preview"
                    alt="Video preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              ) : (
                <>
                  <Input type="file" accept="video/mp4" onChange={handleFileChange} className="mb-4" />
                  <p className="text-sm text-gray-500 mb-2">Supported format: MP4</p>
                  <p className="text-sm text-gray-500">Max file size: 1GB</p>
                </>
              )}
            </div>
            {file && (
              <>
                <Progress value={progress} className="mb-4" />
                <Button onClick={handleUpload} className="w-full text-white" disabled={isUploading}>
                  {isUploading ? "Creating Project..." : "Create Project"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

