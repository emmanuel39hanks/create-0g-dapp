'use client';

import { useEffect, useState } from 'react';
import { StatusCard } from '@/components/StatusCard';
import { NetworkBadge } from '@/components/NetworkBadge';

interface HealthData {
  status: string;
  network: string;
  timestamp: string;
  envValidation: { valid: boolean; warnings: string[]; errors: string[] };
  components: Record<string, { ok: boolean; status: 'connected' | 'disabled' | 'error'; details?: Record<string, unknown>; error?: string }>;
}

const PAGES = [
  { name: 'Storage', href: '/storage', desc: 'Upload & download data on 0G Storage' },
  { name: 'Compute', href: '/compute', desc: 'AI inference via Qwen on 0G Compute' },
  { name: 'Chain', href: '/chain', desc: 'Anchor data hashes on 0G Chain' },
  { name: 'INFT', href: '/inft', desc: 'Mint intelligent NFTs with metadata on 0G' },
];

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
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-orange-500">0G</span> Full Stack
          </h1>
          <p className="text-neutral-500 text-sm mt-1">All 5 components wired up and ready</p>
        </div>
        {health && <NetworkBadge network={health.network} status={health.status} />}
      </header>

      {/* Component Status */}
      <section className="mb-12">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Component Status</h2>
        {loading ? (
          <div className="text-neutral-500 text-sm">Checking 0G health...</div>
        ) : health ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(health.components).map(([name, check]) => (
              <StatusCard key={name} name={name} {...check} />
            ))}
          </div>
        ) : (
          <div className="text-red-400 text-sm">Failed to load health data. Is your .env.local configured?</div>
        )}
      </section>

      {/* Warnings */}
      {health && health.envValidation.warnings.length > 0 && (
        <section className="mb-12">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
            <h3 className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-3">Setup Hints</h3>
            <ul className="space-y-1.5">
              {health.envValidation.warnings.map((w, i) => (
                <li key={i} className="text-xs text-yellow-400/70 flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">-</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Demo Pages */}
      <section className="mb-12">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Try It</h2>
        <div className="grid grid-cols-3 gap-3">
          {PAGES.map(({ name, href, desc }) => (
            <a key={href} href={href} className="group block">
              <div className="rounded-2xl border border-neutral-800 p-5 transition-all hover:border-orange-500/50 hover:bg-orange-500/5">
                <h3 className="font-bold text-sm mb-1 group-hover:text-orange-400 transition-colors">{name}</h3>
                <p className="text-xs text-neutral-500">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Links */}
      <footer className="text-center text-xs text-neutral-600 space-x-4">
        <a href="https://docs.0g.ai" className="hover:text-orange-400" target="_blank" rel="noopener">Docs</a>
        <a href="/api/0g/health" className="hover:text-orange-400">Health API</a>
        <a href="https://compute-marketplace.0g.ai" className="hover:text-orange-400" target="_blank" rel="noopener">Compute Marketplace</a>
      </footer>
    </div>
  );
}
