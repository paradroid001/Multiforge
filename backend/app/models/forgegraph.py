from enum import Enum
from typing import Optional, Union, List

from bson.objectid import ObjectId
from pydantic import BaseModel, Field

from app.settings import Settings
from app.util_classes import PyObjectId


async def get_forgegraph_collection(settings):
    return settings.get_collection('forgegraphs')


class ForgeGraph(BaseModel):
    id: PyObjectId = Field(alias='_id', default_factory=PyObjectId)
    name: str
    content: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str
        }

    @classmethod
    def fields(cls):
        ret = ForgeGraph.schema().get('properties')
        ret.pop('_id')
        return ret

    @classmethod
    async def get_by_id(cls, id: PyObjectId, settings: Settings):
        graph = None
        coll = await ForgeGraph.collection(settings)
        graph_dict = coll.find_one({'_id': id})
        if graph_dict:
            graph = ForgeGraph(**graph_dict)
        return graph

    @classmethod
    async def collection(cls, settings):
        return await get_forgegraph_collection(settings)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if '_id' in kwargs:
            self.id = kwargs['_id']

    def prepare_save(self):
        return self.dict(by_alias=True)

    async def save(self, settings):
        coll = await ForgeGraph.collection(settings)
        print(coll)
        coll.replace_one({'_id': self.id}, self.prepare_save(), True)
