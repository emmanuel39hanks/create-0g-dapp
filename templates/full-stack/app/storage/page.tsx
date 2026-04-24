'use client';

import { useState } from 'react';

export default function StoragePage() {
  const [input, setInput] = useState('{"hello": "0G Storage", "timestamp": ""}');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [downloadHash, setDownloadHash] = useState('');
  const [downloaded, setDownloaded] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function upload() {
    setLoading(true);
    setError('');
    try {
      const payload = JSON.parse(input.replace('"timestamp": ""', `"timestamp": "${new Date().toISOString()}"`));
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setResult(data);
      setDownloadHash(data.rootHash || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!downloadHash) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/storage?rootHash=${encodeURIComponent(downloadHash)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Download failed');
      setDownloaded(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <a href="/" className="text-xs text-neutral-500 hover:text-orange-400 mb-6 block">&larr; Back</a>
      <h1 className="text-2xl font-black mb-1"><span className="text-orange-500">0G</span> Storage</h1>
      <p className="text-neutral-500 text-sm mb-8">Upload JSON to the immutable log layer. Download by root hash.</p>

      {/* Upload */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Upload</h2>
        <textarea
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 font-mono text-sm text-neutral-200 resize-none h-32 focus:border-orange-500 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={upload}
          disabled={loading}
          className="mt-3 px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload to 0G Storage'}
        </button>
      </div>

      {result && (
        <div className="mb-8 bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
          <h3 className="text-green-400 text-xs font-bold mb-3">Uploaded</h3>
          <div className="space-y-2 text-xs font-mono">
            <div><span className="text-neutral-500">Root Hash:</span> <span className="text-green-300">{result.rootHash as string}</span></div>
            <div><span className="text-neutral-500">URI:</span> <span className="text-green-300">{result.storageUri as string}</span></div>
            <div><span className="text-neutral-500">TX:</span> <span className="text-green-300">{result.txHash as string}</span></div>
          </div>
        </div>
      )}

      {/* Download */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Download</h2>
        <div className="flex gap-3">
          <input
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 font-mono text-sm text-neutral-200 focus:border-orange-500 outline-none"
            placeholder="Paste root hash..."
            value={downloadHash}
            onChange={(e) => setDownloadHash(e.target.value)}
          />
          <button
            onClick={download}
            disabled={loading || !downloadHash}
            className="px-6 py-2.5 bg-neutral-700 text-white text-sm font-bold rounded-full hover:bg-neutral-600 disabled:opacity-50 transition-colors"
          >
            Download
          </button>
        </div>
      </div>

      {downloaded && (
        <div className="mb-8 bg-neutral-900 border border-neutral-700 rounded-2xl p-5">
          <h3 className="text-neutral-400 text-xs font-bold mb-3">Downloaded ({(downloaded.durationMs as number)}ms, {(downloaded.byteSize as number)} bytes)</h3>
          <pre className="text-xs font-mono text-neutral-300 overflow-x-auto">{JSON.stringify(downloaded.data, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
