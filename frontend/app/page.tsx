"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MoreVertical, Trash2 } from "lucide-react"
import { api } from "@/lib/api-client"

interface Project {
  id: string
  user_id: string
  name: string
  description: string
  current_version_id: string
  created_at: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  useEffect(() => {
    api.getProjects()
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error)
        }
        if (data) {
          console.log(data)
          setProjects(data)
          setFilteredProjects(data)
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError("An error occurred while fetching projects. Please try again later.")
        setIsLoading(false)
      })
  }, [])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value
    setSearchTerm(term)

    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term.toLowerCase()) ||
        project.description.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredProjects(filtered)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await api.deleteProject(projectId);
      if (error) {
        throw new Error(error);
      }

      // Remove the project from state after successful deletion
      setProjects(projects.filter(project => project.id !== projectId));
      setFilteredProjects(filteredProjects.filter(project => project.id !== projectId));
      setMenuOpenId(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError("Failed to delete project. Please try again.");
    }
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenId && !(event.target as Element).closest('.project-menu')) {
        setMenuOpenId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpenId])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-500 text-white">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">My Projects</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search projects..."
          className="max-w-xs"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Link href="/upload">
          <Button className="btn-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </Link>
      </div>
      {filteredProjects.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No projects found. Try a different search term.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative">
                <Link href={`/project/${project.id}`}>
                  <CardHeader>
                    <CardTitle className="text-gray-800">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative mb-2">
                      <Image
                        src={`/placeholder.svg?height=180&width=320&text=${encodeURIComponent(project.name)}`}
                        alt={`${project.name} thumbnail`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-500">
                      Last modified: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </CardFooter>
                </Link>
                <div className="absolute top-4 right-4 project-menu">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                      setMenuOpenId(menuOpenId === project.id ? null : project.id)
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {menuOpenId === project.id && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.preventDefault()
                          handleDeleteProject(project.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

