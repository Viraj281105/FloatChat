import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Bot, User, MessageSquare, Plus, Download, Trash2, AlertCircle } from 'lucide-react';
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
  "Hello! I'm FloatBot, your AI assistant for ocean data analysis. What would you like to know?",
  "Greetings! I'm ready to help you with your ocean data queries. How can I assist?",
  "Welcome back! I can analyze ARGO float data and generate reports. What's on your mind?",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        setConnectionStatus(data.status === 'healthy' ? 'connected' : 'disconnected');
      } catch {
        setConnectionStatus('disconnected');
      }
    };
    checkConnection();
  }, []);

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
    setConversations(prev => [...prev, { id: newChatId, title: 'New Chat' }]);
    setActiveChatId(newChatId);
    setMessages([welcomeMessage]);
    return newChatId;
  }, []);

  useEffect(() => {
    if (user && !activeChatId) handleNewChat();
  }, [user, activeChatId, handleNewChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const handleDeleteChat = () => {
    if (!activeChatId) return;
    setConversations(prev => prev.filter(c => c.id !== activeChatId));
    setActiveChatId(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !activeChatId) return;

    if (connectionStatus !== 'connected') {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: "⚠️ Unable to connect to backend.", timestamp: new Date(), chat_id: activeChatId }]);
      return;
    }

    const newMessage: Message = { id: Date.now().toString(), type: "user", content: inputValue, timestamp: new Date(), chat_id: activeChatId };
    setMessages(prev => [...prev, newMessage]);
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
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: "bot", content: `⚠️ ${error.message}`, timestamp: new Date(), chat_id: activeChatId }]);
      setConnectionStatus('disconnected');
    } finally { setIsTyping(false); }
  };

  const exportChat = () => {
    const chatHistory = messages.map(m => `${m.type.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([chatHistory], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `floatchat_${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-16 h-screen flex bg-[#121f3d]">
      {connectionStatus !== 'connected' && <div className="fixed top-16 left-0 right-0 z-50 bg-red-600/90 text-white px-4 py-2 text-center text-sm flex items-center justify-center"><AlertCircle className="w-4 h-4 mr-2" />Backend disconnected</div>}
      
      {/* Sidebar */}
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-72 h-full bg-[#1B3E70] p-4 border-r border-[#2a3c5a] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <motion.button whileHover={{scale: 1.1}} whileTap={{scale:0.9}} className="p-2 text-slate-400 hover:text-white hover:bg-[#2a3c5a] rounded-lg" onClick={handleNewChat}><Plus className="w-5 h-5"/></motion.button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 space-y-2">
          {conversations.map(chat => (
            <motion.button key={chat.id} onClick={() => setActiveChatId(chat.id)} whileHover={{ x: 5 }} className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${activeChatId === chat.id ? 'bg-[#2998ff]' : 'text-slate-300 hover:bg-[#2a3c5a]'}`}>
              <MessageSquare className="w-4 h-4 flex-shrink-0"/>
              <span className={`truncate text-sm font-medium ${activeChatId === chat.id ? 'text-white' : ''}`}>{chat.title}</span>
            </motion.button>
          ))}
        </div>
        <div className="border-t border-[#2a3c5a] pt-4 mt-4">
          <label className="flex items-center space-x-2 text-sm text-slate-300">
            <input type="checkbox" checked={showDebugInfo} onChange={(e) => setShowDebugInfo(e.target.checked)} className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded"/>
            <span>Show debug info</span>
          </label>
        </div>
      </motion.div>

      {/* Main Chat */}
      <motion.div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-[#182a45]/80 backdrop-blur-sm border-b border-[#2a3c5a] p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"><Bot className="w-6 h-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold text-white">FloatBot Assistant</h1>
                <p className="text-sm text-slate-400">{connectionStatus === 'connected' ? 'Connected' : 'Offline'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={handleDeleteChat} className="flex items-center space-x-2 px-4 py-2 bg-red-600/50 text-red-300 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4"/><span>Delete</span></motion.button>
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={exportChat} className="flex items-center space-x-2 px-4 py-2 bg-[#2a3c5a] text-slate-300 rounded-lg hover:bg-slate-600/50 hover:text-cyan-400"><Download className="w-4 h-4"/><span>Export</span></motion.button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity:0, y:20 }} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className={`flex ${msg.type==='user'?'justify-end':'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-3xl ${msg.type==='user'?'flex-row-reverse space-x-reverse':''}`}>
                    <motion.div whileHover={{scale:1.1}} className={`p-2 rounded-full ${msg.type==='user'?'bg-[#2998ff]':'bg-[#5f84a4]'}`}>{msg.type==='user'?<User className="w-5 h-5 text-white"/>:<Bot className="w-5 h-5 text-white"/>}</motion.div>
                    <div className={`flex flex-col ${msg.type==='user'?'items-end':'items-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-lg text-white ${msg.type==='user'?'bg-[#2998ff]':'bg-[#066FC1]'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                        <span>{msg.timestamp.toLocaleTimeString()}</span>
                        {msg.processing_time && <span>• {msg.processing_time.toFixed(2)}s by {msg.source_agent}</span>}
                      </div>
                      {msg.debug_info && showDebugInfo && <details className="mt-2 text-xs"><summary className="text-slate-500 cursor-pointer">Debug Info</summary><pre className="mt-1 p-2 bg-slate-800 rounded text-slate-400 overflow-auto max-w-lg">{JSON.stringify(msg.debug_info,null,2)}</pre></details>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-[#5f84a4]"><Bot className="w-5 h-5 text-white"/></div>
                <div className="p-4 bg-[#182a45] rounded-2xl border border-[#2a3c5a] flex space-x-1">
                  {[...Array(3)].map((_,i)=><motion.div key={i} animate={{scale:[1,1.2,1]}} transition={{duration:0.6, repeat:Infinity, delay:i*0.2}} className="w-2 h-2 bg-cyan-400 rounded-full"/>)}
                </div>
              </div>
            </motion.div>}
            <div ref={messagesEndRef}/>
          </div>
        </div>

        {/* Input Box */}
        <div className="p-4 bg-[#121f3d] border-t border-[#2a3c5a]">
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <div className="flex-1 relative">
              <input type="text" value={inputValue} onChange={e=>setInputValue(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&handleSendMessage()} placeholder="Ask about ocean data..." className="w-full px-4 py-3 bg-[#182a45] text-white rounded-xl border border-[#2a3c5a] focus:border-[#2998ff] focus:outline-none" disabled={isTyping}/>
            </div>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="p-3 bg-[#182a45] text-slate-400 rounded-xl hover:bg-[#2a3c5a] transition-colors" disabled><Mic className="w-5 h-5"/></motion.button>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} className="p-3 bg-[#2998ff] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-5 h-5"/></motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatbotPage;
