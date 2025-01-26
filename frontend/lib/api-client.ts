import type { Project, Speaker, Transcription } from "@/types/project"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface CreateProjectPayload {
  name: string;
  description: string;
  video_id: string;
}

interface UploadUrlResponse {
  upload_url: string;
  video_id: string;
}

interface VideoUrlResponse {
  url: string;
}

interface ProjectVersion {
  id: string;
  status: string;
  transcript: Transcription[];
  word_by_word_transcript: string[];
  video_id: string | null;
}

interface BatchEditPayload {
  commands: {
    start_word_index: number;
    end_word_index: number;
    new_text: string;
  }[];
}

interface ApiClient {
  // Projects
  getProjects: () => Promise<ApiResponse<Project[]>>
  getProject: (id: string) => Promise<ApiResponse<Project>>
  createProject: (data: CreateProjectPayload) => Promise<ApiResponse<{ success: boolean; id: string }>>
  deleteProject: (id: string) => Promise<ApiResponse<any>>

  // Versions
  getVersion: (projectId: string, versionId: string) => Promise<ApiResponse<ProjectVersion>>

  // Upload
  getUploadUrl: (fileExtension: string) => Promise<ApiResponse<UploadUrlResponse>>

  // Videos
  getVideoUrl: (videoId: string | null) => Promise<ApiResponse<VideoUrlResponse>>

  // Edits
  applyEdits: (payload: {
    project_id: string,
    version_id: string | undefined,
    edits: any[]
  }) => Promise<ApiResponse<any>>

  // Batch Edit
  batchEdit: (projectId: string, versionId: string, payload: BatchEditPayload) => Promise<ApiResponse<ProjectVersion>>
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export const api: ApiClient = {
  // Projects
  getProjects: () => 
    apiRequest<Project[]>('/projects'),

  getProject: (id: string) => 
    apiRequest<Project>(`/projects/${id}`),

  createProject: (data: CreateProjectPayload) => 
    apiRequest<{ success: boolean; id: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: string) =>
    apiRequest(`/projects/${id}?project_id=${id}`, {
      method: 'DELETE',
    }),

  // Versions
  getVersion: (projectId: string, versionId: string) => 
    apiRequest<ProjectVersion>(`/projects/${projectId}/versions/${versionId}`),

  // Upload
  getUploadUrl: (fileExtension: string) => 
    apiRequest<UploadUrlResponse>('/upload-url', {
      method: 'POST',
      body: JSON.stringify({ file_extension: fileExtension }),
    }),

  // Videos
  getVideoUrl: (videoId: string | null) => {
    if (!videoId) {
      return Promise.resolve({ error: 'No video ID provided' });
    }
    return apiRequest<VideoUrlResponse>(`/videos/${videoId}/url?video_id=${videoId}`);
  },

  // Edits
  applyEdits: async (payload) => {
    return apiRequest(`/api/projects/${payload.project_id}/edits`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  // Batch Edit
  batchEdit: async (projectId: string, versionId: string, payload: BatchEditPayload) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/versions/${versionId}/batch-edit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
} 