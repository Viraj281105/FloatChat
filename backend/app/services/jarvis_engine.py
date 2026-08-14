import datetime
import random
from typing import Dict, Any, List

class JarvisEngine:
    """
    Futuristic dialog and personality system for J.A.R.V.I.S.
    """

    def __init__(self):
        self.diagnostic_phrases = [
            "All sub-systems are operating within nominal parameters.",
            "ARGO float network array is fully responsive. 3,421 nodes online.",
            "Main database clusters are synchronized. Latency at 14 milliseconds.",
            "Thermal profiles and salinity metrics successfully parsed."
        ]

    def get_greeting(self, user_name: str = "Sir") -> str:
        hour = datetime.datetime.now().hour
        if hour < 12:
            period = "morning"
        elif hour < 17:
            period = "afternoon"
        else:
            period = "evening"
        
        greetings = [
            f"Good {period}, {user_name}. J.A.R.V.I.S. online. How may I assist your oceanographic research today?",
            f"Diagnostics complete. Systems green. Ready for your instructions, {user_name}.",
            f"Systems online, {user_name}. Connection to global ocean data network secured."
        ]
        return random.choice(greetings)

    def get_diagnostics(self) -> str:
        phrase = random.choice(self.diagnostic_phrases)
        return f"[J.A.R.V.I.S. SYSTEM DIAGNOSTIC] {phrase}"

    def format_agent_response(self, response: str, source_agent: str) -> str:
        """Add J.A.R.V.I.S. personality styling to agent outputs."""
        if "Error" in response:
            return f"Apologies, Sir. I encountered an anomaly while processing. Details: {response}"
        
        agent_names = {
            "data_agent": "Data Extraction Core",
            "geographic_agent": "Geospatial Analyst Subroutine",
            "visualization_agent": "Holographic Projection Unit"
        }
        friendly_agent = agent_names.get(source_agent, source_agent)
        
        personality_prefixes = [
            f"According to the {friendly_agent}:",
            f"Retrieval complete, Sir. Here are the findings from the {friendly_agent}:",
            f"Displaying analysis computed by the {friendly_agent}:"
        ]
        prefix = random.choice(personality_prefixes)
        return f"{prefix}\n\n{response}"

jarvis_engine = JarvisEngine()
