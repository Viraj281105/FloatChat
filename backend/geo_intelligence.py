# geo_intelligence.py
from typing import Dict, List, Optional, Any
import json


class GeoIntelligenceExpert:
    """
    A comprehensive geographic intelligence system for oceanographic regions and topics.
    
    This expert system provides detailed knowledge about:
    - Major ocean basins and their characteristics
    - Regional oceanographic phenomena
    - Marine geography and bathymetry
    - Climate patterns and seasonal variations
    - Economic and ecological importance of marine regions
    """

    def __init__(self):
        """Initialize the expert system with comprehensive knowledge base."""
        self._initialize_knowledge_base()
        print("GeoIntelligenceExpert initialized with comprehensive knowledge base.")

    def _initialize_knowledge_base(self) -> None:
        """Initialize the comprehensive knowledge base."""
        
        # Define major oceanographic regions and their detailed information
        self._regions = {
            "arabian_sea": {
                "name": "Arabian Sea",
                "description": "A region of the northern Indian Ocean bounded by Pakistan, Iran, India, and the Arabian Peninsula.",
                "key_features": [
                    "Strong monsoon influence with seasonal reversals",
                    "Upwelling zones along the Arabian Peninsula",
                    "Important shipping routes connecting Europe, Asia, and East Africa",
                    "Rich fisheries supporting millions of people"
                ],
                "bathymetry": "Maximum depth of 4,652m in the Arabian Basin",
                "major_currents": [
                    "Somali Current (seasonal)",
                    "Arabian Sea Current",
                    "East India Coastal Current"
                ],
                "economic_importance": "Major fishing grounds, oil transportation routes, pearl diving industry",
                "coordinates": {"lat_range": [8, 27], "lon_range": [50, 78]}
            },
            
            "bay_of_bengal": {
                "name": "Bay of Bengal",
                "description": "The largest bay in the world, located in the northeastern part of the Indian Ocean.",
                "key_features": [
                    "Massive freshwater input from Ganges-Brahmaputra river system",
                    "Strong stratification due to river discharge",
                    "Cyclone formation area during pre and post-monsoon seasons",
                    "Complex circulation patterns influenced by monsoons"
                ],
                "bathymetry": "Maximum depth of 4,694m; extensive continental shelf",
                "major_currents": [
                    "East India Coastal Current",
                    "Bay of Bengal Current",
                    "Southwest Monsoon Current"
                ],
                "economic_importance": "Dense fishing activity, major ports (Chennai, Kolkata, Chittagong)",
                "coordinates": {"lat_range": [5, 22], "lon_range": [77, 97]}
            },
            
            "north_atlantic": {
                "name": "North Atlantic Ocean",
                "description": "The northern portion of the Atlantic Ocean, extending from the equator to the Arctic.",
                "key_features": [
                    "Gulf Stream system providing heat transport to Europe",
                    "Major deep water formation regions",
                    "Rich fishing grounds including Grand Banks",
                    "Historic shipping routes between Europe and Americas"
                ],
                "bathymetry": "Mid-Atlantic Ridge system, deepest point ~8,500m",
                "major_currents": [
                    "Gulf Stream",
                    "North Atlantic Current",
                    "Labrador Current",
                    "Canary Current"
                ],
                "economic_importance": "Transatlantic shipping, fishing, offshore oil/gas",
                "coordinates": {"lat_range": [0, 80], "lon_range": [-80, 20]}
            },
            
            "pacific_ocean": {
                "name": "Pacific Ocean",
                "description": "The largest and deepest ocean basin, covering about one-third of Earth's surface.",
                "key_features": [
                    "Ring of Fire with high seismic activity",
                    "El Niño/La Niña phenomena affecting global climate",
                    "Deepest point on Earth (Mariana Trench)",
                    "Complex current systems and gyres"
                ],
                "bathymetry": "Average depth 4,280m, Mariana Trench reaches 11,034m",
                "major_currents": [
                    "Kuroshio Current",
                    "California Current",
                    "Peru Current",
                    "Equatorial Counter Current"
                ],
                "economic_importance": "Major fisheries, transpacific trade routes, tourism",
                "coordinates": {"lat_range": [-60, 65], "lon_range": [120, -70]}
            },
            
            "indian_ocean": {
                "name": "Indian Ocean",
                "description": "The third largest ocean, bounded by Africa, Asia, and Australia.",
                "key_features": [
                    "Unique monsoon circulation system",
                    "Warm pool region affecting global climate",
                    "Important chokepoints (Strait of Hormuz, Suez Canal)",
                    "Diverse marine ecosystems and coral reefs"
                ],
                "bathymetry": "Average depth 3,741m, Java Trench reaches 7,725m",
                "major_currents": [
                    "Agulhas Current",
                    "Somali Current",
                    "South Equatorial Current",
                    "West Australia Current"
                ],
                "economic_importance": "Oil transport routes, fishing, mineral extraction",
                "coordinates": {"lat_range": [-60, 30], "lon_range": [20, 147]}
            }
        }

        # Define topics and their detailed information
        self._topics = {
            "monsoon": {
                "description": "Seasonal wind patterns that dramatically affect regional climate and oceanography",
                "subtopics": {
                    "southwest": "Summer monsoon bringing heavy rains to South Asia (June-September)",
                    "northeast": "Winter monsoon with dry conditions and offshore winds (December-March)",
                    "pre_monsoon": "Transition period with increasing temperatures and isolated storms",
                    "post_monsoon": "Retreat phase with decreasing rainfall and changing wind patterns"
                },
                "oceanographic_effects": [
                    "Dramatic changes in current directions",
                    "Upwelling and downwelling patterns",
                    "Sea surface temperature variations",
                    "Salinity changes due to precipitation and river runoff"
                ]
            },
            
            "currents": {
                "description": "Ocean current systems that transport heat, nutrients, and marine life",
                "subtopics": {
                    "surface": "Wind-driven currents in the upper ocean layers",
                    "deep": "Thermohaline circulation driven by density differences",
                    "coastal": "Nearshore currents influenced by topography and winds",
                    "seasonal": "Currents that reverse or change strength with seasons"
                },
                "importance": [
                    "Heat transport affecting regional and global climate",
                    "Nutrient distribution supporting marine ecosystems",
                    "Navigation and shipping route planning",
                    "Pollutant and debris transport pathways"
                ]
            },
            
            "bathymetry": {
                "description": "The study of underwater topography and ocean floor features",
                "subtopics": {
                    "continental_shelf": "Shallow underwater landmass extending from coastlines",
                    "abyssal_plains": "Deep, flat regions of the ocean floor",
                    "mid_ocean_ridges": "Underwater mountain ranges where new ocean floor forms",
                    "trenches": "Deepest parts of the ocean formed by tectonic activity"
                },
                "significance": [
                    "Controls current patterns and mixing",
                    "Influences marine habitat distribution",
                    "Affects tsunami propagation",
                    "Important for navigation and resource exploration"
                ]
            },
            
            "climate": {
                "description": "Long-term weather patterns and their interaction with ocean systems",
                "subtopics": {
                    "el_nino": "Warm phase of Pacific climate oscillation",
                    "la_nina": "Cool phase of Pacific climate oscillation",
                    "iod": "Indian Ocean Dipole affecting regional weather patterns",
                    "global_warming": "Long-term increase in global temperatures affecting oceans"
                },
                "ocean_interactions": [
                    "Sea surface temperature changes",
                    "Ocean-atmosphere heat exchange",
                    "Changes in precipitation and evaporation",
                    "Sea level variations and thermal expansion"
                ]
            }
        }

    def get_known_regions(self) -> List[str]:
        """
        Get list of all known regions in the knowledge base.
        
        Returns:
            List of region identifiers
        """
        return list(self._regions.keys())

    def get_known_topics(self) -> List[str]:
        """
        Get list of all known topics in the knowledge base.
        
        Returns:
            List of topic identifiers
        """
        return list(self._topics.keys())

    def get_info(self, region: str, topic: Optional[str] = None, sub_topic: Optional[str] = None) -> str:
        """
        Get detailed information about a region and optionally a specific topic.
        
        Args:
            region: Region identifier (e.g., 'arabian_sea')
            topic: Optional topic identifier (e.g., 'monsoon')
            sub_topic: Optional sub-topic identifier (e.g., 'southwest')
            
        Returns:
            Formatted information string
        """
        if region not in self._regions:
            return f"I don't have information about the region '{region}'. Available regions: {', '.join(self.get_known_regions())}"
        
        region_data = self._regions[region]
        
        if not topic:
            # Return comprehensive region information
            info = [
                f"**{region_data['name']}**",
                f"\n{region_data['description']}\n",
                "**Key Features:**"
            ]
            
            for feature in region_data['key_features']:
                info.append(f"• {feature}")
            
            info.extend([
                f"\n**Bathymetry:** {region_data['bathymetry']}",
                f"\n**Major Currents:** {', '.join(region_data['major_currents'])}",
                f"\n**Economic Importance:** {region_data['economic_importance']}"
            ])
            
            return "\n".join(info)
        
        # Handle topic-specific information for the region
        if topic not in self._topics:
            return f"I don't have specific information about '{topic}' for {region_data['name']}. Available topics: {', '.join(self.get_known_topics())}"
        
        topic_data = self._topics[topic]
        response = [
            f"**{topic.title()} in {region_data['name']}**",
            f"\n{topic_data['description']}\n"
        ]
        
        # Add sub-topic information if requested
        if sub_topic and 'subtopics' in topic_data:
            if sub_topic in topic_data['subtopics']:
                response.append(f"**{sub_topic.replace('_', ' ').title()}:** {topic_data['subtopics'][sub_topic]}")
            else:
                response.append(f"Available subtopics for {topic}: {', '.join(topic_data['subtopics'].keys())}")
        elif 'subtopics' in topic_data:
            response.append("**Subtopics:**")
            for subtopic, description in topic_data['subtopics'].items():
                response.append(f"• **{subtopic.replace('_', ' ').title()}:** {description}")
        
        # Add region-specific context
        if topic == "monsoon" and region in ["arabian_sea", "bay_of_bengal"]:
            response.append(f"\nIn the {region_data['name']}, monsoons significantly influence:")
            response.append("• Current patterns and directions")
            response.append("• Sea surface temperatures")
            response.append("• Fishing seasons and marine productivity")
            response.append("• Coastal weather and precipitation")
        
        return "\n".join(response)

    def list_regions(self) -> str:
        """
        List all available regions with brief descriptions.
        
        Returns:
            Formatted list of regions
        """
        regions_list = ["**Available Ocean Regions:**\n"]
        
        for region_id, region_data in self._regions.items():
            regions_list.append(f"• **{region_data['name']}** - {region_data['description']}")
        
        return "\n".join(regions_list)

    def get_region_stats(self) -> Dict[str, Any]:
        """
        Get statistical information about the knowledge base.
        
        Returns:
            Dictionary containing knowledge base statistics
        """
        return {
            "total_regions": len(self._regions),
            "total_topics": len(self._topics),
            "regions": list(self._regions.keys()),
            "topics": list(self._topics.keys())
        }


# Create a single global instance to be imported by other modules
expert = GeoIntelligenceExpert()

class GeoIntelligenceExpert:
    # ... (existing methods above)

    def list_topics(self, region: Optional[str] = None) -> str:
        """
        List available topics, optionally for a specific region.
        
        Args:
            region: Optional region to get specific topic information
            
        Returns:
            Formatted list of topics
        """
        if region and region in self._regions:
            response = [f"**Available topics for {self._regions[region]['name']}:**\n"]
        else:
            response = ["**Available Topics:**\n"]
        
        for topic_id, topic_data in self._topics.items():
            response.append(f"• **{topic_id.title()}** - {topic_data['description']}")
        
        response.append("\nYou can combine any topic with a region for specific information!")
        return "\n".join(response)

    def answer_general_question(self, topic: str) -> str:
        """
        Answer general questions about oceanographic topics.
        
        Args:
            topic: Topic identifier
            
        Returns:
            General information about the topic
        """
        if topic not in self._topics:
            return f"I don't have information about '{topic}'. Available topics: {', '.join(self.get_known_topics())}"
        
        topic_data = self._topics[topic]
        response = [
            f"**{topic.title()} - General Information**",
            f"\n{topic_data['description']}\n"
        ]
        
        if 'subtopics' in topic_data:
            response.append("**Key Aspects:**")
            for subtopic, description in topic_data['subtopics'].items():
                response.append(f"• **{subtopic.replace('_', ' ').title()}:** {description}")
        
        # Add additional context based on topic
        if topic == "monsoon":
            response.extend([
                "\n**Global Impact:**",
                "• Affects approximately 3 billion people worldwide",
                "• Critical for agriculture and water resources",
                "• Influences global weather patterns",
                "• Drives seasonal ocean circulation changes"
            ])
        elif topic == "currents":
            response.extend([
                "\n**Global Significance:**",
                "• Transport heat equivalent to 100 times global energy consumption",
                "• Critical for marine ecosystems and food webs",
                "• Influence global climate and weather patterns",
                "• Affect navigation, fishing, and marine transportation"
            ])
        
        return "\n".join(response)

    def search_by_coordinates(self, latitude: float, longitude: float) -> Optional[str]:
        """
        Find which region contains the given coordinates.
        
        Args:
            latitude: Latitude in decimal degrees
            longitude: Longitude in decimal degrees
            
        Returns:
            Region identifier if found, None otherwise
        """
        for region_id, region_data in self._regions.items():
            if 'coordinates' in region_data:
                coords = region_data['coordinates']
                lat_range = coords['lat_range']
                lon_range = coords['lon_range']
                if (lat_range[0] <= latitude <= lat_range[1] and
                    lon_range[0] <= longitude <= lon_range[1]):
                    return region_id
        return None