# app/agents/visualization_agent.py (Enhanced Version)
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any, List, Optional, Union
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.agents.base import BaseAgent


class VisualizationAgent(BaseAgent):
    """
    An intelligent agent that understands visualization requests and creates
    multiple types of plots from oceanographic data.
    
    This agent handles:
    - Natural language understanding for visualization intent
    - Interactive map creation showing ARGO float locations
    - Depth profile charts for temperature and salinity analysis
    - Dynamic title generation based on data context
    - Robust error handling and validation
    
    Supported visualization types:
    - Map: Interactive scatter plot on map showing profile locations
    - Depth Profile: Line chart showing temperature/salinity vs depth
    """

    def __init__(self):
        """Initialize the VisualizationAgent with NLU keywords and plot configurations."""
        print("Initializing VisualizationAgent...")
        
        # Configure NLU keywords for plot type detection
        self._setup_plot_keywords()
        
        # Set up default plot configurations
        self._setup_plot_configs()
        
        print("VisualizationAgent initialized successfully.")

    def _setup_plot_keywords(self) -> None:
        """Setup keyword mapping for natural language understanding of plot types."""
        self.plot_keywords = {
            "map": ["map", "location", "locations", "where", "region", "geographic", "spatial"],
            "depth_profile": ["profile", "depth", "chart", "graph", "plot", "vertical", "temperature", "salinity"]
        }

    def _setup_plot_configs(self) -> None:
        """Setup default configurations for different plot types."""
        self.default_configs = {
            "map": {
                "zoom": 3,
                "height": 600,
                "color_scale": px.colors.cyclical.IceFire,
                "mapbox_style": "open-street-map"
            },
            "depth_profile": {
                "height": 600,
                "line_width": 2
            }
        }

    def _parse_intent(self, task: str) -> str:
        """
        Determine the desired plot type from the user's task using keyword matching.
        
        Args:
            task: User's natural language request for visualization
            
        Returns:
            String identifier for the plot type ('map' or 'depth_profile')
        """
        task_lower = task.lower()
        
        # Score each plot type based on keyword matches
        scores = {}
        for plot_type, keywords in self.plot_keywords.items():
            score = sum(1 for keyword in keywords if keyword in task_lower)
            scores[plot_type] = score
        
        # Return plot type with highest score, default to map if tie
        if scores["depth_profile"] > scores["map"]:
            return "depth_profile"
        return "map"  # Default to map visualization

    def _get_contextual_title(self, df: pd.DataFrame, base_title: str) -> str:
        """
        Create a dynamic title using context from the DataFrame.
        
        Args:
            df: DataFrame containing the data to be visualized
            base_title: Base title template
            
        Returns:
            Contextualized title string
        """
        if 'region' in df.columns and not df['region'].empty:
            # Extract region name and format it properly
            region_name = df['region'].iloc[0].replace("_", " ").title()
            return f"{base_title} in the {region_name}"
        return base_title

    def _validate_map_data(self, df: pd.DataFrame) -> None:
        """
        Validate that DataFrame contains required columns for map visualization.
        
        Args:
            df: DataFrame to validate
            
        Raises:
            ValueError: If required columns are missing
        """
        required_columns = ['latitude', 'longitude']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(
                f"Input DataFrame for map must contain {', '.join(required_columns)} columns. "
                f"Missing: {', '.join(missing_columns)}"
            )

    def _validate_depth_profile_data(self, df: pd.DataFrame) -> None:
        """
        Validate that DataFrame contains required columns for depth profile visualization.
        
        Args:
            df: DataFrame to validate
            
        Raises:
            ValueError: If required columns are missing
        """
        required_columns = ['depth', 'temperature']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(
                f"Input DataFrame for depth profile must contain {', '.join(required_columns)} columns. "
                f"Missing: {', '.join(missing_columns)}"
            )

    def _create_map(self, df: pd.DataFrame) -> go.Figure:
        """
        Create an interactive map from DataFrame with geo-coordinates.
        
        Args:
            df: DataFrame containing latitude, longitude, and optional data columns
            
        Returns:
            Plotly figure object for the map visualization
            
        Raises:
            ValueError: If required columns are missing
        """
        self._validate_map_data(df)
        
        title = self._get_contextual_title(df, "ARGO Float Profile Locations")
        config = self.default_configs["map"]
        
        # Prepare hover data - include available columns
        hover_data = []
        for col in ["temperature", "salinity", "datetime"]:
            if col in df.columns:
                hover_data.append(col)
        
        # Create the scatter mapbox plot
        fig = px.scatter_mapbox(
            df, 
            lat="latitude", 
            lon="longitude",
            hover_name="prof_id" if "prof_id" in df.columns else None,
            hover_data=hover_data,
            color="temperature" if "temperature" in df.columns else None,
            color_continuous_scale=config["color_scale"],
            zoom=config["zoom"],
            height=config["height"],
            title=title
        )
        
        # Configure map layout
        fig.update_layout(
            mapbox_style=config["mapbox_style"],
            margin={"r": 0, "t": 40, "l": 0, "b": 0}
        )
        
        return fig

    def _create_depth_profile(self, df: pd.DataFrame) -> go.Figure:
        """
        Create a depth profile chart for temperature and salinity.
        
        Args:
            df: DataFrame containing depth, temperature, and optional salinity data
            
        Returns:
            Plotly figure object for the depth profile visualization
            
        Raises:
            ValueError: If required columns are missing
        """
        self._validate_depth_profile_data(df)
        
        title = self._get_contextual_title(df, "Temperature & Salinity Depth Profile")
        config = self.default_configs["depth_profile"]
        
        # Create the line plot
        fig = px.line(
            df, 
            x='temperature', 
            y='depth',
            color='prof_id' if 'prof_id' in df.columns else None,
            title=title,
            labels={
                'temperature': 'Temperature (°C)',
                'depth': 'Depth (m)'
            },
            height=config["height"]
        )
        
        # Invert y-axis so depth increases downwards (oceanographic convention)
        fig.update_yaxes(autorange="reversed")
        
        # Add salinity as secondary trace if available
        if 'salinity' in df.columns:
            fig.add_scatter(
                x=df['salinity'],
                y=df['depth'],
                mode='lines+markers',
                name='Salinity',
                yaxis='y',
                xaxis='x2'
            )
            
            # Update layout for dual x-axis
            fig.update_layout(
                xaxis2=dict(
                    title='Salinity (PSU)',
                    overlaying='x',
                    side='top'
                )
            )
        
        return fig

    def _validate_input_data(self, data_frame: Any) -> pd.DataFrame:
        """
        Validate and return the input DataFrame.
        
        Args:
            data_frame: Input data to validate
            
        Returns:
            Validated DataFrame
            
        Raises:
            ValueError: If data is invalid or missing
        """
        if data_frame is None:
            raise ValueError(
                "No data was provided. Please run a data query first."
            )
        
        if not isinstance(data_frame, pd.DataFrame):
            raise ValueError(
                f"Expected pandas DataFrame, got {type(data_frame).__name__}"
            )
        
        if data_frame.empty:
            raise ValueError(
                "The provided DataFrame is empty. Please ensure your query returns data."
            )
        
        return data_frame

    def execute(self, task: str, state: Dict[str, Any]) -> Union[str, Any]:
        """
        Execute the visualization task.
        
        This is the main entry point that:
        1. Validates input data
        2. Parses visualization intent from natural language
        3. Creates the appropriate visualization
        4. Returns the result as JSON for API transport
        
        Args:
            task: User's natural language request for visualization
            state: Dictionary containing execution state and data
            
        Returns:
            JSON string of the plotly figure or error message
        """
        print(f"📊 VisualizationAgent received task: {task}")
        
        try:
            # Validate and extract input data
            data_frame = self._validate_input_data(state.get("data_frame"))
            
            # Parse user intent to determine plot type
            plot_type = self._parse_intent(task)
            print(f"DEBUG: Intent parsed as '{plot_type}' plot type.")
            
            # Create the appropriate visualization
            if plot_type == "map":
                figure = self._create_map(data_frame)
            elif plot_type == "depth_profile":
                figure = self._create_depth_profile(data_frame)
            else:
                return f"Sorry, I don't know how to create a '{plot_type}' visualization."
            
            # Convert figure to JSON for API transport
            return figure.to_json()
            
        except ValueError as e:
            # Handle validation and data errors
            return f"Data validation error: {str(e)}"
        except Exception as e:
            # Handle unexpected errors
            return f"An unexpected error occurred during visualization: {str(e)}"