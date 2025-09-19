import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Layers } from 'lucide-react';

const DashboardPage = () => {
  const [selectedParameter, setSelectedParameter] = useState('temperature');
  const [dateRange, setDateRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('global');

  const floatLocations = [
    { lat: 25.5, lng: -80.2, id: 'ARGO_001' },
    { lat: 35.8, lng: -75.4, id: 'ARGO_002' },
    { lat: 42.1, lng: -71.0, id: 'ARGO_003' },
    { lat: 38.9, lng: -77.0, id: 'ARGO_004' },
  ];

  const parameters = [
    { id: 'temperature', label: 'Temperature', unit: '°C', color: '#F59E0B' },
    { id: 'salinity', label: 'Salinity', unit: 'PSU', color: '#3B82F6' },
    { id: 'oxygen', label: 'Dissolved O₂', unit: 'μmol/kg', color: '#10B981' },
    { id: 'chlorophyll', label: 'Chlorophyll', unit: 'mg/m³', color: '#8B5CF6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-[#066FC1]"
    >
      {/* Header */}
      <div className="bg-[#182a45]/80 backdrop-blur-sm border-b border-[#2a3c5a] p-6">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Ocean Data Dashboard</h1>
            <p className="text-slate-400">Interactive exploration of ARGO float measurements</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#182a45] rounded-xl p-6 border border-[#2a3c5a] sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>

              {/* Parameter Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Parameter</label>
                <div className="space-y-2">
                  {parameters.map((param) => (
                    <motion.button
                      key={param.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedParameter(param.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        selectedParameter === param.id
                          ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                          : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: param.color }}
                        />
                        <div>
                          <p className="font-medium">{param.label}</p>
                          <p className="text-sm opacity-75">{param.unit}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                >
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="5years">Last 5 Years</option>
                </select>
              </div>

              {/* Region Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                >
                  <option value="global">Global Ocean</option>
                  <option value="atlantic">North Atlantic</option>
                  <option value="pacific">Pacific</option>
                  <option value="indian">Indian Ocean</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Main Content - Map */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#182a45] rounded-xl p-6 border border-[#2a3c5a]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">ARGO Float Locations</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Live Data</span>
                </div>
              </div>
              
              {/* Map container */}
              <div className="h-[75vh] bg-gradient-to-br from-blue-900/50 to-slate-800/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-slate-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Interactive Map View</p>
                  <p className="text-sm">Showing {floatLocations.length} active floats</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {floatLocations.map((float) => (
                      <div key={float.id} className="bg-slate-700/50 p-2 rounded">
                        <p className="font-medium">{float.id}</p>
                        <p className="opacity-75">{float.lat}°N, {Math.abs(float.lng)}°W</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;