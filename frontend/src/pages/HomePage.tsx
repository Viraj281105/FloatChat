import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Waves, MessageCircle, BarChart3, Globe, Database, 
  TrendingUp, Users, ArrowRight, Calendar, Thermometer
} from 'lucide-react';

// Using home-logo for the homepage content
import homeLogo from '../assets/images/hero-logo.png';
import heroLogo from '../assets/images/hero-logo.png';

// Type definition for the VANTA.js global object
declare const VANTA: {
  WAVES: (options: Record<string, unknown>) => { destroy: () => void };
};

const HomePage = () => {
  const heroRef = useRef(null);

  // useEffect hook for VANTA.js animated background
  useEffect(() => {
    let vantaEffect: { destroy: () => void } | null = null;
    
    if (typeof VANTA !== 'undefined' && heroRef.current) {
      try {
        vantaEffect = VANTA.WAVES({
          el: heroRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x428b,
          shininess: 75.00,
          waveHeight: 30.00,
          waveSpeed: 0.80,
          zoom: 0.65
        });
      } catch (error) {
        console.error('VANTA.js failed to initialize:', error);
      }
    }

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, []);

  const infoCards = [
    { title: '15,847', subtitle: 'Active ARGO Floats', icon: Waves, color: 'from-cyan-500 to-blue-500' },
    { title: 'Dec 15, 2024', subtitle: 'Latest Data Update', icon: Calendar, color: 'from-blue-500 to-indigo-500' },
    { title: '12', subtitle: 'Key Parameters', icon: Thermometer, color: 'from-indigo-500 to-purple-500' },
    { title: '2M+', subtitle: 'Ocean Profiles', icon: Database, color: 'from-purple-500 to-pink-500' },
  ];

  const features = [
    { icon: Globe, title: 'Global Ocean Coverage', description: 'Access real-time data from ARGO floats across all major ocean basins worldwide.' },
    { icon: TrendingUp, title: 'Advanced Analytics', description: 'AI-powered insights and trend analysis for temperature, salinity, and biogeochemical parameters.' },
    { icon: Users, title: 'Research Collaboration', description: 'Tools designed for researchers, policymakers, and students to explore ocean data together.' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16"
    >
      {/* Hero Section with VANTA.js ref */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <div className="relative z-20 max-w-4xl mx-auto px-4 text-center mt-24">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-8">
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="inline-block mb-6">
              <img src={homeLogo} alt="FloatChat Hero Logo" className="w-40 h-auto" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              FloatChat
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-4">
              AI Powered Ocean Data Chatbot
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Explore the world's ocean data through natural conversation. 
              Get instant insights from ARGO float measurements with AI-powered analysis.
            </p>
          </motion.div>

          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/chat">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(34, 211, 238, 0.3)" }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
                <MessageCircle className="w-5 h-5" />
                <span>Try the Chatbot</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/dashboard">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)" }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-slate-800/50 text-slate-200 font-semibold rounded-xl flex items-center justify-center space-x-2 border border-slate-600 hover:border-blue-400 hover:text-blue-400 backdrop-blur-sm transition-all duration-300">
                <BarChart3 className="w-5 h-5" />
                <span>Explore Visualizations</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Info Cards Section with blue background */}
      <section className="relative z-10 py-20 px-4 bg-[#066FC1]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ocean Data at Your Fingertips
            </h2>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto">
              Access comprehensive ocean measurements from the global ARGO float network
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {infoCards.map((card, index) => (
              <motion.div key={index} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -10, scale: 1.02 }} viewport={{ once: true }} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${card.color} mb-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-slate-400">{card.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FloatChat Section */}
      <section className="relative z-10 py-20 px-4 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose FloatChat?
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Making ocean science accessible to researchers, policymakers, and students worldwide
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: index * 0.2 }} whileHover={{ y: -10 }} viewport={{ once: true }} className="text-center group">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 2.0 }} className="inline-flex p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full mb-6 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-cyan-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative z-10 py-16 px-4 bg-[#066FC1] border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img src={homeLogo} alt="FloatChat Logo" className="w-9 h-9" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-100 to-blue-100 bg-clip-text text-transparent">
                FloatChat
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <Link to="/reports" className="text-slate-200 hover:text-cyan-100 transition-colors duration-200">Reports</Link>
              <a href="#" className="text-slate-200 hover:text-cyan-100 transition-colors duration-200">Documentation</a>
              <a href="#" className="text-slate-200 hover:text-cyan-100 transition-colors duration-200">Contact</a>
              <a href="#" className="text-slate-200 hover:text-cyan-100 transition-colors duration-200">API</a>
            </div>
            <p className="text-slate-200 text-sm">
              © 2024 FloatChat. Powered by ARGO Global Ocean Observing System.
            </p>
          </motion.div>
        </div>
      </footer>
    </motion.div>
  );
};

export default HomePage;