# app/agents/orchestrator.py (Enhanced Version)
from typing import Dict, Any, List, Optional, Tuple
import logging
import re
from datetime import datetime, timedelta
from collections import defaultdict, deque
import pandas as pd # Import pandas to correctly check for DataFrame type

from app.agents.base import BaseAgent

# Configure logging for the orchestrator
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enhanced keyword mapping for intelligent routing
ROUTING_PATTERNS = {
    'geographic': {
        'keywords': [
            'monsoon', 'features', 'currents', 'bathymetry', 'cyclonic', 'seasons', 
            'describe', 'what is', 'tell me about', 'information about', 'climate',
            'weather', 'geography', 'ecology', 'economic importance', 'major currents',
            'key features', 'cyclone season', 'storms', 'seabed', 'topography'
        ],
        'patterns': [
            r'\bwhat\s+is\b',
            r'\btell\s+me\s+about\b',
            r'\bdescribe\b',
            r'\binformation\s+about\b'
        ]
    },
    'visualization': {
        'keywords': [
            'map', 'plot', 'visualize', 'show me a map', 'chart', 'graph',
            'display', 'create a plot', 'make a chart', 'visual', 'geographic plot',
            'depth profile', 'scatter plot', 'line chart'
        ],
        'patterns': [
            r'\bshow\s+me\s+a?\s*(map|plot|chart|graph)\b',
            r'\bvisualize\b',
            r'\bcreate\s+a\s*(plot|chart|map|graph)\b',
            r'\bmake\s+a\s*(plot|chart|map|graph)\b'
        ]
    },
    'data': {
        'keywords': [
            'data', 'statistics', 'analysis', 'temperature', 'salinity', 'depth',
            'profiles', 'measurements', 'values', 'average', 'minimum', 'maximum',
            'trend', 'correlation', 'summary', 'query', 'search', 'find'
        ],
        'patterns': [
            r'\bfind\s+.*\bdata\b',
            r'\bshow\s+.*\b(statistics|stats|data)\b',
            r'\bget\s+.*\b(information|data)\b',
            r'\bwhat\s+(is|are)\s+the\s+(temperature|salinity|depth)\b'
        ]
    }
}

class SessionManager:
    """
    Manages user sessions with history, context tracking, and cleanup.
    """
    
    def __init__(self, max_sessions: int = 1000, session_timeout_hours: int = 24):
        """
        Initialize session manager.
        """
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.max_sessions = max_sessions
        self.session_timeout = timedelta(hours=session_timeout_hours)
        self.session_access_times: Dict[str, datetime] = {}
        
    def get_or_create_session(self, session_id: str) -> Dict[str, Any]:
        """
        Get existing session or create new one.
        """
        # Clean up old sessions periodically
        if len(self.sessions) % 50 == 0:  # Check every 50 accesses
            self._cleanup_expired_sessions()
            
        # Update access time
        self.session_access_times[session_id] = datetime.now()
        
        # Return existing session or create new one
        if session_id not in self.sessions:
            if len(self.sessions) >= self.max_sessions:
                self._cleanup_oldest_session()
                
            self.sessions[session_id] = {
                "session_id": session_id,
                "history": [],
                "context": {},
                "created_at": datetime.now(),
                "interaction_count": 0
            }
            logger.info(f"Created new session: {session_id}")
        
        return self.sessions[session_id]
    
    def _cleanup_expired_sessions(self) -> None:
        """Remove sessions that have exceeded the timeout period."""
        now = datetime.now()
        expired_sessions = [
            session_id for session_id, access_time in self.session_access_times.items()
            if now - access_time > self.session_timeout
        ]
        
        for session_id in expired_sessions:
            self.sessions.pop(session_id, None)
            self.session_access_times.pop(session_id, None)
            
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
    
    def _cleanup_oldest_session(self) -> None:
        """Remove the oldest session when max capacity is reached."""
        if not self.session_access_times:
            return
            
        oldest_session = min(self.session_access_times, key=self.session_access_times.get)
        self.sessions.pop(oldest_session, None)
        self.session_access_times.pop(oldest_session, None)
        logger.info(f"Removed oldest session due to capacity limit: {oldest_session}")


class IntentClassifier:
    """
    Intelligent intent classification for routing user queries to appropriate agents.
    """
    
    def __init__(self):
        """Initialize the intent classifier with routing patterns."""
        self.patterns = ROUTING_PATTERNS
        self._compile_regex_patterns()
    
    def _compile_regex_patterns(self) -> None:
        """Compile regex patterns for efficient matching."""
        for intent_type, config in self.patterns.items():
            config['compiled_patterns'] = [
                re.compile(pattern, re.IGNORECASE) 
                for pattern in config.get('patterns', [])
            ]
    
    def classify_intent(self, query: str) -> Tuple[str, float]:
        """
        Classify user intent based on query content.
        """
        query_lower = query.lower()
        scores = defaultdict(float)
        
        for intent_type, config in self.patterns.items():
            # Score based on keyword matches
            keyword_score = sum(
                1 for keyword in config['keywords'] 
                if keyword in query_lower
            ) / len(config['keywords'])
            
            # Score based on regex pattern matches
            pattern_score = sum(
                1 for pattern in config.get('compiled_patterns', [])
                if pattern.search(query)
            )
            
            # Combine scores with weights
            scores[intent_type] = (keyword_score * 0.7) + (pattern_score * 0.3)
        
        if not scores:
            return 'data', 0.0  # Default to data agent
            
        best_intent = max(scores, key=scores.get)
        confidence = scores[best_intent]
        
        return best_intent, confidence


class OrchestratorAgent:
    """
    Enhanced orchestrator agent that intelligently routes user queries to specialist agents.
    """

    def __init__(self, agents: Dict[str, BaseAgent]) -> None:
        """
        Initialize the OrchestratorAgent with specialist agents and supporting systems.
        """
        logger.info("Initializing OrchestratorAgent...")
        
        # Validate required agents
        required_agents = {'data_agent', 'geographic_agent', 'visualization_agent'}
        provided_agents = set(agents.keys())
        missing_agents = required_agents - provided_agents
        
        if missing_agents:
            raise ValueError(f"Missing required agents: {missing_agents}")
        
        self.agents = agents
        
        # Initialize supporting systems
        self.session_manager = SessionManager()
        self.intent_classifier = IntentClassifier()
        
        # Performance tracking
        self.routing_stats = defaultdict(int)
        self.error_counts = defaultdict(int)
        self.processing_times = deque(maxlen=1000)
        
        # Multi-step workflow tracking
        self.active_workflows: Dict[str, List[str]] = {}
        
        logger.info("OrchestratorAgent initialized successfully.")

    def _analyze_context(self, session_state: Dict[str, Any], query: str) -> Dict[str, Any]:
        """
        Analyze conversation context to improve routing decisions.
        """
        history = session_state.get('history', [])
        
        # Analyze recent interactions
        recent_agents = []
        if history:
            recent_agents = [entry.get('agent', '') for entry in history[-3:]]
        
        # Check for follow-up patterns
        follow_up_indicators = [
            'also', 'additionally', 'furthermore', 'and', 'then',
            'next', 'after that', 'following', 'continue'
        ]
        
        is_follow_up = any(indicator in query.lower() for indicator in follow_up_indicators)
        
        return {
            'recent_agents': recent_agents,
            'is_follow_up': is_follow_up,
            'session_length': len(history),
            'last_agent': recent_agents[-1] if recent_agents else None
        }

    def _determine_workflow(self, intent: str, confidence: float, context: Dict[str, Any]) -> List[str]:
        """
        Determine the workflow (sequence of agents) needed for the query.
        """
        # Single-agent workflows
        if intent == 'geographic':
            return ['geographic_agent']
        elif intent == 'data' and confidence > 0.3:
            return ['data_agent']
        elif intent == 'visualization':
            return ['data_agent', 'visualization_agent']
        
        # Context-aware routing for ambiguous cases
        if context['is_follow_up'] and context['last_agent']:
            # Continue with the same agent for follow-up questions
            return [context['last_agent']]
        
        # Default workflow
        return ['data_agent']

    def _execute_workflow(self, workflow: List[str], query: str, session_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a multi-step workflow.
        """
        execution_details = []
        current_state = session_state.copy()
        last_agent_result = None
        last_agent_name = None
        
        for i, agent_name in enumerate(workflow):
            agent = self.agents.get(agent_name)
            if not agent:
                error_msg = f"Agent '{agent_name}' not found in workflow step {i+1}"
                logger.error(error_msg)
                return self._create_error_response(error_msg, query, session_state['session_id'])
            
            try:
                # Configure state for multi-step workflows
                if len(workflow) > 1:
                    current_state['workflow_step'] = i + 1
                    current_state['total_steps'] = len(workflow)
                    
                    # For visualization workflows, ensure data agent returns DataFrame
                    if agent_name == 'data_agent' and 'visualization_agent' in workflow:
                        current_state['return_df'] = True
                
                logger.info(f"Executing step {i+1}/{len(workflow)}: {agent_name}")
                result = agent.execute(query, current_state)
                
                # Special handling for the output of the data agent
                if agent_name == 'data_agent' and 'visualization_agent' in workflow:
                    # Store DataFrame for the next agent (visualization)
                    current_state['data_frame'] = result
                    last_agent_result = "Data collected successfully." # Placeholder for logs
                else:
                    # Capture the final result from the last agent
                    last_agent_result = result
                
                last_agent_name = agent_name
                
                execution_details.append({
                    'agent': agent_name,
                    'result_summary': "Data collected" if agent_name == 'data_agent' else "Result generated",
                    'step': i + 1
                })
                
                self.routing_stats[agent_name] += 1
                
            except Exception as e:
                error_msg = f"Error in {agent_name} (step {i+1}): {str(e)}"
                logger.error(error_msg, exc_info=True)
                self.error_counts[agent_name] += 1
                
                return self._create_error_response(error_msg, query, session_state['session_id'])
        
        # Return the final result
        return {
            'response': last_agent_result,
            'source_agent': last_agent_name,
            'workflow_steps': len(workflow),
            'execution_details': execution_details
        }

    def _update_session_history(self, session_state: Dict[str, Any], query: str, response: Any, agent: str) -> None:
        """
        Update session history with comprehensive tracking.
        """
        entry = {
            "query": query,
            "response": response,
            "agent": agent,
            "timestamp": datetime.now().isoformat(),
            "session_interaction": session_state.get('interaction_count', 0) + 1
        }
        
        session_state.setdefault("history", []).append(entry)
        session_state['interaction_count'] = session_state.get('interaction_count', 0) + 1
        
        # Keep history manageable (last 50 interactions)
        if len(session_state["history"]) > 50:
            session_state["history"] = session_state["history"][-50:]

    def _create_error_response(self, error_msg: str, query: str, session_id: str) -> Dict[str, Any]:
        """
        Create a standardized error response.
        """
        return {
            "response": f"I encountered an error processing your request: {error_msg}",
            "source_agent": "OrchestratorAgent",
            "session_id": session_id,
            "error": error_msg,
            "original_query": query,
            "timestamp": datetime.now().isoformat()
        }

    def get_system_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive system statistics.
        """
        total_requests = sum(self.routing_stats.values())
        total_errors = sum(self.error_counts.values())
        
        return {
            "total_requests": total_requests,
            "total_errors": total_errors,
            "error_rate": total_errors / total_requests if total_requests > 0 else 0,
            "routing_distribution": dict(self.routing_stats),
            "error_distribution": dict(self.error_counts),
            "active_sessions": len(self.session_manager.sessions),
            "average_processing_time": (
                sum(self.processing_times) / len(self.processing_times)
                if self.processing_times else 0
            ),
            "agent_info": {
                name: agent.get_agent_info() if hasattr(agent, 'get_agent_info') else str(agent)
                for name, agent in self.agents.items()
            }
        }

    def route_request(self, user_query: str, session_id: str) -> Dict[str, Any]:
        """
        Process and route a user request with comprehensive orchestration.
        """
        start_time = datetime.now()
        
        try:
            # Get or create session
            session_state = self.session_manager.get_or_create_session(session_id)
            
            # Analyze query context
            context = self._analyze_context(session_state, user_query)
            
            # Classify intent
            intent, confidence = self.intent_classifier.classify_intent(user_query)
            
            logger.info(
                f"Processing query for session {session_id}: intent='{intent}' "
                f"confidence={confidence:.2f} context={context}"
            )
            
            # Determine workflow
            workflow = self._determine_workflow(intent, confidence, context)
            
            # Execute workflow
            result = self._execute_workflow(workflow, user_query, session_state)
            
            # Update session history
            self._update_session_history(
                session_state,
                user_query,
                result.get('response'),
                result.get('source_agent')
            )
            
            # Track performance
            processing_time = (datetime.now() - start_time).total_seconds()
            self.processing_times.append(processing_time)
            
            # Build comprehensive response
            response = {
                "response": result.get('response'),
                "source_agent": result.get('source_agent'),
                "session_id": session_id,
                "history": session_state["history"],
                "intent": intent,
                "confidence": confidence,
                "workflow": workflow,
                "processing_time": processing_time,
                "context": context
            }
            
            # Add execution details for multi-step workflows
            if result.get('execution_details'):
                response['execution_details'] = result['execution_details']
            
            return response
            
        except Exception as e:
            # Handle unexpected errors
            logger.error(f"Unexpected error in orchestrator: {e}", exc_info=True)
            self.error_counts['orchestrator'] += 1
            
            return self._create_error_response(
                f"Unexpected system error: {str(e)}",
                user_query,
                session_id
            )

    def health_check(self) -> Dict[str, Any]:
        """
        Perform a system health check.
        """
        health_status = {
            "orchestrator": "healthy",
            "agents": {},
            "session_manager": "healthy",
            "timestamp": datetime.now().isoformat()
        }
        
        # Check each agent
        for name, agent in self.agents.items():
            try:
                # Try to get agent info as a basic health check
                if hasattr(agent, 'get_agent_info'):
                    agent_info = agent.get_agent_info()
                    health_status["agents"][name] = "healthy"
                else:
                    health_status["agents"][name] = "healthy (basic)"
            except Exception as e:
                health_status["agents"][name] = f"unhealthy: {str(e)}"
                health_status["orchestrator"] = "degraded"
        
        return health_status