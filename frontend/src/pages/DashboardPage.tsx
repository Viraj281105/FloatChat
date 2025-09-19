import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Layers, AlertTriangle, Loader } from 'lucide-react';

// NEW: Import the Plotly component
import Plot from 'react-plotly.js';

// --- Type definitions (simplified for this approach) ---
type ErrorDisplayProps = {
  message: string | null;
};

// --- Helper Components ---
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

const parameters = [
    { id: 'temperature', label: 'Temperature', unit: '°C', color: '#F59E0B' },
    { id: 'salinity', label: 'Salinity', unit: 'PSU', color: '#3B82F6' },
    { id: 'oxygen', label: 'Dissolved O₂', unit: 'μmol/kg', color: '#10B981' },
    { id: 'chlorophyll', label: 'Chlorophyll', unit: 'mg/m³', color: '#8B5CF6' },
];

const DashboardPage = () => {
  const [selectedParameter, setSelectedParameter] = useState('temperature');
  const [dateRange, setDateRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('global');

  // MODIFIED: State to hold the Plotly figure JSON. 'any' is acceptable here.
  const [plotFigure, setPlotFigure] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisualizationData = async () => {
      setIsLoading(true);
      setError(null);
      setPlotFigure(null); // Clear previous plot

      try {
        const response = await fetch('http://localhost:8000/visualize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parameter: selectedParameter,
            date_range: dateRange,
            region: selectedRegion,
          }),
        });
        
        // The entire response body is the Plotly JSON, we parse it directly
        const figureJson = await response.json();

        if (!response.ok) {
          // If the server sent a JSON error object, use its details
          throw new Error(figureJson.error_details || 'Failed to fetch plot data.');
        }
        
        setPlotFigure(figureJson);

      } catch (err) {
        if (err instanceof Error) {
            console.error("API Error:", err);
            setError(err.message);
        } else {
            console.error("An unknown error occurred:", err);
            setError("An unexpected error occurred. The response may not be valid JSON.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisualizationData();
  }, [selectedParameter, dateRange, selectedRegion]);

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

      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar (No changes here) */}
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Parameter</label>
                <div className="space-y-2">
                  {parameters.map((param) => (
                    <motion.button
                      key={param.id}
                      onClick={() => setSelectedParameter(param.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        selectedParameter === param.id
                          ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                          : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-600/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: param.color }}/>
                        <div>
                          <p className="font-medium">{param.label}</p>
                          <p className="text-sm opacity-75">{param.unit}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Date Range</label>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none">
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="5years">Last 5 Years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Region</label>
                <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 focus:border-cyan-500/50 focus:outline-none">
                  <option value="global">Global Ocean</option>
                  <option value="indian">Indian Ocean</option>
                  <option value="atlantic">North Atlantic</option>
                  <option value="pacific">Pacific</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Main Content - Renders the Plotly Figure */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#182a45] rounded-xl p-6 border border-[#2a3c5a]"
            >
              {isLoading ? ( <LoadingIndicator /> ) 
              : error ? ( <ErrorDisplay message={error} /> ) 
              : plotFigure ? (
                // NEW: Render the Plotly component here
                <Plot
                  data={plotFigure.data}
                  layout={plotFigure.layout}
                  useResizeHandler={true}
                  style={{ width: '100%', height: '75vh' }}
                  config={{ responsive: true }}
                />
              ) : (
                <p>No data available for the selected filters.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;