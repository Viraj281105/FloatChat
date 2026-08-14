import json
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.models.chat import ChatRequest, ChatResponse, VisualizationRequest
from app.services.orchestrator import OrchestratorAgent
from app.services.data_agent import DataAgent
from app.services.geographic_agent import GeographicAgent
from app.services.visualization_agent import VisualizationAgent

from app.services.jarvis_engine import jarvis_engine

logger = logging.getLogger(__name__)

router = APIRouter()

# App State wrapper
class SystemState:
    def __init__(self):
        self.orchestrator: Optional[OrchestratorAgent] = None
        self.is_ready: bool = False
        self.initialization_error: Optional[str] = None

system_state = SystemState()

def get_orchestrator() -> OrchestratorAgent:
    if not system_state.is_ready or not system_state.orchestrator:
        raise HTTPException(
            status_code=503,
            detail=f"System not ready: {system_state.initialization_error or 'Initializing'}"
        )
    return system_state.orchestrator

def initialize_system():
    logger.info("Initializing system agents...")
    try:
        data_agent = DataAgent()
        geographic_agent = GeographicAgent()
        visualization_agent = VisualizationAgent(data_agent)

        agents = {
            "data_agent": data_agent,
            "geographic_agent": geographic_agent,
            "visualization_agent": visualization_agent
        }

        system_state.orchestrator = OrchestratorAgent(agents=agents)
        system_state.is_ready = True
        logger.info("All agents initialized successfully. System is Ready!")
    except Exception as e:
        logger.error(f"Failed to initialize agents: {e}", exc_info=True)
        system_state.initialization_error = str(e)
        system_state.is_ready = False

@router.get("/health", tags=["System"])
async def health_check():
    if system_state.is_ready:
        diag = jarvis_engine.get_diagnostics()
        return {"status": "healthy", "diagnostic": diag}
    raise HTTPException(status_code=503, detail="Application is not ready")

@router.post("/visualize", tags=["Visualization"])
async def visualize_endpoint(request: VisualizationRequest, orchestrator: OrchestratorAgent = Depends(get_orchestrator)):
    try:
        viz_agent = orchestrator.agents.get("visualization_agent")
        task = f"Generate plot for {request.parameter} in {request.region} for {request.date_range}."
        state = request.model_dump()
        agent_response = viz_agent.execute(task=task, state=state)
        content = agent_response if isinstance(agent_response, dict) else json.loads(agent_response)
        return JSONResponse(content=content)
    except Exception as e:
        logger.error(f"Visualization request failed: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"success": False, "error_details": str(e)})

@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest, orchestrator: OrchestratorAgent = Depends(get_orchestrator)):
    try:
        # Check if the query is a simple diagnostic request
        lower_query = request.query.lower()
        if any(w in lower_query for w in ["status", "diagnostics", "health", "system"]):
            response_text = f"{jarvis_engine.get_diagnostics()}\n\n{jarvis_engine.get_greeting()}"
            return ChatResponse(
                success=True,
                response=response_text,
                source_agent="J.A.R.V.I.S. Diagnostics"
            )

        response = orchestrator.route_request(
            user_query=request.query,
            session_id=request.session_id
        )
        raw_res = response.get("response", "No response")
        source = response.get("source_agent", "unknown")
        
        # Style response with J.A.R.V.I.S. personality
        formatted_res = jarvis_engine.format_agent_response(raw_res, source)
        
        return ChatResponse(
            success=True,
            response=formatted_res,
            source_agent=source
        )
    except Exception as e:
        logger.error(f"Chat request failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
