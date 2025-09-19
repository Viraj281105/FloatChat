# FloatChat 🌊

FloatChat is an AI-powered conversational platform for exploring global oceanographic data from the ARGO float network. Ask questions in natural language and get instant insights, analysis, and visualizations about the state of our oceans.

## ✨ Features

  * **Conversational AI:** Interact with vast datasets using plain English. No code required.
  * **Global Ocean Coverage:** Access real-time data from thousands of active ARGO floats across all major ocean basins.
  * **Advanced Analytics:** Get AI-powered insights and trend analysis for temperature, salinity, and other key ocean parameters.
  * **On-the-Fly Visualizations:** Generate charts and maps directly from your conversation.

## 🛠️ Technology Stack

  * **Frontend:** React, Vite, TypeScript, Tailwind CSS
  * **Backend:** Python, FastAPI
  * **Database:** Supabase (PostgreSQL)
  * **AI:** Retrieval-Augmented Generation (RAG) pipelines

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

  * [Git](https://git-scm.com/)
  * [Python](https://www.python.org/downloads/) (version 3.9+)
  * [Node.js](https://nodejs.org/) (version 18+) and npm

### ⚙️ Installation & Setup

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

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please follow these steps.

1.  **Fork the Project**
    Click the 'Fork' button in the top right of the repository page. This creates your own copy of the project.

2.  **Clone Your Fork**

    ```bash
    git clone https://github.com/your-username/FloatChat.git
    ```

3.  **Create your Feature Branch**
    Create a new branch to work on your feature or bug fix.

    ```bash
    git checkout -b feature/AmazingFeature
    ```

4.  **Commit your Changes**
    Make your changes and commit them with a descriptive message.

    ```bash
    git add .
    git commit -m "Add some AmazingFeature"
    ```

5.  **Push to the Branch**
    Push your changes up to your forked repository on GitHub.

    ```bash
    git push origin feature/AmazingFeature
    ```

6.  **Open a Pull Request**
    Go to your repository on GitHub and click the 'Compare & pull request' button to open a new Pull Request to the original repository.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Viraj - [@your\_twitter\_handle](https://www.google.com/search?q=https://twitter.com/your_twitter_handle)

Project Link: [https://github.com/Viraj281105/FloatChat](https://www.google.com/search?q=https://github.com/Viraj281105/FloatChat)
