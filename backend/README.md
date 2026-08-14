# FloatChat Backend API 🐍

FastAPI-powered server running the multi-agent system of J.A.R.V.I.S. to query database profiles, perform geographic reasoning, and compile data packages.

## Structure
- `app/api/`: Request routers and route handlers.
- `app/core/`: Application settings, configurations, and Supabase client definitions.
- `app/models/`: Pydantic input/output schemas.
- `app/services/`: Specialist agents (`data_agent`, `geographic_agent`, `visualization_agent`) and the `orchestrator`.
- `main.py`: Application startup and middleware setup.
