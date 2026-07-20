import { faJira } from "@fortawesome/free-brands-svg-icons/faJira";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons/faSortDown";
import { faSortUp } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ProductItem from "../components/ProductItem";
export default function Product() {
  const exampleData = [
    {
      id: 1,
      productName: "Wireless Noise-Canceling Headphones",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      desc: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
      initialPrice: "$299.99",
    },
    {
      id: 2,
      productName: "Minimalist Mechanical Keyboard",
      image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
      desc: "Compact 75% layout with tactile switches and customizable RGB backlighting.",
      initialPrice: "$129.50",
    },
    {
      id: 3,
      productName: "Ergonomic Wooden Desk Lamp",
      image:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      desc: "Adjustable warm LED desk light crafted from natural oak.",
      initialPrice: "$75.00",
    },
    {
      id: 4,
      productName: "Stainless Steel Water Bottle",
      image:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
      desc: "Double-wall insulated 32oz bottle that keeps drinks cold for up to 24 hours.",
      initialPrice: "$34.99",
    },
    {
      id: 5,
      productName: "Smart Fitness Watch",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      desc: "Tracks heart rate, sleep patterns, and daily workout metrics with built-in GPS.",
      initialPrice: "$199.00",
    },
    {
      id: 6,
      productName: "Canvas Everyday Backpack",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      desc: "Durable water-resistant backpack featuring a dedicated 15-inch laptop sleeve.",
      initialPrice: "$85.00",
    },
    {
      id: 7,
      productName: "Portable Bluetooth Speaker",
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
      desc: "Waterproof wireless speaker with deep bass and 12 hours of playback.",
      initialPrice: "$59.95",
    },
    {
      id: 8,
      productName: "Ceramic Coffee Pour-Over Set",
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      desc: "Handcrafted ceramic dripper and server set for specialty morning brews.",
      initialPrice: "$48.00",
    },
    {
      id: 9,
      productName: "Ultra-Thin Power Bank 10000mAh",
      image:
        "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80",
      desc: "Fast-charging pocket-sized battery pack with dual USB-C output ports.",
      initialPrice: "$39.99",
    },
    {
      id: 10,
      productName: "Noise-Isolating In-Ear Monitors",
      image:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
      desc: "Wired studio-grade earphones with detachable cable and balanced armature drivers.",
      initialPrice: "$149.99",
    },
  ];
  return (
    <>
      <div className="">
        <div className=" sticky top-30 flex items-center justify-center w-full px-4">
          <div className="group flex w-1/2 hover:w-full transition-all duration-500 ease-in-out">
            <div className="relative flex-1">
              <input
                className="w-full h-full border-2 border-gray-300 border-r-0 rounded-l-md pl-12 pr-4 py-2 font-syne text-2xl outline-none"
                type="text"
                name="linkProduct"
                placeholder="Enter product's link ... "
              />

              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              >
                <img className="w-8 h-8" src="paste.png" alt="paste" />
              </button>
            </div>

            <button
              className="flex items-center gap-2 font-syne bg-orange-500 text-white font-bold border-2 border-orange-500 hover:bg-orange-600 transition-colors px-4 py-2 text-xl rounded-r-md"
              type="button"
            >
              Track <FontAwesomeIcon icon={faJira} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center w-full pt-8 px-4 ">
        {/* Thẻ bọc ngoài thiết lập độ rộng tối đa và ép các thành phần con có cùng chiều cao */}
        <div className="flex w-full  items-stretch shadow-sm">
          {/* 1. Ô Tìm kiếm (Có icon kính lúp nằm hẳn bên trong) */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              className="w-full h-full border-2 border-gray-300 border-r-0 rounded-l-md pl-12 pr-4 py-2 font-syne text-lg outline-none focus:border-orange-500 transition-colors"
              type="text"
              placeholder="Search products ... "
            />
          </div>

          {/* 2. Nút Sắp xếp theo Date */}
          <button
            className="flex items-center gap-2 font-syne border-2 border-gray-300 border-r-0 px-4 py-2 text-lg bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 transition-colors"
            type="button"
          >
            Date <FontAwesomeIcon icon={faSortDown} className="text-gray-400" />
          </button>

          {/* 3. Nút Sắp xếp theo Price */}
          <button
            className="flex items-center gap-2 font-syne border-2 border-gray-300 border-r-0 px-4 py-2 text-lg bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 transition-colors"
            type="button"
          >
            Price <FontAwesomeIcon icon={faSortUp} className="text-gray-400" />
          </button>

          {/* 4. Ô Lọc Price Status */}
          <select
            className="font-syne border-2 border-gray-300 border-r-0 px-4 py-2 text-lg outline-none bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 transition-colors"
            defaultValue=""
          >
            <option value="" disabled hidden selected>
              Price Status
            </option>
            <option value="1">All Products</option>
            <option value="2">On Sale</option>
            <option value="3">Target Reached</option>
          </select>

          {/* 5. Nút Advanced Filters (Đóng khối - Bo góc bên phải) */}
          <button
            className="font-syne border-2 border-gray-300  px-4 py-2 text-lg outline-none bg-white cursor-pointer hover:bg-gray-50 hover:text-orange-500 rounded-r-md transition-colors"
            type="button"
          >
            Advanced Filters
          </button>
        </div>
      </div>

      <div className="flex flex-wrap pt-12">
        {exampleData.map((item) => (
          <ProductItem
            key={item.id}
            productName={item.productName}
            image={item.image}
            desc={item.desc}
            initialPrice={item.initialPrice}
          />
        ))}
      </div>
    </>
  );
}
