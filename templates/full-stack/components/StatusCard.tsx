'use client';

interface StatusCardProps {
  name: string;
  status: 'connected' | 'disabled' | 'error';
  details?: Record<string, unknown>;
  error?: string;
}

export function StatusCard({ name, status, details, error }: StatusCardProps) {
  const borderColor = {
    connected: 'border-green-200 bg-green-50/50',
    disabled: 'border-[#E5E5E5] bg-[#FAFAFA]',
    error: 'border-red-200 bg-red-50/50',
  };
  const dotColor = {
    connected: 'bg-green-500',
    disabled: 'bg-[#E5E5E5]',
    error: 'bg-red-500',
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all hover:border-[#B75FFF] ${borderColor[status]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor[status]}`} />
          <h3 className="font-bold text-sm text-[#000] capitalize">{name}</h3>
        </div>
        <span className="text-[10px] font-mono text-[#999] uppercase tracking-wider">{status}</span>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {details && Object.keys(details).length > 0 && (
        <div className="mt-2 space-y-1">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-[#999]">{key}</span>
              <span className="text-[#333] font-mono truncate ml-4 max-w-[200px]">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
