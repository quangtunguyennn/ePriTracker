import { useState } from 'react';
import { clearAuth } from '../api/authStorage';
import MonitoringPanel from './admin/MonitoringPanel';
import StatsPanel from './admin/StatsPanel';
import EventsPanel from './admin/EventsPanel';

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('events');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'monitoring', label: 'Scraper Monitoring' },
    { id: 'events', label: 'Event Management' },
    { id: 'tracking', label: 'Tracked Products' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'System Settings' },
  ];

  // Đăng xuất: xoá phiên trong localStorage (giống nút Logout ở trang người dùng) rồi về trang đăng nhập
  const handleLogout = () => {
    if (!window.confirm('Log out of the admin panel?')) return;
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      {/* ... Style, Sidebar, Background Video sections stay the same ... */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      <div className="fixed inset-0 w-full h-full z-0 bg-[#0f172a]">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-40">
          <source src="/theme.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/80 to-[#0f172a]/95 w-full h-full"></div>
      </div>

      <div className="relative z-10 flex h-screen font-sans text-slate-200">

        {/* ... Paste your Aside Sidebar section here ... */}
        <aside className="w-72 flex flex-col bg-[#0f172a]/60 backdrop-blur-xl border-r border-slate-700/50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-slate-700/50">
            <h1 className="text-3xl font-urbanist font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 drop-shadow-md">ePriTracker</h1>
            <p className="text-xs font-syne text-slate-400 mt-2 uppercase tracking-widest">Admin Panel</p>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 font-syne font-medium ${activeMenu === item.id ? 'bg-slate-800/80 text-white border border-slate-600/50 shadow-[0_0_15px_rgba(14,165,233,0.15)] translate-x-1' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 hover:translate-x-1'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3.5 rounded-xl text-left font-syne font-medium text-rose-400 border border-transparent transition-all duration-300 hover:bg-rose-900/30 hover:border-rose-800/60 hover:translate-x-1"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-urbanist font-bold text-white drop-shadow-sm">{menuItems.find(m => m.id === activeMenu)?.label}</h2>
            </div>
          </header>

          {activeMenu === 'dashboard' && <StatsPanel />}
          {activeMenu === 'monitoring' && <MonitoringPanel />}

          {/* Giữ panel sự kiện trong cây (chỉ ẩn) để danh sách đã quét không mất khi chuyển tab – như trước khi tách file */}
          <div className={activeMenu === 'events' ? '' : 'hidden'}>
            <EventsPanel />
          </div>
        </main>
      </div>
    </>
  );
}
