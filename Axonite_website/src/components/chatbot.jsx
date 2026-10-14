import { API_BASE_URL } from "../lib/api";
import React, { useState, useRef, useEffect } from 'react';


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm Axonite's AI assistant. Ask me anything about our services, tech stacks, or company solutions."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
      setHasInteracted(true);
    }
  }, [messages, isTyping, isOpen]);

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Conversation reset. How can I help you today?'
      }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isTyping) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();

      const botResponse = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply || "I didn't receive a response from the assistant.",
        sources: data.sources || []
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Unable to reach the assistant server. Please reach out to info@axonite.net.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      {/* Proactive Help Tooltip (Hidden once opened) */}
      {!isOpen && !hasInteracted && (
        <div className="mb-2 mr-1 flex items-center gap-2 bg-white text-ink border border-line px-3.5 py-2 rounded-full shadow-raise text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
          Need help? Ask our AI assistant
        </div>
      )}

      {/* Chat Window - Reduced Height (h-[380px]) and Width (w-72 sm:w-80) */}
      {isOpen && (
        <div className="mb-3.5 flex flex-col h-[380px] w-72 sm:w-80 bg-white border border-line rounded-lg shadow-float overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Header */}
          <header className="flex items-center justify-between px-3.5 py-2.5 bg-dark text-ink-inverse">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-6 h-6 rounded-sm bg-accent-bright text-accent-ink flex items-center justify-center font-semibold text-[0.65rem]">
                  AI
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-accent-bright border-2 border-dark rounded-full"></span>
              </div>
              <div>
                <h2 className="font-semibold text-xs text-ink-inverse leading-tight">Axonite Assistant</h2>
                <p className="font-mono-label text-[0.55rem] text-ink-inverse-2">Online • Instant answers</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Reset Conversation"
                className="text-ink-inverse-2 hover:text-ink-inverse hover:bg-dark-3 p-1 rounded-sm transition-colors text-xs"
              >
                ↻
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-ink-inverse-2 hover:text-ink-inverse hover:bg-dark-3 p-1 rounded-sm transition-colors"
                aria-label="Close Chat"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          {/* Messages Body */}
          <main className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-paper text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] px-3 py-2 rounded-md leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-accent text-white shadow-card font-medium'
                      : 'bg-white text-ink-2 border border-line shadow-card'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Grounded PDF Document Badges */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 items-center pl-1">
                    <span className="font-mono-label text-[0.6rem] text-ink-3">Ref</span>
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="inline-block text-[0.65rem] bg-accent-soft text-accent border border-accent/15 px-2 py-0.5 rounded-sm font-medium truncate max-w-[120px]"
                        title={src}
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-line w-fit px-3 py-2 rounded-md shadow-card">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Input Box */}
          <footer className="p-2.5 bg-white border-t border-line">
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about tech, pricing..."
                className="flex-1 px-3 py-1.5 text-xs bg-paper border border-line rounded-sm text-ink placeholder:text-ink-3 font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-sm bg-accent text-white hover:bg-accent-strong disabled:opacity-40 transition-colors focus:outline-none cursor-pointer"
                aria-label="Send message"
              >
                <svg className="w-3.5 h-3.5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </footer>
        </div>
      )}

      {/* Floating Launcher Button */}
      <div className="relative">
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-accent opacity-30 animate-ping pointer-events-none"></span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-11 h-11 bg-accent hover:bg-accent-strong text-white rounded-full shadow-float transition-all focus:outline-none cursor-pointer transform hover:scale-105 active:scale-95"
          aria-label="Toggle Chat"
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}