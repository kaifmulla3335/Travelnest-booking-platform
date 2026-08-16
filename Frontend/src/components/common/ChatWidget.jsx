import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Plane } from 'lucide-react';
import axiosInstance from '../../api/axios';

const SUGGESTED_QUESTIONS = [
  "Which package is best for a beach trip?",
  "What is the cancellation policy?",
  "Show me packages under ₹25,000",
  "How does booking work?",
];

const ChatWidget = () => {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([
    {
      role: 'assistant',
      text: "Hi! I'm TravelNest AI 🌏 I can help you find the perfect travel package, answer questions about bookings, or give travel tips. How can I help you today?",
    }
  ]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await axiosInstance.post('/chat/message', { message: userText });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating bubble ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center transition-all duration-300
          ${isOpen
            ? 'bg-slate-700 rotate-0 scale-95'
            : 'bg-gradient-to-br from-sky-500 to-sky-600 hover:scale-110'}`}
        aria-label="Open AI Chat"
      >
        {isOpen
          ? <X size={22} className="text-white" />
          : <MessageCircle size={24} className="text-white" />}
      </button>

      {/* Unread dot — shown before first open */}
      {!isOpen && messages.length === 1 && (
        <span className="fixed bottom-16 right-5 z-50 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      )}

      {/* ── Chat panel ── */}
      <div className={`fixed bottom-24 right-5 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl
        flex flex-col overflow-hidden border border-sky-100 bg-white
        transition-all duration-300 origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: '520px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Plane size={16} className="text-white rotate-45" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-none">TravelNest AI</p>
            <p className="text-sky-100 text-xs mt-0.5">Ask me anything about travel</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sky-100 text-xs">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50"
          style={{ minHeight: '300px' }}>

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                ${msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-sky-400 to-sky-600'
                  : 'bg-slate-200'}`}>
                {msg.role === 'assistant'
                  ? <Bot size={14} className="text-white" />
                  : <User size={14} className="text-slate-500" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed
                ${msg.role === 'assistant'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                  : 'bg-sky-500 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex-shrink-0 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm border border-slate-100">
                <div className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map(delay => (
                    <span key={delay}
                      className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suggested questions — shown only at start */}
          {showSuggestions && messages.length === 1 && !loading && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-slate-400 px-1">Quick questions:</p>
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs bg-white border border-sky-100 hover:border-sky-300
                    hover:bg-sky-50 text-slate-600 rounded-xl px-3 py-2 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about packages, travel tips..."
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm
                text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400
                focus:ring-2 focus:ring-sky-100 disabled:opacity-50 max-h-24 leading-relaxed"
              style={{ minHeight: '38px' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
              }}
            />
            <button onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed
                rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              {loading
                ? <Loader2 size={15} className="text-white animate-spin" />
                : <Send size={15} className="text-white" />}
            </button>
          </div>
          <p className="text-center text-xs text-slate-300 mt-2">Powered by Groq AI · LLaMA 3.3</p>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;