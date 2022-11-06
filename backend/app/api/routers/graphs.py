import os
from typing import List
import json

from fastapi import APIRouter, Depends, Request, HTTPException, Response, WebSocket, File, UploadFile
from fastapi.responses import StreamingResponse
from starlette import status

from app.util_classes import PyObjectId, node_run_graph
from app.dependencies import get_settings
from app.settings import Settings
from app.models.forgegraph import ForgeGraph
from app.models.asset import Asset

router = APIRouter(
    prefix="/api/graphs",
    tags=["graphs"],
)


@router.get("/all/")
async def list_graphs(settings=Depends(get_settings)) -> List[ForgeGraph]:
    graph_collection = await ForgeGraph.collection(settings)
    graphs_filter = {}
    return [ForgeGraph(**item) for item in graph_collection.find(graphs_filter)]


@router.get("/all/names/")
async def list_graphnames(settings=Depends(get_settings)) -> List[List[str]]:
    graph_collection = await ForgeGraph.collection(settings)
    graphs_filter = {}
    graphs = [ForgeGraph(**item)
              for item in graph_collection.find(graphs_filter)]
    print('returning graphs...')
    print(graphs)
    return [[str(graph.id), graph.name] for graph in graphs]


@router.get("/{graph_id}/")
async def get_graph_content_by_id(graph_id: PyObjectId, settings=Depends(get_settings)) -> str:
    forgegraph = await ForgeGraph.get_by_id(graph_id, settings)
    return forgegraph.content


@router.post("/{graph_id}/asset/")
async def create_asset(graph_id: PyObjectId,
                       file_data: UploadFile = File(...),
                       mime_type: str = "text/plain",
                       settings=Depends(get_settings)) -> int:
    '''save file data, return a filesize in bytes'''

    try:
        file_name = file_data.filename
        if file_name is None:
            file_name = "uploadedfile"
        asset = Asset(forge_graph_id=graph_id,
                      file_name=file_name,
                      mime_type=mime_type)
        local_file_path = asset.get_file_name()
        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
        with open(local_file_path, "wb+") as saved_file:
            content = await file_data.read()
            saved_file.write(content)
        asset.file_size = os.path.getsize(local_file_path)
        asset.save(settings)
    except OSError as error:
        # raise from to maintain 'cause' exception chain: PEP-3134
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error writing source file locally."
        ) from error
    return asset.file_size


@router.get("/{graph_id}/asset/")
async def get_asset(graph_id: PyObjectId, settings: Settings = Depends(get_settings)) -> StreamingResponse:

    def iterfile(filepath):
        with open(filepath, mode="rb") as file_data:
            yield from file_data

    asset = await Asset.get_by_graph_id(graph_id, settings)
    print(asset)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    elif not os.path.exists(asset.get_file_name()):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    else:
        return StreamingResponse(iterfile(asset.get_file_name()), media_type=asset.mime_type)


@router.get("/{graph_id}/asset/meta/")
async def get_asset_meta(graph_id: PyObjectId, settings: Settings = Depends(get_settings)):
    asset = await Asset.get_by_graph_id(graph_id, settings)
    print(asset)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    else:
        return {'name': asset.file_name, 'size': asset.file_size, 'type': asset.mime_type}


@ router.get("/by_name/{graph_name}/")
async def get_graph_content_by_name(graph_name: str, settings=Depends(get_settings)) -> str:
    graph = ForgeGraph.get_by_name(name, settings)
    if graph is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return graph


@ router.post("/save/{name}/")
async def save_graphname(name: str, graph: ForgeGraph, settings=Depends(get_settings)) -> List[str]:
    current_graph: ForgeGraph = await ForgeGraph.get_by_name(name, settings)
    if current_graph is None:
        current_graph = graph  # the incoming one
    else:
        current_graph.content = graph.content
    await current_graph.save(settings)

    return [str(current_graph.id), current_graph.name]


@ router.get("/run/{name}/")
async def run_graph_by_name(name: str, settings=Depends(get_settings)) -> StreamingResponse:

    return StreamingResponse(node_run_graph(name))
