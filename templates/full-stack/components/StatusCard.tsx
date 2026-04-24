'use client';

interface StatusCardProps {
  name: string;
  status: 'connected' | 'disabled' | 'error';
  details?: Record<string, unknown>;
  error?: string;
  href?: string;
}

export function StatusCard({ name, status, details, error, href }: StatusCardProps) {
  const statusColors = {
    connected: 'border-green-500/30 bg-green-500/5',
    disabled: 'border-neutral-700/50 bg-neutral-800/30',
    error: 'border-red-500/30 bg-red-500/5',
  };

  const dotColors = {
    connected: 'bg-green-500',
    disabled: 'bg-neutral-600',
    error: 'bg-red-500',
  };

  const Wrapper = href ? 'a' : 'div';
  const linkProps = href ? { href, className: 'block' } : {};

  return (
    <Wrapper {...linkProps}>
      <div className={`rounded-2xl border p-5 transition-all hover:border-orange-500/30 ${statusColors[status]}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${dotColors[status]}`} />
            <h3 className="font-bold text-sm">{name}</h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">{status}</span>
        </div>

        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

        {details && Object.keys(details).length > 0 && (
          <div className="mt-2 space-y-1">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-neutral-500">{key}</span>
                <span className="text-neutral-300 font-mono truncate ml-4 max-w-[200px]">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
