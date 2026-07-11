// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-center items-center shadow-md">
   
      <div className="flex gap-30 ">
        <Link to="/" className="hover:text-blue-300 transition-colors no-underline">Home</Link>
        <Link to="/products" className="hover:text-blue-300 transition-colors no-underline">Products</Link>
        <Link to="" className='no-underline'>About</Link>
        <Link to="" className='no-underline'>Events</Link>
      </div>

    
    </nav>
  );
}