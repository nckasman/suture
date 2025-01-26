"use server"

import { revalidatePath } from "next/cache"

interface CreateProjectData {
  title: string
  videoUrl: string
}

export async function createProject(data: CreateProjectData) {
  // In a real application, you would save this data to a database
  // For now, we'll simulate creating a project with a delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate generating a random project ID
  const projectId = Math.floor(Math.random() * 1000000).toString()

  // Revalidate the projects page to show the new project
  revalidatePath("/")

  return { success: true, projectId }
}

