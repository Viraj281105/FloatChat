import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldAlert, Waves } from 'lucide-react';

const LogoHeader = () => (
  <div className="text-center mb-6">
    <div className="w-12 h-12 mx-auto mb-3 bg-blue-600 rounded-xl flex items-center justify-center shadow-md border border-blue-500/20">
      <Waves className="text-white w-6 h-6 animate-pulse" />
    </div>
    <h1 className="text-2xl text-slate-800 font-bold tracking-wide uppercase">FloatChat Login</h1>
    <p className="text-slate-500 text-xs mt-1">Sign in to access your oceanographic mainframe</p>
  </div>
);

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      if (rememberMe) {
        localStorage.setItem('fc_remember_user', email);
      } else {
        localStorage.removeItem('fc_remember_user');
      }
      navigate('/chat');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform: string) => {
    alert(`Connecting J.A.R.V.I.S. mainframe to your ${platform} profile...`);
    setEmail('researcher@ocean.org');
    setPassword('Password123!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-[#F1F5F9] via-[#F8FAFC] to-[#E2E8F0]"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-xl backdrop-blur-xl"
      >
        <LogoHeader />

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@domain.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500/50"
              />
              <span className="font-semibold">Keep me signed in</span>
            </label>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-md hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-blue-500/10 shadow-sm"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Separator */}
        <div className="relative my-6 select-none">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-mono tracking-wider">Third Party Credentials</span></div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={() => handleSocialLogin('Google')} className="py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center space-x-1.5 shadow-sm">
            <span>Google</span>
          </button>
          <button onClick={() => handleSocialLogin('GitHub')} className="py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center space-x-1.5 shadow-sm">
            <span>GitHub</span>
          </button>
          <button onClick={() => handleSocialLogin('ORCID')} className="py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center space-x-1.5 shadow-sm">
            <span className="text-emerald-600">ORCID</span>
          </button>
        </div>

        {/* Signup redirection link */}
        <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
          Don’t have an account?{' '}
          <Link to="/signup" className="font-bold text-blue-600 hover:underline">
            Register Mainframe
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignInPage;
