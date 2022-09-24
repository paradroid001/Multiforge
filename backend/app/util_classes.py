from typing import List, Any, Optional, Union, Dict
from enum import Enum

from fastapi import WebSocket
from pydantic import BaseModel
import json
import httpx
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid objectid')
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type='string')


class AsyncResponse(BaseModel):
    status: int = 500
    data: Any = None
    url: str
    post_data: Optional[Any] = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # if 'url' in kwargs:
        #    self.url = kwargs['url']
        # await self.request(self.url)

    async def request(self) -> 'AsyncResponse':
        async with httpx.AsyncClient() as client:
            try:
                response = None
                if self.post_data is not None:
                    print("posting")
                    response = await client.post(self.url, json=self.post_data)
                else:
                    response = await client.get(self.url)
                self.status = response.status_code  # https.AsyncClient format
                self.data = response.json()
                return self
            except ConnectionRefusedError as error:
                return self
            except OSError as error:
                return self
            except Exception as error:
                return self


class AsyncListResponse():
    status: int = 500
    data: List[Any] = []

    def __init__(self, **kwargs):
        if 'status' in kwargs:
            self.status = kwargs['status']
        if 'data' in kwargs:
            self.data = kwargs['data']


async def request_list_from_url(url: str) -> AsyncListResponse:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response_status = response.status_code  # https.AsyncClient format
            return AsyncListResponse(status=response.status_code, data=response.json())
        except ConnectionRefusedError as error:
            return AsyncListResponse()
        except OSError as error:
            return AsyncListResponse()
        except Exception as error:
            return AsyncListResponse()
