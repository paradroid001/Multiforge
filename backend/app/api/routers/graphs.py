from typing import List
import json

from fastapi import APIRouter, Depends, Request, HTTPException, Response, WebSocket
from starlette import status

from app.util_classes import PyObjectId
from app.dependencies import get_settings
from app.settings import Settings
from app.models.forgegraph import ForgeGraph

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


@router.post("/save/{name}/")
async def save_graphname(name: str, graph: ForgeGraph, settings=Depends(get_settings)) -> List[str]:
    # TODO what if the graph name already exists?
    await graph.save(settings)
    return [str(graph.id), graph.name]
