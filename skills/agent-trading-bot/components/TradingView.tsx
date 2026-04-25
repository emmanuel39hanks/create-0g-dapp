'use client';

import { useState } from 'react';

export function TradingView() {
  const [asset, setAsset] = useState('ETH');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function evaluate() {
    setLoading(true);
    try {
      const res = await fetch('/api/skills/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, currentPrice: 3200, historicalPrices: [3100, 3150, 3180, 3200] }),
      });
      setResult(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
      <h2 className="font-bold text-sm mb-3">Trading Bot</h2>
      <p className="text-xs text-[#999] mb-4">AI evaluates trade decisions. Every decision anchored on 0G Chain.</p>
      <div className="flex gap-2 mb-3">
        <input className="flex-1 border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm focus:border-[#9200E1] outline-none" value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="Asset (ETH, BTC...)" />
        <button onClick={evaluate} disabled={loading} className="px-5 py-2 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Evaluate'}
        </button>
      </div>
      {result && <pre className="bg-[#F8F0FF] rounded-xl p-3 text-xs text-[#333] overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
