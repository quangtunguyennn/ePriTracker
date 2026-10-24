// src/layouts/ProductLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomScrollRestoration from "../components/CustomScrollRestoration";
export default function ProductLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
     <CustomScrollRestoration/>
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}