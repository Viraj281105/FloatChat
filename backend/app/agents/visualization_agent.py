# app/agents/visualization_agent.py (Enhanced for Dashboard API)
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any, List, Optional, Union
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.agents.base import BaseAgent
# NEW: Import DataAgent to give this agent data-fetching capabilities
from app.agents.data_agent import DataAgent


class VisualizationAgent(BaseAgent):
    """
    An intelligent agent that creates visualizations from oceanographic data.
    
    This agent now has two modes of operation:
    1.  Dashboard Mode: Handles structured requests from the API, fetches its own
        data, and returns simplified JSON suitable for a web frontend.
    2.  Legacy Chat Mode: Handles natural language requests from the orchestrator,
        works on a pre-fetched DataFrame, and returns full Plotly figure JSON.
    """

    def __init__(self):
        """Initialize the VisualizationAgent."""
        print("Initializing VisualizationAgent...")
        
        # This agent now needs a DataAgent to fetch data for dashboard requests
        self.data_agent = DataAgent()
        
        # Configurations for Legacy Chat Mode
        self._setup_plot_keywords()
        self._setup_plot_configs()
        
        print("VisualizationAgent initialized successfully.")

    # --- NEW METHODS FOR DASHBOARD MODE ---

    def _prepare_map_data(self, df: pd.DataFrame, parameter: str) -> List[Dict[str, Any]]:
        """
        Formats DataFrame into a simple list of dictionaries for map plotting.
        
        Args:
            df: The input DataFrame.
            parameter: The parameter being visualized (e.g., 'temperature').
            
        Returns:
            A list of dicts, e.g., [{'lat': 10.1, 'lon': 75.2, 'value': 28.5}]
        """
        # Ensure required columns exist
        if 'latitude' not in df.columns or 'longitude' not in df.columns or parameter not in df.columns:
            print(f"Warning: Missing required columns for map data. Have: {df.columns.to_list()}")
            return []
            
        # To avoid sending massive amounts of data, we can sample or aggregate.
        # Here, we'll just take the most recent 1000 points.
        subset_df = df.nlargest(1000, 'datetime')
        
        map_data = []
        for _, row in subset_df.iterrows():
            map_data.append({
                "lat": row["latitude"],
                "lon": row["longitude"],
                "value": row[parameter],
                "prof_id": row.get("prof_id", "N/A")
            })
        return map_data

    def _prepare_chart_data(self, df: pd.DataFrame, parameter: str) -> Dict[str, Any]:
        """
        Aggregates DataFrame to create time-series data for a chart.
        
        Args:
            df: The input DataFrame.
            parameter: The parameter being visualized.
            
        Returns:
            A dict, e.g., {'labels': ['Jan', 'Feb'], 'values': [28.1, 28.3]}
        """
        if parameter not in df.columns or 'datetime' not in df.columns:
            print(f"Warning: Missing required columns for chart data. Have: {df.columns.to_list()}")
            return {"labels": [], "values": []}

        # Ensure 'datetime' is a datetime object
        df['datetime'] = pd.to_datetime(df['datetime'])
        df = df.set_index('datetime').sort_index()

        # Resample data by month and calculate the mean
        monthly_avg = df[parameter].resample('M').mean().dropna()

        return {
            "labels": monthly_avg.index.strftime('%Y-%b').tolist(),
            "values": monthly_avg.round(2).tolist(),
        }

    def _handle_dashboard_request(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handles a structured request from the /visualize endpoint.
        """
        print("DEBUG: Handling request in Dashboard Mode.")
        parameter = state.get("parameter")
        region = state.get("region")

        if not all([parameter, region]):
            raise ValueError("Dashboard request requires 'parameter' and 'region' in the state.")

        # Step 1: Use the internal DataAgent to fetch data
        print(f"DEBUG: Fetching data for parameter='{parameter}', region='{region}'...")
        data_query = f"Get all {parameter} data for the {region.replace('_', ' ')} region"
        
        # The DataAgent's execute method returns a DataFrame when `return_df` is true
        data_frame = self.data_agent.execute(task=data_query, state={"return_df": True})

        if not isinstance(data_frame, pd.DataFrame) or data_frame.empty:
            print("Warning: DataAgent returned no data for the query.")
            return {"map_data": [], "chart_data": {"labels": [], "values": []}}
        
        print(f"DEBUG: DataAgent returned a DataFrame with {len(data_frame)} rows.")

        # Step 2: Prepare the data into the required JSON formats
        map_data = self._prepare_map_data(data_frame, parameter)
        chart_data = self._prepare_chart_data(data_frame, parameter)

        return {
            "map_data": map_data,
            "chart_data": chart_data
        }

        # --- MODIFIED EXECUTE METHOD ---

    def execute(self, task: str, state: Dict[str, Any]) -> str:
        """
        Main entry point for the agent. 
        This version is optimized to create a full Plotly figure for the dashboard.
        """
        print(f"📊 VisualizationAgent received task: {task}")

        try:
            # This is a structured request from the dashboard API
            if "parameter" in state and "region" in state:
                print("DEBUG: Handling request in Dashboard-Plotly Mode.")
                parameter = state.get("parameter")
                region = state.get("region")

                # Step 1: Use the internal DataAgent to fetch data
                data_query = f"Get all {parameter} data for the {region.replace('_', ' ')} region"
                data_frame = self.data_agent.execute(task=data_query, state={"return_df": True})
                
                # Step 2: Validate the received data
                data_frame = self._validate_input_data(data_frame)
                
                print(f"DEBUG: DataAgent returned a DataFrame with {len(data_frame)} rows. Creating map...")

                # Step 3: Create the map figure using the legacy method
                figure = self._create_map(data_frame)
                
                # Step 4: Convert the entire figure to a JSON string and return it
                return figure.to_json()
            
            else:
                # Fallback to legacy chat-based mode for other uses
                print("DEBUG: Handling request in Legacy Chat Mode.")
                return self._handle_legacy_chat_request(task, state)

        except Exception as e:
            import traceback
            print(f"ERROR in VisualizationAgent: {traceback.format_exc()}")
            # Raise the exception to let the FastAPI endpoint handle error formatting
            raise RuntimeError(f"An unexpected error occurred during visualization: {str(e)}") from e


    # --- LEGACY METHODS (for chat-based interaction) ---
    # These methods are kept for backward compatibility but are not used by the dashboard.

    def _handle_legacy_chat_request(self, task: str, state: Dict[str, Any]) -> str:
        """
        Handles a natural language request from the orchestrator.
        """
        data_frame = self._validate_input_data(state.get("data_frame"))
        plot_type = self._parse_intent(task)
        
        if plot_type == "map":
            figure = self._create_map(data_frame)
        elif plot_type == "depth_profile":
            figure = self._create_depth_profile(data_frame)
        else:
            return f"Sorry, I don't know how to create a '{plot_type}' visualization."
        
        return figure.to_json()
        
    def _setup_plot_keywords(self) -> None:
        self.plot_keywords = {
            "map": ["map", "location", "locations", "where", "region", "geographic", "spatial"],
            "depth_profile": ["profile", "depth", "chart", "graph", "plot", "vertical", "temperature", "salinity"]
        }

    def _setup_plot_configs(self) -> None:
        self.default_configs = {
            "map": {"zoom": 3, "height": 600, "color_scale": px.colors.cyclical.IceFire, "mapbox_style": "open-street-map"},
            "depth_profile": {"height": 600, "line_width": 2}
        }

    def _parse_intent(self, task: str) -> str:
        task_lower = task.lower()
        scores = {ptype: sum(1 for kw in kws if kw in task_lower) for ptype, kws in self.plot_keywords.items()}
        return "depth_profile" if scores["depth_profile"] > scores["map"] else "map"

    def _get_contextual_title(self, df: pd.DataFrame, base_title: str) -> str:
        if 'region' in df.columns and not df['region'].empty:
            region_name = df['region'].iloc[0].replace("_", " ").title()
            return f"{base_title} in the {region_name}"
        return base_title

    def _validate_map_data(self, df: pd.DataFrame) -> None:
        required = ['latitude', 'longitude']
        if not all(col in df.columns for col in required):
            raise ValueError(f"Map data missing one of: {required}")

    def _validate_depth_profile_data(self, df: pd.DataFrame) -> None:
        required = ['depth', 'temperature']
        if not all(col in df.columns for col in required):
            raise ValueError(f"Depth profile data missing one of: {required}")

    # In backend/app/agents/visualization_agent.py

    def _create_map(self, df: pd.DataFrame) -> go.Figure:
        # ... (code before update_layout is unchanged) ...
        
        # Find this section and add the two new lines
        fig.update_layout(
            # These two lines are NEW
            mapbox_center={"lat": 20.5937, "lon": 78.9629}, # Coordinates for the center of India
            mapbox_zoom=4,                                  # Adjust zoom level for a country view

            # Existing styling
            mapbox_style="carto-darkmatter",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            title_text=title,
            title_font_size=20,
            font_color="#d1d5db", 
            coloraxis_colorbar=dict(
                title="Temperature (°C)",
                title_font_color="#d1d5db",
                tickfont_color="#d1d5db",
                len=0.75,
                yanchor="bottom",
                y=0,
            ),
            margin={"r": 0, "t": 40, "l": 0, "b": 0}
        )
        
        return fig

    def _create_depth_profile(self, df: pd.DataFrame) -> go.Figure:
        self._validate_depth_profile_data(df)
        title = self._get_contextual_title(df, "Temperature & Salinity Depth Profile")
        fig = px.line(df, x='temperature', y='depth',
                      color='prof_id' if 'prof_id' in df.columns else None, title=title,
                      labels={'temperature': 'Temperature (°C)', 'depth': 'Depth (m)'})
        fig.update_yaxes(autorange="reversed")
        return fig

    def _validate_input_data(self, data_frame: Any) -> pd.DataFrame:
        if data_frame is None:
            raise ValueError("No data was provided.")
        if not isinstance(data_frame, pd.DataFrame):
            raise ValueError(f"Expected pandas DataFrame, got {type(data_frame).__name__}")
        if data_frame.empty:
            raise ValueError("The provided DataFrame is empty.")
        return data_frame