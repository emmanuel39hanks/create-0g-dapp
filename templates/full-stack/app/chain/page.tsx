'use client';

import { useState } from 'react';

export default function ChainPage() {
  const [data, setData] = useState('Hello from 0G Chain!');
  const [result, setResult] = useState<{ dataHash: string; txHash: string; chainId: number; blockNumber: number; explorerUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function anchor() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Anchor failed');
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Anchor failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <a href="/" className="text-xs text-[#999] hover:text-[#9200E1] mb-6 block">&larr; Back</a>
      <h1 className="text-2xl font-black mb-1"><span className="text-[#9200E1]">0G</span> Chain</h1>
      <p className="text-[#999] text-sm mb-8">Anchor a data hash on 0G Chain. Permanent, verifiable proof that this data existed.</p>

      <div className="mb-6">
        <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3">Data to Anchor</h2>
        <input
          className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 font-mono text-sm text-[#333] focus:border-[#9200E1] outline-none"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter any text to anchor on-chain..."
        />
        <button
          onClick={anchor}
          disabled={loading || !data}
          className="mt-3 px-6 py-2.5 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Anchoring...' : 'Anchor on 0G Chain'}
        </button>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <h3 className="text-green-600 text-xs font-bold mb-3">Anchored on 0G Chain</h3>
          <div className="space-y-2 text-xs font-mono">
            <div><span className="text-[#999]">Data Hash:</span> <span className="text-green-700">{result.dataHash}</span></div>
            <div><span className="text-[#999]">TX Hash:</span> <span className="text-green-700">{result.txHash}</span></div>
            <div><span className="text-[#999]">Chain ID:</span> <span className="text-green-700">{result.chainId}</span></div>
            <div><span className="text-[#999]">Block:</span> <span className="text-green-700">{result.blockNumber}</span></div>
            {result.explorerUrl && (
              <a href={result.explorerUrl} target="_blank" rel="noopener" className="text-[#9200E1] hover:underline block mt-2">
                View on ChainScan &rarr;
              </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
