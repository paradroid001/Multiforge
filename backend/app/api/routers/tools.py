from fastapi import APIRouter, Depends
from app.dependencies import get_settings
from app.settings import Settings
from app.models.forge import Forge, ForgePublic

router = APIRouter(
    prefix="/api/tools",
    tags=["tools"],
)


@router.get("/")
async def get_tools(settings=Depends(get_settings)):
    #print("get tools was called")
    #tool1 = {"id": 1, "name": "My Fake Tool", "url": "http://whatever"}
    #tool2 = {"id": 2, "name": "Crazy fake tools", "url": "http: // whatever"}
    #tool3 = {"id": 3, "name": "Yep. I am fake", "url": "http://whatever"}

    forges_collection = await Forge.collection(settings)
    forges_filter = {}
    forges = [Forge(**item) for item in forges_collection.find(forges_filter)]
    # TODO: do I have to await this? Can't I run it sync?
    tools_response = [await forge.refresh_tools() for forge in forges]
    toolgroups = [toolgroup for toolgroup in tools_response]
    # print(toolgroups)
    tools = []
    for toolgroup in toolgroups:
        for tool in toolgroup:
            tools.append(tool)
    return tools
