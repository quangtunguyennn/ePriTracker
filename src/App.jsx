// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeLayout from './layouts/HomeLayout';
import Home from './pages/Home';
import Product from './pages/Product';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Bọc HomeLayout ra ngoài cùng. Tất cả các Route con bên trong sẽ tự động thừa hưởng Navbar và Footer */}
        <Route path="/" element={<HomeLayout />}>
          
          {/* Khi URL là "/" -> Home sẽ chui vào nằm trong HomeLayout */}
          <Route index element={<Home />} />
          
          {/* Khi URL là "/products" -> Products sẽ chui vào nằm trong HomeLayout */}
          <Route path="products" element={<Product />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}