import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Edit3, Camera, Mail, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
  email: string;
  full_name: string;
  organization: string;
  role: string;
  bio: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    email: user?.email || '',
    full_name: user?.name || '',
    organization: '',
    role: 'Researcher',
    bio: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Mock save - replace with actual API call
    console.log('Saving profile:', profile);
    alert('Profile updated successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-[#066FC1]"
    >
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50"
        >
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
              <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-slate-700 rounded-full border-2 border-slate-600 hover:bg-slate-600">
                  <Camera className="w-4 h-4 text-slate-200" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{profile.full_name || 'Your Name'}</h3>
                <p className="text-slate-400">{profile.role || 'Your Role'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="organization"
                    value={profile.organization}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    className="w-full pl-10 pr-4 p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select 
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea
                rows={4}
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none resize-none"
                placeholder="Tell us about your research interests or work..."
              />
            </div>
            
            <div className="flex justify-end pt-6 border-t border-slate-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;