// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import ProductLayout from "./layouts/ProductLayout";
import DetailLayout from "./layouts/DetailLayout";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Detail from "./pages/Detail";
import Register from "./pages/Register";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route path="/events" element={<HomeLayout />}>
          <Route index element={<EventList />} />
          <Route path=":eventId" element={<EventDetail />} />
        </Route>

        <Route path="/products" element={<ProductLayout />}>
          <Route index element={<Product />} />
        </Route>

        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/product/:id" element={<DetailLayout />}>
          <Route index element={<Detail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
