# app/agents/data_agent.py (Bypass Version)
import os
import re
import pandas as pd
import psycopg2
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional, Tuple
import sys
from pathlib import Path
import requests # <-- ADDED for direct HTTP calls

# --- Imports for RAG ---
from sentence_transformers import SentenceTransformer

# Add parent directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.agents.base import BaseAgent
from geo_intelligence import expert

class DataAgent(BaseAgent):
    def __init__(self):
        print("Initializing DataAgent...")
        
        env_path = Path(__file__).resolve().parents[2] / '.env'
        load_dotenv(dotenv_path=env_path)
        
        self.db_params = self._build_db_params()
        self._setup_nlu_patterns()
        
        print("Loading embedding model...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

        # --- CHANGED: Storing Supabase credentials but NOT creating the client ---
        self.supa_url = os.getenv("SUPABASE_URL")
        self.supa_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not self.supa_url or not self.supa_key:
            raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env file.")
        
        print("DataAgent initialized successfully.")

    # --- REWRITTEN: Using direct HTTP request to bypass the client library ---
    def _find_relevant_profiles_from_vector_db(self, task: str) -> Optional[List[str]]:
        print("Performing semantic search with Supabase pgvector via direct HTTP...")
        try:
            task_embedding = self.embedding_model.encode(task).tolist()
            
            # 1. Define the endpoint URL for the RPC function
            url = f"{self.supa_url}/rest/v1/rpc/match_profiles"
            
            # 2. Set the required headers
            headers = {
                "apikey": self.supa_key,
                "Authorization": f"Bearer {self.supa_key}",
                "Content-Type": "application/json"
            }
            
            # 3. Define the JSON payload
            payload = {
                'query_embedding': task_embedding,
                'match_threshold': 0.7,
                'match_count': 10
            }

            # 4. Make the POST request
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

            response_data = response.json()
            if not response_data:
                print("No relevant profiles found in Supabase.")
                return None

            prof_ids = [item['prof_id'] for item in response_data]
            print(f"Found {len(prof_ids)} relevant profiles in Supabase.")
            return prof_ids
        except Exception as e:
            print(f"Supabase vector search failed: {e}")
            return None

    # --- All other methods below this line are UNCHANGED ---
    def _build_db_params(self) -> Dict[str, str]:
        return { "host": os.getenv("DB_HOST"), "port": os.getenv("DB_PORT"), "user": os.getenv("DB_USER"), "password": os.getenv("DB_PASSWORD"), "database": os.getenv("DB_NAME") }

    def _setup_nlu_patterns(self) -> None:
        region_names = expert.get_known_regions()
        pattern_parts = [r.replace('_', ' ') for r in region_names] + region_names
        self.region_pattern = re.compile(r'\b(' + '|'.join(pattern_parts) + r')\b', re.IGNORECASE)

    def _get_db_connection(self) -> psycopg2.extensions.connection:
        return psycopg2.connect(**self.db_params)
        
    def _execute_sql_query(self, query: str, params: Optional[Tuple] = None) -> pd.DataFrame:
        try:
            with self._get_db_connection() as conn:
                return pd.read_sql_query(query, conn, params=params)
        except Exception as e:
            print(f"Database query failed: {e}")
            return pd.DataFrame()

    def _extract_region_from_task(self, task: str) -> Optional[str]:
        region_match = self.region_pattern.search(task)
        if region_match:
            return region_match.group(1).lower().replace(" ", "_")
        return None

    def _build_dynamic_query(self, task: str, relevant_prof_ids: Optional[List[str]] = None) -> Tuple[str, Tuple]:
        params = []
        where_clauses = []
        if relevant_prof_ids:
            id_placeholders = ','.join(['%s'] * len(relevant_prof_ids))
            where_clauses.append(f"p.prof_id IN ({id_placeholders})")
            params.extend(relevant_prof_ids)
        target_region = self._extract_region_from_task(task)
        if target_region:
            where_clauses.append("pm.region = %s")
            params.append(target_region)
        base_query = "SELECT p.*, pm.region FROM profiles p JOIN profile_metadata pm ON p.prof_id = pm.prof_id"
        if where_clauses:
            sql_query = f"{base_query} WHERE {' AND '.join(where_clauses)}"
        else:
            sql_query = base_query
        sql_query += " ORDER BY p.datetime DESC LIMIT 1000;"
        return sql_query, tuple(params) if params else tuple()

    def _generate_insights(self, df: pd.DataFrame, region: Optional[str] = None) -> str:
        if df.empty:
            return "I couldn't find any data matching your query."
        num_profiles = len(df.index) 
        region_info = f"from the **{region.replace('_', ' ').title()}**" if region else "**across all regions**"
        response = [f"Found {num_profiles} data points {region_info} matching your criteria.\n"]
        temp_stats = df['temperature'].agg(['mean', 'min', 'max']).to_dict()
        if temp_stats:
            response.append(f"**Temperature Insights:**\n- Average: {temp_stats['mean']:.2f}°C, Range: {temp_stats['min']:.2f}°C to {temp_stats['max']:.2f}°C")
        salinity_stats = df['salinity'].agg(['mean', 'min', 'max']).to_dict()
        if salinity_stats:
            response.append(f"**Salinity Insights:**\n- Average: {salinity_stats['mean']:.2f} PSU, Range: {salinity_stats['min']:.2f} PSU to {salinity_stats['max']:.2f} PSU")
        return "\n".join(response)

    def execute(self, task: str, state: Dict[str, Any]) -> Any:
        print(f"⚙️ DataAgent received task: {task}")
        relevant_prof_ids = self._find_relevant_profiles_from_vector_db(task)
        sql_query, query_params = self._build_dynamic_query(task, relevant_prof_ids)
        query_results_df = self._execute_sql_query(sql_query, query_params)
        if state.get("return_df"):
            return query_results_df
        target_region = self._extract_region_from_task(task)
        return self._generate_insights(query_results_df, region=target_region)