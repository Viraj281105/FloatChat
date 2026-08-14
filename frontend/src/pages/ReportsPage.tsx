import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, MapPin,
  Plus, Search, Clock, Share2, Eye, X,
  Thermometer, Droplets, Activity, FileSpreadsheet
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

const parametersList = [
  { id: 'Temperature', label: 'Temperature', icon: Thermometer, color: 'text-orange-500 bg-orange-50' },
  { id: 'Salinity', label: 'Salinity', icon: Droplets, color: 'text-blue-500 bg-blue-50' },
  { id: 'Oxygen', label: 'Dissolved O₂', icon: Activity, color: 'text-emerald-500 bg-emerald-50' },
  { id: 'Chlorophyll', label: 'Chlorophyll', icon: Activity, color: 'text-green-500 bg-green-50' },
];

const regions = [
  'Global Ocean', 'North Atlantic', 'South Atlantic', 'North Pacific',
  'South Pacific', 'Indian Ocean', 'Arctic Ocean', 'Mediterranean Sea', 'Arabian Sea'
];

const formats = [
  { id: 'PDF', label: 'PDF Report', description: 'Visual document with charts' },
  { id: 'NetCDF', label: 'NetCDF Format', description: 'Scientific multidimensional grid' },
  { id: 'CSV', label: 'CSV Dataset', description: 'Spreadsheet compatible raw data' },
];

const ReportsPage = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<Report['format']>('PDF');
  const [selectedRegion, setSelectedRegion] = useState('Global Ocean');
  const [selectedParameters, setSelectedParameters] = useState<string[]>(['Temperature']);
  const [reportTitle, setReportTitle] = useState('');
  const [dateRange, setDateRange] = useState('6months');

  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'North Atlantic Temperature Analysis',
      region: 'North Atlantic',
      parameters: ['Temperature', 'Salinity'],
      dateRange: 'Last 6 Months',
      createdAt: new Date('2026-08-10'),
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: '2',
      title: 'Pacific Ocean BGC Parameters',
      region: 'North Pacific',
      parameters: ['Oxygen', 'Chlorophyll'],
      dateRange: 'Last Year',
      createdAt: new Date('2026-08-05'),
      size: '15.7 MB',
      format: 'NetCDF'
    },
    {
      id: '3',
      title: 'Global Salinity Anomalies',
      region: 'Global Ocean',
      parameters: ['Salinity', 'Temperature'],
      dateRange: 'Last 5 Years',
      createdAt: new Date('2026-07-28'),
      size: '8.2 MB',
      format: 'CSV'
    }
  ]);

  const handleParameterToggle = (paramId: string) => {
    setSelectedParameters(prev =>
      prev.includes(paramId) ? prev.filter(id => id !== paramId) : [...prev, paramId]
    );
  };

  const filteredReports = reports.filter(report => {
    return report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.region.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const generateReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      title: reportTitle.trim() || `${selectedRegion} Custom Analysis`,
      region: selectedRegion,
      parameters: selectedParameters,
      dateRange: dateRange === '6months' ? 'Last 6 Months' : dateRange === '1year' ? 'Last Year' : 'Last 5 Years',
      createdAt: new Date(),
      size: selectedFormat === 'PDF' ? '1.8 MB' : selectedFormat === 'NetCDF' ? '12.4 MB' : '4.1 MB',
      format: selectedFormat
    };

    setReports(prev => [newReport, ...prev]);
    setShowGenerator(false);
    
    // Reset inputs
    setReportTitle('');
    setSelectedRegion('Global Ocean');
    setSelectedParameters(['Temperature']);
    setSelectedFormat('PDF');
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGenerator(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-16 min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 p-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Ocean Data Reports</h1>
            <p className="text-slate-500 text-sm">Generate and manage comprehensive ocean analysis reports</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGenerator(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Generate New Report</span>
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search */}
        <motion.div className="mb-8 flex flex-col md:flex-row gap-4" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title or region..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-450 focus:border-blue-500/80 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] focus:outline-none transition-all duration-300 text-sm"
            />
          </div>
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
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-all duration-300 group flex flex-col justify-between h-96"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      report.format === 'PDF' ? 'bg-red-50' :
                      report.format === 'NetCDF' ? 'bg-blue-50' : 'bg-emerald-50'
                    }`}>
                      {report.format === 'CSV' ? (
                        <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <FileText className={`w-6 h-6 ${
                          report.format === 'PDF' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      report.format === 'PDF' ? 'bg-red-50 text-red-700 border border-red-100' :
                      report.format === 'NetCDF' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {report.format}
                    </span>
                  </div>

                  <h3 className="text-md font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {report.title}
                  </h3>

                  <div className="space-y-2 mb-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{report.region}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{report.dateRange}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{report.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Parameters:</p>
                    <div className="flex flex-wrap gap-1">
                      {report.parameters.map((param, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-medium">
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">{report.size}</span>
                    <div className="flex items-center space-x-2">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg hover:bg-blue-100 transition-all duration-200">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredReports.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">No reports found</h3>
            <p className="text-sm text-slate-400">Try adjusting your search criteria or generate a new report</p>
          </motion.div>
        )}
      </div>

      {/* Report Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowGenerator(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg border border-slate-200 shadow-xl flex flex-col justify-between max-h-[90vh]">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">Generate Report</h2>
                </div>
                <button onClick={() => setShowGenerator(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 flex-grow scrollbar-thin">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Report Title</label>
                  <input
                    type="text"
                    placeholder="e.g. North Atlantic Salinity Report"
                    value={reportTitle}
                    onChange={e => setReportTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Region</label>
                  <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none">
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Temporal Range</label>
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none">
                    <option value="6months">Last 6 Months</option>
                    <option value="1year">Last Year</option>
                    <option value="5years">Last 5 Years</option>
                  </select>
                </div>

                {/* Parameters */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Parameters to Include</label>
                  <div className="grid grid-cols-2 gap-2">
                    {parametersList.map(p => {
                      const isSelected = selectedParameters.includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => handleParameterToggle(p.id)}
                          className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition-all ${
                            isSelected ? 'bg-blue-50/50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                          <div className={`p-1.5 rounded ${p.color}`}>
                            <p.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Output Format</label>
                  <div className="space-y-2">
                    {formats.map(f => {
                      const isSelected = selectedFormat === f.id;
                      return (
                        <button key={f.id} type="button" onClick={() => setSelectedFormat(f.id as any)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                            isSelected ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                          <div>
                            <p className="text-xs font-bold">{f.label}</p>
                            <p className="text-[10px] opacity-75">{f.description}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-slate-350'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 mt-5">
                <button type="button" onClick={() => setShowGenerator(false)} className="w-1/2 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={generateReport} disabled={selectedParameters.length === 0}
                  className="w-1/2 py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Generate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportsPage;
