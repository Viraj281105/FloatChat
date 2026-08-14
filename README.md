# FloatChat: Oceanographic Advisory Mainframe 🌊🤖

FloatChat is an immersive, high-tech cognitive advisory platform designed to explore and analyze global oceanographic datasets collected from the global **ARGO Float Network**. Leveraging a modular multi-agent routing mainframe, it functions as an interactive science intelligence advisor, allowing researchers to query, map, and run diagnostics on physical ocean data using natural language.

---

## ⚡ Mainframe Capabilities & Architectural Features

- **FloatAdvisor Cognitive Routing Core**: A futuristic multi-agent orchestrator that dynamically parsing and tokenizes user queries, forwarding them across domain-specific expert sub-routines (Geographic Spatial Agents, Biogeochemical Data Analyzers, and Visual Mapping Sub-Systems).
- **Global Array Telemetry**: Real-time analytical retrieval of Temperature, Salinity, and Dissolved Oxygen profiles transiting from thousands of active telemetry arrays across all major ocean basins.
- **Glassmorphic Command Center**: Premium light-themed slate glassmorphism user interface designed with responsive visual analytics charts, collapsible prompt libraries, and interactive ocean basin exploration widgets.
- **Interactive Reports Generator**: Dynamic document compiler that generates visual PDFs, CSV tables, and multidimensional NetCDF grids on demand.
- **Live HUD Telemetry console**: Running continuous database handshake checks, latency audits (ms), and cached footprint monitors.

---

## 📂 System Architecture

```
FloatChat/
├── backend/
│   ├── app/
│   │   ├── api/             # Secure REST endpoint routers
│   │   ├── core/            # Mainframe configurations & client initializers
│   │   ├── models/          # Data schemas & response models
│   │   └── services/        # Advisor agent engines & core algorithms
│   └── main.py              # Application entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI widgets & layouts
│   │   ├── context/         # Auth contexts & session states
│   │   ├── lib/             # Third-party integrations (Supabase)
│   │   ├── pages/           # High-fidelity dashboard & advisor screens
│   │   └── services/        # Service integrations layer
│   └── tsconfig.json        # TypeScript configuration
└── README.md
```

---

## 🚀 Deployment Instructions

### Prerequisites
- **Python** (version 3.9+)
- **Node.js** (version 18+)

### ⚙️ Mainframe Setup

1. **Clone the Mainframe Repository**
   ```bash
   git clone https://github.com/Viraj281105/FloatChat.git
   cd FloatChat
   ```

2. **Initialize Backend Environment**
   ```bash
   cd backend
   # Create and activate virtual environment
   python -m venv venv
   .\venv\Scripts\activate  # On macOS/Linux: source venv/bin/activate
   
   # Install backend dependencies
   pip install -r requirements.txt
   ```

3. **Initialize Frontend Modules**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   - Create a `.env` file in the `backend/` directory and specify your `SUPABASE_URL` and service credentials.

---

## ⚡ Running the Platform

### 1. Fire up the Python REST Mainframe
```bash
# In backend directory (venv activated)
uvicorn main:app --reload
```
API launches at `http://127.0.0.1:8000`.

### 2. Ignite the Vite Dev Console
```bash
# In frontend directory
npm run dev
```
Client launches at `http://localhost:5173`.
