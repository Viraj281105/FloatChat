# FloatChat: Project J.A.R.V.I.S. 🌊🤖

FloatChat is an immersive, AI-powered conversational platform for exploring global oceanographic data from the ARGO float network. Inspired by J.A.R.V.I.S., the system acts as an interactive science advisor, allowing you to query, analyze, and visualize complex physical ocean data in plain English.

---

## ✨ Features

- **J.A.R.V.I.S. Orchestration Engine**: Multi-agent system that routes user queries dynamically between specialist agents (Data, Geographic, and Visualization).
- **Global Ocean Coverage**: Instant access to real-time temperature, salinity, and biogeochemical profiles from thousands of active ARGO floats.
- **Glassmorphic Sci-Fi Dashboard**: Sleek dark-mode interface with responsive, interactive data panels.
- **On-the-Fly Visualizations**: Instant map generation and temporal trend analysis powered by Plotly.

---

## 📂 Project Architecture

```
FloatChat/
├── backend/
│   ├── app/
│   │   ├── api/             # API Router & Route handlers (endpoints.py)
│   │   ├── core/            # Configuration variables & client initializers
│   │   ├── models/          # Pydantic schemas (chat.py)
│   │   └── services/        # Specialist agents & core domain experts
│   └── main.py              # Application entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI widgets & common layout items
│   │   ├── context/         # Auth & global state management
│   │   ├── lib/             # Third-party client interfaces (supabase)
│   │   ├── pages/           # Screen views (Chat, Dashboard, Reports)
│   │   └── services/        # API service layer
│   └── tsconfig.json        # TypeScript configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Python](https://www.python.org/downloads/) (version 3.9+)
- [Node.js](https://nodejs.org/) (version 18+)

### ⚙️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Viraj281105/FloatChat.git
   cd FloatChat
   ```

2. **Set Up the Backend**
   ```bash
   cd backend
   # Create and activate virtual environment
   python -m venv venv
   .\venv\Scripts\activate  # On macOS/Linux: source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Set Up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**
   - Place a `.env` file in the `backend/` directory specifying your `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and database variables.

---

## ⚡ Running the Application

### 1. Start the Backend API
```bash
# In /backend directory (venv activated)
uvicorn main:app --reload
```
Runs at `http://127.0.0.1:8000`.

### 2. Start the Frontend Dev Server
```bash
# In /frontend directory
npm run dev
```
Runs at `http://localhost:5173`.
