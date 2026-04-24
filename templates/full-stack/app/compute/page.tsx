'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ComputePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Inference failed');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${e instanceof Error ? e.message : 'Failed'}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto">
      <div className="p-8 pb-4">
        <a href="/" className="text-xs text-neutral-500 hover:text-orange-400 mb-6 block">&larr; Back</a>
        <h1 className="text-2xl font-black mb-1"><span className="text-orange-500">0G</span> Compute</h1>
        <p className="text-neutral-500 text-sm">Chat with an AI model running on 0G's decentralized compute network.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-20 text-neutral-600 text-sm">
            Send a message to start chatting with Qwen on 0G Compute
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-800 text-neutral-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 rounded-2xl px-4 py-3 text-sm text-neutral-400 animate-pulse">
              Thinking on 0G Compute...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-8 pt-4">
        <div className="flex gap-3">
          <input
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-5 py-3 text-sm text-neutral-200 focus:border-orange-500 outline-none"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-orange-500 text-white text-sm font-bold rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-neutral-600 text-center mt-2">
          Powered by 0G Compute — decentralized AI inference
        </p>
      </div>
    </div>
  );
}
