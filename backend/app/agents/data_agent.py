import os
import re
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import pandas as pd
import requests
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, text

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

        self.supa_url = os.getenv("SUPABASE_URL")
        self.supa_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not self.supa_url or not self.supa_key:
            raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env file.")

        # SQLAlchemy engine
        self.engine = create_engine(
            f"postgresql+psycopg2://{self.db_params['user']}:{self.db_params['password']}"
            f"@{self.db_params['host']}:{self.db_params['port']}/{self.db_params['database']}"
        )

        print("DataAgent initialized successfully.")

    # ---------------- DB & Env Setup ----------------
    def _build_db_params(self) -> Dict[str, str]:
        return {
            "host": os.getenv("DB_HOST"),
            "port": os.getenv("DB_PORT"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "database": os.getenv("DB_NAME")
        }

    def _setup_nlu_patterns(self) -> None:
        regions = expert.get_known_regions()
        patterns = [r.replace('_', ' ') for r in regions] + regions
        self.region_pattern = re.compile(r'\b(' + '|'.join(patterns) + r')\b', re.IGNORECASE)

    # ---------------- Supabase Vector Search ----------------
    def _find_relevant_profiles_from_vector_db(self, task: str) -> Optional[List[str]]:
        try:
            embedding = self.embedding_model.encode(task).tolist()
            url = f"{self.supa_url}/rest/v1/rpc/match_profiles"
            headers = {
                "apikey": self.supa_key,
                "Authorization": f"Bearer {self.supa_key}",
                "Content-Type": "application/json"
            }
            payload = {'query_embedding': embedding, 'match_threshold': 0.7, 'match_count': 10}
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            if not data:
                print("No relevant profiles found in Supabase.")
                return None
            return [item['prof_id'] for item in data]
        except Exception as e:
            print(f"Supabase vector search failed: {e}")
            return None

    # ---------------- Database Query ----------------
    def _execute_sql_query(self, query: str, params: Optional[Tuple] = None) -> pd.DataFrame:
        try:
            with self.engine.connect() as conn:
                df = pd.read_sql(text(query), conn, params=params)
                print(f"[DEBUG] Query executed, rows returned: {len(df)}")
                return df
        except Exception as e:
            print(f"Database query failed: {e}")
            return pd.DataFrame()

    # ---------------- Region Extraction ----------------
    def _extract_region_from_task(self, task: str) -> Optional[str]:
        match = self.region_pattern.search(task)
        return match.group(1).lower().replace(" ", "_") if match else None

    # ---------------- Dynamic SQL Builder ----------------
    def _build_dynamic_query(self, task: str, relevant_prof_ids: Optional[List[str]] = None) -> Tuple[str, Tuple]:
        """
        Builds SQL query dynamically, ensuring latitude, longitude, and prof_id are always included.
        """
        params, clauses = [], []

        if relevant_prof_ids:
            placeholders = ','.join(['%s'] * len(relevant_prof_ids))
            clauses.append(f"p.prof_id IN ({placeholders})")
            params.extend(relevant_prof_ids)

        region = self._extract_region_from_task(task)
        if region:
            clauses.append("pm.region = %s")
            params.append(region)

        # Use correct table columns
        base = """
        SELECT p.prof_id, pm.region, p.latitude, p.longitude,
               p.temperature, p.salinity, p.datetime
        FROM profiles p
        JOIN profile_metadata pm ON p.prof_id = pm.prof_id
        """

        sql = f"{base} WHERE {' AND '.join(clauses)}" if clauses else base
        sql += " ORDER BY p.datetime DESC LIMIT 1000;"

        print(f"[DEBUG] SQL Query: {sql}")
        print(f"[DEBUG] Params: {params}")
        return sql, tuple(params)

    # ---------------- Insights ----------------
    def _generate_insights(self, df: pd.DataFrame, region: Optional[str] = None) -> str:
        if df.empty:
            return "I couldn't find any data matching your query."
        region_info = f"from the **{region.replace('_', ' ').title()}**" if region else "**across all regions**"
        response = [f"Found {len(df)} data points {region_info} matching your criteria.\n"]
        for col, label, unit in [('temperature', 'Temperature', '°C'), ('salinity', 'Salinity', 'PSU')]:
            if col in df.columns:
                stats = df[col].agg(['mean', 'min', 'max']).to_dict()
                response.append(f"**{label} Insights:**\n- Average: {stats['mean']:.2f}{unit}, "
                                f"Range: {stats['min']:.2f}{unit} to {stats['max']:.2f}{unit}")
        return "\n".join(response)

    # ---------------- Main Execute ----------------
    def execute(self, task: str, state: Dict[str, Any]) -> Any:
        print(f"⚙️ DataAgent received task: {task}")
        prof_ids = self._find_relevant_profiles_from_vector_db(task)
        sql, params = self._build_dynamic_query(task, prof_ids)
        df = self._execute_sql_query(sql, params)
        if state.get("return_df"):
            return df
        return self._generate_insights(df, region=self._extract_region_from_task(task))
