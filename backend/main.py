import logging
import sys
import json
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
import warnings

warnings.filterwarnings("ignore", category=FutureWarning)

# --- Import Agents ---
try:
    from app.agents.orchestrator import OrchestratorAgent
    from app.agents.data_agent import DataAgent
    from app.agents.geographic_agent import GeographicAgent
    from app.agents.visualization_agent import VisualizationAgent
except ImportError as e:
    print(f"CRITICAL: Could not import agents: {e}. Running in disabled state.")
    DataAgent = GeographicAgent = VisualizationAgent = OrchestratorAgent = None

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# --- App State ---
class ApplicationState:
    def __init__(self):
        self.orchestrator: Optional[OrchestratorAgent] = None
        self.is_ready: bool = False
        self.initialization_error: Optional[str] = None

app_state = ApplicationState()

# --- Request Models ---
class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)
    session_id: str = Field(default="default_session", min_length=1, max_length=100)

class ChatResponse(BaseModel):
    success: bool
    response: Any
    source_agent: str

class VisualizationRequest(BaseModel):
    parameter: str
    date_range: str
    region: str

# --- App Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== FloatChat API Starting Up ===")
    try:
        if not all([DataAgent, GeographicAgent, VisualizationAgent, OrchestratorAgent]):
            raise ImportError("One or more agent classes could not be imported.")

        agents = {
            "data_agent": DataAgent(),
            "geographic_agent": GeographicAgent(),
            "visualization_agent": VisualizationAgent()
        }
        app_state.orchestrator = OrchestratorAgent(agents=agents)
        app_state.is_ready = True
        logger.info("=== All agents initialized successfully. API is Ready! ===")
    except Exception as e:
        logger.error(f"FATAL: Failed to initialize system: {e}", exc_info=True)
        app_state.initialization_error = str(e)
        app_state.is_ready = False
    yield
    logger.info("=== FloatChat API Shutting Down ===")

# --- FastAPI App ---
app = FastAPI(title="FloatChat API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health Check ---
@app.get("/health", tags=["System"])
async def health_check():
    if app_state.is_ready:
        return {"status": "healthy"}
    raise HTTPException(status_code=503, detail="Application is not ready")

# --- Visualization Endpoint ---
@app.post("/visualize", tags=["Visualization"])
async def visualize_endpoint(request: VisualizationRequest):
    if not app_state.is_ready or not app_state.orchestrator:
        raise HTTPException(status_code=503, detail=f"System not ready: {app_state.initialization_error}")
    try:
        viz_agent = app_state.orchestrator.agents.get("visualization_agent")
        task = f"Generate plot for {request.parameter} in {request.region} for {request.date_range}."
        state = request.model_dump()

        agent_response = viz_agent.execute(task=task, state=state)
        content = agent_response if isinstance(agent_response, dict) else json.loads(agent_response)
        return JSONResponse(content=content)
    except Exception as e:
        logger.error(f"Visualization request failed: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "error_details": str(e)})

# --- Chat Endpoint ---
@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    if not app_state.is_ready or not app_state.orchestrator:
        raise HTTPException(status_code=503, detail=f"System not ready: {app_state.initialization_error}")
    try:
        response = app_state.orchestrator.route_request(
            user_query=request.query,
            session_id=request.session_id
        )
        return ChatResponse(
            success=True,
            response=response.get("response", "No response"),
            source_agent=response.get("source_agent", "unknown")
        )
    except Exception as e:
        logger.error(f"Chat request failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- Main ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
