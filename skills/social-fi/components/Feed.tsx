'use client';

export function Feed({ posts }: { posts: Array<{ id: string; content: string; author: string; timestamp: number; storageUri?: string }> }) {
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <div key={p.id} className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <p className="text-sm text-[#000] mb-2">{p.content}</p>
          <div className="flex justify-between text-[10px] text-[#999]">
            <span className="font-mono">{p.author.slice(0, 8)}...</span>
            <span>{new Date(p.timestamp).toLocaleString()}</span>
          </div>
          {p.storageUri && <div className="text-[10px] text-[#9200E1] mt-1">{p.storageUri}</div>}
        </div>
      ))}
    </div>
  );
}
