'use client';

import { useEffect, useState } from 'react';

interface HealthData {
  status: string;
  network: string;
  timestamp: string;
  envValidation: { valid: boolean; warnings: string[]; errors: string[] };
  components: Record<string, { ok: boolean; status: string; details?: Record<string, unknown>; error?: string }>;
}

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/0g/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="text-orange-500">0G</span> App
          </h1>
          <p className="text-neutral-400 text-lg">
            Your decentralized application is ready.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-xs font-mono text-neutral-400">
            <span className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : health?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            {loading ? 'Checking...' : health?.network || 'disconnected'}
          </div>
        </div>

        {health && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Components</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(health.components).map(([name, check]) => (
                <div key={name} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${check.status === 'connected' ? 'bg-green-500' : check.status === 'disabled' ? 'bg-neutral-600' : 'bg-red-500'}`} />
                    <span className="font-bold text-sm capitalize">{name}</span>
                  </div>
                  <span className="text-xs text-neutral-500">{check.status}</span>
                </div>
              ))}
            </div>

            {health.envValidation.warnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <h3 className="text-yellow-500 text-xs font-bold mb-2">Setup Hints</h3>
                <ul className="space-y-1">
                  {health.envValidation.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-yellow-400/70">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {health.envValidation.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h3 className="text-red-500 text-xs font-bold mb-2">Errors</h3>
                <ul className="space-y-1">
                  {health.envValidation.errors.map((e, i) => (
                    <li key={i} className="text-xs text-red-400/70">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="text-center space-y-3 pt-4">
          <p className="text-sm text-neutral-500">
            Edit <code className="bg-neutral-800 px-2 py-0.5 rounded text-orange-400">.env.local</code> to configure your 0G components.
          </p>
          <div className="flex gap-3 justify-center text-xs">
            <a href="https://docs.0g.ai" className="text-orange-400 hover:underline" target="_blank" rel="noopener">0G Docs</a>
            <span className="text-neutral-700">|</span>
            <a href="/api/0g/health" className="text-orange-400 hover:underline">Health API</a>
            <span className="text-neutral-700">|</span>
            <a href="https://github.com/schemalabs/create-0g-app" className="text-orange-400 hover:underline" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </div>
    </div>
  );
}
