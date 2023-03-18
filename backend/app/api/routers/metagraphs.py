import os
from typing import List, Dict, Any, Optional
import json

from fastapi import APIRouter, Depends, Request, HTTPException, Response
from starlette import status

from app.util_classes import PyObjectId
from app.dependencies import get_settings
from app.settings import Settings
from app.models.metagraph import MetaGraphDataType, MetaGraphProject, MetaGraphEdge, MetaGraphNode, get_metagraph_collection

router = APIRouter(
    prefix="/api/metagraphs",
    tags=["metagraphs"],
)


async def get_project_by_id(project_id: PyObjectId, settings: Settings) -> MetaGraphProject:
    metagraph_collection = await get_metagraph_collection(settings)

    project_data = metagraph_collection.find_one(
        {"_id": project_id, "object_type": MetaGraphDataType.PROJECT})

    if not bool(project_data):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return MetaGraphProject(**project_data)


async def get_node_by_id(node_id: PyObjectId, settings: Settings) -> MetaGraphNode:
    metagraph_collection = await get_metagraph_collection(settings)

    node_data = metagraph_collection.find_one(
        {"_id": node_id, "object_type": MetaGraphDataType.NODE})

    if not bool(node_data):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return MetaGraphNode(**node_data)


async def get_edge_by_id(node_id: PyObjectId, settings: Settings) -> MetaGraphEdge:
    metagraph_collection = await get_metagraph_collection(settings)

    edge_data = metagraph_collection.find_one(
        {"_id": node_id, "object_type": MetaGraphDataType.EDGE})

    if not bool(edge_data):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return MetaGraphEdge(**edge_data)


@router.get("/projects/")
async def list_projects(settings=Depends(get_settings)) -> List[MetaGraphProject]:
    metagraph_collection = await get_metagraph_collection(settings)
    projects = metagraph_collection.find(
        {'object_type': MetaGraphDataType.PROJECT})
    return [MetaGraphProject(**data) for data in projects]

# returns [[name, id], [name, id], ... ]


@router.get("/projects/names/")
async def list_project_names(settings=Depends(get_settings)) -> List[List[str]]:
    projects = await list_projects(settings)
    return list([[project.name, str(project.id)] for project in projects])


@router.post("/project/create/")
async def create_metagraph_project(name: str,
                                   description: str,
                                   settings=Depends(get_settings)) -> str:
    metagraph_collection = await get_metagraph_collection(settings)
    new_project = MetaGraphProject(
        **{'name': name, 'description': description})
    result = metagraph_collection.insert_one(new_project.dict())
    return str(result.inserted_id)


@router.patch("/project/update/{project_id}/")
async def update_metagraph_project(project_id: PyObjectId,
                                   name: Optional[str] = None,
                                   description: Optional[str] = None,
                                   settings=Depends(get_settings)) -> MetaGraphProject:
    metagraph_collection = await get_metagraph_collection(settings)
    project = await get_project_by_id(project_id, settings)
    if name is not None:
        project.name = name
    if description is not None:
        project.description = description
    metagraph_collection.replace_one({"_id": project.id}, project.dict(),)
    return project


@router.delete("/project/delete/{project_id}/")
async def delete_metagraph_project(project_id: PyObjectId, settings=Depends(get_settings)):
    metagraph_collection = await get_metagraph_collection(settings)
    project = await get_project_by_id(project_id, settings)
    metagraph_collection.delete_one({"_id": project_id})


@router.get("/project/{project_id}/")
async def get_metagraph_data(project_id: PyObjectId,
                             settings=Depends(get_settings)):
    metagraph_collection = await get_metagraph_collection(settings)
    project = await get_project_by_id(project_id, settings)
    nodes = metagraph_collection.find(
        {'project_id': project_id, 'object_type': MetaGraphDataType.NODE})
    edges = metagraph_collection.find(
        {'project_id': project_id, 'object_type': MetaGraphDataType.EDGE})
    return {"nodes": [MetaGraphNode(**node) for node in nodes], "edges": [MetaGraphEdge(edge) for edge in edges]}


@router.post("/node/{project_id}/create/")
async def create_metagraph_node(project_id: PyObjectId,
                                name: str,
                                attributes: Dict[str, Any],
                                settings=Depends(get_settings)) -> str:
    metagraph_collection = await get_metagraph_collection(settings)

    new_node = MetaGraphNode(**{'name': name,
                                'attributes': attributes,
                                'object_type': MetaGraphDataType.NODE,
                                'project_id': project_id})
    result = metagraph_collection.insert_one(new_node.dict())
    return str(result.inserted_id)


@router.patch("/node/{project_id}/update/")
async def update_metagraph_node(node_id: PyObjectId,
                                name: Optional[str] = None,
                                attributes: Optional[Dict[str, Any]] = {},
                                remove: Optional[List[str]] = [],
                                settings=Depends(get_settings)) -> MetaGraphNode:
    metagraph_collection = await get_metagraph_collection(settings)
    node = await get_node_by_id(node_id, settings)
    if name:
        node.name = name
    for attribute in attributes:
        node.attributes[attribute] = attributes[attribute]
    for item in remove:
        node.attributes.pop(item)
    metagraph_collection.replace_one({"_id": node_id}, node.dict())
    return node


@router.delete("/node/{project_id}/delete/")
async def delete_metagraph_node(node_id: PyObjectId, settings=Depends(get_settings)):
    metagraph_collection = await get_metagraph_collection(settings)
    node = await get_node_by_id(node_id, settings)
    metagraph_collection.delete_one({"_id": node_id})


@router.post("/edge/{project_id}/create/")
async def create_metagraph_edge(project_id: PyObjectId,
                                name: str,
                                node_from: Optional[PyObjectId] = None,
                                node_to: Optional[PyObjectId] = None,
                                weightings: Optional[Dict[str, float]] = None,
                                settings=Depends(get_settings)) -> str:
    metagraph_collection = await get_metagraph_collection(settings)

    new_edge = MetaGraphEdge(**{'name': name,
                                'object_type': MetaGraphDataType.EDGE,
                                'project_id': project_id})
    if weightings:
        new_edge.weightings = weightings
    else:
        new_edge.weightings = {}

    if node_from:
        # TODO check node from exists
        new_edge.node_from = node_from
    if node_to:
        # TODO check node_to exists
        new_edge.node_to = node_to

    result = metagraph_collection.insert_one(new_edge.dict())
    return str(result.inserted_id)


@router.patch("/edge/{project_id}/update/")
async def update_metagraph_edge(edge_id: PyObjectId,
                                node_from: Optional[PyObjectId] = None,
                                node_to: Optional[PyObjectId] = None,
                                weightings: Optional[Dict[str, float]] = None,
                                remove: Optional[List[str]] = None,
                                settings=Depends(get_settings)) -> MetaGraphNode:
    metagraph_collection = await get_metagraph_collection(settings)
    edge = await get_edge_by_id(edge_id, settings)
    if name:
        edge.name = name
    if weightings:
        for weighting in weightings:
            edge.weightings[weighting] = weightings[weighting]
    if remove:
        for item in remove:
            node.weightings.pop(item)
    metagraph_collection.replace_one({"_id": edge_id}, edge.dict())
    return edge


@router.delete("/edge/{project_id}/delete/")
async def delete_metagraph_edge(edge_id: PyObjectId, settings=Depends(get_settings)):
    metagraph_collection = await get_metagraph_collection(settings)
    edge = await get_edge_by_id(node_id, settings)
    metagraph_collection.delete_one({"_id": edge_id})
