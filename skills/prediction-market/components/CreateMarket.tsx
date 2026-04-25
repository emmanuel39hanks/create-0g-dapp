'use client';

import { useState } from 'react';

export function CreateMarket({ onCreated }: { onCreated?: () => void }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function create() {
    if (!question) return;
    setLoading(true);
    try {
      const res = await fetch('/api/skills/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResult(data);
      onCreated?.();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
      <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3">Create Market</h2>
      <input
        className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm focus:border-[#9200E1] outline-none mb-3"
        placeholder="Will ETH hit $5000 by end of 2026?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        onClick={create}
        disabled={loading || !question}
        className="px-5 py-2 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50"
      >
        {loading ? 'Evaluating...' : 'Create Market'}
      </button>

      {result && (
        <div className="mt-3 bg-[#F8F0FF] rounded-xl p-3">
          <pre className="text-xs text-[#333]">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
