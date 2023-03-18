from bson.objectid import ObjectId
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.settings import Settings
from app.util_classes import PyObjectId


async def get_metagraph_collection(settings):
    return settings.get_collection('metagraphs')


class MetaGraphDataType(int, Enum):
    PROJECT = 1,
    NODE = 2,
    EDGE = 3


class MetaGraphProject(BaseModel):
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str
        }
    id: PyObjectId = Field(alias='_id', default_factory=PyObjectId)
    object_type: MetaGraphDataType = MetaGraphDataType.PROJECT
    name: str
    description: str


class MetaGraphNode(BaseModel):
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str
        }
    id: PyObjectId = Field(alias='_id', default_factory=PyObjectId)
    project_id: Optional[PyObjectId]
    object_type: MetaGraphDataType = MetaGraphDataType.NODE
    name: str
    attributes: Dict[str, Any]  # is it really any?


class MetaGraphEdge(BaseModel):
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str
        }
    id: PyObjectId = Field(alias='_id', default_factory=PyObjectId)
    project_id: Optional[PyObjectId]
    object_type: MetaGraphDataType = MetaGraphDataType.EDGE
    name: str
    node_from: Optional[PyObjectId]
    node_to: Optional[PyObjectId]
    weightings: Dict[str, float]  # values should really be "transformations
