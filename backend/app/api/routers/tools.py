from fastapi import APIRouter, Depends
from app.dependencies import get_settings
from app.settings import Settings
from app.models.forge import Forge, ForgePublic

router = APIRouter(
    prefix="/api/tools",
    tags=["tools"],
)


@router.get("/")
async def get_tools():
    print("get tools was called")
    tool1 = {"id": 1, "name": "My Fake Tool", "url": "http://whatever"}
    tool2 = {"id": 2, "name": "Crazy fake tools", "url": "http: // whatever"}
    tool3 = {"id": 3, "name": "Yep. I am fake", "url": "http://whatever"}

    return [tool1, tool2, tool3]
