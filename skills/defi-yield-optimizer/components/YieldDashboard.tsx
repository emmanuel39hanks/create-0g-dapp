'use client';

import { useState } from 'react';

export function YieldDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch('/api/skills/optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunities: [
            { protocol: 'Aave', asset: 'USDC', apy: 4.2, risk: 'low', chain: 'Base' },
            { protocol: 'Morpho', asset: 'WETH', apy: 8.5, risk: 'medium', chain: 'Base' },
            { protocol: 'Yearn', asset: 'DAI', apy: 6.1, risk: 'low', chain: 'Ethereum' },
          ],
        }),
      });
      setResult(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
      <h2 className="font-bold text-sm mb-3">Yield Optimizer</h2>
      <p className="text-xs text-[#999] mb-4">AI analyzes DeFi yield opportunities and recommends allocation. Decisions logged to 0G Storage.</p>
      <button onClick={analyze} disabled={loading} className="px-5 py-2 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50">
        {loading ? 'Analyzing...' : 'Analyze Yields'}
      </button>
      {result && (
        <pre className="mt-4 bg-[#F8F0FF] rounded-xl p-3 text-xs text-[#333] overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
