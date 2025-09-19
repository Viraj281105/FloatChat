# app/agents/data_agent.py (Enhanced Version)
import os
import re
import pandas as pd
import psycopg2
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional, Tuple
import sys

# Add parent directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.agents.base import BaseAgent
from geo_intelligence import expert  # Import expert to access valid regions


class DataAgent(BaseAgent):
    """
    An intelligent agent that dynamically queries a database based on
    natural language and prepares the groundwork for a full RAG pipeline.
    
    This agent handles:
    - Natural language processing to extract regions and parameters
    - Dynamic SQL query generation based on user requests
    - Database connection management and query execution  
    - Statistical analysis and insight generation from query results
    - Placeholder integration for future RAG (Retrieval-Augmented Generation) pipeline
    """

    def __init__(self):
        """Initialize the DataAgent with database configuration and NLU patterns."""
        print("Initializing DataAgent...")
        
        # Load environment variables for database connection
        load_dotenv()
        self.db_params = self._build_db_params()
        
        # Initialize natural language understanding components
        self._setup_nlu_patterns()
        
        print("DataAgent initialized successfully.")

    def _build_db_params(self) -> Dict[str, str]:
        """
        Build database connection parameters from environment variables.
        
        Returns:
            Dictionary containing database connection parameters
        """
        return {
            "host": os.getenv("DB_HOST"),
            "port": os.getenv("DB_PORT"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "database": os.getenv("DB_NAME"),
        }

    def _setup_nlu_patterns(self) -> None:
        """Setup natural language understanding patterns for region detection."""
        # Create regex pattern from all known region names for NLU
        region_names = expert.get_known_regions()
        # Convert underscores to spaces and create pattern for both formats
        pattern_parts = []
        for region in region_names:
            pattern_parts.append(region.replace('_', ' '))  # "bay of bengal"
            pattern_parts.append(region)  # "bay_of_bengal"
        
        self.region_pattern = re.compile(
            r'\b(' + '|'.join(pattern_parts) + r')\b', 
            re.IGNORECASE
        )

    def _get_db_connection(self) -> psycopg2.extensions.connection:
        """
        Create and return a database connection.
        
        Returns:
            PostgreSQL database connection
            
        Raises:
            psycopg2.Error: If connection cannot be established
        """
        return psycopg2.connect(**self.db_params)
        
    def _execute_sql_query(self, query: str, params: Optional[Tuple] = None) -> pd.DataFrame:
        """
        Execute SQL query and return results as a DataFrame.
        
        Args:
            query: SQL query string to execute
            params: Optional query parameters for parameterized queries
            
        Returns:
            DataFrame containing query results, empty DataFrame on error
        """
        try:
            with self._get_db_connection() as conn:
                df = pd.read_sql_query(query, conn, params=params)
                return df
        except Exception as e:
            print(f"Database query failed: {e}")
            return pd.DataFrame()

    def _find_relevant_profiles_from_vector_db(self, task: str) -> Optional[List[int]]:
        """
        Placeholder for RAG pipeline semantic search functionality.
        
        In a full RAG implementation, this method would:
        1. Create an embedding of the user's 'task' (e.g., "coldest water temperatures")
        2. Query a vector database (like ChromaDB) with this embedding
        3. Return a list of the most semantically similar 'prof_id's
        
        Args:
            task: User's natural language task description
            
        Returns:
            List of relevant profile IDs or None if no matches found
        """
        print("DEBUG: RAG semantic search step would happen here.")
        # Returning None to indicate fallback to keyword search
        return None

    def _extract_region_from_task(self, task: str) -> Optional[str]:
        """
        Extract region information from the user's task using NLU.
        
        Args:
            task: User's natural language task description
            
        Returns:
            Normalized region name or None if no region detected
        """
        region_match = self.region_pattern.search(task)
        if region_match:
            # Normalize the matched region name
            matched_region = region_match.group(1).lower().replace(" ", "_")
            return matched_region
        return None

    def _build_dynamic_query(self, task: str, relevant_prof_ids: Optional[List[int]] = None) -> Tuple[str, Tuple]:
        """
        Build dynamic SQL query based on task analysis.
        
        Args:
            task: User's natural language task description
            relevant_prof_ids: Optional list of profile IDs from vector search
            
        Returns:
            Tuple containing (SQL query string, query parameters)
        """
        params = []
        where_clauses = []
        
        # Use RAG results if available
        if relevant_prof_ids:
            # If we had IDs from RAG, we'd use them for precise querying
            # where_clauses.append("p.prof_id IN %s")
            # params.append(tuple(relevant_prof_ids))
            pass
        
        # Extract and apply region filter
        target_region = self._extract_region_from_task(task)
        if target_region:
            where_clauses.append("pm.region = %s")
            params.append(target_region)

        # Build final query
        base_query = """
            SELECT p.*, pm.region 
            FROM profiles p 
            JOIN profile_metadata pm ON p.prof_id = pm.prof_id
        """
        
        if where_clauses:
            sql_query = f"{base_query} WHERE {' AND '.join(where_clauses)}"
        else:
            sql_query = base_query  # No filters, get all data
            
        sql_query += " ORDER BY p.datetime DESC LIMIT 1000;"
        
        return sql_query, tuple(params) if params else tuple()

    def _calculate_column_stats(self, df: pd.DataFrame, column_name: str) -> Dict[str, float]:
        """
        Calculate statistical summary for a numeric column.
        
        Args:
            df: DataFrame containing the data
            column_name: Name of the column to analyze
            
        Returns:
            Dictionary containing statistical measures
        """
        if column_name in df.columns:
            return df[column_name].agg(['mean', 'min', 'max', 'std']).to_dict()
        return {}

    def _generate_insights(self, df: pd.DataFrame, region: Optional[str] = None) -> str:
        """
        Generate human-readable insights from query results.
        
        Args:
            df: DataFrame containing query results
            region: Optional region name for context
            
        Returns:
            Formatted string containing data insights
        """
        if df.empty:
            return "I couldn't find any data matching your query."
        
        # Generate overview
        num_profiles = len(df['prof_id'].unique()) if 'prof_id' in df.columns else len(df)
        region_info = f"from the **{region.replace('_', ' ').title()}**" if region else "**across all regions**"
        
        response = [f"Found {num_profiles} unique profiles {region_info} matching your criteria.\n"]

        # Generate temperature insights
        temp_stats = self._calculate_column_stats(df, 'temperature')
        if temp_stats:
            response.append(
                "**Temperature Insights:**\n"
                f"- Average: {temp_stats['mean']:.2f}°C, "
                f"Range: {temp_stats['min']:.2f}°C to {temp_stats['max']:.2f}°C"
            )

        # Generate salinity insights
        salinity_stats = self._calculate_column_stats(df, 'salinity')
        if salinity_stats:
            response.append(
                "**Salinity Insights:**\n"
                f"- Average: {salinity_stats['mean']:.2f} PSU, "
                f"Range: {salinity_stats['min']:.2f} PSU to {salinity_stats['max']:.2f} PSU"
            )
            
        return "\n".join(response)

    def execute(self, task: str, state: Dict[str, Any]) -> Any:
        """
        Main execution method that processes user tasks and returns results.
        
        Args:
            task: Natural language description of the user's request
            state: Dictionary containing execution state and configuration
            
        Returns:
            Either a DataFrame (if return_df is True) or formatted insights string
        """
        print(f"⚙️ DataAgent received task: {task}")
        
        # RAG Step 1: Attempt semantic search for relevant profiles
        relevant_prof_ids = self._find_relevant_profiles_from_vector_db(task)
        
        # RAG Step 2: Build dynamic query based on task analysis
        sql_query, query_params = self._build_dynamic_query(task, relevant_prof_ids)
        
        # Execute the query
        query_results_df = self._execute_sql_query(sql_query, query_params)
        
        # Return DataFrame directly if requested
        if state.get("return_df"):
            return query_results_df
        
        # Generate and return human-readable insights
        target_region = self._extract_region_from_task(task)
        return self._generate_insights(query_results_df, region=target_region)