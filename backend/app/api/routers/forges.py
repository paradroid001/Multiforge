from fastapi import APIRouter, Depends, Request, HTTPException
from starlette import status
import httpx
import asyncio

from app.dependencies import get_settings
from app.settings import Settings
from app.models.forge import Forge, ForgePublic
from app.util_classes import PyObjectId

router = APIRouter(
    prefix="/api/forges",
    tags=["forges"],
)


async def get_forge_by_id(forge_id: PyObjectId, settings: Settings) -> Forge:
    forges_collection = await settings.get_collection('forges')
    forge_dict = forges_collection.find_one({'_id': forge_id})
    if not forge_dict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Forge {forge_id} not found.")
    return Forge(**forge_dict)


async def request_forge_details(client: httpx.AsyncClient, forge: Forge, settings: Settings):

    def format_error(error):
        return f"Error {forge.url}: {str(error)}"
    try:
        response = await client.get(str(forge.url))
        return response.text
    except ConnectionRefusedError as error:
        return format_error(error)
    except OSError as error:
        return format_error(error)
    except Exception as error:
        return format_error(error)


@router.get("/")
async def get_forges(settings=Depends(get_settings)):
    forges_collection = await settings.get_collection('forges')
    forges_filter = {}
    forges = [ForgePublic(**item) for item in forges_collection.find(forges_filter)]
    return forges


@router.get("/check/all/")
async def check_forges(request: Request, settings: Settings = Depends(get_settings)):

    forges_collection = await settings.get_collection('forges')
    forges = forges_collection.find()  # all

    async with httpx.AsyncClient() as client:
        tasks = [request_forge_details(client, Forge(**forge), settings) for forge in forges]
        result = await asyncio.gather(*tasks)
        return result
    return None


@router.get("/check/{forge_id}/")
async def check_forge(forge_id: PyObjectId, settings: Settings = Depends(get_settings)):

    forge = await get_forge_by_id(forge_id, settings)

    async with httpx.AsyncClient() as client:
        result = await request_forge_details(client, forge, settings)
        print(result)
        return result
    return None


@router.get("/new/")
async def create_forge(name: str = "Forge name", url: str = "URL including port", settings=Depends(get_settings)):
    forges_collection = await settings.get_collection('forges')
    forge = Forge(name=name, url=url)
    forges_collection.insert_one(forge.save())


@router.patch("/edit/{forge_id}")
async def edit_forge(forge_id: PyObjectId,
                     name: str = None,
                     url: str = None,
                     settings: Settings = Depends(get_settings)):
    forge = await get_forge_by_id(forge_id, settings)
    # update_dict = {key: value for (key, value) in update_dict.dict().items()}
    update_dict = {}
    if name:
        update_dict["name"] = name
    if url:
        update_dict["url"] = url
    print(update_dict)
    # for attr in ['name', 'url']:
    #    if update_dict[attr] is not None:
    #        setattr(forge, attr, update_dict[attr])
    forge_collection = await settings.get_collection('forges')
    forge_collection.update_one({'_id': forge.id}, {'$set': update_dict})
    return None
