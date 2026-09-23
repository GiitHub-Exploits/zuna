import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  AlertCircle,
  Scissors,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  "✂️ How do home measurements work?",
  "👔 What bespoke suiting styles do you craft?",
  "📍 Where is the Howrah workshop located?",
  "⏱️ What is the typical tailoring turnaround time?"
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Greetings! I am the ZUNA Atelier AI Assistant. How may I assist you today with bespoke tailoring, fabrics, measurements, or order queries?',
      time: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Floating button position (draggable / swipeable)
  const [position, setPosition] = useState({ x: null, y: null });
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const elementStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const messagesEndRef = useRef(null);

  // Set default initial position on screen mount (bottom-right above bottom nav)
  useEffect(() => {
    const defaultX = Math.max(window.innerWidth - 76, 20);
    const defaultY = Math.max(window.innerHeight - 170, 80);
    setPosition({ x: defaultX, y: defaultY });

    const handleResize = () => {
      setPosition(prev => {
        if (prev.x === null) return prev;
        const newX = Math.min(Math.max(16, prev.x), window.innerWidth - 70);
        const newY = Math.min(Math.max(70, prev.y), window.innerHeight - 110);
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Touch and Mouse Drag / Swipe Handlers
  const handlePointerDown = (clientX, clientY) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: clientX, y: clientY };
    elementStartPosRef.current = { x: position.x, y: position.y };
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - dragStartPosRef.current.x;
    const dy = clientY - dragStartPosRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }

    const newX = Math.min(Math.max(12, elementStartPosRef.current.x + dx), window.innerWidth - 68);
    const newY = Math.min(Math.max(70, elementStartPosRef.current.y + dy), window.innerHeight - 100);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // If tap without significant dragging, toggle window
    if (!hasMovedRef.current) {
      setIsOpen(prev => !prev);
    }
  };

  // Touch Events
  const onTouchStart = (e) => {
    const touch = e.touches[0];
    handlePointerDown(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e) => {
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    handlePointerUp();
  };

  // Mouse Events
  const onMouseDown = (e) => {
    handlePointerDown(e.clientX, e.clientY);

    const onMouseMove = (moveEvent) => {
      handlePointerMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      handlePointerUp();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Send message to backend Gemini AI endpoint
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    setErrorMessage('');

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/ai/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to receive AI answer right now');
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        time: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      setErrorMessage(err.message || 'Service temporarily busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format AI response text with basic formatting (paragraphs and bullet points)
  const formatAIText = (text) => {
    if (!text) return null;
    return text.split('\n\n').map((block, i) => {
      if (block.startsWith('- ') || block.startsWith('* ')) {
        const items = block.split('\n');
        return (
          <ul key={i} className="list-disc pl-4 space-y-1 my-1.5 text-xs">
            {items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item.replace(/^[-*]\s+/, '')}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="text-xs leading-relaxed my-1">
          {block}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING, SWIPEABLE & ADJUSTABLE ICON */}
      <div
        style={{
          left: position.x !== null ? `${position.x}px` : undefined,
          top: position.y !== null ? `${position.y}px` : undefined,
          touchAction: 'none'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        className={`fixed z-50 select-none cursor-grab active:cursor-grabbing transition-shadow ${
          position.x === null ? 'bottom-24 right-5' : ''
        }`}
      >
        <div 
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#161514] text-white border-2 border-[#9e7938] shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex items-center justify-center group hover:scale-105 active:scale-95 transition-transform"
          title="ZUNA Atelier AI (Drag to move, Tap to open)"
        >
          {/* Subtle gold ring pulse */}
          <span className="absolute -inset-1 rounded-full border border-[#9e7938]/40 animate-ping pointer-events-none" />

          {/* AI Sparkles icon */}
          <Sparkles className="w-6 h-6 text-[#9e7938] drop-shadow-sm transition-transform group-hover:rotate-12" />

          {/* Tiny badge */}
          <span className="absolute -top-1 -right-1 bg-[#9e7938] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter border border-[#161514]">
            AI
          </span>
        </div>
      </div>

      {/* 2. MINI CHAT WINDOW */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 h-[510px] max-h-[80vh] rounded-3xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] shadow-float z-50 flex flex-col overflow-hidden animate-fadeIn backdrop-blur-md">
          
          {/* Header */}
          <div className="p-4 bg-[#faf9f5] dark:bg-[#141312] border-b border-[#eae7e0] dark:border-[#262422] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#9e7938]/15 border border-[#9e7938]/30 flex items-center justify-center text-[#9e7938]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-editorial text-base font-bold text-[#161514] dark:text-[#f7f5f0] leading-none">
                    ZUNA Atelier AI
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] mt-0.5">
                  Master Sultan Baig Bespoke Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([
                  {
                    id: 'welcome',
                    sender: 'ai',
                    text: 'Greetings! I am the ZUNA Atelier AI Assistant. How may I assist you today with bespoke tailoring, fabrics, measurements, or order queries?',
                    time: new Date()
                  }
                ])}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7d7a73] hover:text-[#161514] dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                title="Restart Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7d7a73] hover:text-[#161514] dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                title="Close Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-[#9e7938]/15 border border-[#9e7938]/30 flex items-center justify-center text-[#9e7938] shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#161514] text-white dark:bg-white dark:text-[#161514] rounded-br-xs shadow-xs'
                    : 'bg-[#faf9f5] dark:bg-[#201e1c] text-[#161514] dark:text-[#f7f5f0] border border-[#eae7e0] dark:border-stone-800 rounded-bl-xs shadow-subtle'
                }`}>
                  {msg.sender === 'ai' ? formatAIText(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-[#7d7a73] text-xs pt-1">
                <div className="w-6 h-6 rounded-lg bg-[#9e7938]/15 border border-[#9e7938]/30 flex items-center justify-center text-[#9e7938]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex items-center gap-1 bg-[#faf9f5] dark:bg-[#201e1c] px-3 py-2 rounded-xl border border-[#eae7e0] dark:border-stone-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9e7938] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9e7938] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9e7938] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Suggestions (Shown on first screen) */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96] block">
                  Suggested Queries:
                </span>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left text-xs p-2 rounded-xl bg-[#faf9f5] dark:bg-[#201e1c] hover:bg-stone-200/60 dark:hover:bg-stone-800 border border-[#eae7e0] dark:border-stone-800 text-[#524f48] dark:text-[#c4c0b6] transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#faf9f5] dark:bg-[#141312] border-t border-[#eae7e0] dark:border-[#262422] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about tailoring, fabrics, sizing..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1c1b18] border border-[#dedbd2] dark:border-stone-700 text-xs text-[#161514] dark:text-[#f7f5f0] placeholder-[#a39f96] focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] flex items-center justify-center hover:bg-[#9e7938] dark:hover:bg-[#9e7938] dark:hover:text-white transition-all disabled:opacity-40 cursor-pointer shadow-xs"
              title="Send Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
