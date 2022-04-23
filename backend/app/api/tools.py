from fastapi import APIRouter, Depends
from app.dependencies import get_settings
from app.settings import Settings
from app.models.forge import Forge

router = APIRouter()


@router.get("/forges/")
async def get_forges(settings=Depends(get_settings)):
    forges_collection = await settings.get_collection('forges')
    forges_filter = {}
    forges = [Forge(**item) for item in forges_collection.find(forges_filter)]
    return forges

@router.get("/forges/new/")
async def create_forge(name: str="Forge name", url: str="URL including port", settings=Depends(get_settings)):
    forges_collection = await settings.get_collection('forges')
    forge = Forge(name=name, url=url)
    forges_collection.insert_one(forge.save())


@router.get("/tools/")
async def get_tools():
    return "tools"

@router.get("/db/init/")
async def init_db(settings = Depends(get_settings)):
    result = await settings.init_db()
    return result

@router.get("/db/list")
async def list_db(settings = Depends(get_settings)):
    result = await settings.list_db()
    return result

