from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from app.dependencies import get_settings
from app.api.routers import tools, forges, db


settings = get_settings()

app = FastAPI(root_path=settings.root_path)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


app.include_router(forges.router)
app.include_router(tools.router)
app.include_router(db.router)
