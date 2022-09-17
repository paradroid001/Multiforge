from typing import List, Any, Optional, Union, Dict
from enum import Enum

from fastapi import WebSocket
from pydantic import BaseModel
import json
import httpx
from bson import ObjectId

from app.core.toolrunsocket import ToolRunSocket


class WebSocketConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, ToolRunSocket] = {}

    async def connect(self, websocket: WebSocket):
        if websocket not in self.active_connections:
            runsocket = ToolRunSocket(websocket)
            await runsocket.connect()
            self.active_connections[websocket] = runsocket
            return runsocket

            # await websocket.accept()
            # self.active_connections.append(websocket)
        else:
            print("Error connecting, websocket already connected.")
            return None

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections[websocket].disconnect()
            # self.active_connections.remove(websocket)
            self.active_connections.pop(websocket)
        else:
            print("Error disconnecting, websocket was not connected")
