import React from "react";
import { Link } from "react-router-dom";

export default function ProductItem({
  productId,
  productName,
  image,
  desc,
  initialPrice,
  latestPrice,
  productLink,
  lastUpdatedAt,
  onDelete,
}) {
  // Format date cleanly for English Enterprise standard (e.g., "Aug 11, 2026, 10:19 PM")
  const formattedDate = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not updated yet";

  return (
    <article className="group relative flex flex-col justify-between w-full h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden">
      
      {/* 1. PRODUCT MEDIA & BADGES */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 border-b border-slate-100">
        <Link
          to={`/product/${productId}`}
          className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label={`View details for ${productName}`}
        >
          <img
            src={image || "/placeholder-product.png"}
            alt={productName}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Live Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[12px] font-medium font-syne text-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Tracking
          </span>
        </div>
      </div>

      {/* 2. PRODUCT DETAILS */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Title */}
        <Link
          to={`/product/${productId}`}
          title={productName}
          className="font-semibold font-questrial text-lg text-slate-900 leading-snug hover:text-orange-600 transition-colors line-clamp-2 mb-1.5"
        >
          {productName}
        </Link>

        {/* Description (Optional) */}
        {desc && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {desc}
          </p>
        )}

        {/* 3. PRICE DASHBOARD & FOOTER ACTIONS */}
        <div className="mt-auto pt-2">
          
          {/* Price Tracking Box (Gom nhóm Giá & Thời gian vào 1 khối cho gọn gàng) */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 mb-4">
            <div className="flex items-end justify-between mb-0">
              <div className="mb-2">
                <span className="text-[12px] uppercase tracking-wider font-questrial font-semibold text-gray-700 block mb-0.5">
                  Tracked Price
                </span>
                <span className="font-bold font-questrial text-lg text-slate-600 ">
                  {initialPrice}
                </span>
              </div>
              
            </div>
            <div className="border-t border-slate-200/60 pt-2 pb-2">
                <span className="text-[15px] font-questrial font-bold uppercase tracking-wider text-amber-600 block mb-0.5">
                  Latest Price
                </span>
                <span className="font-black font-questrial text-2xl text-orange-600">
                  {latestPrice}
                </span>
              </div>

            {/* Cập nhật thời gian */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-200/60">
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate font-questrial text-xs pt-1 font-semibold">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* 4. FOOTER BUTTONS (Chia tỉ lệ 50/50 cân đối) */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 py-2.5 px-3 text-sm font-semibold font-syne text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
                <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
              </svg>
              Delete
            </button>
            <a
              href={productLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 text-sm font-semibold font-syne text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white active:bg-slate-800 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              View 
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </article>
  );
}