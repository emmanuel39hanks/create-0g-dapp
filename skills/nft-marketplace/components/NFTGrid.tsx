'use client';

export function NFTGrid({ tokens }: { tokens: Array<{ id: string; name: string; owner: string; storageUri?: string }> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {tokens.map((t) => (
        <div key={t.id} className="rounded-2xl border border-[#E5E5E5] bg-white p-4 hover:border-[#9200E1] transition-all">
          <div className="aspect-square bg-[#F8F0FF] rounded-xl mb-3 flex items-center justify-center">
            <span className="text-3xl text-[#9200E1]">NFT</span>
          </div>
          <h3 className="font-bold text-sm">{t.name}</h3>
          <p className="text-[10px] text-[#999] font-mono truncate">{t.owner}</p>
          {t.storageUri && <p className="text-[10px] text-[#9200E1] truncate mt-1">{t.storageUri}</p>}
        </div>
      ))}
    </div>
  );
}
