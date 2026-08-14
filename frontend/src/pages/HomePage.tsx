import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Waves, MessageCircle, BarChart3, Globe, Database, 
  TrendingUp, Users, ArrowRight, Calendar, Thermometer,
  Terminal, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, Droplets, Info
} from 'lucide-react';

// Home logo
import homeLogo from '../assets/images/hero-logo.png';

// VANTA.js typing
declare global {
  interface Window {
    VANTA: any;
  }
}

interface Telemetry {
  id: string;
  temp: string;
  salinity: string;
  location: string;
  status: string;
}

const initialTelemetry: Telemetry[] = [
  { id: '#29482', temp: '21.4°C', salinity: '35.4 PSU', location: 'Arabian Sea', status: 'SYNCHRONIZED' },
  { id: '#48201', temp: '14.2°C', salinity: '34.8 PSU', location: 'North Atlantic', status: 'RECEIVING' },
  { id: '#91823', temp: '8.7°C', salinity: '34.2 PSU', location: 'Pacific Ocean', status: 'STANDBY' },
  { id: '#10394', temp: '26.8°C', salinity: '33.5 PSU', location: 'Bay of Bengal', status: 'SYNCHRONIZED' },
];

const basins = [
  {
    id: 'arabian',
    name: 'Arabian Sea',
    temp: '24°C - 28°C',
    salinity: '35.5 - 36.5 PSU',
    currents: 'Somali Current, Arabian Sea Monsoon Current',
    features: 'Strong seasonal reversing monsoons, upwelling zones supporting rich marine food webs.',
  },
  {
    id: 'bay',
    name: 'Bay of Bengal',
    temp: '25°C - 29°C',
    salinity: '31.0 - 34.0 PSU',
    currents: 'East India Coastal Current, Monsoon Drift',
    features: 'High freshwater influx from major river basins causing strong stratification.',
  },
  {
    id: 'atlantic',
    name: 'North Atlantic',
    temp: '4°C - 20°C',
    salinity: '34.5 - 35.5 PSU',
    currents: 'Gulf Stream, North Atlantic Current',
    features: 'Crucial driver of global thermohaline ocean circulation and heat distribution.',
  },
  {
    id: 'pacific',
    name: 'Pacific Ocean',
    temp: '2°C - 28°C',
    salinity: '34.0 - 35.0 PSU',
    currents: 'Kuroshio Current, California Current',
    features: 'Deepest ocean basin, home to the Mariana Trench and major climate cycles (ENSO).',
  }
];

const faqs = [
  {
    q: "How does the FloatAdvisor parser process my queries?",
    a: "Our multi-agent routing loop breaks down your prompt into geographic entities, target parameters (like temperature, salinity), and visualization actions. These are processed dynamically using our specialist data and mapping agents."
  },
  {
    q: "What data formats can I export from the reports page?",
    a: "We support PDF reports (for visual summaries and plots), NetCDF grid formats (for scientific multidimensional datasets), and CSV files (for easy analysis in spreadsheets)."
  },
  {
    q: "How frequently is the ARGO float sensor database updated?",
    a: "The telemetry arrays sync automatically on a daily schedule, fetching the latest drift measurements directly from NOAA and global observing systems."
  }
];

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  // States for interactive HUD features
  const [telemetry, setTelemetry] = useState<Telemetry[]>(initialTelemetry);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] Initiating Mainframe secure handshake...",
    "[SYSTEM] Syncing 15,847 ARGO float channels...",
  ]);
  const [selectedBasin, setSelectedBasin] = useState('arabian');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load VANTA.js dynamically
  useEffect(() => {
    if (!window.VANTA || !heroRef.current) return;

    const effect = window.VANTA.WAVES({
      el: heroRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x428b,
      shininess: 75,
      waveHeight: 30,
      waveSpeed: 0.8,
      zoom: 0.65,
    });
    setVantaEffect(effect);

    return () => effect.destroy();
  }, []);

  // Simulate scrolling terminal logs
  useEffect(() => {
    const logPool = [
      "[SYNC] Float #89284 -> Transmitting data packet (0.42kb)...",
      "[INFO] Database update completed. 1,421 profiles synced.",
      "[WARN] Anomaly detected: Node #10293 report high temperature spike.",
      "[SYS] Auto-calibration sequence complete.",
      "[SYNC] Fetching NOAA Coriolis GDAC daily sensor logs..."
    ];

    const interval = setInterval(() => {
      setTerminalLogs(prev => {
        const updated = [...prev, logPool[Math.floor(Math.random() * logPool.length)]];
        return updated.slice(-6); // Keep last 6 lines
      });

      // Update telemetry parameters randomly
      setTelemetry(prev => prev.map(t => {
        if (Math.random() > 0.6) {
          const tempNum = (parseFloat(t.temp) + (Math.random() * 0.4 - 0.2)).toFixed(1);
          return { ...t, temp: `${tempNum}°C` };
        }
        return t;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const infoCards = [
    { title: '15,847', subtitle: 'Active ARGO Floats', icon: Waves, color: 'from-blue-500 to-indigo-500' },
    { title: 'Dec 15, 2024', subtitle: 'Latest Data Update', icon: Calendar, color: 'from-indigo-500 to-purple-500' },
    { title: '12', subtitle: 'Key Parameters', icon: Thermometer, color: 'from-purple-500 to-pink-500' },
    { title: '2M+', subtitle: 'Ocean Profiles', icon: Database, color: 'from-cyan-500 to-blue-500' },
  ];

  const features = [
    { icon: Globe, title: 'Global Ocean Coverage', description: 'Access real-time data from ARGO floats across all major ocean basins worldwide.' },
    { icon: TrendingUp, title: 'Advanced Analytics', description: 'AI-powered insights and trend analysis for temperature, salinity, and biogeochemical parameters.' },
    { icon: Users, title: 'Research Collaboration', description: 'Tools designed for researchers, policymakers, and students to explore ocean data together.' }
  ];

  const currentBasin = basins.find(b => b.id === selectedBasin) || basins[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16"
    >
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 max-w-4xl mx-auto px-4 text-center mt-16 md:mt-24">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-8">
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="inline-block mb-6">
              <img src={homeLogo} alt="FloatChat Hero Logo" className="w-40 h-auto" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              FloatChat
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-4 font-light tracking-wide">
              Scientific Oceanography & AI Advisor Mainframe
            </p>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Query, visualize, and map the global ARGO float network using natural language conversation. Powered by our advanced multi-agent data parser.
            </p>
          </motion.div>

          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/chat">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(34, 211, 238, 0.3)" }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 border border-blue-500/20">
                <MessageCircle className="w-5 h-5" />
                <span>Open FloatAdvisor</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/dashboard">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)" }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 border border-slate-400 hover:border-blue-400 hover:text-blue-400 backdrop-blur-sm transition-all duration-300">
                <BarChart3 className="w-5 h-5" />
                <span>Explore Visualizations</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Telemetry Ticker */}
      <div className="bg-slate-900 border-y border-slate-800 py-3 overflow-hidden select-none z-10 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 text-xs font-mono">
          <div className="flex items-center space-x-2 text-cyan-400 animate-pulse font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>LIVE TRANSITING ARRAY</span>
          </div>
          <div className="flex-1 flex justify-around pl-8 overflow-hidden space-x-4">
            {telemetry.map(t => (
              <span key={t.id} className="text-slate-300">
                <strong className="text-slate-400">{t.id}</strong> ({t.location}): <span className="text-cyan-300">{t.temp}</span> | <span className="text-indigo-300">{t.salinity}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <section className="relative z-10 py-20 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Ocean Data at Your Fingertips
            </h2>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto">
              Access comprehensive ocean measurements from the global ARGO float network
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {infoCards.map((card, index) => (
              <motion.div key={index} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -10, scale: 1.02 }} viewport={{ once: true }} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${card.color} mb-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm font-medium">{card.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Ocean Basins Explorer & Terminal Diagnostics */}
      <section className="relative z-10 py-20 px-4 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Basin Explorer Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="pb-3 border-b border-slate-100 mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Basin Hydrography Explorer</h2>
              <p className="text-sm text-slate-500">Toggle ocean basins to view typical values and currents mapped by FloatAdvisor</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {basins.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBasin(b.id)}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                    selectedBasin === b.id 
                      ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            <motion.div 
              key={selectedBasin}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">{currentBasin.name} Parameters</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Thermometer className="w-5 h-5 text-orange-500 bg-orange-50 p-1 rounded" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Mean Temperature</p>
                      <p className="font-semibold text-slate-700">{currentBasin.temp}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Droplets className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Mean Salinity</p>
                      <p className="font-semibold text-slate-700">{currentBasin.salinity}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Globe className="w-5 h-5 text-purple-500 bg-purple-50 p-1 rounded" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Major Currents</p>
                      <p className="font-semibold text-slate-700">{currentBasin.currents}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Oceanographic Features</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{currentBasin.features}</p>
                </div>
                <Link to="/chat" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 pt-4 md:pt-0">
                  <span>Ask Advisor about this region</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Scrolling Terminal Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-96 select-none font-mono">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-cyan-400 text-xs font-bold">
              <Terminal className="w-4 h-4" />
              <span>HUD SCI-DIAGNOSTIC CORE</span>
            </div>
            
            <div className="flex-1 my-4 overflow-hidden text-[10px] leading-relaxed space-y-2 text-slate-400">
              {terminalLogs.map((log, i) => (
                <div key={i} className={log.includes('[WARN]') ? 'text-amber-400' : log.includes('[SYS]') ? 'text-green-400' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>MAINFRAME: NOMINAL</span>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                <span>ONLINE</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Why Choose FloatChat?
            </h2>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto">
              Making ocean science accessible to researchers, policymakers, and students worldwide
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: index * 0.2 }} whileHover={{ y: -5 }} viewport={{ once: true }} className="text-center group">
                <motion.div className="inline-flex p-4 bg-blue-50 border border-blue-100 rounded-full mb-6 group-hover:bg-blue-100 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific FAQ Accordion */}
      <section className="relative z-10 py-20 px-4 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm">Mainframe routines and data parsing guides</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-5 flex justify-between items-center text-left text-slate-800 hover:bg-slate-100/50 transition-colors font-bold text-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>{faq.q}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-200 px-5 py-4 bg-white text-slate-600 text-xs leading-relaxed"
                      >
                        <p>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-4 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img src={homeLogo} alt="FloatChat Logo" className="w-9 h-9" />
            <span className="text-2xl font-bold text-slate-800">
              FloatChat
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <Link to="/reports" className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors duration-200">Reports</Link>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors duration-200">Documentation</a>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors duration-200">Contact</a>
            <a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors duration-200">API</a>
          </div>
          <p className="text-slate-400 text-xs">
            © 2024 FloatChat. Powered by ARGO Global Ocean Observing System.
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default HomePage;
