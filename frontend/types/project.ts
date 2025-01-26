export interface Speaker {
  id: number
  name: string
}

export interface Transcription {
  text: string
  speaker: string
  start_time: number
  end_time: number
}

export interface Sentence {
  text: string
  speaker: string
  start_time: number
  end_time: number
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string
  current_version_id: string
  created_at: string
}

export interface ProjectVersion {
  id: string
  status: string
  transcript: Transcription[]
  word_by_word_transcript: string[] // Added word-by-word transcript
}

