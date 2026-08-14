import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldAlert, Waves, Check, X } from 'lucide-react';

const LogoHeader = () => (
  <div className="text-center mb-6">
    <div className="w-12 h-12 mx-auto mb-3 bg-blue-600 rounded-xl flex items-center justify-center shadow-md border border-blue-500/20">
      <Waves className="text-white w-6 h-6 animate-pulse" />
    </div>
    <h1 className="text-2xl text-slate-800 font-bold tracking-wide uppercase">Register Mainframe</h1>
    <p className="text-slate-500 text-xs mt-1">Create an account to explore ocean data anomalies</p>
  </div>
);

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Password Validation Checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  const getStrength = () => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;
    if (hasUpper) score++;
    
    if (password.length === 0) return { label: 'Empty', color: 'bg-slate-200', text: 'text-slate-400', width: 'w-0' };
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/4' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500', width: 'w-2/4' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-500', width: 'w-full' };
  };

  const strength = getStrength();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength || !hasNumber || !hasSymbol || !hasUpper) {
      setError('Password does not meet mainframe security clearance.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signUp(email, password);
      alert('Registration successful! Access granted. Please sign in.');
      navigate('/signin');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

        <form onSubmit={handleSignUp} className="space-y-4">
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

          {/* Strength Bar */}
          {password && (
            <div className="space-y-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase">
                <span className="text-slate-400">Mainframe Strength:</span>
                <span className={strength.text}>{strength.label}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
              </div>

              {/* Requirement indicators */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-semibold text-slate-500">
                <div className="flex items-center space-x-1.5">
                  {hasMinLength ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  <span>8+ Characters</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  <span>Includes Number</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {hasSymbol ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  <span>Includes Symbol</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {hasUpper ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  <span>Includes Upper</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-md hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-blue-500/10 shadow-sm"
          >
            {isLoading ? 'Creating Mainframe profile...' : 'Register'}
          </button>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
          Already have an account?{' '}
          <Link to="/signin" className="font-bold text-blue-600 hover:underline">
            Mainframe Login
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignUpPage;
