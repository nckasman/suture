from typing import List, Optional, Dict, Any
from decimal import Decimal
import asyncio
from functools import partial

import boto3
from boto3.dynamodb.conditions import Key, Attr

from backend.models import Project, Version, Word

class DynamoDB:
    def __init__(self):
        self.ddb = boto3.resource('dynamodb')
        self.projects = self.ddb.Table('projects-demo')
        self.versions = self.ddb.Table('versions-demo')
        self.loop = asyncio.get_event_loop()

    async def _run_async(self, func, *args, **kwargs):
        return await self.loop.run_in_executor(None, partial(func, *args, **kwargs))

    async def save_project(self, project: Project) -> None:
        item = {
            'id': project.id,
            'user_id': project.user_id,
            'name': project.name,
            'description': project.description,
            'current_version_id': project.current_version_id,
            'created_at': project.created_at.isoformat()
        }
        await self._run_async(self.projects.put_item, Item=item)

    async def get_projects(self, user_id: str) -> List[Project]:
        response = await self._run_async(
            self.projects.query,
            IndexName='user_id-index',
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
        return [
            Project(
                id=item['id'],
                user_id=item['user_id'],
                name=item['name'],
                description=item.get('description'),
                current_version_id=item['current_version_id'],
                created_at=item['created_at']
            )
            for item in response['Items']
        ]

    async def get_project(self, project_id: str) -> Optional[Project]:
        response = await self._run_async(
            self.projects.get_item,
            Key={'id': project_id}
        )
        if 'Item' not in response:
            return None
        item = response['Item']
        return Project(
            id=item['id'],
            user_id=item['user_id'],
            name=item['name'],
            description=item.get('description'),
            current_version_id=item['current_version_id'],
            created_at=item['created_at']
        )

    async def save_version(self, version: Version) -> None:
        item = {
            'id': version.id,
            'project_id': version.project_id,
            'parent_version_id': version.parent_version_id,
            'video_id': version.video_id,
            'timestamp': version.timestamp.isoformat(),
            'status': version.status.value,
            'transcript': [
                {
                    'text': word.text,
                    'start_time': Decimal(str(word.start_time)),
                    'end_time': Decimal(str(word.end_time)),
                    'speaker': word.speaker
                }
                for word in version.transcript
            ],
            'error_message': version.error_message
        }
        await self._run_async(self.versions.put_item, Item=item)

    async def get_versions(self, project_id: str) -> List[Version]:
        response = await self._run_async(
            self.versions.query,
            IndexName='project_id-index',
            KeyConditionExpression=Key('project_id').eq(project_id)
        )
        return [self._parse_version(item) for item in response['Items']]

    async def get_version(self, project_id: str, version_id: str) -> Optional[Version]:
        response = await self._run_async(
            self.versions.get_item,
            Key={'id': version_id}
        )
        if 'Item' not in response:
            return None
        item = response['Item']
        if item['project_id'] != project_id:
            return None
        return self._parse_version(item)

    def _parse_version(self, item: Dict[str, Any]) -> Version:
        return Version(
            id=item['id'],
            project_id=item['project_id'],
            parent_version_id=item.get('parent_version_id'),
            video_id=item['video_id'],
            timestamp=item['timestamp'],
            status=item['status'],
            transcript=[
                Word(
                    text=word['text'],
                    start_time=word['start_time'],
                    end_time=word['end_time'],
                    speaker=word['speaker']
                )
                for word in item['transcript']
            ],
            error_message=item.get('error_message')
        )
