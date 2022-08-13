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
    return "tools"
