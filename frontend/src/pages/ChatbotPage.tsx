import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, MessageSquare, Plus, Download, Trash2, AlertCircle, Radio,
  Compass, Map, LineChart, ShieldCheck, Edit3, Check, Type, BookOpen, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendChat } from '../services/api';

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  chat_id: string;
  processing_time?: number;
  source_agent?: string;
  debug_info?: Record<string, unknown>;
}

interface Conversation {
  id: string;
  title: string;
}

const welcomeMessages: string[] = [
  "Good day, Sir. FloatAdvisor online. Oceanographic sensor array is fully synchronized. How may I assist your analysis today?",
  "Greetings. Core database nodes operational. Ready to parse ARGO float parameters on your command, Sir.",
  "System diagnostics are fully green. I stand ready to assist you in charting temperature and salinity metrics, Sir.",
];

const quickActions = [
  {
    icon: Compass,
    title: "Geographic Insights",
    prompt: "Tell me about the key features and currents of the Arabian Sea",
    description: "Analyze currents, bathymetry, and monsoon effects.",
    color: "text-blue-600 bg-blue-50 border-blue-100"
  },
  {
    icon: LineChart,
    title: "Data Insights",
    prompt: "What is the average temperature and salinity across all regions?",
    description: "Fetch statistical summaries from profile measurements.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100"
  },
  {
    icon: Map,
    title: "Visualize Ocean Data",
    prompt: "Show me a map of temperature data in the Bay of Bengal",
    description: "Generate spatial distributions and monthly averages.",
    color: "text-purple-600 bg-purple-50 border-purple-100"
  }
];

const libraryPrompts = [
  { category: "Salinity Profiles", prompts: ["Compare salinity in the North Atlantic vs South Pacific", "How does deep ocean salinity change with pressure?", "What causes low salinity in the Bay of Bengal?"] },
  { category: "Temperature anomalies", prompts: ["Show temperature trends in the Arabian Sea over the last decade", "What is the Thermocline depth in equatorial waters?", "Is there evidence of El Niño in the western Pacific float data?"] },
  { category: "Biogeochemical data", prompts: ["Where are the lowest oxygen minimum zones located?", "Analyze Chlorophyll distribution in the Southern Ocean", "Does pH level correlate with temperature in North Atlantic floats?"] }
];

const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [diagnosticText, setDiagnosticText] = useState("Initializing sensors...");
  
  // Custom enhanced features states
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showLibrary, setShowLibrary] = useState(false);
  const [dbLatency, setDbLatency] = useState(12);
  const [cachedFootprint, setCachedFootprint] = useState(4.2);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend health & update telemetry mock stats
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        if (response.ok && data.status === 'healthy') {
          setConnectionStatus('connected');
          if (data.diagnostic) {
            setDiagnosticText(data.diagnostic);
          }
        } else {
          setConnectionStatus('disconnected');
        }
      } catch {
        setConnectionStatus('disconnected');
      }
    };
    checkConnection();

    // Mock live HUD updates
    const interval = setInterval(() => {
      setDbLatency(Math.floor(Math.random() * 8) + 8);
      setCachedFootprint(prev => parseFloat((prev + (Math.random() * 0.2 - 0.1)).toFixed(2)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Create new chat
  const handleNewChat = useCallback(() => {
    const newChatId = Date.now().toString();
    const randomWelcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const welcomeMessage: Message = {
      id: Date.now().toString() + '-bot',
      type: "bot",
      content: randomWelcomeMsg,
      timestamp: new Date(),
      chat_id: newChatId,
    };
    setConversations(prev => [...prev, { id: newChatId, title: 'Advisor Session' }]);
    setActiveChatId(newChatId);
    setMessages(prev => [...prev, welcomeMessage]);
    return newChatId;
  }, []);

  // Auto-create chat if user exists
  useEffect(() => {
    if (user && !activeChatId) handleNewChat();
  }, [user, activeChatId, handleNewChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Delete active chat cleanly
  const handleDeleteChat = () => {
    if (!activeChatId) return;

    setMessages(prev => prev.filter(m => m.chat_id !== activeChatId));
    setConversations(prevConversations => {
      const remainingChats = prevConversations.filter(c => c.id !== activeChatId);
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id);
      } else {
        setActiveChatId(null);
      }
      return remainingChats;
    });
  };

  // Purge all chats
  const handlePurgeAllChats = () => {
    if (window.confirm("Are you sure you want to purge all active advisory sessions?")) {
      setConversations([]);
      setMessages([]);
      setActiveChatId(null);
    }
  };

  // Submit query
  const submitQuery = async (queryText: string) => {
    if (!queryText.trim() || !user || !activeChatId) return;

    if (connectionStatus !== 'connected') {
      const errorMsg = "⚠️ FloatAdvisor is offline. Unable to connect to backend mainframe.";
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: errorMsg,
        timestamp: new Date(),
        chat_id: activeChatId
      }]);
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: queryText,
      timestamp: new Date(),
      chat_id: activeChatId
    };
    setMessages(prev => [...prev, newMessage]);

    // Update session title if it's the default
    setConversations(prev => prev.map(c =>
      c.id === activeChatId && c.title === 'Advisor Session'
        ? { ...c, title: queryText.slice(0, 30) + (queryText.length > 30 ? '...' : '') }
        : c
    ));

    setIsTyping(true);

    try {
      const response = await sendChat(queryText, activeChatId);
      const botReply: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: response.response,
        timestamp: new Date(),
        chat_id: activeChatId,
        processing_time: response.processing_time,
        source_agent: response.source_agent,
        debug_info: response.debug_info,
      };
      setMessages(prev => [...prev, botReply]);
    } catch (error: any) {
      const errorStr = `⚠️ Processing failure: ${error.message}`;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        content: errorStr,
        timestamp: new Date(),
        chat_id: activeChatId
      }]);
      setConnectionStatus('disconnected');
    } finally { setIsTyping(false); }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const query = inputValue;
    setInputValue("");
    submitQuery(query);
  };

  // Start editing session title
  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitleValue(currentTitle);
  };

  // Save session title rename
  const handleSaveRename = (id: string) => {
    if (editTitleValue.trim()) {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitleValue.trim() } : c));
    }
    setEditingChatId(null);
  };

  // Export chat
  const exportChat = () => {
    const chatHistory = messages.map(m => `${m.type.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([chatHistory], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `advisor_log_${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeMessages = messages.filter(m => m.chat_id === activeChatId);
  const showStarters = activeMessages.length <= 1;

  return (
    <div className="pt-16 h-screen flex bg-gradient-to-tr from-[#F1F5F9] via-[#F8FAFC] to-[#E2E8F0] text-slate-800 overflow-hidden font-sans">
      {connectionStatus !== 'connected' &&
        <div className="fixed top-16 left-0 right-0 z-50 bg-red-50 border-b border-red-200 text-red-800 px-4 py-2.5 text-center text-sm flex items-center justify-center shadow-md">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600 animate-pulse" />
          <span>FloatAdvisor mainframe offline. Please verify backend instance.</span>
        </div>
      }

      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", stiffness: 100 }}
        className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-md z-20"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2 className="text-md font-bold tracking-wider text-slate-800 uppercase">Sessions</h2>
          </div>
          <div className="flex space-x-1">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#FEF2F2" }} 
              whileTap={{ scale: 0.95 }} 
              title="Purge all sessions"
              className="p-2 text-red-500 hover:text-red-700 bg-red-50/55 border border-red-100 rounded-lg transition-colors duration-200" 
              onClick={handlePurgeAllChats}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#EFF6FF" }} 
              whileTap={{ scale: 0.95 }} 
              title="New Session"
              className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50/50 border border-blue-100 rounded-lg transition-colors duration-200" 
              onClick={handleNewChat}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
          {conversations.map(chat => (
            <motion.div 
              key={chat.id} 
              onClick={() => { if (editingChatId !== chat.id) setActiveChatId(chat.id); }}
              whileHover={{ x: 4, backgroundColor: "rgba(239, 246, 255, 0.4)" }}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                activeChatId === chat.id 
                  ? 'bg-blue-50 border-blue-200/50 text-blue-800 shadow-sm font-semibold' 
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-blue-600' : 'text-slate-400'}`} />
                {editingChatId === chat.id ? (
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={e => setEditTitleValue(e.target.value)}
                    onBlur={() => handleSaveRename(chat.id)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveRename(chat.id)}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 w-full focus:outline-none focus:border-blue-500"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate text-xs font-semibold tracking-wide uppercase">{chat.title}</span>
                )}
              </div>
              {activeChatId === chat.id && editingChatId !== chat.id && (
                <button onClick={(e) => handleStartRename(chat.id, chat.title, e)} className="p-1 hover:bg-blue-100 rounded text-blue-600 flex-shrink-0 transition-colors ml-1">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Telemetry Core HUD panel */}
        <div className="border-t border-slate-200/60 p-5 space-y-3 bg-slate-50/50">
          <label className="flex items-center space-x-3 text-xs text-slate-600 cursor-pointer hover:text-slate-800">
            <input 
              type="checkbox" 
              checked={showDebugInfo} 
              onChange={(e) => setShowDebugInfo(e.target.checked)} 
              className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500/50" 
            />
            <span className="font-mono uppercase tracking-wider">HUD Telemetry</span>
          </label>
          
          <div className="space-y-1.5 text-[10px] font-mono text-slate-500 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm leading-relaxed">
            <div className="flex justify-between items-center">
              <span>LATENCY:</span>
              <span className="text-blue-600 font-bold flex items-center space-x-0.5">
                <RefreshCw className="w-3 h-3 mr-0.5 animate-spin" />
                {dbLatency} ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>CACHE SIZE:</span>
              <span className="text-slate-700 font-bold">{cachedFootprint} MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span>STATUS:</span>
              <span className="text-green-600 font-bold">NOMINAL</span>
            </div>
            <div className="border-t border-slate-100 pt-1.5 mt-1.5 flex items-center space-x-1.5 text-[9px] uppercase tracking-wider truncate text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>{diagnosticText}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Chat */}
      <motion.div className="flex-1 flex flex-col h-full bg-slate-50/30 relative">
        {/* Soft layout grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200/80 p-4.5 z-10 shadow-sm backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
              </div>
              <div>
                <h1 className="text-md font-bold tracking-widest text-slate-800 uppercase">FloatAdvisor</h1>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{connectionStatus === 'connected' ? 'System ready' : 'Offline'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Font Size Toggle */}
              <div className="flex bg-slate-55 p-0.5 rounded-lg border border-slate-200 mr-2">
                <button onClick={() => setFontSize('sm')} className={`p-1.5 text-xs font-bold rounded ${fontSize === 'sm' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'}`} title="Small text"><Type className="w-3.5 h-3.5" /></button>
                <button onClick={() => setFontSize('md')} className={`p-1.5 text-xs font-bold rounded ${fontSize === 'md' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'}`} title="Medium text"><Type className="w-4 h-4" /></button>
                <button onClick={() => setFontSize('lg')} className={`p-1.5 text-xs font-bold rounded ${fontSize === 'lg' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'}`} title="Large text"><Type className="w-4.5 h-4.5" /></button>
              </div>

              {/* Prompt Library */}
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => setShowLibrary(true)} 
                className="flex items-center space-x-2 px-3 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-bold">Library</span>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleDeleteChat} 
                className="flex items-center space-x-2 px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Purge</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={exportChat} 
                className="flex items-center space-x-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100/80 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Export</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 z-10 scrollbar-thin scrollbar-thumb-slate-200 flex flex-col justify-between">
          <div className="max-w-4xl w-full mx-auto space-y-6 flex-grow">
            <AnimatePresence>
              {activeMessages.map(msg => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }} 
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-4 max-w-3xl ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <motion.div 
                      whileHover={{ scale: 1.1 }} 
                      className={`p-2.5 rounded-xl border ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 border-blue-500 shadow-sm' 
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      {msg.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-600" />}
                    </motion.div>
                    
                    <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4.5 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-sm border ${
                        msg.type === 'user' 
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-700/20 text-white' 
                          : 'bg-white border-slate-200/80 text-slate-800'
                      } ${
                        fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                      }`}>
                        <p>{msg.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2.5 mt-2 text-[10px] font-mono text-slate-400 tracking-wider">
                        <span>{msg.timestamp.toLocaleTimeString()}</span>
                        {msg.processing_time && (
                          <span>• {msg.processing_time.toFixed(2)}s via {msg.source_agent}</span>
                        )}
                      </div>
                      
                      {msg.debug_info && showDebugInfo && (
                        <details className="mt-3 text-xs w-full bg-white border border-slate-200 rounded-xl p-3.5 font-mono shadow-sm">
                          <summary className="text-blue-600/80 cursor-pointer select-none uppercase tracking-widest text-[9px] font-bold">Telemetry Data</summary>
                          <pre className="mt-2 text-slate-500 overflow-auto max-w-lg leading-relaxed text-[11px]">{JSON.stringify(msg.debug_info, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm"><Bot className="w-4 h-4 text-blue-600 animate-pulse" /></div>
                  <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex space-x-1.5 items-center px-5 shadow-sm">
                    {[...Array(3)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} 
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }} 
                        className="w-1.5 h-1.5 bg-blue-500 rounded-full" 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions / Starter Cards */}
          {showStarters && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="max-w-4xl w-full mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {quickActions.map((action, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => submitQuery(action.prompt)}
                  className="bg-white border border-slate-200/80 rounded-xl p-5 text-left shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col justify-between h-40"
                >
                  <div className={`p-2.5 rounded-lg border inline-block ${action.color} mb-3`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{action.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{action.description}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-5 bg-white border-t border-slate-200/80 z-10 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <div className="flex-1 relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300">
              <input 
                type="text" 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value.slice(0, 1000))} 
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()} 
                placeholder="Direct FloatAdvisor to scan ocean sensors..." 
                className="w-full py-3.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium pr-10" 
                disabled={isTyping} 
              />
              <span className="text-[10px] font-mono text-slate-400 font-bold select-none">{inputValue.length}/1000</span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59,130,246,0.2)" }} 
              whileTap={{ scale: 0.95 }} 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isTyping} 
              className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_0_10px_rgba(59,130,246,0.15)] border border-blue-500/20"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Expandable Scientific Prompt Library Drawer */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex justify-end"
            onClick={() => setShowLibrary(false)}
          >
            <motion.div 
              initial={{ x: 400 }} 
              animate={{ x: 0 }} 
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-96 bg-white h-full shadow-2xl p-6 flex flex-col border-l border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-md font-bold text-slate-800">Prompt Library</h3>
                </div>
                <button onClick={() => setShowLibrary(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 scrollbar-thin">
                {libraryPrompts.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{category.category}</h4>
                    <div className="space-y-1.5">
                      {category.prompts.map((p, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setInputValue(p);
                            setShowLibrary(false);
                          }}
                          className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 text-xs text-slate-600 hover:text-slate-800 transition-all font-medium leading-relaxed"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotPage;
