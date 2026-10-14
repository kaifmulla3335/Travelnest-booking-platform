import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Plane } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axiosInstance from '../../api/axios';

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
  a: ({ children, ...props }) => <a {...props} className="text-sky-700 underline break-all" target="_blank" rel="noopener noreferrer">{children}</a>,
  table: ({ children }) => <div className="my-2 max-w-full overflow-x-auto"><table className="w-full min-w-max text-xs">{children}</table></div>,
  th: ({ children }) => <th className="border-b border-slate-200 px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-slate-100 px-2 py-1 align-top">{children}</td>,
};

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
      text: "Hi! I'm TravelNest AI 🌏 Ask me about packages, travel plans, studying, or anything else. How can I help you today?",
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

    const history = messages.slice(1).filter(msg => !msg.isError).slice(-8)
      .map(msg => ({ role: msg.role, content: msg.text }));

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await axiosInstance.post('/chat/message', { message: userText, history });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        isError: true,
        text: error.response?.data?.message || "The AI assistant is temporarily unavailable. Please try again in a moment!",
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
      <div className={`fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 rounded-2xl shadow-2xl
        flex flex-col overflow-hidden border border-sky-100 bg-white
        transition-all duration-300 origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: 'min(520px, calc(100dvh - 7rem))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Plane size={16} className="text-white rotate-45" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-none">TravelNest AI</p>
            <p className="text-sky-100 text-xs mt-0.5">Ask me anything</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sky-100 text-xs">Here to help</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-slate-50"
          style={{ minHeight: 'min(300px, calc(100dvh - 15rem))' }}>

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
              <div className={`min-w-0 max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed
                ${msg.role === 'assistant'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none break-words'
                  : 'bg-sky-500 text-white rounded-tr-none'}`}>
                {msg.role === 'assistant'
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{msg.text}</ReactMarkdown>
                  : msg.text}
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
              placeholder="Ask about trips, study, or anything..."
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
          <p className="text-center text-xs text-slate-300 mt-2">Powered by Groq AI</p>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
