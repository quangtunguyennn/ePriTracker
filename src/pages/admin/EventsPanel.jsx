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
      <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            aria-pressed={tab === t.id}
            onClick={() => select(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
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
