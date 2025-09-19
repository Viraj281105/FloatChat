from typing import Dict, Any, List, Optional, Tuple
import logging
import re
from datetime import datetime, timedelta
from collections import defaultdict, deque

from app.agents.base import BaseAgent
import pandas as pd  # for type checks if needed

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
            'map', 'plot', 'visualize', 'chart', 'graph',
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
    """Manage sessions with history, timeout, and max capacity."""
    def __init__(self, max_sessions=1000, session_timeout_hours=24):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.access_times: Dict[str, datetime] = {}
        self.max_sessions = max_sessions
        self.timeout = timedelta(hours=session_timeout_hours)

    def get_or_create_session(self, session_id: str) -> Dict[str, Any]:
        self._cleanup_expired_sessions()
        self.access_times[session_id] = datetime.now()
        if session_id not in self.sessions:
            if len(self.sessions) >= self.max_sessions:
                self._cleanup_oldest_session()
            self.sessions[session_id] = {
                "session_id": session_id, "history": [], "context": {},
                "created_at": datetime.now(), "interaction_count": 0
            }
            logger.info(f"Created session: {session_id}")
        return self.sessions[session_id]

    def _cleanup_expired_sessions(self):
        now = datetime.now()
        expired = [sid for sid, t in self.access_times.items() if now - t > self.timeout]
        for sid in expired:
            self.sessions.pop(sid, None)
            self.access_times.pop(sid, None)
        if expired:
            logger.info(f"Cleaned {len(expired)} expired sessions")

    def _cleanup_oldest_session(self):
        if not self.access_times:
            return
        oldest = min(self.access_times, key=self.access_times.get)
        self.sessions.pop(oldest, None)
        self.access_times.pop(oldest, None)
        logger.info(f"Removed oldest session: {oldest}")

class IntentClassifier:
    """Classify user intent for routing."""
    def __init__(self):
        self.patterns = ROUTING_PATTERNS
        for cfg in self.patterns.values():
            cfg['compiled_patterns'] = [re.compile(p, re.I) for p in cfg.get('patterns', [])]

    def classify_intent(self, query: str) -> Tuple[str, float]:
        query_lower = query.lower()
        scores = defaultdict(float)
        for intent, cfg in self.patterns.items():
            keyword_score = sum(1 for k in cfg['keywords'] if k in query_lower) / len(cfg['keywords'])
            pattern_score = sum(1 for p in cfg['compiled_patterns'] if p.search(query))
            scores[intent] = 0.7 * keyword_score + 0.3 * pattern_score
        if not scores:
            return 'data', 0.0
        best = max(scores, key=scores.get)
        return best, scores[best]

class OrchestratorAgent:
    """Routes user queries to agents based on intent and context."""
    def __init__(self, agents: Dict[str, BaseAgent]):
        required = {'data_agent', 'geographic_agent', 'visualization_agent'}
        missing = required - set(agents.keys())
        if missing:
            raise ValueError(f"Missing agents: {missing}")
        self.agents = agents
        self.session_manager = SessionManager()
        self.intent_classifier = IntentClassifier()
        self.routing_stats = defaultdict(int)
        self.error_counts = defaultdict(int)
        self.processing_times = deque(maxlen=1000)

    def _analyze_context(self, session: Dict[str, Any], query: str) -> Dict[str, Any]:
        recent = [h.get('agent') for h in session.get('history', [])[-3:]]
        follow_up = any(word in query.lower() for word in ['also','additionally','then','next','continue'])
        return {'recent_agents': recent, 'is_follow_up': follow_up, 'last_agent': recent[-1] if recent else None}

    def _determine_workflow(self, intent: str, confidence: float, ctx: Dict[str, Any]) -> List[str]:
        if intent == 'geographic': return ['geographic_agent']
        if intent == 'visualization': return ['data_agent','visualization_agent']
        if intent == 'data' and confidence > 0.3: return ['data_agent']
        if ctx['is_follow_up'] and ctx['last_agent']: return [ctx['last_agent']]
        return ['data_agent']

    def _execute_workflow(self, workflow: List[str], query: str, session: Dict[str, Any]) -> Dict[str, Any]:
        result = None
        for i, agent_name in enumerate(workflow):
            agent = self.agents.get(agent_name)
            if not agent:
                return self._error_response(f"Agent {agent_name} not found", query, session['session_id'])
            try:
                state = session.copy()
                if 'visualization_agent' in workflow and agent_name == 'data_agent':
                    state['return_df'] = True
                res = agent.execute(query, state)
                if agent_name == 'data_agent' and 'visualization_agent' in workflow:
                    state['data_frame'] = res
                    result = "Data collected"
                else:
                    result = res
                self.routing_stats[agent_name] += 1
            except Exception as e:
                self.error_counts[agent_name] += 1
                return self._error_response(str(e), query, session['session_id'])
        return {'response': result, 'source_agent': workflow[-1], 'workflow_steps': len(workflow)}

    def _update_history(self, session: Dict[str, Any], query: str, response: Any, agent: str):
        session.setdefault("history", []).append({
            "query": query, "response": response, "agent": agent,
            "timestamp": datetime.now().isoformat(),
            "session_interaction": session.get('interaction_count',0)+1
        })
        session['interaction_count'] = session.get('interaction_count',0)+1
        if len(session['history'])>50:
            session['history'] = session['history'][-50:]

    def _error_response(self, msg: str, query: str, session_id: str) -> Dict[str, Any]:
        return {"response": f"Error: {msg}", "source_agent":"Orchestrator", "session_id":session_id, "original_query":query, "timestamp":datetime.now().isoformat()}

    def route_request(self, user_query: str, session_id: str) -> Dict[str, Any]:
        start = datetime.now()
        session = self.session_manager.get_or_create_session(session_id)
        ctx = self._analyze_context(session, user_query)
        intent, confidence = self.intent_classifier.classify_intent(user_query)
        workflow = self._determine_workflow(intent, confidence, ctx)
        result = self._execute_workflow(workflow, user_query, session)
        self._update_history(session, user_query, result.get('response'), result.get('source_agent'))
        self.processing_times.append((datetime.now()-start).total_seconds())
        return {**result, "session_id":session_id, "history":session["history"], "intent":intent, "confidence":confidence, "workflow":workflow, "context":ctx}

    def health_check(self) -> Dict[str, Any]:
        status = {"orchestrator":"healthy","agents":{},"session_manager":"healthy","timestamp":datetime.now().isoformat()}
        for name, agent in self.agents.items():
            try: status["agents"][name] = "healthy" if hasattr(agent,'get_agent_info') else "healthy (basic)"
            except Exception as e: status["agents"][name] = f"unhealthy: {e}"; status["orchestrator"]="degraded"
        return status
