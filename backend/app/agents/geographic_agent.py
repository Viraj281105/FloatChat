# app/agents/geographic_agent.py (Enhanced Version)
import re
from typing import Dict, Any, List, Optional, Pattern

# Import the single expert instance
from geo_intelligence import expert
from app.agents.base import BaseAgent


class GeographicAgent(BaseAgent):
    """
    An intelligent agent that acts as an NLU (Natural Language Understanding) layer 
    for the GeoIntelligenceExpert.
    
    This agent:
    - Parses user intent from natural language queries
    - Extracts geographical entities (regions, topics, sub-topics)
    - Routes queries to appropriate expert methods
    - Provides intelligent fallbacks when entities are ambiguous
    
    The agent uses regex patterns built dynamically from the expert's knowledge base
    to ensure consistency and maintainability.
    """

    def __init__(self):
        """Initialize the GeographicAgent with NLU patterns and expert integration."""
        print("Initializing GeographicAgent...")
        
        self.expert = expert
        
        # Initialize NLU patterns based on expert's knowledge base
        self._build_nlu_patterns()
        
        print("GeographicAgent initialized successfully.")

    def _build_nlu_patterns(self) -> None:
        """Build comprehensive regex patterns from the expert's knowledge base."""
        # Build region pattern (e.g., "arabian sea", "bay of bengal")
        self.region_pattern = self._create_region_pattern()
        
        # Build topic pattern (e.g., "monsoon", "weather", "cyclones")
        self.topic_pattern = self._create_topic_pattern()
        
        # Build sub-topic pattern (e.g., "southwest", "pre-monsoon")
        self.sub_topic_pattern = self._create_sub_topic_pattern()

    def _create_region_pattern(self) -> Pattern[str]:
        """
        Create regex pattern for region detection from expert's known regions.
        
        Returns:
            Compiled regex pattern for matching region names
        """
        region_keys = self.expert.get_known_regions()
        # Convert underscores to spaces for natural language matching
        region_names = [re.escape(region.replace("_", " ")) for region in region_keys]
        return re.compile(r'\b(' + '|'.join(region_names) + r')\b', re.IGNORECASE)

    def _create_topic_pattern(self) -> Pattern[str]:
        """
        Create regex pattern for topic detection from expert's known topics and aliases.
        
        Returns:
            Compiled regex pattern for matching topic names and aliases
        """
        topic_keys = list(self.expert._topics.keys())
        escaped_topics = [re.escape(topic) for topic in topic_keys]
        return re.compile(r'\b(' + '|'.join(escaped_topics) + r')\b', re.IGNORECASE)

    def _create_sub_topic_pattern(self) -> Pattern[str]:
        """
        Create regex pattern for sub-topic detection.
        
        Note: This uses a simplified approach with common sub-topic keywords.
        A production system might extract these dynamically from the knowledge base.
        
        Returns:
            Compiled regex pattern for matching sub-topic keywords
        """
        self.sub_topic_keywords = [
            "southwest", "northeast", "pre-monsoon", "post-monsoon",
            "pre_monsoon", "post_monsoon"  # Handle both formats
        ]
        escaped_sub_topics = [re.escape(keyword) for keyword in self.sub_topic_keywords]
        return re.compile(r'\b(' + '|'.join(escaped_sub_topics) + r')\b', re.IGNORECASE)

    def _normalize_entity(self, entity: str) -> str:
        """
        Normalize extracted entity for consistent matching.
        
        Args:
            entity: Raw entity string extracted from user input
            
        Returns:
            Normalized entity string
        """
        return entity.lower().replace("-", "_").replace(" ", "_")

    def _parse_intent(self, task: str) -> Dict[str, Optional[str]]:
        """
        Parse the user's task to extract entities (region, topic, sub-topic).
        
        This method uses regex patterns to identify geographical entities
        in the user's natural language query.
        
        Args:
            task: User's natural language query
            
        Returns:
            Dictionary containing extracted entities:
            - region: Identified geographical region
            - topic: Identified topic or theme
            - sub_topic: Identified sub-topic or specific aspect
        """
        # Extract entities using regex patterns
        region_match = self.region_pattern.search(task)
        topic_match = self.topic_pattern.search(task)
        sub_topic_match = self.sub_topic_pattern.search(task)

        # Build intent dictionary with normalized entities
        intent = {
            "region": None,
            "topic": None,
            "sub_topic": None
        }

        if region_match:
            intent["region"] = self._normalize_entity(region_match.group(1))
        
        if topic_match:
            intent["topic"] = topic_match.group(1).lower()
        
        if sub_topic_match:
            intent["sub_topic"] = self._normalize_entity(sub_topic_match.group(1))

        return intent

    def _route_query(self, intent: Dict[str, Optional[str]]) -> str:
        """
        Route the query to appropriate expert method based on extracted intent.
        
        Args:
            intent: Dictionary containing extracted entities from user query
            
        Returns:
            Response string from the appropriate expert method
        """
        region = intent["region"]
        topic = intent["topic"]
        sub_topic = intent["sub_topic"]

        # Route based on available entities (most specific to least specific)
        if region and topic:
            # Most specific query: region + topic + optional sub-topic
            return self.expert.get_info(region, topic, sub_topic)
        
        elif region:
            # User mentioned a region but no clear topic - show available topics
            return self.expert.list_topics(region)
        
        elif topic:
            # User mentioned a topic but no region - provide general information
            return self.expert.answer_general_question(topic)
        
        else:
            # No clear entities found - provide general help
            return self._provide_general_help()

    def _provide_general_help(self) -> str:
        """
        Provide general help when no clear entities are identified.
        
        Returns:
            Helpful guidance message with available options
        """
        return (
            "I can provide information about various oceanographic regions and topics. "
            + self.expert.list_regions()
        )

    def execute(self, task: str, state: Dict[str, Any]) -> str:
        """
        Execute the geographic query task.
        
        This is the main entry point that:
        1. Parses the user's natural language input
        2. Extracts geographical entities
        3. Routes the query to the appropriate expert method
        4. Returns the formatted response
        
        Args:
            task: User's natural language query about geographical/oceanographic topics
            state: Dictionary containing execution state and configuration
            
        Returns:
            Formatted response string containing the requested information
        """
        print(f"🗺️ GeographicAgent received task: {task}")

        # Parse user intent to extract entities
        intent = self._parse_intent(task)
        
        # Route query based on extracted intent
        response = self._route_query(intent)
        
        return response