'use client';

import { useState } from 'react';

export function PostComposer({ onPosted }: { onPosted?: () => void }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function post() {
    if (!content) return;
    setLoading(true);
    try {
      await fetch('/api/skills/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setContent('');
      onPosted?.();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
      <textarea className="w-full border-0 resize-none text-sm focus:outline-none mb-3" rows={3} placeholder="What's on your mind? (stored on 0G)" value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={post} disabled={loading || !content} className="px-5 py-2 bg-[#9200E1] text-white text-sm font-bold rounded-full hover:bg-[#7A00BD] disabled:opacity-50">
        {loading ? 'Posting...' : 'Post to 0G'}
      </button>
    </div>
  );
}
