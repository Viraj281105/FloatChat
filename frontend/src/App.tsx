import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import the auth components
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Navigation />
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/chat" element={<ChatbotPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;