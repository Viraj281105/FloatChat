import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, AlertTriangle, Loader } from 'lucide-react';
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
  <div className="flex flex-col items-center justify-center h-[75vh] text-slate-400">
    <Loader className="w-12 h-12 animate-spin mb-4 text-cyan-400" />
    <p className="text-lg">Generating Visualization...</p>
    <p>This may take a moment.</p>
  </div>
);

const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <div className="flex flex-col items-center justify-center h-[75vh] text-red-400">
    <AlertTriangle className="w-12 h-12 mb-4" />
    <p className="text-lg font-semibold">An Error Occurred</p>
    <p>{message || "Could not retrieve visualization data."}</p>
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
  }, [selectedParameter, dateRange, selectedRegion]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-16 min-h-screen bg-[#066FC1]">
      {/* Header */}
      <div className="bg-[#182a45]/80 backdrop-blur-sm border-b border-[#2a3c5a] p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Ocean Data Dashboard</h1>
          <p className="text-slate-400">Interactive exploration of ARGO float measurements</p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="lg:col-span-1">
            <div className="bg-[#182a45] rounded-xl p-6 border border-[#2a3c5a] sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>

              {/* Parameter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Parameter</label>
                <div className="space-y-2">
                  {parameters.map(p => (
                    <motion.button key={p.id} onClick={() => setSelectedParameter(p.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${selectedParameter === p.id ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400' : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-600/30'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                        <div>
                          <p className="font-medium">{p.label}</p>
                          <p className="text-sm opacity-75">{p.unit}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Date Range</label>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none">
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="5years">Last 5 Years</option>
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Region</label>
                <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none">
                  <option value="global">Global Ocean</option>
                  <option value="indian">Indian Ocean</option>
                  <option value="atlantic">North Atlantic</option>
                  <option value="pacific">Pacific</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-[#182a45] rounded-xl p-6 border border-[#2a3c5a]">
              {isLoading ? <LoadingIndicator /> : error ? <ErrorDisplay message={error} /> : mapFigure ? (
                <Plot data={mapFigure.data} layout={mapFigure.layout} useResizeHandler style={{ width: '100%', height: '75vh' }} config={{ responsive: true }} />
              ) : <p className="text-white">No map data available for selected filters.</p>}
            </motion.div>

            {chartFigure && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-[#182a45] rounded-xl p-6 border border-[#2a3c5a]">
                <Plot data={chartFigure.data} layout={chartFigure.layout} useResizeHandler style={{ width: '100%', height: '400px' }} config={{ responsive: true }} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
