import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, MessageSquare, Plus, Download, Trash2, AlertCircle, Volume2, VolumeX, Radio
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
  "Good day, Sir. J.A.R.V.I.S. online. Oceanographic sensor array is fully synchronized. How may I assist your analysis today?",
  "Greetings. Core database nodes operational. Ready to parse ARGO float parameters on your command, Sir.",
  "System diagnostics are fully green. I stand ready to assist you in charting temperature and salinity metrics, Sir.",
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
  const [isMuted, setIsMuted] = useState(false);
  const [diagnosticText, setDiagnosticText] = useState("Initializing sensors...");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend health
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
  }, []);

  // Text-To-Speech function
  const speakText = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Remove markdown formatting before speaking
    const cleanText = text.replace(/[*#_`[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose a suitable voice (prefer British male if available for Jarvis effect)
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Microsoft David") || v.lang.startsWith("en-GB"));
    if (jarvisVoice) utterance.voice = jarvisVoice;
    
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

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
    setConversations(prev => [...prev, { id: newChatId, title: 'J.A.R.V.I.S. Session' }]);
    setActiveChatId(newChatId);
    setMessages([welcomeMessage]);
    speakText(randomWelcomeMsg);
    return newChatId;
  }, [speakText]);

  // Auto-create chat if user exists
  useEffect(() => {
    if (user && !activeChatId) handleNewChat();
  }, [user, activeChatId, handleNewChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Delete chat
  const handleDeleteChat = () => {
    if (!activeChatId) return;
    setConversations(prev => prev.filter(c => c.id !== activeChatId));
    setMessages(prev => prev.filter(m => m.chat_id !== activeChatId));

    setTimeout(() => {
      setActiveChatId(prev => {
        const remainingChats = conversations.filter(c => c.id !== prev);
        if (remainingChats.length > 0) {
          const nextChatId = remainingChats[0].id;
          const firstMsg = messages.find(m => m.chat_id === nextChatId);
          setMessages(firstMsg ? messages.filter(m => m.chat_id === nextChatId) : []);
          return nextChatId;
        } else {
          return null;
        }
      });
    }, 0);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !activeChatId) return;

    if (connectionStatus !== 'connected') {
      const errorMsg = "⚠️ J.A.R.V.I.S. is offline. Unable to connect to backend mainframe.";
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: errorMsg,
        timestamp: new Date(),
        chat_id: activeChatId
      }]);
      speakText("Mainframe connection failed.");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      chat_id: activeChatId
    };
    setMessages(prev => [...prev, newMessage]);

    // Dynamically update chat title if it's still generic
    setConversations(prev => prev.map(c =>
      c.id === activeChatId && c.title === 'J.A.R.V.I.S. Session'
        ? { ...c, title: inputValue.slice(0, 30) + (inputValue.length > 30 ? '...' : '') }
        : c
    ));

    const currentQuery = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await sendChat(currentQuery, activeChatId);
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
      speakText(response.response);
    } catch (error: any) {
      const errorStr = `⚠️ Processing failure: ${error.message}`;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        content: errorStr,
        timestamp: new Date(),
        chat_id: activeChatId
      }]);
      speakText("An error occurred during computational routing.");
      setConnectionStatus('disconnected');
    } finally { setIsTyping(false); }
  };

  // Export chat
  const exportChat = () => {
    const chatHistory = messages.map(m => `${m.type.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([chatHistory], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jarvis_log_${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-16 h-screen flex bg-radial-gradient from-[#0B1528] via-[#040814] to-[#010307] text-[#E2E8F0] overflow-hidden font-sans">
      {connectionStatus !== 'connected' &&
        <div className="fixed top-16 left-0 right-0 z-50 bg-red-950/80 border-b border-red-500/50 backdrop-blur-md text-red-200 px-4 py-2.5 text-center text-sm flex items-center justify-center shadow-lg shadow-red-950/20">
          <AlertCircle className="w-4 h-4 mr-2 text-red-400 animate-pulse" />
          <span>Core mainframe offline. Please verify J.A.R.V.I.S. backend instance.</span>
        </div>
      }

      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", stiffness: 100 }}
        className="w-76 h-full bg-[#050B16]/90 backdrop-blur-xl p-5 border-r border-[#102A45]/30 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#102A45]/30">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold tracking-wider text-cyan-100 uppercase">Archive</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "#123057" }} 
            whileTap={{ scale: 0.95 }} 
            className="p-2 text-cyan-400 hover:text-white bg-[#0D213D] border border-cyan-500/20 rounded-lg transition-colors duration-200" 
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-cyan-900/30">
          {conversations.map(chat => (
            <motion.button 
              key={chat.id} 
              onClick={() => setActiveChatId(chat.id)} 
              whileHover={{ x: 4, backgroundColor: "rgba(13, 33, 61, 0.4)" }}
              className={`w-full text-left p-3.5 rounded-xl border flex items-center space-x-3.5 transition-all duration-300 ${
                activeChatId === chat.id 
                  ? 'bg-gradient-to-r from-[#0C2442] to-[#123661] border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="truncate text-xs font-semibold tracking-wide uppercase">{chat.title}</span>
            </motion.button>
          ))}
        </div>

        <div className="border-t border-[#102A45]/30 pt-4 mt-4 space-y-3">
          <label className="flex items-center space-x-3 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
            <input 
              type="checkbox" 
              checked={showDebugInfo} 
              onChange={(e) => setShowDebugInfo(e.target.checked)} 
              className="w-4 h-4 text-cyan-600 bg-slate-900 border-[#102A45]/50 rounded focus:ring-cyan-500/50 focus:ring-offset-slate-950" 
            />
            <span className="font-mono uppercase tracking-wider">HUD Diagnostics</span>
          </label>
          <div className="text-[10px] font-mono text-cyan-500/60 leading-relaxed bg-[#02050C]/50 p-2.5 rounded border border-[#102A45]/15 select-none">
            {diagnosticText}
          </div>
        </div>
      </motion.div>

      {/* Main Chat */}
      <motion.div className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A1931]/30 via-[#030813] to-[#01040A] relative">
        
        {/* Holographic grid overlay background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,48,87,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,48,87,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

        {/* Chat Header */}
        <div className="bg-[#050D1A]/80 backdrop-blur-md border-b border-[#102A45]/30 p-4.5 z-10 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/20">
                  <Bot className="w-5 h-5 text-cyan-100" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === 'connected' ? 'bg-cyan-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatus === 'connected' ? 'bg-cyan-500' : 'bg-red-500'}`}></span>
                </span>
              </div>
              <div>
                <h1 className="text-md font-bold tracking-widest text-white uppercase">J.A.R.V.I.S. advisory</h1>
                <p className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">{connectionStatus === 'connected' ? 'Mainframe connected' : 'Mainframe offline'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => setIsMuted(prev => !prev)} 
                className={`p-2.5 rounded-lg border flex items-center justify-center transition-all ${
                  isMuted 
                    ? 'bg-red-950/20 border-red-500/20 text-red-400 hover:bg-red-900/30' 
                    : 'bg-[#0D213D] border-cyan-500/20 text-cyan-400 hover:bg-[#123057]'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleDeleteChat} 
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-950/30 border border-red-500/20 text-red-300 rounded-lg hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Purge</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={exportChat} 
                className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D213D] border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-[#123057] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Export</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 z-10 scrollbar-thin scrollbar-thumb-cyan-950">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.filter(m => m.chat_id === activeChatId).map(msg => (
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
                          ? 'bg-cyan-600/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                          : 'bg-slate-800/30 border-slate-700/30'
                      }`}
                    >
                      {msg.type === 'user' ? <User className="w-4 h-4 text-cyan-300" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                    </motion.div>
                    
                    <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-xl border ${
                        msg.type === 'user' 
                          ? 'bg-gradient-to-br from-[#0B2545] to-[#134074]/80 border-[#1D4ED8]/30 text-cyan-50' 
                          : 'bg-[#060D1E]/95 border-[#102A45]/40 text-slate-100'
                      }`}>
                        <p>{msg.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2.5 mt-2 text-[10px] font-mono text-slate-500 tracking-wider">
                        <span>{msg.timestamp.toLocaleTimeString()}</span>
                        {msg.processing_time && (
                          <span>• {msg.processing_time.toFixed(2)}s via {msg.source_agent}</span>
                        )}
                      </div>
                      
                      {msg.debug_info && showDebugInfo && (
                        <details className="mt-3 text-xs w-full bg-[#02050A]/70 border border-[#102A45]/20 rounded-xl p-3.5 font-mono">
                          <summary className="text-cyan-500/80 cursor-pointer select-none uppercase tracking-widest text-[9px] font-bold">Telemetry Data</summary>
                          <pre className="mt-2 text-slate-400 overflow-auto max-w-lg leading-relaxed text-[11px]">{JSON.stringify(msg.debug_info, null, 2)}</pre>
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
                  <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/30"><Bot className="w-4 h-4 text-cyan-400 animate-pulse" /></div>
                  <div className="p-4 bg-[#060D1E]/95 border border-[#102A45]/30 rounded-2xl flex space-x-1.5 items-center px-5">
                    {[...Array(3)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} 
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }} 
                        className="w-1.5 h-1.5 bg-cyan-400 rounded-full" 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Box */}
        <div className="p-5 bg-[#030814]/95 backdrop-blur-md border-t border-[#102A45]/30 z-10">
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()} 
                placeholder="Direct J.A.R.V.I.S. to scan ocean sensors..." 
                className="w-full px-5 py-3.5 bg-[#060F20] text-slate-100 placeholder-slate-500 rounded-xl border border-[#102A45]/50 focus:border-cyan-500/80 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] focus:outline-none transition-all duration-300 text-sm font-medium" 
                disabled={isTyping} 
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(6,182,212,0.3)" }} 
              whileTap={{ scale: 0.95 }} 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isTyping} 
              className="p-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-400/20"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatbotPage;
