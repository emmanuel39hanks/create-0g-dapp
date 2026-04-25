'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tools?: Array<{ name: string; result?: Record<string, unknown> }>;
}

export default function AgentPage() {
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const toolsUsed: Array<{ name: string; result?: Record<string, unknown> }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'text_delta') {
              assistantContent += event.content;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  last.content = assistantContent;
                  last.tools = toolsUsed.length > 0 ? [...toolsUsed] : undefined;
                } else {
                  updated.push({ role: 'assistant', content: assistantContent, tools: toolsUsed.length > 0 ? [...toolsUsed] : undefined });
                }
                return updated;
              });
            }

            if (event.type === 'tool_start') {
              toolsUsed.push({ name: event.toolName });
            }

            if (event.type === 'tool_result') {
              const tool = toolsUsed.find((t) => t.name === event.toolName && !t.result);
              if (tool) tool.result = event.toolResult;
            }
          } catch { /* skip malformed events */ }
        }
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${e instanceof Error ? e.message : 'Failed'}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">
            <span className="text-[#9200E1]">0G</span> Agent
          </h1>
          <p className="text-[#999] text-xs">AI agent with Storage, Chain, and Compute tools</p>
        </div>
        <div className="text-[10px] font-mono text-[#999] bg-white px-2.5 py-1 rounded-full">
          Qwen on 0G Compute
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 py-4">
        {messages.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="text-4xl font-black text-[#9200E1]">0G</div>
            <p className="text-[#999] text-sm max-w-md mx-auto">
              I'm an AI agent running on 0G Compute. I can store data on 0G Storage, anchor proofs on 0G Chain, and list available compute services.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {['Check 0G health', 'List AI models', 'Store some data on 0G'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs bg-[#F5F5F5] hover:bg-[#E5E5E5] px-3 py-1.5 rounded-full text-[#333] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? '' : ''}`}>
              {/* Tool badges */}
              {msg.tools && msg.tools.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {msg.tools.map((t, j) => (
                    <span key={j} className="text-[10px] font-mono bg-[#9200E1]/10 text-[#9200E1] px-2 py-0.5 rounded-full">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#9200E1] text-white'
                  : 'bg-[#F5F5F5]/80 text-[#333]'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#F5F5F5]/80 rounded-2xl px-4 py-3 text-sm text-[#666] animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-2">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white border border-[#E5E5E5] rounded-full px-5 py-3 text-sm text-[#333] focus:border-[#9200E1] outline-none"
            placeholder="Ask about 0G, store data, anchor proofs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-[#999] text-center mt-1.5">
          Powered by Qwen on 0G Compute — decentralized AI inference
        </p>
      </div>
    </div>
  );
}
