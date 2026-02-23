# FloatChat 🌊

[![TypeScript](https://img.shields.io/badge/TypeScript-54.3%25-3178C6)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-44.1%25-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
![GitHub stars](https://img.shields.io/github/stars/Viraj281105/FloatChat?style=social)

FloatChat is an AI-powered conversational platform for exploring global oceanographic data from the ARGO float network. Ask questions in natural language and get instant insights, analysis, and visualizations about the state of our oceans.

---

## ✨ Features

- **Conversational AI** — Interact with vast datasets using plain English. No code required.
- **Global Ocean Coverage** — Access real-time data from thousands of active ARGO floats across all major ocean basins.
- **Advanced Analytics** — Get AI-powered insights and trend analysis for temperature, salinity, and other key ocean parameters.
- **On-the-Fly Visualizations** — Generate charts and maps directly from your conversation.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Retrieval-Augmented Generation (RAG) pipelines |

---

## 📁 Repository Structure

```
FloatChat/
├── backend/        # FastAPI server, RAG pipeline, ARGO data integration
├── frontend/       # React + Vite + TypeScript UI, Tailwind CSS
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) and npm

---

### ⚙️ Installation & Setup

**1. Clone the Repository**

```bash
git clone https://github.com/Viraj281105/FloatChat.git
cd FloatChat
```

**2. Set Up the Backend (Python)**

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**3. Set Up the Frontend (React)**

```bash
cd frontend
npm install
```

**4. Configure Environment Variables**

Create `.env` files for both services:

**`frontend/.env.local`**
```env
VITE_SUPABASE_URL="https://your-project-url.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

**`backend/.env`**
```env
SUPABASE_URL="https://your-project-url.supabase.co"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
# Add any other backend keys here
```

> ⚠️ Never commit `.env` or `.env.local` files — they are already listed in `.gitignore`.

---

## ▶️ Running the Application

Run the backend and frontend in **two separate terminals**.

**Terminal 1 — Backend**

```bash
cd backend
source venv/bin/activate   # or .\venv\Scripts\activate on Windows
uvicorn main:app --reload
```

Backend API running at: 👉 `http://127.0.0.1:8000`

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Frontend running at: 👉 `http://localhost:5173`

---

## 🤝 Contributing

Contributions are welcome and greatly appreciated! To contribute:

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/FloatChat.git
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add your feature description"
   ```
5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** from your fork to the main repository.

---

## 📜 License

Distributed under the MIT License.

---

## 📧 Contact

**Viraj Jadhao**
📂 [github.com/Viraj281105](https://github.com/Viraj281105)
🔗 Project: [github.com/Viraj281105/FloatChat](https://github.com/Viraj281105/FloatChat)
