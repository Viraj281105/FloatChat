# main.py (Updated for Supabase)
import logging
import sys
import os
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, field_validator
import uvicorn

# Import Supabase client
try:
    from supabase_client import get_supabase_client, get_supabase_admin_client
    supabase = get_supabase_client()
    supabase_admin = get_supabase_admin_client()
except Exception as e:
    print(f"Warning: Could not initialize Supabase client: {e}")
    supabase = None
    supabase_admin = None

# Import all agent classes
try:
    from app.agents.orchestrator import OrchestratorAgent
    from app.agents.data_agent import DataAgent
    from app.agents.geographic_agent import GeographicAgent
    from app.agents.visualization_agent import VisualizationAgent
except ImportError as e:
    print(f"Warning: Could not import agents: {e}")
    print("Some features may not work. Continuing with basic setup...")

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Application State Management
class ApplicationState:
    """Centralized application state management."""
    
    def __init__(self):
        self.orchestrator: Optional[Any] = None
        self.startup_time: Optional[datetime] = None
        self.is_ready: bool = False
        self.initialization_error: Optional[str] = None
        self.request_count: int = 0
        self.error_count: int = 0
        self.supabase_connected: bool = False

# Global application state
app_state = ApplicationState()

# Pydantic Models
class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)
    session_id: str = Field(default="default_session", min_length=1, max_length=100)
    include_debug: bool = Field(default=False)
    
    @field_validator('query')
    @classmethod
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty')
        return v.strip()

class ChatResponse(BaseModel):
    success: bool
    response: Any
    source_agent: str
    session_id: str
    processing_time: float
    timestamp: str
    debug_info: Optional[Dict[str, Any]] = None
    error_details: Optional[str] = None

# Application Lifespan Management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    logger.info("=== FloatChat API Starting Up ===")
    app_state.startup_time = datetime.now()
    
    try:
        await initialize_system()
        logger.info("=== FloatChat API Ready ===")
    except Exception as e:
        logger.error(f"Failed to initialize system: {e}")
        app_state.initialization_error = str(e)
    
    yield
    
    logger.info("=== FloatChat API Shutting Down ===")

async def initialize_system():
    """Initialize all system components."""
    try:
        # Test Supabase connection
        if supabase:
            try:
                # Test connection by querying a system table
                result = supabase.table('profiles').select("count", count="exact").execute()
                app_state.supabase_connected = True
                logger.info("Supabase connection successful")
            except Exception as e:
                logger.warning(f"Supabase connection failed: {e}")
                app_state.supabase_connected = False
        
        logger.info("Initializing specialist agents...")
        
        specialist_agents = {}
        
        # Initialize agents with error handling
        try:
            specialist_agents["data_agent"] = DataAgent()
            logger.info("DataAgent initialized successfully")
        except Exception as e:
            logger.warning(f"DataAgent initialization failed: {e}")
            # Create mock agent
            class MockDataAgent:
                def execute(self, task: str, state: Dict[str, Any]) -> str:
                    return "Mock data response - DataAgent not available. Please check database configuration."
                def get_agent_info(self) -> Dict[str, Any]:
                    return {"name": "MockDataAgent", "status": "mock"}
            specialist_agents["data_agent"] = MockDataAgent()
        
        try:
            specialist_agents["geographic_agent"] = GeographicAgent()
            logger.info("GeographicAgent initialized successfully")
        except Exception as e:
            logger.warning(f"GeographicAgent initialization failed: {e}")
            class MockGeoAgent:
                def execute(self, task: str, state: Dict[str, Any]) -> str:
                    return "Mock geographic response - GeographicAgent not available"
                def get_agent_info(self) -> Dict[str, Any]:
                    return {"name": "MockGeoAgent", "status": "mock"}
            specialist_agents["geographic_agent"] = MockGeoAgent()
        
        try:
            specialist_agents["visualization_agent"] = VisualizationAgent()
            logger.info("VisualizationAgent initialized successfully")
        except Exception as e:
            logger.warning(f"VisualizationAgent initialization failed: {e}")
            class MockVizAgent:
                def execute(self, task: str, state: Dict[str, Any]) -> str:
                    return "Mock visualization response - VisualizationAgent not available"
                def get_agent_info(self) -> Dict[str, Any]:
                    return {"name": "MockVizAgent", "status": "mock"}
            specialist_agents["visualization_agent"] = MockVizAgent()
        
        # Initialize OrchestratorAgent
        try:
            app_state.orchestrator = OrchestratorAgent(agents=specialist_agents)
            logger.info("OrchestratorAgent initialized successfully")
        except Exception as e:
            logger.warning(f"OrchestratorAgent initialization failed: {e}")
            # Create simple mock orchestrator
            class MockOrchestrator:
                def __init__(self, agents):
                    self.agents = agents
                def route_request(self, user_query: str, session_id: str) -> Dict[str, Any]:
                    return {
                        "response": f"Hello! I received your query: '{user_query}'. The FloatChat system is running in demo mode. To enable full functionality, please ensure your Supabase database is properly configured with ARGO float data.",
                        "source_agent": "MockOrchestrator",
                        "session_id": session_id,
                        "processing_time": 0.1
                    }
                def get_system_stats(self) -> Dict[str, Any]:
                    return {"status": "mock", "agents": len(self.agents)}
                def health_check(self) -> Dict[str, Any]:
                    return {"status": "mock_healthy"}
            
            app_state.orchestrator = MockOrchestrator(specialist_agents)
        
        app_state.is_ready = True
        logger.info("All components initialized successfully")
        
    except Exception as e:
        logger.error(f"System initialization failed: {e}")
        app_state.is_ready = False
        app_state.initialization_error = str(e)

# FastAPI Application Setup
app = FastAPI(
    title="FloatChat API",
    description="AI-powered ocean data analysis API with Supabase backend",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    app_state.error_count += 1
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Request validation failed",
            "details": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    app_state.error_count += 1
    logger.error(f"Unexpected error: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An unexpected error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )

# Utility Functions
def get_system_uptime() -> float:
    if app_state.startup_time:
        return (datetime.now() - app_state.startup_time).total_seconds()
    return 0.0

# API Endpoints
@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "FloatChat API",
        "version": "2.0.0",
        "description": "Intelligent oceanographic data analysis API",
        "status": "ready" if app_state.is_ready else "initializing",
        "supabase_connected": app_state.supabase_connected,
        "uptime_seconds": get_system_uptime(),
        "endpoints": {
            "chat": "/chat",
            "health": "/health",
            "stats": "/stats",
            "docs": "/docs"
        }
    }

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest, background_tasks: BackgroundTasks):
    """Main chat endpoint for processing user queries."""
    start_time = datetime.now()
    
    if not app_state.is_ready:
        raise HTTPException(
            status_code=503,
            detail=f"System not ready. {app_state.initialization_error or 'Still initializing...'}"
        )
    
    try:
        logger.info(f"Processing chat request: session={request.session_id}")
        
        if app_state.orchestrator:
            orchestrator_response = app_state.orchestrator.route_request(
                user_query=request.query,
                session_id=request.session_id
            )
        else:
            orchestrator_response = {
                "response": f"Hello! I received: {request.query}. FloatChat is running with limited functionality. Please configure your Supabase database for full ocean data analysis capabilities.",
                "source_agent": "BasicHandler",
                "session_id": request.session_id
            }
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        response = ChatResponse(
            success=True,
            response=orchestrator_response.get("response", "No response"),
            source_agent=orchestrator_response.get("source_agent", "unknown"),
            session_id=orchestrator_response.get("session_id", request.session_id),
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )
        
        if request.include_debug:
            response.debug_info = orchestrator_response.get("debug_info", {
                "supabase_connected": app_state.supabase_connected
            })
        
        app_state.request_count += 1
        logger.info(f"Chat request completed successfully in {processing_time:.3f}s")
        return response
        
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"Chat request failed: {e}")
        
        app_state.error_count += 1
        
        return ChatResponse(
            success=False,
            response="I encountered an error processing your request. Please try again.",
            source_agent="ErrorHandler",
            session_id=request.session_id,
            processing_time=processing_time,
            timestamp=datetime.now().isoformat(),
            error_details=str(e) if os.getenv("DEBUG", "false").lower() == "true" else None
        )

@app.get("/health", tags=["System"])
async def health_check():
    """System health check endpoint."""
    try:
        agents_status = {}
        if app_state.orchestrator and hasattr(app_state.orchestrator, 'health_check'):
            health_data = app_state.orchestrator.health_check()
            agents_status = health_data.get("agents", {})
        else:
            agents_status = {"system": "basic_mode"}
        
        return {
            "status": "healthy" if app_state.is_ready else "unhealthy",
            "uptime_seconds": get_system_uptime(),
            "total_requests": app_state.request_count,
            "total_errors": app_state.error_count,
            "supabase_connected": app_state.supabase_connected,
            "agents_status": agents_status,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "uptime_seconds": get_system_uptime(),
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/stats", tags=["System"])
async def system_stats():
    """Detailed system statistics endpoint."""
    if not app_state.is_ready:
        raise HTTPException(
            status_code=503,
            detail="System not ready - statistics unavailable"
        )
    
    try:
        orchestrator_stats = {}
        if app_state.orchestrator and hasattr(app_state.orchestrator, 'get_system_stats'):
            orchestrator_stats = app_state.orchestrator.get_system_stats()
        
        return {
            "orchestrator_stats": orchestrator_stats,
            "uptime_seconds": get_system_uptime(),
            "request_count": app_state.request_count,
            "error_count": app_state.error_count,
            "supabase_connected": app_state.supabase_connected,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Stats collection failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to collect system statistics: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )