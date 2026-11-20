import { useState } from 'react';
import AutoEventsPanel from './AutoEventsPanel';
import TikiEventsPanel from './TikiEventsPanel';

const TABS = [
  { id: 'tiki', label: 'Tiki (manual review)' },
  { id: 'auto', label: 'Auto-published platforms' },
];

// Tab "Event Management": Tiki do Admin duyệt (như cũ) + sàn tự đăng sự kiện
export default function EventsPanel() {
  const [tab, setTab] = useState('tiki');
  const [autoOpened, setAutoOpened] = useState(false); // chỉ tải sự kiện tự đăng khi mở tab lần đầu

  const select = (id) => {
    setTab(id);
    if (id === 'auto') setAutoOpened(true);
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl border border-slate-700/50 bg-[#0f172a]/60 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-syne font-medium transition-all ${tab === t.id ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cả hai giữ trong cây (chỉ ẩn) để không mất danh sách khi chuyển qua lại */}
      <div className={tab === 'tiki' ? '' : 'hidden'}><TikiEventsPanel /></div>
      {autoOpened && <div className={tab === 'auto' ? '' : 'hidden'}><AutoEventsPanel /></div>}
    </div>
  );
}
