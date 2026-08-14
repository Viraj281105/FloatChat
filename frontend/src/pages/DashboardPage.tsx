import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, AlertTriangle, Loader, RefreshCw, Download, 
  Play, Pause, Compass, Activity, Thermometer, Droplets
} from 'lucide-react';
import Plot from 'react-plotly.js';

type Parameter = {
  id: string;
  label: string;
  unit: string;
  color: string;
};

type ErrorDisplayProps = {
  message: string | null;
};

const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
    <Loader className="w-12 h-12 animate-spin mb-4 text-blue-500" />
    <p className="text-lg font-bold text-slate-700">Generating Visualization...</p>
    <p className="text-sm text-slate-500">Connecting to ocean sensors mainframe.</p>
  </div>
);

const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-red-550">
    <AlertTriangle className="w-12 h-12 mb-4 text-red-600" />
    <p className="text-lg font-bold">Mainframe Connection Interrupted</p>
    <p className="text-sm text-slate-600">{message || "Could not retrieve visualization data."}</p>
  </div>
);

const parameters: Parameter[] = [
  { id: 'temperature', label: 'Temperature', unit: '°C', color: '#F59E0B' },
  { id: 'salinity', label: 'Salinity', unit: 'PSU', color: '#3B82F6' },
  { id: 'oxygen', label: 'Dissolved O₂', unit: 'μmol/kg', color: '#10B981' },
  { id: 'chlorophyll', label: 'Chlorophyll', unit: 'mg/m³', color: '#8B5CF6' },
];

const DashboardPage = () => {
  const [selectedParameter, setSelectedParameter] = useState('temperature');
  const [dateRange, setDateRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [mapFigure, setMapFigure] = useState<any | null>(null);
  const [chartFigure, setChartFigure] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced features states
  const [isRotating, setIsRotating] = useState(false);
  const [activeTab, setActiveTab] = useState<'spatial' | 'temporal'>('spatial');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Auto rotation loop
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setSelectedParameter(prev => {
        const index = parameters.findIndex(p => p.id === prev);
        const nextIndex = (index + 1) % parameters.length;
        return parameters[nextIndex].id;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [isRotating]);

  // Fetch Plot Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setMapFigure(null);
      setChartFigure(null);

      try {
        const res = await fetch('http://localhost:8000/visualize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parameter: selectedParameter,
            date_range: dateRange,
            region: selectedRegion,
            mode: 'dashboard',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error_details || data.message || 'Failed to fetch data.');

        setMapFigure(data.map_figure ? JSON.parse(data.map_figure) : null);
        setChartFigure(data.chart_figure ? JSON.parse(data.chart_figure) : null);

        if (!data.map_figure && !data.chart_figure) setError(data.message || 'No visualization returned.');
      } catch (err: any) {
        console.error("Dashboard API error:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedParameter, dateRange, selectedRegion, reloadTrigger]);

  // Dynamic statistics based on parameter selection
  const getStats = () => {
    switch (selectedParameter) {
      case 'salinity':
        return { max: '36.4 PSU', min: '31.2 PSU', activeNodes: '4,102', anomalyRate: '0.08%' };
      case 'oxygen':
        return { max: '320 μmol/kg', min: '45 μmol/kg', activeNodes: '1,902', anomalyRate: '0.12%' };
      case 'chlorophyll':
        return { max: '8.4 mg/m³', min: '0.02 mg/m³', activeNodes: '1,411', anomalyRate: '0.24%' };
      default:
        return { max: '29.8 °C', min: '3.4 °C', activeNodes: '4,129', anomalyRate: '0.04%' };
    }
  };

  const stats = getStats();

  const handleDownloadFigure = () => {
    alert("Exporting sensor grid coordinates mapping to JSON...");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapFigure || chartFigure));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `floatchat_grid_${selectedParameter}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-16 min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Ocean Data Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">Interactive exploration of ARGO float measurements</p>
          </div>
          
          {/* Autoplay Parameter loop */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRotating(p => !p)}
              className={`flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isRotating 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isRotating ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Loop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 animate-pulse" />
                  <span>Autoplay Parameters</span>
                </>
              )}
            </button>

            <button 
              onClick={() => setReloadTrigger(p => p + 1)}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh dataset sync"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
        
        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-sm flex items-center space-x-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Peak Register</p>
              <h4 className="text-base font-bold text-slate-800">{stats.max}</h4>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-sm flex items-center space-x-3.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Minimum Register</p>
              <h4 className="text-base font-bold text-slate-800">{stats.min}</h4>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-sm flex items-center space-x-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Active Sensors</p>
              <h4 className="text-base font-bold text-slate-800">{stats.activeNodes}</h4>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-sm flex items-center space-x-3.5">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mainframe Anomaly Rate</p>
              <h4 className="text-base font-bold text-slate-800">{stats.anomalyRate}</h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm sticky top-24 space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Filter className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-slate-800">Filters</h2>
              </div>

              {/* Parameter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Target Parameter</label>
                <div className="space-y-2">
                  {parameters.map(p => (
                    <motion.button key={p.id} onClick={() => setSelectedParameter(p.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 border ${selectedParameter === p.id ? 'bg-blue-50 border-blue-200/50 text-blue-800 shadow-sm' : 'bg-slate-50 border-transparent text-slate-650 hover:bg-slate-100'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <div>
                          <p className="font-bold text-xs uppercase tracking-wide">{p.label}</p>
                          <p className="text-[10px] opacity-75">{p.unit}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Date Range</label>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:border-blue-500 focus:outline-none text-xs font-bold">
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="5years">Last 5 Years</option>
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Region</label>
                <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:border-blue-500 focus:outline-none text-xs font-bold">
                  <option value="global">Global Ocean</option>
                  <option value="indian">Indian Ocean</option>
                  <option value="atlantic">North Atlantic</option>
                  <option value="pacific">Pacific Ocean</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* View Toggles Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex justify-between items-center">
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button onClick={() => setActiveTab('spatial')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${activeTab === 'spatial' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Spatial Heatmap</button>
                <button onClick={() => setActiveTab('temporal')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${activeTab === 'temporal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`} disabled={!chartFigure}>Temporal Depth Profile</button>
              </div>
              <button 
                onClick={handleDownloadFigure} 
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors border border-blue-100 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Plots wrapper */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm overflow-hidden">
              {isLoading ? (
                <LoadingIndicator />
              ) : error ? (
                <ErrorDisplay message={error} />
              ) : activeTab === 'spatial' && mapFigure ? (
                <Plot data={mapFigure.data} layout={mapFigure.layout} useResizeHandler style={{ width: '100%', height: '70vh' }} config={{ responsive: true }} />
              ) : activeTab === 'temporal' && chartFigure ? (
                <Plot data={chartFigure.data} layout={chartFigure.layout} useResizeHandler style={{ width: '100%', height: '70vh' }} config={{ responsive: true }} />
              ) : (
                <p className="text-slate-500 font-medium">No visualization data available for selection.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
