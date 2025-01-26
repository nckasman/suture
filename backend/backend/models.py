from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ProcessingStatus(Enum):
    PROCESSING = "processing"
    COMPLETED = "completed" 
    FAILED = "failed"

class Word(BaseModel):
    text: str
    start_time: float
    end_time: float
    speaker: str

class Version(BaseModel):
    id: str
    project_id: str
    parent_version_id: Optional[str]
    video_id: str
    timestamp: datetime
    status: ProcessingStatus
    transcript: List[Word]
    error_message: Optional[str]

class Project(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    current_version_id: str
    created_at: datetime

class EditCommand(BaseModel):
    start_word_index: int
    end_word_index: int

class DeleteCommand(EditCommand):
    pass

class ReplaceCommand(EditCommand):
    new_text: str
