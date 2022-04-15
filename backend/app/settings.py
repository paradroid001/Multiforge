import os

from pydantic import BaseSettings


class Settings(BaseSettings):
    mongodb_host: str = os.getenv('MONGODB_HOST', 'localhost')
    mongodb_port: int = os.getenv('MONGODB_PORT', 27017)
    db_name: str = os.getenv('MONGODB_NAME', 'bdr')
    root_path: str = os.getenv('ROOT_PATH', '')
    temp_file_storage_path: str = os.getenv('TEMPORARY_FILE_STORAGE_PATH', '/tmp')