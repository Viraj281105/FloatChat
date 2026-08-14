import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import warnings

from app.core.config import settings
from app.api.endpoints import router as api_router, initialize_system

warnings.filterwarnings("ignore", category=FutureWarning)

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# --- App Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== FloatChat API Starting Up ===")
    initialize_system()
    yield
    logger.info("=== FloatChat API Shutting Down ===")

# --- FastAPI App ---
app = FastAPI(
    title="FloatChat API",
    version="2.0.0",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# Parse origins from settings config
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
