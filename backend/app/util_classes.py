from typing import List, Any

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

# , settings: Settings):


async def request_forge_tools(url: str):

    # class ForgeDetails():
    #    status: int
    #    details: str

    #    def __init__(self, status: int = None, details: int = None):
    #        self.status = status
    #        self.details = details

    # def format_error(status: int, error):
    #    return ForgeDetails(status=status, details=f"Error {forge.url+suffix}: {str(error)}")

    response_status = 400
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response_status = response.status_code  # https.AsyncClient format
            return response.json()
        except ConnectionRefusedError as error:
            return []
        except OSError as error:
            return []
        except Exception as error:
            return []
