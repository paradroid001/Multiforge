from fastapi import APIRouter, Depends
from app.dependencies import get_settings
from app.settings import Settings
from app.models.config import MultiforgeConfig

router = APIRouter(
    prefix="/api/config",
    tags=["config"],
)

@router.get("/")
async def get_config(settings: Settings) -> MultiforgeConfig:
    print("GET CONFIG")
    return settings.config