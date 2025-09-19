# app/agents/visualization_agent.py
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.agents.base import BaseAgent
from app.agents.data_agent import DataAgent


class VisualizationAgent(BaseAgent):
    """
    Generates map and chart visualizations for oceanographic data.
    """

    def __init__(self):
        print("Initializing VisualizationAgent...")
        self.data_agent = DataAgent()
        print("VisualizationAgent initialized successfully.")

    # ---------------- Helper Methods ----------------
    def _validate_map_data(self, df: pd.DataFrame):
        required_cols = ['latitude', 'longitude']
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column for map: {col}")
        # Convert numeric columns
        df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
        df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
        df.dropna(subset=['latitude', 'longitude'], inplace=True)
        return df

    def _validate_chart_data(self, df: pd.DataFrame, parameter: str):
        if parameter not in df.columns or 'datetime' not in df.columns:
            return pd.DataFrame()
        df['datetime'] = pd.to_datetime(df['datetime'])
        return df.set_index('datetime').sort_index()

    # ---------------- Map ----------------
    def _create_map(self, df: pd.DataFrame, parameter: str) -> go.Figure:
        df = self._validate_map_data(df)

        color_column = parameter if parameter in df.columns else None
        hover_cols = ['latitude', 'longitude', 'prof_id']
        if color_column:
            hover_cols.append(color_column)

        fig = px.scatter_mapbox(
            df,
            lat="latitude",
            lon="longitude",
            color=color_column,
            hover_data=hover_cols
        )

        fig.update_layout(
            mapbox_center={"lat": 20.5937, "lon": 78.9629},
            mapbox_zoom=3,
            mapbox_style="open-street-map",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            title_text=f"{parameter.title()} Map",
            title_font_size=20,
            font_color="#d1d5db",
            margin={"r": 0, "t": 40, "l": 0, "b": 0}
        )

        return fig

    # ---------------- Chart ----------------
    def _create_chart(self, df: pd.DataFrame, parameter: str) -> go.Figure:
        df_chart = self._validate_chart_data(df, parameter)
        if df_chart.empty:
            return go.Figure()

        monthly_avg = df_chart[parameter].resample('M').mean().dropna()
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=monthly_avg.index,
            y=monthly_avg.values,
            mode='lines+markers',
            name=parameter.title(),
            line=dict(color='cyan', width=2)
        ))
        fig.update_layout(
            title=f"{parameter.title()} Monthly Average",
            xaxis_title="Month",
            yaxis_title=parameter.title(),
            template="plotly_dark",
            height=500
        )
        return fig

    # ---------------- Main Execute ----------------
    def execute(self, task: str, state: Dict[str, Any]):
        try:
            parameter = state.get("parameter", "temperature")
            region = state.get("region", "global")

            # Fetch data from DataAgent
            query = f"Get all {parameter} data for {region}"
            df = self.data_agent.execute(task=query, state={"return_df": True})

            if df is None or df.empty:
                return {"map_figure": None, "chart_figure": None, "message": "No data found."}

            map_fig = self._create_map(df, parameter)
            chart_fig = self._create_chart(df, parameter)

            return {
                "map_figure": map_fig.to_json(),
                "chart_figure": chart_fig.to_json(),
                "message": "Visualization successful."
            }

        except Exception as e:
            print(f"VisualizationAgent error: {e}")
            return {"map_figure": None, "chart_figure": None, "message": str(e)}
