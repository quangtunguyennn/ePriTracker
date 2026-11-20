import { useState } from 'react';
import { clearAuth } from '../api/authStorage';
import MonitoringPanel from './admin/MonitoringPanel';
import StatsPanel from './admin/StatsPanel';
import EventsPanel from './admin/EventsPanel';

// Giao diện SaaS sáng cho toàn bộ trang Admin (nền phẳng, thẻ trắng viền mảnh, màu nhấn cam như trang người dùng)
export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('events');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', subtitle: 'How people are using ePriTracker' },
    { id: 'monitoring', label: 'Scraper Monitoring', subtitle: 'Health of the scrapers and background jobs' },
    { id: 'events', label: 'Event Management', subtitle: 'Tiki events you publish and events the other platforms publish automatically' },
    { id: 'tracking', label: 'Tracked Products', soon: true },
    { id: 'users', label: 'User Management', soon: true },
    { id: 'settings', label: 'System Settings', soon: true },
  ];
  const current = menuItems.find(m => m.id === activeMenu);

  // Đăng xuất: xoá phiên trong localStorage (giống nút Logout ở trang người dùng) rồi về trang đăng nhập
  const handleLogout = () => {
    if (!window.confirm('Log out of the admin panel?')) return;
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="flex h-screen bg-[#f7f7f5] font-sans text-slate-800">
        <aside className="w-72 flex flex-col bg-white border-r border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-3xl font-urbanist font-bold text-orange-500">ePriTracker</h1>
            <p className="text-xs font-syne mt-2 uppercase tracking-widest text-slate-500">Admin Panel</p>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const active = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors duration-200 font-syne font-medium border ${active
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  {item.label}
                  {/* Mục chưa làm: ghi rõ để không bị tưởng là lỗi khi bấm vào thấy trống */}
                  {item.soon && (
                    <span className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Soon</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-xl text-left font-syne font-medium text-rose-600 border border-transparent transition-colors duration-200 hover:bg-rose-50 hover:border-rose-200"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-urbanist font-bold text-slate-900">{current?.label}</h2>
            {current?.subtitle && <p className="mt-1 text-sm text-slate-500">{current.subtitle}</p>}
          </header>

          {activeMenu === 'dashboard' && <StatsPanel />}
          {activeMenu === 'monitoring' && <MonitoringPanel />}

          {/* Giữ panel sự kiện trong cây (chỉ ẩn) để danh sách đã quét không mất khi chuyển tab */}
          <div className={activeMenu === 'events' ? '' : 'hidden'}>
            <EventsPanel />
          </div>

          {current?.soon && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-base font-semibold text-slate-900">{current.label} is coming soon</p>
              <p className="mt-1 text-sm text-slate-500">This section is planned but not built yet.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
