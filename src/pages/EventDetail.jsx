import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMagnifyingGlass,
  faSpinner,
  faBoxOpen,
  faExternalLinkAlt,
  faPlus,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";

export default function EventDetail() {
  const { eventId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State quản lý hiệu ứng loading cho nút Track của từng sản phẩm
  const [trackingId, setTrackingId] = useState(null);

  const API_BASE_URL = "https://localhost:44338";

  useEffect(() => {
    const fetchEventProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/api/Event/getLiveEventProducts/${eventId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setProducts(response.data);
      } catch (error) {
        console.error("Error loading event products:", error);
        toast.error("Failed to load products for this event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventProducts();
  }, [eventId]);

  // Xử lý khi bấm nút Track
  const handleTrackProduct = async (productLink, productId) => {
    if (!productLink) {
      toast.error("Cannot track this product: Missing product link.");
      return;
    }

    setTrackingId(productId);
    const toastId = toast.loading("Adding Product to tracking list...");
    const token = localStorage.getItem("token");

    try {
      await axios.post(`${API_BASE_URL}/api/product/add`, `"${productLink}"`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Product tracked successfully!", { id: toastId });
    } catch (error) {
      console.error("Error tracking product:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to track this product.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setTrackingId(null);
    }
  };

  const filteredProducts = products.filter((item) =>
    item.productName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8 font-syne relative selection:bg-orange-100 selection:text-orange-900">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "font-syne text-sm font-medium rounded-xl shadow-lg border border-slate-100",
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* SECTION 1: HEADER & BACK BUTTON */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-questrial font-bold text-sm mb-6 bg-slate-50 hover:bg-orange-50 px-4 py-2 rounded-xl"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-2xl w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full mb-3 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Event
              </div>
              <h1 className="font-urbanist md:text-4xl text-3xl font-black text-slate-900 mb-2 tracking-tight">
                Event Products
              </h1>
              <p className="text-slate-500 font-ggf text-sm md:text-base">
                Explore and track products participating in this specific event.
                Get notified when prices drop.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-96 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-slate-400"
                />
              </div>
              <input
                className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all sm:text-sm font-medium shadow-sm"
                type="text"
                placeholder="Search products in this event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT GRID */}
        <div>
          {loading ? (
            // Màn hình Skeleton Loading chuẩn doanh nghiệp
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm animate-pulse flex flex-col h-[420px]"
                >
                  <div className="w-full h-48 bg-slate-100 rounded-2xl mb-5"></div>
                  <div className="h-5 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="h-5 bg-slate-100 rounded w-2/3 mb-auto"></div>
                  <div className="pt-4 border-t border-slate-50 mt-4">
                    <div className="h-3 bg-slate-100 rounded w-1/3 mb-2"></div>
                    <div className="h-7 bg-slate-100 rounded w-1/2 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-slate-100 rounded-xl flex-1"></div>
                      <div className="h-10 bg-slate-100 rounded-xl flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            // Màn hình rỗng (Empty State)
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200/60 rounded-3xl border-dashed">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="text-4xl text-slate-300"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-urbanist">
                No products found
              </h3>
              <p className="text-slate-500 max-w-md text-center mb-6 font-medium">
                We couldn't find any products matching{" "}
                <span className="font-bold text-slate-700">
                  "{searchQuery}"
                </span>{" "}
                in this event.
              </p>
            </div>
          ) : (
            // Lưới Sản phẩm
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((item) => {
                const isTracking = trackingId === item.productId;

                // Xử lý Logic hiển thị Giá
                const oldPrice = item.initialPrice || 0;
                const currentPrice = item.latestPrice || 0;
                const isDiscounted =
                  oldPrice > currentPrice && currentPrice > 0;
                const discountPercent = isDiscounted
                  ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
                  : 0;

                return (
                  <div
                    key={item.productId}
                    className="group relative bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
                    {/* Tag Giảm giá góc trái trên ảnh */}
                    {isDiscounted && (
                      <div className="absolute font-urbanist text-base top-4 left-4 z-10 bg-red-900 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-red-50 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                        -{discountPercent}%
                      </div>
                    )}

                    {/* Hình ảnh */}
                    <div className="relative aspect-[4/3] w-full bg-slate-50 rounded-2xl mb-4 p-4 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.imageURL || "https://via.placeholder.com/200"}
                        alt={item.productName || "Product"}
                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Tên Sản phẩm */}
                    <h3
                      title={item.productName}
                      className="font-bold font-questrial text-slate-800 text-base mb-2 line-clamp-2 leading-snug flex-grow group-hover:text-orange-600 transition-colors break-words"
                    >
                      {item.productName}
                    </h3>

                    {/* Khu vực Giá & Hành động */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="flex flex-col mb-5 min-h-[64px] justify-end">
                          {isDiscounted ? (
                            <>
                              {/* 1. GIÁ CŨ (Original Price) */}
                              <div className="flex items-center gap-1.5 font-questrial mb-1.5">
                                <span className="font-semibold text-[12px] text-slate-400">
                                  Original:
                                </span>
                                <span className="font-medium text-[14px] text-slate-400 line-through decoration-1 decoration-slate-400/60">
                                  {oldPrice.toLocaleString("vi-VN")} ₫
                                </span>
                              </div>

                              {/* 2. GIÁ SAU GIẢM (Discounted Price) */}
                              <div>
                                <span className="text-[11px] text-red-600 font-bold font-questrial uppercase tracking-wider block leading-none mb-1">
                                  DISCOUNTED PRICE
                                </span>
                                <div
                                  title={
                                    currentPrice ? `${currentPrice} ₫` : "0 ₫"
                                  }
                                  className="text-orange-600 font-questrial font-black text-2xl truncate leading-none"
                                >
                                  {currentPrice
                                    ? `${currentPrice.toLocaleString("vi-VN")} ₫`
                                    : "N/A"}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* TRƯỜNG HỢP KHÔNG GIẢM GIÁ (Regular Price) */}
                              {/* Spacer giữ khung layout không bị nhảy (tương đương chiều cao của dòng Original) */}
                              <div className="h-[22px]"></div>
                              <div>
                                <span className="text-[11px] font-bold font-questrial uppercase tracking-wider text-slate-400 block leading-none mb-1">
                                  REGULAR PRICE
                                </span>
                                <div
                                  title={
                                    currentPrice ? `${currentPrice} ₫` : "0 ₫"
                                  }
                                  className="text-slate-900 font-urbanist font-black text-2xl truncate leading-none"
                                >
                                  {currentPrice
                                    ? `${currentPrice.toLocaleString("vi-VN")} ₫`
                                    : "N/A"}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Nút bấm (Buttons) */}
                      <div className="flex gap-2">
                        {/* Nút Track */}
                        <button
                          onClick={() =>
                            handleTrackProduct(item.productLink, item.productId)
                          }
                          disabled={isTracking}
                          className="cursor-pointer relative flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-urbanist font-bold text-xs tracking-wide uppercase text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden shadow-sm"
                        >
                          {isTracking ? (
                            <>
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-orange-400"
                              />
                              <span>Tracking...</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon className="text-slate-300" />
                              <span>Track Deal</span>
                            </>
                          )}
                        </button>

                        {/* Nút View */}
                        {item.productLink ? (
                          <a
                            href={item.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-50/50 text-blue-700 border border-blue-100 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-[0.97] transition-all duration-200"
                          >
                            View
                            <FontAwesomeIcon
                              icon={faExternalLinkAlt}
                              className="text-[10px]"
                            />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-slate-50 text-slate-400 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide cursor-not-allowed border border-slate-200"
                          >
                            N/A
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
