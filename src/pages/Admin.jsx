import { useState } from 'react';

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tracking', label: 'Quản lý Theo dõi Giá', icon: '📈' },
    { id: 'vouchers', label: 'Phát hiện Voucher', icon: '🏷️' },
    { id: 'users', label: 'Quản lý Người dùng', icon: '👥' },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">ePriTracker</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeMenu === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Tổng quan hệ thống</h2>
            <p className="text-gray-500 mt-1">Cập nhật dữ liệu Crawl mới nhất từ Shopee, Tiki, Lazada.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Stats (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Sản phẩm đang theo dõi', value: '1,245', change: '+12%', color: 'text-blue-600' },
            { title: 'Biến động giá (24h)', value: '382', change: '+5%', color: 'text-green-600' },
            { title: 'Voucher mới phát hiện', value: '45', change: '+18%', color: 'text-purple-600' },
            { title: 'Cảnh báo đã gửi', value: '890', change: '-2%', color: 'text-orange-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.title}</h3>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className={`text-sm font-medium mb-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart / Data Section Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ lịch sử & Dự đoán giá</h3>
          <div className="w-full h-64 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
            <p className="text-gray-400">Khu vực tích hợp thư viện biểu đồ (Recharts / Chart.js)</p>
          </div>
        </div>
      </main>
    </div>
  );
}