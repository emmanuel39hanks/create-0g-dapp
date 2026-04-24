'use client';

import { useState } from 'react';

export default function INFTPage() {
  const [contract, setContract] = useState('');
  const [name, setName] = useState('My 0G INFT');
  const [description, setDescription] = useState('An intelligent NFT with metadata on 0G Storage');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [lookupContract, setLookupContract] = useState('');
  const [lookupTokenId, setLookupTokenId] = useState('');
  const [tokenInfo, setTokenInfo] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function mint() {
    if (!contract || !to || !name) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/inft/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress: contract,
          to,
          metadata: { name, description },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Mint failed'); }
    finally { setLoading(false); }
  }

  async function lookup() {
    if (!lookupContract || !lookupTokenId) return;
    setLoading(true); setError(''); setTokenInfo(null);
    try {
      const res = await fetch(`/api/inft/token?contract=${lookupContract}&tokenId=${lookupTokenId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTokenInfo(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Lookup failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <a href="/" className="text-xs text-neutral-500 hover:text-orange-400 mb-6 block">&larr; Back</a>
      <h1 className="text-2xl font-black mb-1"><span className="text-orange-500">0G</span> INFT</h1>
      <p className="text-neutral-500 text-sm mb-8">Mint intelligent NFTs with metadata stored on 0G Storage and verified on-chain.</p>

      {/* Mint */}
      <div className="mb-8 space-y-3">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Mint INFT</h2>
        <input className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-200 font-mono focus:border-orange-500 outline-none" placeholder="INFT contract address (0x...)" value={contract} onChange={(e) => setContract(e.target.value)} />
        <input className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-200 font-mono focus:border-orange-500 outline-none" placeholder="Recipient address (0x...)" value={to} onChange={(e) => setTo(e.target.value)} />
        <input className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-200 focus:border-orange-500 outline-none" placeholder="NFT Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-200 focus:border-orange-500 outline-none" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={mint} disabled={loading || !contract || !to} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-full hover:bg-orange-600 disabled:opacity-50">
          {loading ? 'Minting...' : 'Mint INFT'}
        </button>
      </div>

      {result && (
        <div className="mb-8 bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
          <h3 className="text-green-400 text-xs font-bold mb-3">Minted</h3>
          <div className="space-y-1.5 text-xs font-mono">
            {Object.entries(result).map(([k, v]) => (
              <div key={k}><span className="text-neutral-500">{k}:</span> <span className="text-green-300">{v}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Lookup */}
      <div className="mb-8 space-y-3">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Lookup Token</h2>
        <div className="flex gap-3">
          <input className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-200 font-mono focus:border-orange-500 outline-none" placeholder="Contract (0x...)" value={lookupContract} onChange={(e) => setLookupContract(e.target.value)} />
          <input className="w-28 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-200 font-mono focus:border-orange-500 outline-none" placeholder="Token ID" value={lookupTokenId} onChange={(e) => setLookupTokenId(e.target.value)} />
          <button onClick={lookup} disabled={loading} className="px-5 py-2.5 bg-neutral-700 text-white text-sm font-bold rounded-full hover:bg-neutral-600 disabled:opacity-50">Lookup</button>
        </div>
      </div>

      {tokenInfo && (
        <div className="mb-8 bg-neutral-900 border border-neutral-700 rounded-2xl p-5">
          <h3 className="text-neutral-400 text-xs font-bold mb-3">Token Info</h3>
          <pre className="text-xs font-mono text-neutral-300">{JSON.stringify(tokenInfo, null, 2)}</pre>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className="text-xs text-red-400">{error}</p></div>}
    </div>
  );
}
