import os
import pymongo
from typing import Any, Dict, Optional
from pydantic import BaseSettings

class DBCache():
    db_obj: Any = None
    db_client: pymongo.MongoClient = None
    db_collections= {}

    def __init__(self, settings: 'Settings'):
        if self.db_client is None:
            print('getting db client')
            self.db_client = pymongo.MongoClient(settings.mongodb_host, settings.mongodb_port)
        if self.db_obj is None:
            print('getting db obj')
            self.db_obj = self.db_client[settings.db_name]

class Settings(BaseSettings):
    mongodb_host: str = os.getenv('MONGODB_HOST', 'localhost')
    mongodb_port: int = os.getenv('MONGODB_PORT', 27017)
    db_name: str = os.getenv('MONGODB_NAME', 'multiforge')
    root_path: str = os.getenv('ROOT_PATH', '')
    temp_file_storage_path: str = os.getenv('TEMPORARY_FILE_STORAGE_PATH', '/tmp')
    cache: Optional[DBCache]


    def __init__(self):
        super(Settings, self).__init__()
        #Create the cache
        self.cache = DBCache(self)
    
    async def init_db(self, force:bool = False):
        dbnames = this.list_db()
        if not self.db_name in dbnames:
            forges = self.cache.db_obj['forges']
            forges.create_index('name')
        return "OK"

    async def list_db(self):
        dbnames = self.cache.db_client.list_database_names()
        return dbnames

    async def get_collection(self, name: str):
        if name not in self.cache.db_collections:
            #print('getting collection')
            self.cache.db_collections[name] = self.cache.db_obj[name]
        return self.cache.db_collections[name]