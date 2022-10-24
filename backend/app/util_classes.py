from typing import List, Any, Optional, Union, Dict
from enum import Enum
import sys
import os
import subprocess
import asyncio

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


def node_run_graph(graph_name: str):
    loop = None
    try:
        #loop = asyncio.get_event_loop()
        loop = asyncio.get_running_loop()
    except RuntimeError as ex:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    # no await
    yield loop.run_until_complete(node_process_graph(graph_name))
    loop.close()


async def node_process_graph(graph_name: str):
    try:
        #js = "console.log('hello world');"
        #cmd = ["cd", "../frontend/", ";", "node", "-e", f"{js}"]
        cmd = ["./run_js.sh", graph_name]
        # proc = subprocess.Popen(cmd, shell=True,
        #                        stdin=subprocess.PIPE,
        #                        stdout=subprocess.PIPE,
        #                        stderr=subprocess.PIPE,
        #                        bufsize=1)
        process = await asyncio.create_subprocess_shell(" ".join(cmd),
                                                        stdout=asyncio.subprocess.PIPE,
                                                        stderr=asyncio.subprocess.PIPE)
        stdout, stderr = await process.communicate()
        print(stdout)
        print(stderr)
        return stdout + stderr
        # out, err = await proc.communicate()
        # return out, err
    except subprocess.CalledProcessError as cpe:
        try:
            sys.stderr.write(cpe.output)
        except TypeError as te:
            sys.stderr.write(str(cpe.output))
    except Exception as e:
        sys.stderr.write(
            "unable to run the node js with the node_run_js function.")
        raise e
