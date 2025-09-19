import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, MessageCircle, BarChart3, 
  FileText, User, LogOut, Home 
} from 'lucide-react';

// 1. Import the logo image
import heroLogo from '../assets/images/hero-logo.png';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home, public: true },
    { name: 'Chat', href: '/chat', icon: MessageCircle, public: false },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, public: false },
    { name: 'Reports', href: '/reports', icon: FileText, public: false },
    { name: 'Profile', href: '/profile', icon: User, public: false },
  ];

  const isActive = (href: string) => location.pathname === href;
  const visibleItems = user ? navigationItems : navigationItems.filter(item => item.public);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            {/* 2. Replaced the placeholder div with an img tag */}
            <img className="h-8 w-8" src={heroLogo} alt="FloatChat Logo" />
            <span className="text-white font-bold text-xl">FloatChat</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-300 text-sm">{user.email}</span>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-slate-800 border-t border-slate-700/50"
        >
          <div className="px-4 py-4 space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-700/50">
                <Link
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;