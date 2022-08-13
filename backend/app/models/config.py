from pydantic import BaseModel, Field

class MultiforgeConfig(BaseModel):
    backend_url: str = "127.0.0.1:8080/api"