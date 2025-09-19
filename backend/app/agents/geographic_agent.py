import re
from typing import Dict, Any, Optional, Pattern
from app.agents.base import BaseAgent
from geo_intelligence import expert


class GeographicAgent(BaseAgent):
    """
    NLU agent for geographic queries using the GeoIntelligenceExpert.
    Extracts regions, topics, and sub-topics from natural language queries
    and routes them to the expert for responses.
    """

    def __init__(self):
        print("Initializing GeographicAgent...")
        self.expert = expert
        self._build_nlu_patterns()
        print("GeographicAgent initialized successfully.")

    def _build_nlu_patterns(self) -> None:
        self.region_pattern = self._create_region_pattern()
        self.topic_pattern = self._create_topic_pattern()
        self.sub_topic_pattern = self._create_sub_topic_pattern()

    def _create_region_pattern(self) -> Pattern[str]:
        regions = [re.escape(r.replace("_", " ")) for r in self.expert.get_known_regions()]
        return re.compile(r'\b(' + '|'.join(regions) + r')\b', re.IGNORECASE)

    def _create_topic_pattern(self) -> Pattern[str]:
        topics = [re.escape(t) for t in self.expert._topics.keys()]
        return re.compile(r'\b(' + '|'.join(topics) + r')\b', re.IGNORECASE)

    def _create_sub_topic_pattern(self) -> Pattern[str]:
        keywords = ["southwest", "northeast", "pre-monsoon", "post-monsoon",
                    "pre_monsoon", "post_monsoon"]
        return re.compile(r'\b(' + '|'.join(re.escape(k) for k in keywords) + r')\b', re.IGNORECASE)

    def _normalize_entity(self, entity: str) -> str:
        return entity.lower().replace("-", "_").replace(" ", "_")

    def _parse_intent(self, task: str) -> Dict[str, Optional[str]]:
        intent = {"region": None, "topic": None, "sub_topic": None}
        region_match = self.region_pattern.search(task)
        topic_match = self.topic_pattern.search(task)
        sub_topic_match = self.sub_topic_pattern.search(task)

        if region_match:
            intent["region"] = self._normalize_entity(region_match.group(1))
        if topic_match:
            intent["topic"] = topic_match.group(1).lower()
        if sub_topic_match:
            intent["sub_topic"] = self._normalize_entity(sub_topic_match.group(1))

        return intent

    def _route_query(self, intent: Dict[str, Optional[str]]) -> str:
        region, topic, sub_topic = intent["region"], intent["topic"], intent["sub_topic"]
        if region and topic:
            return self.expert.get_info(region, topic, sub_topic)
        elif region:
            return self.expert.list_topics(region)
        elif topic:
            return self.expert.answer_general_question(topic)
        else:
            return self._provide_general_help()

    def _provide_general_help(self) -> str:
        return "I can provide information about ocean regions and topics: " + self.expert.list_regions()

    def execute(self, task: str, state: Dict[str, Any]) -> str:
        print(f"🗺️ GeographicAgent received task: {task}")
        intent = self._parse_intent(task)
        return self._route_query(intent)
