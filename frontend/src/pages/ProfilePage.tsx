import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Save, Camera, Mail, Building, Key, Copy, Check, 
  Settings2, Activity, ShieldCheck, HelpCircle, HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
  email: string;
  full_name: string;
  organization: string;
  role: string;
  bio: string;
  avatar?: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  
  // Profile Form state
  const [profile, setProfile] = useState<ProfileData>({
    email: user?.email || 'researcher@oceans.org',
    full_name: user?.name || 'Sir',
    organization: 'Global Oceanographic Association',
    role: 'Researcher',
    bio: 'Dedicated to studying northern Indian Ocean temperature anomalies and salinity profiles.',
    avatar: '',
  });

  // User preferences states
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [salinityUnit, setSalinityUnit] = useState<'PSU' | 'PPT'>('PSU');
  const [enableLogs, setEnableLogs] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // API Token states
  const [apiKey, setApiKey] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const generateApiKey = () => {
    const randomString = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
    const newKey = `fc_live_${randomString}`;
    setApiKey(newKey);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    alert('Settings and profile saved successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-slate-50 text-slate-800 font-sans"
    >
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 p-6 -mx-6 -mt-6 shadow-sm mb-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Account Mainframe</h1>
            <p className="text-slate-500 text-sm">Configure system details, credentials, and scientific preferences</p>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Queries</p>
              <h3 className="text-xl font-bold text-slate-800">142</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reports Compiled</p>
              <h3 className="text-xl font-bold text-slate-800">8</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">API Call quota</p>
              <h3 className="text-xl font-bold text-slate-800">92% Remaining</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Clearance</p>
              <h3 className="text-xl font-bold text-slate-800">Level 1 (Admin)</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form & Basic Settings Column */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Scientist Profile</h2>
                  <p className="text-xs text-slate-500">Edit your public details and organizational credentials</p>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition-all">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{profile.full_name || 'Your Name'}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{profile.role || 'Your Role'}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={profile.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Organization</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="organization"
                        value={profile.organization}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        readOnly
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Role</label>
                    <select
                      name="role"
                      value={profile.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:bg-white"
                    >
                      <option>Researcher</option>
                      <option>Student</option>
                      <option>Policymaker</option>
                      <option>Data Analyst</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Research Background</label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:bg-white resize-none"
                    placeholder="Tell us about your research interests or work..."
                  />
                </div>

                <div className="flex justify-end pt-5 border-t border-slate-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Preferences & Developer Keys Column */}
          <div className="space-y-6">
            
            {/* Scientific Preferences */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="pb-4 border-b border-slate-100 mb-5 flex items-center space-x-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-md font-bold text-slate-800">Preferences</h2>
              </div>

              <div className="space-y-4">
                {/* Temperature Unit */}
                <div className="flex justify-between items-center py-1">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Temperature Unit</p>
                    <p className="text-[10px] text-slate-400">Preferred scientific metrics</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button onClick={() => setTempUnit('C')} className={`px-3 py-1 text-xs font-bold rounded-md ${tempUnit === 'C' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>°C</button>
                    <button onClick={() => setTempUnit('F')} className={`px-3 py-1 text-xs font-bold rounded-md ${tempUnit === 'F' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>°F</button>
                  </div>
                </div>

                {/* Salinity Unit */}
                <div className="flex justify-between items-center py-1">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Salinity Standard</p>
                    <p className="text-[10px] text-slate-400">Measurement formats</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button onClick={() => setSalinityUnit('PSU')} className={`px-3 py-1 text-xs font-bold rounded-md ${salinityUnit === 'PSU' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>PSU</button>
                    <button onClick={() => setSalinityUnit('PPT')} className={`px-3 py-1 text-xs font-bold rounded-md ${salinityUnit === 'PPT' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>PPT</button>
                  </div>
                </div>

                {/* Debug HUD Toggle */}
                <div className="flex justify-between items-center py-1">
                  <div>
                    <p className="text-xs font-bold text-slate-800">HUD Console</p>
                    <p className="text-[10px] text-slate-400">Show telemetry debug panels</p>
                  </div>
                  <button onClick={() => setEnableLogs(p => !p)} className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ${enableLogs ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${enableLogs ? 'transform translate-x-4' : ''}`} />
                  </button>
                </div>

                {/* System Alerts Toggle */}
                <div className="flex justify-between items-center py-1">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Sensor Warning alerts</p>
                    <p className="text-[10px] text-slate-400">Notify anomalies detected</p>
                  </div>
                  <button onClick={() => setSystemAlerts(p => !p)} className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ${systemAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${systemAlerts ? 'transform translate-x-4' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Developer Keys */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="pb-4 border-b border-slate-100 mb-5 flex items-center space-x-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h2 className="text-md font-bold text-slate-800">Mainframe REST Token</h2>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate tokens to interact with the FloatChat REST API programmatically. Keep keys secure.
                </p>

                {apiKey ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono select-all overflow-hidden truncate">
                      {apiKey}
                    </div>
                    <button onClick={copyToClipboard} className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="h-10 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 font-semibold select-none">
                    No active credentials
                  </div>
                )}

                <button onClick={generateApiKey} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-center space-x-2">
                  <span>Generate API Key</span>
                </button>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default ProfilePage;
