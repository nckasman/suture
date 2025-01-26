from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from typing import List, Optional, Union
import uuid
from datetime import datetime
import asyncio

from backend.models import *
from backend.db import DynamoDB
from backend.s3 import S3Client
from backend.stt import preprocess_video_task

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db():
    return DynamoDB()
async def get_s3():
    return S3Client()

from pydantic import BaseModel

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    video_id: str

@app.post("/projects")
async def create_project(
    request: CreateProjectRequest,
    db: DynamoDB = Depends(get_db)
):
    project_id = str(uuid.uuid4())
    version_id = str(uuid.uuid4())
    
    project = Project(
        id=project_id,
        user_id="test_user",  # TODO: Get from auth
        name=request.name,
        description=request.description,
        current_version_id=version_id,
        created_at=datetime.now()
    )
    
    version = Version(
        id=version_id,
        project_id=project_id,
        parent_version_id=None,
        video_id=request.video_id,
        timestamp=datetime.now(),
        status=ProcessingStatus.PROCESSING,
        transcript=[],
        error_message=None
    )

    await db.save_project(project)
    await db.save_version(version)

    asyncio.create_task(preprocess_video_task(version))
    # await preprocess_video_task(version)
    return {"success": True}

@app.get("/projects")
async def list_projects(db: DynamoDB = Depends(get_db)) -> List[Project]:
    return await db.get_projects("test_user")  # TODO: Get from auth

@app.get("/projects/{project_id}")
async def get_project_details(
    project_id: str,
    db: DynamoDB = Depends(get_db)
) -> Project:
    project = await db.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404)
    return project

@app.get("/projects/{project_id}/versions")
async def list_versions(
    project_id: str,
    db: DynamoDB = Depends(get_db)
) -> List[Version]:
    return await db.get_versions(project_id)

@app.get("/projects/{project_id}/versions/{version_id}")
async def get_version_details(
    project_id: str,
    version_id: str,
    db: DynamoDB = Depends(get_db)
) -> Version:
    version = await db.get_version(project_id, version_id)
    if not version:
        raise HTTPException(status_code=404)
    return version

@app.post("/projects/{project_id}/versions/{version_id}/edit")
async def create_edit(
    project_id: str,
    version_id: str,
    command: Union[DeleteCommand, ReplaceCommand],
    db: DynamoDB = Depends(get_db)
) -> Version:
    base_version = await db.get_version(project_id, version_id)
    if not base_version:
        raise HTTPException(status_code=404)
        
    new_version = Version(
        id=str(uuid.uuid4()),
        project_id=project_id,
        parent_version_id=version_id,
        video_id=f"{uuid.uuid4()}.mp4",  # Will be replaced with actual video
        timestamp=datetime.now(),
        status=ProcessingStatus.PROCESSING,
        transcript=base_version.transcript.copy(),
        error_message=None
    )
    
    await db.save_version(new_version)
    return new_version

class UploadRequest(BaseModel):
    file_extension: str

@app.post("/upload-url")
async def get_upload_url(
    request: UploadRequest,
    s3: S3Client = Depends(get_s3)
) -> dict:
    if request.file_extension != "mp4":
        raise HTTPException(status_code=400, detail="Unsupported file type")
        
    url, video_id = await s3.generate_upload_url(request.file_extension)
    return {
        "upload_url": url,
        "video_id": video_id
    }

@app.get("/videos/{video_id}/url")
async def get_video_url(
    video_id: str,
    s3: S3Client = Depends(get_s3)
) -> dict:
    url = await s3.generate_download_url(video_id)
    return {"url": url}
