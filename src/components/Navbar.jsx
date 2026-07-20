// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className=" sticky top-0 z-100 text-black bg-neutral-100 p-4  md:flex  justify-between items-center pl-8 pr-8 shadow-md rounded-br-full  ">
      <div className=" flex gap-2 justify-start">
        <div className="flex ">
          <img className="w-15 h-15 object-contain" src="/paypal.png" />
        </div>

        <div className=" flex items-center justify-center">
          <text className="font-urbanist text-3xl font-semibold ">
            ePriTracker
          </text>
        </div>
      </div>

      <div className="flex gap-20">
        <div className="flex gap-18">
          <Link
            to="/"
            className="hover:text-yellow-600 transition-colors text-xl font-semibold no-underline font-urbanist"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="hover:text-yellow-600 transition-colors text-xl font-semibold no-underline font-urbanist"
          >
            Products
          </Link>
          {/* <Link to="" className=' hover:text-yellow-600 transition-colors text-2xl font-semibold no-underline font-urbanist'>About</Link> */}
          <Link
            to=""
            className=" hover:text-yellow-600 transition-colors text-xl font-semibold no-underline font-urbanist"
          >
            Events
          </Link>
        </div>

        <div className="flex gap-4">
          <div>
            <img
              className="w-8 h-8  object-contain cursor-pointer"
              src="user.svg"
            />
          </div>

          <div>
            <img
              className="w-7 h-7 object-contain cursor-pointer"
              src="notify.svg"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
