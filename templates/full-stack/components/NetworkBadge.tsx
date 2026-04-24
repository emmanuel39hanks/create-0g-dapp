'use client';

export function NetworkBadge({ network, status }: { network: string; status: string }) {
  const color = status === 'ok' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-700/50 text-xs font-mono">
      <span className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-neutral-300">0G {network}</span>
    </div>
  );
}
