import os
import pymongo
import json
from typing import Any, Dict, Optional
from pydantic import BaseSettings, Field, BaseModel
from app.models.config import MultiforgeConfig


class DBCache(BaseModel):

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

    db_obj: Any = None
    db_client: pymongo.MongoClient = None
    db_collections = {}

    def __init__(self, settings: 'Settings'):
        super().__init__(settings=settings)
        if self.db_client is None:
            print('getting db client')
            self.db_client = pymongo.MongoClient(
                settings.mongodb_host, settings.mongodb_port)
        if self.db_obj is None:
            print('getting db obj')
            self.db_obj = self.db_client[settings.db_name]


class Settings(BaseSettings):
    mongodb_host: str = os.getenv('MONGODB_HOST', 'localhost')
    mongodb_port: int = os.getenv('MONGODB_PORT', 27017)
    db_name: str = os.getenv('MONGODB_NAME', 'multiforge')
    root_path: str = os.getenv('ROOT_PATH', '')
    config_file: str = os.getenv('CONFIG_FILE', 'default_config.json')
    temp_file_storage_path: str = os.getenv(
        'TEMPORARY_FILE_STORAGE_PATH', '/tmp')
    dbcache: Optional[DBCache] = Field(exclude=True)
    config: Optional[MultiforgeConfig]

    def __init__(self):
        super(Settings, self).__init__()
        self.config = self.read_config_file(
            os.path.join(self.root_path, self.config_file))
        # Create the cache
        self.dbcache = DBCache(self)

    def read_config_file(self, config_pathname):

        if os.path.exists(config_pathname):
            print("The config file existed")
            with open(config_pathname) as f:
                data = json.load(f)
                config = MultiforgeConfig(**data)
                return config

        # Return default config
        return MultiforgeConfig()

    async def init_db(self, force: bool = False):
        dbnames = this.list_db()
        if not self.db_name in dbnames:
            forges = self.dbcache.db_obj['forges']
            forges.create_index('name')
        return "OK"

    async def list_db(self):
        dbnames = self.dbcache.db_client.list_database_names()
        return dbnames

    def get_collection(self, name: str):
        if name not in self.dbcache.db_collections:
            #print('getting collection')
            self.dbcache.db_collections[name] = self.dbcache.db_obj[name]
        return self.dbcache.db_collections[name]
