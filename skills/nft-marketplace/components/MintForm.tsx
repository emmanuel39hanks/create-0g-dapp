'use client';

import { useState } from 'react';

export function MintForm() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function mint() {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch('/api/skills/nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc }),
      });
      setResult(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
      <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3">Mint INFT</h2>
      <input className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm mb-2 focus:border-[#9200E1] outline-none" placeholder="NFT Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm mb-3 focus:border-[#9200E1] outline-none" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
      <button onClick={mint} disabled={loading || !name} className="px-5 py-2 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50">
        {loading ? 'Minting...' : 'Mint'}
      </button>
      {result && <pre className="mt-3 bg-[#F8F0FF] rounded-xl p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
