'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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
      <div className="max-w-2xl w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <Image src="/0g-logo-purple.svg" alt="0G" width={80} height={40} className="mx-auto" />
          <h1 className="text-4xl font-black tracking-tight text-[#000]">
            Your 0G App
          </h1>
          <p className="text-[#666] text-base">
            Decentralized AI infrastructure — ready to build.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5E5E5] text-xs font-mono text-[#666]">
            <span className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : health?.status === 'degraded' ? 'bg-yellow-500' : loading ? 'bg-[#E5E5E5]' : 'bg-red-500'}`} />
            {loading ? 'Checking...' : health ? `0G ${health.network}` : 'Disconnected'}
          </div>
        </div>

        {/* Components */}
        {health && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold text-[#999] uppercase tracking-[0.15em]">Components</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(health.components).map(([name, check]) => (
                <div key={name} className="rounded-2xl p-4 border border-[#E5E5E5] bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${check.status === 'connected' ? 'bg-green-500' : check.status === 'disabled' ? 'bg-[#E5E5E5]' : 'bg-red-500'}`} />
                    <span className="font-bold text-sm capitalize text-[#000]">{name}</span>
                  </div>
                  <span className="text-xs text-[#999]">{check.status}</span>
                </div>
              ))}
            </div>

            {health.envValidation.warnings.length > 0 && (
              <div className="bg-[#F8F0FF] border border-[#E3C1FF] rounded-2xl p-4">
                <h3 className="text-[#9200E1] text-xs font-bold mb-2">Setup Hints</h3>
                <ul className="space-y-1">
                  {health.envValidation.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-[#666]">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Getting Started */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-sm text-[#999]">
            Edit <code className="bg-[#F5F5F5] px-2 py-0.5 rounded text-[#9200E1] text-xs">.env.local</code> to configure your 0G components.
          </p>
          <div className="flex gap-4 justify-center text-xs font-medium">
            <a href="https://docs.0g.ai" className="text-[#9200E1] hover:underline" target="_blank" rel="noopener">Docs</a>
            <a href="/api/0g/health" className="text-[#9200E1] hover:underline">Health API</a>
            <a href="https://compute-marketplace.0g.ai" className="text-[#9200E1] hover:underline" target="_blank" rel="noopener">Compute</a>
            <a href="https://build.0g.ai" className="text-[#9200E1] hover:underline" target="_blank" rel="noopener">Builder Hub</a>
          </div>
        </div>
      </div>
    </div>
  );
}
