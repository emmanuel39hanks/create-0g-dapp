'use client';

import { useState } from 'react';

export default function StorageDAppPage() {
  const [tab, setTab] = useState<'upload' | 'download' | 'anchor'>('upload');
  const [payload, setPayload] = useState('{\n  "title": "My first 0G document",\n  "content": "Hello, decentralized storage!"\n}');
  const [rootHash, setRootHash] = useState('');
  const [anchorData, setAnchorData] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function upload() {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = JSON.parse(payload);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { ...data, uploadedAt: new Date().toISOString() } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
      setRootHash(json.rootHash || '');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  async function download() {
    if (!rootHash) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`/api/upload?rootHash=${encodeURIComponent(rootHash)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  async function anchor() {
    if (!anchorData) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: anchorData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  const tabs = [
    { id: 'upload' as const, label: 'Upload' },
    { id: 'download' as const, label: 'Download' },
    { id: 'anchor' as const, label: 'Anchor' },
  ];

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black mb-1"><span className="text-[#9200E1]">0G</span> Storage dApp</h1>
      <p className="text-[#999] text-sm mb-8">Upload data to 0G Storage. Anchor hashes on 0G Chain. Verify forever.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white p-1 rounded-full w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResult(null); setError(''); }}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              tab === t.id ? 'bg-[#9200E1] text-white' : 'text-[#666] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload */}
      {tab === 'upload' && (
        <div className="space-y-4">
          <textarea
            className="w-full bg-white border border-[#E5E5E5] rounded-xl p-4 font-mono text-sm text-[#333] resize-none h-40 focus:border-[#9200E1] outline-none"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
          <button onClick={upload} disabled={loading} className="px-6 py-2.5 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50">
            {loading ? 'Uploading...' : 'Upload to 0G Storage'}
          </button>
        </div>
      )}

      {/* Download */}
      {tab === 'download' && (
        <div className="flex gap-3">
          <input
            className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 font-mono text-sm text-[#333] focus:border-[#9200E1] outline-none"
            placeholder="Paste root hash..."
            value={rootHash}
            onChange={(e) => setRootHash(e.target.value)}
          />
          <button onClick={download} disabled={loading || !rootHash} className="px-6 py-2.5 bg-[#E5E5E5] text-white text-sm font-bold rounded-full hover:bg-neutral-600 disabled:opacity-50">
            {loading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      )}

      {/* Anchor */}
      {tab === 'anchor' && (
        <div className="space-y-4">
          <input
            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm text-[#333] focus:border-[#9200E1] outline-none"
            placeholder="Data to anchor on 0G Chain..."
            value={anchorData}
            onChange={(e) => setAnchorData(e.target.value)}
          />
          <button onClick={anchor} disabled={loading || !anchorData} className="px-6 py-2.5 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50">
            {loading ? 'Anchoring...' : 'Anchor on 0G Chain'}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">
          <h3 className="text-green-600 text-xs font-bold mb-3">Result</h3>
          <pre className="text-xs font-mono text-[#333] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-12 text-center text-xs text-[#999] space-x-4">
        <a href="/api/0g/health" className="hover:text-[#9200E1]">Health API</a>
        <a href="https://storagescan.0g.ai" className="hover:text-[#9200E1]" target="_blank" rel="noopener">StorageScan</a>
        <a href="https://chainscan.0g.ai" className="hover:text-[#9200E1]" target="_blank" rel="noopener">ChainScan</a>
      </div>
    </div>
  );
}
