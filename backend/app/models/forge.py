from enum import Enum
from typing import Optional, Union

from bson.objectid import ObjectId
from pydantic import BaseModel, Field

from app.util_classes import PyObjectId

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

    def save(self):
        return self.dict(by_alias=True)
    