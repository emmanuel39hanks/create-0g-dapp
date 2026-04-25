'use client';

interface MarketCardProps {
  id: string;
  question: string;
  options: string[];
  resolved: boolean;
  outcome?: string;
  proof?: { storageUri: string; chainTxHash: string };
  onResolve?: () => void;
}

export function MarketCard({ question, options, resolved, outcome, proof, onResolve }: MarketCardProps) {
  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 transition-all hover:border-[#9200E1]">
      <h3 className="font-bold text-sm mb-3 text-[#000]">{question}</h3>

      <div className="flex gap-2 mb-3">
        {options.map((opt) => (
          <span
            key={opt}
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              outcome === opt
                ? 'bg-[#9200E1] text-white'
                : 'bg-[#F5F5F5] text-[#666]'
            }`}
          >
            {opt}
          </span>
        ))}
      </div>

      {resolved ? (
        <div className="space-y-1">
          <div className="text-xs text-green-600 font-bold">Resolved: {outcome}</div>
          {proof && (
            <div className="text-[10px] text-[#999] space-x-3">
              <span>0G Storage: {proof.storageUri.slice(0, 25)}...</span>
              <span>Chain: {proof.chainTxHash.slice(0, 15)}...</span>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onResolve}
          className="text-xs px-4 py-1.5 bg-[#9200E1] text-white rounded-full hover:bg-[#7A00BD] font-bold"
        >
          Resolve with AI
        </button>
      )}
    </div>
  );
}
