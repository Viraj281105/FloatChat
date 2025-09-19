import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, MapPin, 
  Plus, Search, Filter, Clock, Share2, Eye, 
  Thermometer, Droplets, Activity
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  region: string;
  parameters: string[];
  dateRange: string;
  createdAt: Date;
  size: string;
  format: 'PDF' | 'NetCDF' | 'CSV';
}

const ReportsPage = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);

  const [reports] = useState<Report[]>([
    {
      id: '1',
      title: 'North Atlantic Temperature Analysis',
      region: 'North Atlantic',
      parameters: ['Temperature', 'Salinity'],
      dateRange: '2024-01 to 2024-06',
      createdAt: new Date('2024-12-10'),
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: '2',
      title: 'Pacific Ocean BGC Parameters',
      region: 'Pacific Ocean',
      parameters: ['Oxygen', 'Chlorophyll', 'pH'],
      dateRange: '2024-01 to 2024-12',
      createdAt: new Date('2024-12-05'),
      size: '15.7 MB',
      format: 'NetCDF'
    },
    {
      id: '3',
      title: 'Global Salinity Anomalies',
      region: 'Global Ocean',
      parameters: ['Salinity', 'Temperature'],
      dateRange: '2023-01 to 2024-12',
      createdAt: new Date('2024-11-28'),
      size: '8.2 MB',
      format: 'CSV'
    }

  ]);

  const parameters = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-orange-400' },
    { id: 'salinity', label: 'Salinity', icon: Droplets, color: 'text-blue-400' },
    { id: 'oxygen', label: 'Dissolved O₂', icon: Activity, color: 'text-green-400' },
    { id: 'chlorophyll', label: 'Chlorophyll', icon: Activity, color: 'text-emerald-400' },
    { id: 'ph', label: 'pH Level', icon: Activity, color: 'text-purple-400' },
    { id: 'nitrate', label: 'Nitrate', icon: Activity, color: 'text-indigo-400' },
  ];

  const regions = [
    'Global Ocean', 'North Atlantic', 'South Atlantic', 'North Pacific',
    'South Pacific', 'Indian Ocean', 'Arctic Ocean', 'Mediterranean Sea', 'Arabian Sea'
  ];

  const formats = [
    { id: 'PDF', label: 'PDF Report', description: 'Visual report with charts' },
    { id: 'NetCDF', label: 'NetCDF', description: 'Scientific data format' },
    { id: 'CSV', label: 'CSV Data', description: 'Spreadsheet compatible' },
  ];

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleParameterToggle = (paramId: string) => {
    setSelectedParameters(prev =>
      prev.includes(paramId)
        ? prev.filter(id => id !== paramId)
        : [...prev, paramId]
    );
  };

  const generateReport = () => {
    console.log('Generating report with:', {
      region: selectedRegion,
      parameters: selectedParameters,
      format: selectedFormat
    });
    alert('Report generation started! This is a demo - check console for details.');
    setShowGenerator(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 min-h-screen bg-[#066FC1]"
    >
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-cyan-500/20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Ocean Data Reports</h1>
              <p className="text-slate-400">Generate and manage comprehensive ocean analysis reports</p>
            </div>
           
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerator(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Generate New Report</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search and Filters */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-600/50 rounded-lg text-slate-300 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
         
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-3 bg-slate-900/80 text-slate-300 rounded-lg hover:bg-slate-600/50 hover:text-cyan-400 transition-all duration-200"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </motion.button>
        </motion.div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    report.format === 'PDF' ? 'bg-red-500/20' :
                    report.format === 'NetCDF' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                    <FileText className={`w-6 h-6 ${
                      report.format === 'PDF' ? 'text-red-400' :
                      report.format === 'NetCDF' ? 'text-blue-400' : 'text-green-400'
                    }`} />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.format === 'PDF' ? 'bg-red-500/20 text-red-400' :
                    report.format === 'NetCDF' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {report.format}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-200">
                  {report.title}
                </h3>
               
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{report.region}</span>
                  </div>
                 
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{report.dateRange}</span>
                  </div>
                 
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Created {report.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Parameters:</p>
                  <div className="flex flex-wrap gap-1">
                    {report.parameters.map((param, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
                      >
                        {param}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4">{report.size}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                   
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-200"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                 
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-sm rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No reports found</h3>
            <p className="text-slate-500">Try adjusting your search terms or create a new report</p>
          </motion.div>
        )}
      </div>

      {/* Report Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-slate-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Generate New Report</h2>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Region Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option value="">Choose a region...</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* Parameters Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select Parameters
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {parameters.map(param => {
                      const Icon = param.icon;
                      const isSelected = selectedParameters.includes(param.id);
                     
                      return (
                        <motion.button
                          key={param.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleParameterToggle(param.id)}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                              : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${param.color}`} />
                          <p className="text-sm font-medium">{param.label}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Output Format
                  </label>
                  <div className="space-y-2">
                    {formats.map(format => (
                      <motion.button
                        key={format.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                          selectedFormat === format.id
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                        }`}
                      >
                        <p className="font-medium">{format.label}</p>
                        <p className="text-sm opacity-75">{format.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setShowGenerator(false)}
                    className="px-6 py-3 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                 
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateReport}
                    disabled={!selectedRegion || selectedParameters.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Generate Report
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportsPage;