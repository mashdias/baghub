"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, status, error, sendMessage } = useChat({
    api: '/api/chat',
    onError: (e) => console.error(e)
  });
  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage({ content: input, role: 'user' });
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-xl hover:bg-primary-dark hover:scale-105 transition-all z-50 ${isOpen ? 'hidden' : 'flex'} items-center justify-center`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">BagHub AI</h3>
                <p className="text-[10px] opacity-90">Online & Ready to help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 max-h-[400px] min-h-[300px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-70">
                <Bot size={40} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">Hello! I'm BagHub AI.</p>
                <p className="text-xs">How can I assist you today?</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${message.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                        {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                      </div>
                      <div className={`px-3 py-2 rounded-2xl text-sm ${message.role === 'user' ? 'bg-secondary text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm whitespace-pre-wrap'}`}>
                        {message.content || message.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('') || (message as any).error?.message || ''}
                      </div>
                    </div>
                  </div>
                ))}
                {error && (
                  <div className="flex justify-center my-2">
                    <span className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full text-center">
                      Connection error. Please try again in a minute.
                    </span>
                  </div>
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white bg-primary">
                        <Bot size={12} />
                      </div>
                      <div className="px-4 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2 relative">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about our bags..."
                className="flex-1 pl-4 pr-10 py-2.5 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-primary hover:text-primary-dark disabled:opacity-50 disabled:hover:text-primary transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Powered by BagHub AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
