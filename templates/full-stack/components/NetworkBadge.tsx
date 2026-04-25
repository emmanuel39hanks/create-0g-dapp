'use client';

export function NetworkBadge({ network, status }: { network: string; status: string }) {
  const color = status === 'ok' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5E5E5] text-xs font-mono text-[#666]">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span>0G {network}</span>
    </div>
  );
}
