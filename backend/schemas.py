from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional

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