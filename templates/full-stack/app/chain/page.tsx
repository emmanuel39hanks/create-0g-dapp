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
      <a href="/" className="text-xs text-neutral-500 hover:text-orange-400 mb-6 block">&larr; Back</a>
      <h1 className="text-2xl font-black mb-1"><span className="text-orange-500">0G</span> Chain</h1>
      <p className="text-neutral-500 text-sm mb-8">Anchor a data hash on 0G Chain. Permanent, verifiable proof that this data existed.</p>

      <div className="mb-6">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Data to Anchor</h2>
        <input
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 font-mono text-sm text-neutral-200 focus:border-orange-500 outline-none"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter any text to anchor on-chain..."
        />
        <button
          onClick={anchor}
          disabled={loading || !data}
          className="mt-3 px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Anchoring...' : 'Anchor on 0G Chain'}
        </button>
      </div>

      {result && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
          <h3 className="text-green-400 text-xs font-bold mb-3">Anchored on 0G Chain</h3>
          <div className="space-y-2 text-xs font-mono">
            <div><span className="text-neutral-500">Data Hash:</span> <span className="text-green-300">{result.dataHash}</span></div>
            <div><span className="text-neutral-500">TX Hash:</span> <span className="text-green-300">{result.txHash}</span></div>
            <div><span className="text-neutral-500">Chain ID:</span> <span className="text-green-300">{result.chainId}</span></div>
            <div><span className="text-neutral-500">Block:</span> <span className="text-green-300">{result.blockNumber}</span></div>
            {result.explorerUrl && (
              <a href={result.explorerUrl} target="_blank" rel="noopener" className="text-orange-400 hover:underline block mt-2">
                View on ChainScan &rarr;
              </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
