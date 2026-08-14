from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

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

@dataclass
class QueryIntent:
    """A structured representation of the user's query intent."""
    intent_type: str
    entities: Dict[str, Any]
    confidence: float
    parameters: List[str]

    # Optional fields for more complex queries
    aggregation: Optional[str] = None
    temporal_scope: Optional[str] = None
    spatial_scope: Optional[str] = None
    complexity_level: str = 'moderate'

    # Boolean flags for routing
    is_visualization_request: bool = False
    is_geospatial: bool = False
