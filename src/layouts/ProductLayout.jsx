// src/layouts/HomeLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function ProductLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

  
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

     
      <footer className="bg-gray-900 text-gray-400 text-center py-4 text-sm">
        <p>© 2026 TechStore. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}