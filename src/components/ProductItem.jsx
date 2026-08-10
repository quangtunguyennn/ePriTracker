import { Link } from "react-router-dom";

export default function ProductItem({
  productId,
  productName,
  image,
  desc,
  initialPrice,
  onDelete,
}) {
  return (
    <article className="group relative flex flex-col justify-between w-full h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* 1. MAIN CONTENT AREA */}
      <div>
        {/* Fixed 1:1 aspect ratio image container */}
        <Link
          to={`/product/${productId}`}
          className="block relative aspect-square w-full overflow-hidden bg-gray-50 cursor-pointer"
        >
          <img
            src={image || "/placeholder-product.png"}
            alt={productName}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Product Information */}
        <div className="p-5">
          {/* Product Name (Max 2 lines limit) */}
          <Link
            to={`/product/${productId}`}
            title={productName}
            className="font-questrial font-semibold text-lg  text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 leading-snug"
          >
            {productName}
          </Link>

          {/* Product Description (If available) */}
          {desc && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
              {desc}
            </p>
          )}

          {/* Price Display */}
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-0.5">
                Tracked Price
              </span>
              <span className="font-urbanist text-2xl font-bold text-orange-600">
                {initialPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTION BUTTONS */}
      <div className="p-5 pt-0 mt-auto grid grid-cols-2 gap-2.5">
        {/* Delete Button */}
        <button
          type="button"
          onClick={onDelete}
          className="w-full py-2.5 px-3 text-sm font-semibold font-syne text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 640 640"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
          </svg>
          Delete
        </button>

        {/* Details Button */}
        <Link
          to={`/product/${productId}`}
          className="w-full py-2.5 px-3 text-sm font-semibold font-syne text-white bg-slate-900 hover:bg-slate-800 active:bg-black rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Details
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 640 640"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
