import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LogoPlaceholder = () => (
  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-xl">FC</span>
  </div>
);

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50"
      >
        <div className="text-center mb-8">
          <LogoPlaceholder />
          <h1 className="text-3xl text-white font-bold">Welcome Back</h1>
          <p className="text-slate-400">Sign in to access your dashboard.</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        </form>
        <p className="text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-cyan-400 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignInPage;