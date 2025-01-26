import boto3
from botocore.config import Config
from typing import Tuple
import uuid

class S3Client:
    def __init__(self):
        self.client = boto3.client(
            's3',
            config=Config(signature_version='s3v4')
        )
        self.bucket = "video-store-demo-2025"

    async def download_video(self, video_id: str, local_path: str) -> None:
        """Download video from S3 to local path"""
        self.client.download_file(
            self.bucket,
            f"uploads/{video_id}",
            local_path
        )

    async def upload_video(self, local_path: str, video_id: str) -> None:
        """Upload video from local path to S3"""
        self.client.upload_file(
            local_path,
            self.bucket,
            f"uploads/{video_id}",
            ExtraArgs={'ContentType': 'video/mp4'}
        )
        
    async def generate_upload_url(self, file_extension: str) -> Tuple[str, str]:
        """Generate a presigned URL for frontend upload and corresponding video_id"""
        video_id = f"{uuid.uuid4()}{file_extension}"
        url = self.client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': self.bucket,
                'Key': f"uploads/{video_id}",
                'ContentType': 'video/mp4'
            },
            ExpiresIn=3600
        )
        return url, video_id

    async def generate_download_url(self, video_id: str) -> str:
        """Generate a presigned URL for viewing/downloading a video"""
        url = self.client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': self.bucket,
                'Key': f"uploads/{video_id}"
            },
            ExpiresIn=3600  # URL valid for 1 hour
        )
        return url
