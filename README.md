# FloatChat 🌊

FloatChat is an AI-powered conversational platform for exploring global oceanographic data from the ARGO float network. Ask questions in natural language and get instant insights, analysis, and visualizations about the state of our oceans.

## ✨ Features

  * **Conversational AI:** Interact with vast datasets using plain English. No code required.
  * **Global Ocean Coverage:** Access real-time data from thousands of active ARGO floats across all major ocean basins.
  * **Advanced Analytics:** Get AI-powered insights and trend analysis for temperature, salinity, and other key ocean parameters.
  * **On-the-Fly Visualizations:** Generate charts and maps directly from your conversation.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

  * [Git](https://git-scm.com/)
  * [Python](https://www.python.org/downloads/) (version 3.9+)
  * [Node.js](https://nodejs.org/) (version 18+) and npm

### 🛠️ Installation & Setup

Follow these steps to set up your local development environment.

**1. Clone the Repository**

First, clone the project from GitHub to your local machine.

```bash
git clone https://github.com/Viraj281105/FloatChat.git
cd FloatChat
```

**2. Set Up the Backend (Python)**

The backend is powered by FastAPI. We'll set up a virtual environment to manage its dependencies.

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt
```

> **Developer Note:** If `requirements.txt` is missing, you can create it from the original machine by running `pip freeze > requirements.txt` inside the activated backend environment.

**3. Set Up the Frontend (React)**

The frontend is a React application built with Vite.

```bash
# Navigate to the frontend directory from the root
cd frontend

# Install the required npm packages
npm install
```

**4. Set Up Environment Variables**

You will need to create `.env` files for both the frontend and backend to store your secret keys (like your Supabase API keys).

  * In the `frontend` folder, create a file named `.env.local`.
  * In the `backend` folder, create a file named `.env`.

You will need to add your project-specific variables, like your Supabase URL and anon key, to these files.

*Example `frontend/.env.local`:*

```
VITE_SUPABASE_URL="https://your-project-url.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

-----

## ධ Running the Application

You'll need to run the backend and frontend servers in separate terminals.

**1. Start the Backend Server**

  * Open a terminal and navigate to the `backend` directory.
  * Make sure your Python virtual environment is activated.
  * Run the Uvicorn server:

<!-- end list -->

```bash
# Make sure you are in the /backend folder and the venv is active
uvicorn main:app --reload
```

The backend API should now be running, typically at `http://127.0.0.1:8000`.

**2. Start the Frontend Development Server**

  * Open a **new** terminal and navigate to the `frontend` directory.
  * Run the Vite development server:

<!-- end list -->

```bash
# Make sure you are in the /frontend folder
npm run dev
```

The React application should now be running. You can view it in your browser at `http://localhost:5173`.
