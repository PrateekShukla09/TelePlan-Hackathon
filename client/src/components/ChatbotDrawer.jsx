import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, Zap, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export function ChatbotDrawer() {
  const { isDarkMode } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => 'session-' + Math.random().toString(36).substr(2, 9));
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "👋 Hi! I'm your TelePlan AI Tariff Assistant. Tell me your data needs, budget, or if you need a Family/Business plan, and I'll find your perfect match!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behateleplanor: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputValue.trim();
    if (!messageText || loading) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      // 1. Try to connect to Python bot.py FastAPI Server on port 5005
      const response = await fetch('http://localhost:5005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, session_id: sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: data.reply,
            isRecommendation: data.is_recommendation,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Server offline fallback
    }

    // 2. Client-side fallback logic matching bot.py logic
    setTimeout(() => {
      let reply = '';
      const msg = messageText.toLowerCase();

      if (msg.includes('family') || msg.includes('pooled') || msg.includes('share')) {
        reply = "Recommended Plans:\n1. TelePlan True 5G Family Care 999 (₹999) — 200 GB shared data for 4 SIMs with free Netflix & Prime.\n2. TelePlan Family Max 1050 (₹1050) — 150 GB shared data for 3 connections with 1-Year Hotstar.\n3. TelePlan Max Family 699 (₹699) — Budget family plan for 2 members with SonyLIV VIP.";
      } else if (msg.includes('business') || msg.includes('corporate') || msg.includes('office')) {
        reply = "Recommended Plans:\n1. TelePlan Business Fleet Pro 1299 (₹1299) — 300 GB shared data, unlimited CUG calling for 10 users & Google Workspace.\n2. TelePlan Business Enterprise 5G 1499 (₹1499) — 500 GB corporate data for 15 users with Static IP & Microsoft 365.\n3. TelePlan Corporate Connect 799 (₹799) — 150 GB data for 6 team members with free CUG calls.";
      } else if (msg.includes('roam') || msg.includes('abroad') || msg.includes('travel') || msg.includes('international')) {
        reply = "Recommended Plans:\n1. TelePlan Global Roaming 999 (₹999) — 2.5 GB/day local data + 5GB international roaming & in-flight connectiteleplanty.\n2. TelePlan 84 Days Super Saver 666 (₹666) — Long 84-day validity with 5G speeds for domestic travel.\n3. TelePlan Hero Unlimited 379 (₹379) — Unlimited 5G data plus weekend data rollover while traveling.";
      } else if (msg.includes('cheap') || msg.includes('budget') || msg.includes('299') || msg.includes('low')) {
        reply = "Recommended Plans:\n1. TelePlan Value 4G 249 (₹249) — Best budget value offering 2.0 GB/day data with unlimited calling.\n2. TelePlan True 5G Unlimited 299 (₹299) — Unthrottled 5G speed boost with 1.5 GB/day and TelePlanCinema.\n3. TelePlan Binge All Night 299 (₹299) — Uncapped 12am-6am midnight data streaming + 1.5 GB/day.";
      } else {
        reply = "Here are our top recommended plans based on your request:\n\nRecommended Plans:\n1. TelePlan True 5G Unlimited 299 (₹299) — 1.5 GB/day + Unlimited 5G standalone speeds with TelePlanCinema.\n2. TelePlan 5G Plus Essential 349 (₹349) — 2.0 GB/day + HD Voice crystal clear calling.\n3. TelePlan Binge All Night 299 (₹299) — 1.5 GB/day + free midnight 12am-6am unlimited data.\n\nTell me your exact budget or preferred operator to narrow it down further!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: reply,
          isRecommendation: reply.includes('Recommended Plans:'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setLoading(false);
    }, 600);
  };

  const quickPrompts = [
    '🔥 Best 5G plan under ₹350',
    '👨‍👩‍👧 Family plan for 3 members',
    '💼 Business fleet plan with CUG',
    '✈️ Global roaming plan',
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-4 rounded-2xl bg-gradient-to-tr from-red-600 teleplana-rose-600 to-amber-500 hover:from-red-500 hover:to-rose-500 text-white shadow-2xl shadow-red-600/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          title="Open AI Tariff Adteleplansor Chatbot"
        >
          <Bot className="w-7 h-7 stroke-[2.2]" />

          {/* Pulse ring indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-4 ring-[#070304] animate-pulse" />
          
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
            AI Tariff Bot
          </span>
        </button>
      </div>

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-[#0b0507]/95 border-red-950/80 text-white shadow-red-950/60' 
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'bg-[#0e0608] border-red-950/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 teleplana-rose-600 to-amber-500 p-0.5 shadow-md">
                  <div className="w-full h-full bg-[#0a0406] rounded-[10px] flex items-center justify-center text-rose-400">
                    <Bot className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-tight">TelePlan AI Adteleplansor</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      bot.py
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Connected to LangGraph AI Agent
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'bot',
                      text: "Conversation reset! How can I help you find your tariff plan?",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                  ])}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-red-950/40 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
                  }`}
                  title="Reset Chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-red-950/40 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-tr from-red-600 to-rose-600 text-white'
                        : isDarkMode ? 'bg-red-950 text-rose-400 border border-red-900/60' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-line shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-none'
                          : isDarkMode
                          ? 'bg-[#12080a] border border-red-950/80 text-zinc-200 rounded-bl-none'
                          : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  <span className="text-[9px] text-zinc-500 font-mono mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-rose-400">
                  <div className="w-7 h-7 rounded-full bg-red-950 border border-red-900/60 flex items-center justify-center text-rose-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-[#12080a] border border-red-950/80 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce delay-150" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce delay-300" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className={`px-3 py-2 border-t flex items-center gap-2 overflow-x-auto scrollbar-none ${
              isDarkMode ? 'bg-[#0d0608] border-red-950/60' : 'bg-slate-50 border-slate-200'
            }`}>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all shrink-0 ${
                    isDarkMode
                      ? 'bg-[#150a0c] border-red-950/80 text-rose-300 hover:bg-red-950/60 hover:border-red-500/50'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`p-3 border-t flex items-center gap-2 ${
                isDarkMode ? 'bg-[#0b0507] border-red-950/80' : 'bg-white border-slate-200'
              }`}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask bot.py about tariff plans..."
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                  isDarkMode
                    ? 'bg-[#13090b] border-red-950/80 text-white placeholder-zinc-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 teleplana-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white shadow-md disabled:opacity-40 transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
