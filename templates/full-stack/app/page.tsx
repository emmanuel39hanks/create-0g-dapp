'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { StatusCard } from '@/components/StatusCard';
import { NetworkBadge } from '@/components/NetworkBadge';

interface HealthData {
  status: string;
  network: string;
  components: Record<string, { ok: boolean; status: 'connected' | 'disabled' | 'error'; details?: Record<string, unknown>; error?: string }>;
  envValidation: { warnings: string[]; errors: string[] };
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
    fetch('/api/0g/health').then((r) => r.json()).then(setHealth).catch(() => null).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Image src="/0g-logo-purple.svg" alt="0G" width={48} height={24} />
          <div>
            <h1 className="text-2xl font-black tracking-tight">Full Stack</h1>
            <p className="text-[#999] text-xs">All components wired up and ready</p>
          </div>
        </div>
        {health && <NetworkBadge network={health.network} status={health.status} />}
      </header>

      <section className="mb-10">
        <h2 className="text-[10px] font-bold text-[#999] uppercase tracking-[0.15em] mb-4">Components</h2>
        {loading ? (
          <p className="text-[#999] text-sm">Checking 0G health...</p>
        ) : health ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(health.components).map(([name, check]) => (
              <StatusCard key={name} name={name} {...check} />
            ))}
          </div>
        ) : (
          <p className="text-red-500 text-sm">Failed to connect. Check .env.local</p>
        )}
      </section>

      {health && health.envValidation.warnings.length > 0 && (
        <section className="mb-10">
          <div className="bg-[#F8F0FF] border border-[#E3C1FF] rounded-2xl p-5">
            <h3 className="text-[#9200E1] text-xs font-bold mb-3 uppercase tracking-wider">Setup Hints</h3>
            {health.envValidation.warnings.map((w, i) => (
              <p key={i} className="text-xs text-[#666] mb-1">- {w}</p>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-[10px] font-bold text-[#999] uppercase tracking-[0.15em] mb-4">Try It</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PAGES.map(({ name, href, desc }) => (
            <a key={href} href={href} className="group block">
              <div className="rounded-2xl border border-[#E5E5E5] p-5 transition-all hover:border-[#9200E1] hover:bg-[#F8F0FF]/50 bg-white">
                <h3 className="font-bold text-sm mb-1 group-hover:text-[#9200E1] transition-colors">{name}</h3>
                <p className="text-xs text-[#999]">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-[#999] space-x-4">
        <a href="https://docs.0g.ai" className="hover:text-[#9200E1]" target="_blank" rel="noopener">Docs</a>
        <a href="/api/0g/health" className="hover:text-[#9200E1]">Health API</a>
        <a href="https://compute-marketplace.0g.ai" className="hover:text-[#9200E1]" target="_blank" rel="noopener">Compute</a>
        <a href="https://build.0g.ai" className="hover:text-[#9200E1]" target="_blank" rel="noopener">Builder Hub</a>
      </footer>
    </div>
  );
}
