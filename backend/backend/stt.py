from google.cloud import speech_v1p1beta1 as speech
import os
import tempfile
from typing import List
import asyncio
from decimal import Decimal

from backend.models import ProcessingStatus, Version, Word
from backend.db import DynamoDB
from backend.s3 import S3Client

class STTProcessor:
    def __init__(self):
        self.stt_client = speech.SpeechClient()
        self.s3 = S3Client()
        self.db = DynamoDB()

    async def preprocess_video(self, version: Version):
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                video_path = os.path.join(temp_dir, "video.mp4")
                audio_path = os.path.join(temp_dir, "audio.wav")
                
                # Download video
                await self.s3.download_video(version.video_id, video_path)
                
                # Extract audio using ffmpeg
                os.system(f'ffmpeg -i {video_path} -ac 1 -ar 16000 {audio_path}')
                
                # Read audio file
                with open(audio_path, 'rb') as f:
                    audio_content = f.read()

                # Configure STT request
                audio = speech.RecognitionAudio(content=audio_content)
                diarization_config = speech.SpeakerDiarizationConfig(
                    enable_speaker_diarization=True,
                    min_speaker_count=2,
                    max_speaker_count=10,
                )

                config = speech.RecognitionConfig(
                    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                    language_code="en-US",
                    diarization_config=diarization_config,
                )

                # Get transcript
                print("Sending request to GCP")
                response = self.stt_client.recognize(config=config, audio=audio)
                print("GCP Done!")
                
                # Process speaker diarization into Word objects
                transcript = []
                for result in response.results:
                    for word_info in result.alternatives[0].words:
                        transcript.append(Word(
                            text=word_info.word,
                            start_time=word_info.start_time.total_seconds(),
                            end_time=word_info.end_time.total_seconds(),
                            speaker=f"Speaker {word_info.speaker_tag}"
                        ))
                        print(word_info.word)
                
                # Update version with transcript
                version.transcript = transcript
                version.status = ProcessingStatus.COMPLETED
                await self.db.save_version(version)

        except Exception as e:
            # Update version with error
            version.status = ProcessingStatus.FAILED
            version.error_message = str(e)
            await self.db.save_version(version)
            raise

async def preprocess_video_task(version: Version):
    processor = STTProcessor()
    await processor.preprocess_video(version)
