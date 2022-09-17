from typing import List
from fastapi import APIRouter, Depends, Request, HTTPException, Response, WebSocket
from starlette import status
import httpx
import asyncio

from app.dependencies import get_settings
from app.settings import Settings
from app.models.forge import Forge, ForgePublic
from app.util_classes import PyObjectId
from app.core.websockerconnectionmanager import WebSocketConnectionManager

router = APIRouter(
    prefix="/api/forges",
    tags=["forges"],
)

websocket_manager = WebSocketConnectionManager()


async def get_forge_by_id(forge_id: PyObjectId, settings: Settings = Depends(get_settings)) -> Forge:
    # forges_collection = await settings.get_collection('forges')
    #forge_dict = forges_collection.find_one({'_id': forge_id})
    # if not forge_dict:
    #    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Forge {forge_id} not found.")
    # return Forge(**forge_dict)
    forge = await Forge.get_by_id(forge_id, settings)
    if not forge:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Forge {forge_id} not found.")
    return forge


async def request_forge_status(client: httpx.AsyncClient, forge: Forge, settings: Settings):

    suffix = "/stats/"

    class ForgeDetails():
        status: int
        details: str

        def __init__(self, status: int = None, details: int = None):
            self.status = status
            self.details = details

    def format_error(status: int, error):
        return ForgeDetails(status=status, details=f"Error {forge.url+suffix}: {str(error)}")

    response_status = 400
    try:
        response = await client.get(str(forge.url+suffix))
        response_status = response.status_code  # https.AsyncClient format
        return ForgeDetails(status=response.status_code, details=response.text)
    except ConnectionRefusedError as error:
        return format_error(response_status, error)
    except OSError as error:
        return format_error(response_status, error)
    except Exception as error:
        return format_error(response_status, error)


@router.get("/")
async def get_forges(settings=Depends(get_settings)) -> List[ForgePublic]:
    # forges_collection = await settings.get_collection('forges')
    forges_collection = await Forge.collection(settings)
    forges_filter = {}
    return [ForgePublic(**item)
            for item in forges_collection.find(forges_filter)]


@router.get("/check/all/")
async def check_forges(request: Request, settings: Settings = Depends(get_settings)):

    forges_collection = await Forge.collection(settings)
    forges = forges_collection.find()  # all

    async with httpx.AsyncClient() as client:
        tasks = [request_forge_status(client, Forge(
            **forge), settings) for forge in forges]
        result = await asyncio.gather(*tasks)
        return result
    return None


@router.get("/check/{forge_id}/")
async def check_forge(forge_id: PyObjectId, settings: Settings = Depends(get_settings)):
    print(f"Checking forge with id {forge_id}")
    forge = await get_forge_by_id(forge_id, settings)

    async with httpx.AsyncClient() as client:
        result = await request_forge_status(client, forge, settings)
        print(result)
        return result
    return None


@router.get("/new/")
async def create_forge(name: str = "Forge name", url: str = "URL including port", settings=Depends(get_settings)):
    forge = Forge(name=name, url=url)
    await forge.save(settings)
    # forges_collection.insert_one(forge.save())


@router.patch("/{forge_id}/edit/")
async def edit_forge(forge_id: PyObjectId,
                     name: str = None,
                     url: str = None,
                     settings: Settings = Depends(get_settings)) -> ForgePublic:
    forge = await get_forge_by_id(forge_id, settings)
    update_dict = {}
    if name:
        forge.name = name
    if url:
        forge.url = url
    await forge.save(settings)
    return ForgePublic(**forge.dict(by_alias=True))


@router.delete("/{forge_id}/delete/")
async def delete_forge(forge_id: PyObjectId, settings: Settings = Depends(get_settings)):
    forge = await get_forge_by_id(forge_id, settings)
    if forge:
        forge_collection = await Forge.collection(settings)
        forge_collection.delete_one({'_id': forge.id})


@router.websocket('/run/{forge_id}/{tool_name}/')
async def run_tool_ws(websocket: WebSocket):
    runsocket = await websocket_manager.connect(websocket)
    await runsocket.tick()
    # while True:
    #    data = await websocket.receive_text()
    #    print("Websocket recieved text " + data)
    #    await websocket.send_text(f"Message Text was {data}")
