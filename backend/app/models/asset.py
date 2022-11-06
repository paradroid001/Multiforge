import os
from datetime import datetime

from bson.objectid import ObjectId
from pydantic import BaseModel, Field

from app.settings import Settings
from app.dependencies import get_settings
from app.util_classes import PyObjectId

app_settings = get_settings()


def get_asset_collection(settings):
    return settings.get_collection('assets')
    # settings.dbcache.db_client.get_database('assets')


class Asset(BaseModel):
    id: PyObjectId = Field(alias='_id', default_factory=PyObjectId)
    forge_graph_id: PyObjectId
    file_name: str
    mime_type: str
    file_size: int = 0
    last_updated: datetime = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str,
            datetime: datetime.isoformat
        }

    @classmethod
    async def get_by_graph_id(cls, graph_id: PyObjectId, settings: Settings) -> 'Asset':
        asset = None
        coll = get_asset_collection(settings)
        asset_dicts = coll.find({'forge_graph_id': graph_id})
        assets = [Asset(**asset_dict, by_alias=True)
                  for asset_dict in asset_dicts]
        if len(assets) > 0:
            asset = assets[-1]
        return asset

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.file_size = 0

    def prepare_save(self) -> dict:
        self.last_updated = datetime.now()
        return self.dict(by_alias=True)

    def save(self, settings: Settings):
        asset_collection = get_asset_collection(settings)
        asset_collection.update_one(
            {'_id': self.id}, {'$set': self.prepare_save()}, upsert=True)

    def get_file_path(self, settings: Settings = app_settings) -> str:
        return os.path.join(settings.temp_file_storage_path, str(self.forge_graph_id))

    def get_file_name(self, settings: Settings = app_settings) -> str:
        return os.path.join(self.get_file_path(), self.file_name)
