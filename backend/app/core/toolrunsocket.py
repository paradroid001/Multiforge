from typing import List, Any, Optional, Union, Dict
from enum import Enum

from fastapi import WebSocket
from pydantic import BaseModel
import json
import httpx
from bson import ObjectId
from app.util_classes import PyObjectId, AsyncResponse

from app.dependencies import get_settings
from app.models.forge import Forge


class ToolRunSocket:
    socket: WebSocket
    connected: bool = False
    forge_id: str = "Unknown Forge"
    tool_name: str = "Unknown Tool"
    tool_run_url: str = "Unknown URL"
    # See execsocket.ts for the client side definitions of these

    class MessageTypes(str, Enum):
        INIT = 'init'
        INITOK = 'initok'
        INDATA = 'indata'
        OUTDATA = 'outdata'
        ERROR = 'error'

    class SocketMessage(BaseModel):
        messagetype: str
        data: Optional[Union[str | List[Any] | Dict[Any, Any]]]

    def __init__(self, websocket: WebSocket):
        self.socket = websocket
        self.connected = False

    async def connect(self):
        print("Websocket connected, accepting")
        await self.socket.accept()
        self.connected = True

    async def disconnect(self, close_code=None):
        print("Websocket discconnect, code was: " + str(close_code))
        print("TODO: Is command still running? should we kill here?")
        self.connected = False

    async def recieve(self, text_data):
        print("Recieved " + text_data)
        message = ToolRunSocket.SocketMessage(**json.loads(text_data))
        if message.messagetype == ToolRunSocket.MessageTypes.INIT:
            await self.handle_init(message.data)
        elif message.messagetype == ToolRunSocket.MessageTypes.INDATA:
            await self.handle_run(message.data)

    async def send(self, messagetype=None, data=None):
        if messagetype is None:
            messagetype = ToolRunSocket.MessageTypes.ERROR.value
        message = ToolRunSocket.SocketMessage(messagetype=messagetype,
                                              data=json.dumps(data))
        await self.socket.send_text(message.json())

    async def tick(self):
        while self.connected:
            data = await self.socket.receive_text()
            await self.recieve(data)

    async def handle_init(self, data):
        print(f"Handling init, data is {data}")
        self.forge_id = data['forgeID']
        self.tool_name = data['toolName']
        await self.send(messagetype=ToolRunSocket.MessageTypes.INITOK)

    async def handle_run(self, tool_args):
        print(f"Handling run for {self.forge_id}, {self.tool_name}")
        print(f"Input was: {tool_args}")
        forge = await Forge.get_by_id(PyObjectId(self.forge_id), get_settings())
        if forge:
            # print(forge.url)
            # print(self.tool_name)
            self.tool_run_url = f"{forge.url}/tool/run/{self.tool_name}/"
            # we have to run the tool on the node.
            response: AsyncResponse = AsyncResponse(
                # url="http://127.0.0.1:8888/tool/run/Hello World Tool/")
                url=self.tool_run_url,
                post_data=tool_args)
            await response.request()

            await self.send(messagetype=ToolRunSocket.MessageTypes.OUTDATA,
                            data=response.data)
        else:
            await self.send(messagetype=ToolRunSocket.MessageTypes.ERROR,
                            data="No such forge")
