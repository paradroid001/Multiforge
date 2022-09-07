from enum import Enum
from typing import Optional, Union

from bson.objectid import ObjectId
from pydantic import BaseModel, Field

from app.util_classes import PyObjectId


async def get_forge_collection(settings):
    return await settings.get_collection('forges')


class Forge(BaseModel):
    id: PyObjectId = Field(alias='_id', default_factory=PyObjectId)
    name: str
    url: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

    @classmethod
    async def collection(cls, settings):
        return await settings.get_collection('forges')

    @classmethod
    async def get_by_id(cls, id, settings):
        forge = None
        coll = await Forge.collection(settings)
        forge_dict = coll.find_one({'_id': id})
        if forge_dict:
            forge = Forge(**forge_dict)
        return forge

    @classmethod
    def fields(cls):
        ret = Forge.schema().get('properties')
        ret.pop('_id')
        return ret

    def prepare_save(self):
        return self.dict(by_alias=True)

    async def save(self, settings):
        coll = await Forge.collection(settings)
        coll.replace_one({'_id': self.id}, self.prepare_save(), True)


class ForgePublic(Forge):
    id: Optional[str]

    def __init__(self, **pydict):
        if "_id" in pydict:
            pydict["id"] = str(pydict.pop("_id"))
        super(ForgePublic, self).__init__(**pydict)
