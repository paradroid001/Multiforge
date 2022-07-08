from fastapi import APIRouter, Depends
from app.dependencies import get_settings
from app.settings import Settings
from app.models.forge import Forge, ForgePublic

router = APIRouter(
    prefix="/api/db",
    tags=["db"],
)


@router.get("/init/")
async def init_db(settings=Depends(get_settings)):
    result = await settings.init_db()
    return result


@router.get("/list/")
async def list_db(settings=Depends(get_settings)):
    result = await settings.list_db()
    return result
