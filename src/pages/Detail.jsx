import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Plus } from "lucide-react";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main Product States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suggestions States
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [errorSuggestions, setErrorSuggestions] = useState(null);

  // State quản lý loading của nút Track
  const [trackingId, setTrackingId] = useState(null);

  const BASE_URL = "https://localhost:44338";

  // Instant scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BASE_URL}/product`, {
          params: { id: id },
          headers: headers,
        });
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Cannot load product information. Please try again!");
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        setErrorSuggestions(null);
        const response = await axios.get(
          `${BASE_URL}/api/product/suggestion/${id}`,
          { headers: headers },
        );
        setSuggestions(response.data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setErrorSuggestions("Cannot load recommended products.");
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchProductDetail();
    fetchSuggestions();
  }, [id]);

  // Format Date Helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Làm mới danh sách gợi ý
  const handleRefreshBtn = async () => {
    if (!id || loadingSuggestions) return;

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      setLoadingSuggestions(true);
      setErrorSuggestions(null);

      const response = await axios.get(
        `${BASE_URL}/api/product/refresh-suggestions`,
        {
          params: { productId: id },
          headers: headers,
        },
      );

      setSuggestions(response.data);
    } catch (err) {
      console.error("Error refreshing suggestions:", err);
      setErrorSuggestions(
        "Failed to refresh suggestions. Please try again later.",
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 🔥 Xử lý khi bấm nút Track
  const handleTrackProduct = async (suggestion) => {
    if (!suggestion.productLink) {
      alert("Cannot track this product: Missing product link.");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      setTrackingId(suggestion.id);

      // Gọi API POST /api/product/add, gửi string bọc ngoặc kép
      await axios.post(
        `${BASE_URL}/api/product/add`,
        `"${suggestion.productLink}"`,
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        },
      );

      // Thành công thì chuyển hướng về trang Products
      navigate("/products");
    } catch (err) {
      console.error("Error tracking product:", err);
      // Lấy lỗi từ backend .NET nếu có
      const errorMsg =
        err.response?.data?.message ||
        "Failed to track this product. Please try again.";
      alert(errorMsg);
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-syne selection:bg-orange-100 selection:text-orange-900">
      <div className="max-w-6xl mx-auto space-y-8" id="detail">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link
            to="/products"
            className="hover:text-orange-600 transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-900">Product Detail</span>
        </div>

        {/* ---------------- 1. MAIN PRODUCT SECTION ---------------- */}
        {loading ? (
          // SKELETON LOADER
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 animate-pulse">
            <div className="w-40 h-8 bg-slate-100 rounded-full mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="aspect-square bg-slate-100 rounded-2xl w-full"></div>
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                  <div className="h-10 bg-slate-100 rounded-lg w-3/4"></div>
                </div>
                <div className="h-32 bg-slate-100 rounded-2xl w-full mt-8"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          // ERROR STATE
          <div className="bg-red-50 text-red-600 rounded-3xl p-10 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : !product ? (
          // NOT FOUND STATE
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-2xl text-slate-700 font-bold mb-2">
              Product not found!
            </p>
            <p className="text-slate-500">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        ) : (
          <>
            {/* MAIN INFO CARD */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 lg:p-12">
              <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full w-max mb-4 border border-emerald-200/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Product Detail
                  </span>
                  <h1 className="font-questrial text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 break-words">
                    {product.productName}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                {/* Product Image */}
                <div className="lg:col-span-5 relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-6 group">
                  <img
                    src={product.imageURL || "https://via.placeholder.com/400"}
                    alt={product.productName || "Product"}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Product Details & Price Dashboard */}
                <div className="lg:col-span-7 flex flex-col h-full min-w-0">
                  {/* Price Box */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50/30 border border-orange-100/80 rounded-2xl p-6 md:p-8 mb-8 shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-orange-200/50">
                      {/* Tracked Price (Initial) */}
                      <div className="min-w-0">
                        <span className="text-[11px] text-gray-800 uppercase font-bold tracking-wider mb-1.5 block">
                          Tracked Price
                        </span>
                        <span
                          title={`${product.initialPrice} ₫`}
                          className="text-2xl text-slate-400 font-bold font-questrial block truncate"
                        >
                          {product.initialPrice?.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>

                      {/* Current Market Price */}
                      {product.latestPrice && (
                        <div className="min-w-0 sm:text-right">
                          <span className="text-[11px] text-orange-600 uppercase font-bold tracking-wider mb-1.5 block">
                            Current Market Price
                          </span>
                          <span
                            title={`${product.latestPrice} ₫`}
                            className="text-4xl text-orange-600 font-black font-questrial leading-none block truncate tracking-tight drop-shadow-sm"
                          >
                            {product.latestPrice?.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta Info (Last Updated) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
                      <div className="flex items-center gap-2 text-slate-500 font-urbanist font-bold text-lg">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Last updated:{" "}
                        <span className="text-slate-700 font-urbanist font-medium">
                          {formatDateTime(
                            product.lastUpdatedAt || product.updatedAt,
                          )}
                        </span>
                      </div>

                      {/* Optional Product Link */}
                      {product.productLink && (
                        <a
                          href={product.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-200"
                        >
                          Visit Store
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- 2. DESCRIPTION SECTION ---------------- */}
            <div
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10"
              id="description"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-questrial">
                  Product Description
                </h2>
              </div>

              {product.description &&
              typeof product.description === "string" ? (
                <div
                  className="prose prose-slate prose-lg max-w-none text-slate-600 font-ggf leading-relaxed marker:text-orange-500"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="bg-slate-50 rounded-2xl text-center py-12 border border-slate-100 border-dashed">
                  <svg
                    className="w-12 h-12 text-slate-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-slate-500 font-medium">
                    No detailed description available for this product.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ---------------- 3. SUGGESTIONS SECTION ---------------- */}
        <div className="pt-4" id="suggestion">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="inline-block py-1 bg-gray-100 text-gray-600 text-xl font-bold uppercase tracking-widest rounded-full w-max mb-4">
                Suggestion Deals
              </span>
              <p className="text-slate-500 text-lg font-syne">
                Similar products with better pricing options.
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshBtn}
              disabled={loadingSuggestions}
              className="group mt-4 inline-flex font-questrial text-lg cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 active:scale-95 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 self-start sm:self-auto"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-transform duration-500 ${
                  loadingSuggestions
                    ? "animate-spin text-amber-600"
                    : "group-hover:rotate-180"
                }`}
              />
              <span>
                {loadingSuggestions ? "Refreshing..." : "Refresh suggestions"}
              </span>
            </button>
          </div>

          {/* Suggestions Content */}
          {loadingSuggestions ? (
            // SUGGESTIONS SKELETON
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm animate-pulse"
                >
                  <div className="w-full h-48 bg-slate-100 rounded-2xl mb-5"></div>
                  <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-6"></div>
                  <div className="h-8 bg-slate-100 rounded w-1/2 mb-4"></div>
                  <div className="h-11 bg-slate-100 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : errorSuggestions ? (
            // ERROR STATE
            <div className="bg-red-50 p-8 rounded-3xl font-questrial text-xl border border-red-100 text-center text-red-500 font-medium">
              {errorSuggestions}
            </div>
          ) : suggestions.length === 0 ? (
            // EMPTY STATE
            <div className="bg-white py-16 px-4 rounded-3xl shadow-sm border border-slate-100 border-dashed text-center">
              <span className="text-5xl mb-4 block">🏷️</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-questrial">
                No better deals found
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                We couldn't find any similar products with a lower price at the
                moment. You're already looking at a great deal!
              </p>
            </div>
          ) : (
            // SUGGESTIONS GRID
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggestions.map((item, index) => (
                <div
                  key={item.id || index}
                  className="group relative bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  {/* Savings Badge */}
                  {item.savingsAmount > 0 && (
                    <div className="absolute top-4 left-4 bg-rose-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10 shadow-sm border border-rose-400">
                      Save {item.savingsAmount?.toLocaleString("vi-VN")} ₫
                    </div>
                  )}

                  <div className="relative aspect-[4/3] w-full bg-slate-50 rounded-2xl mb-5 p-4 overflow-hidden">
                    <img
                      src={item.imageURL || "https://via.placeholder.com/200"}
                      alt={item.productName || "Product"}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  </div>

                  <h3
                    title={item.productName}
                    className="font-bold font-questrial text-slate-800 text-base mb-3 line-clamp-2 leading-snug flex-grow group-hover:text-orange-600 transition-colors break-words"
                  >
                    {item.productName}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <p
                      title={`${item.price} ₫`}
                      className="text-orange-600 font-questrial font-black text-2xl mb-4 truncate"
                    >
                      {item.price?.toLocaleString("vi-VN")} ₫
                    </p>
                    <div className="mb-4">
                      <p className="text-sm font-questrial font-bold text-slate-800">
                        Last updated at -
                      </p>
                      <p className="text-sm font-extrabold font-urbanist text-slate-600">
                        {/* Đã sửa thành item.lastUpdatedAt */}
                        {formatDateTime(item.lastUpdatedAt)}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-6 ">
                      {/* 🔥 NÚT TRACK ĐƯỢC HOÀN THIỆN */}
                      <button
                        onClick={() => handleTrackProduct(item)}
                        disabled={trackingId === item.id}
                        className="group relative flex-1 inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-urbanist font-semibold text-xs tracking-wider uppercase text-slate-100 bg-slate-900 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_20px_-2px_rgba(245,158,11,0.25)] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
                      >
                        {/* Hiệu ứng Vệt sáng Shimmer lướt qua khi Hover */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                        {trackingId === item.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span className="text-slate-300 lowercase font-medium">
                              Tracking...
                            </span>
                          </>
                        ) : (
                          <>
                            {/* Tín hiệu Pulse Radar thu nhỏ tinh tế */}
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="group-hover:text-amber-300 transition-colors duration-200">
                              Track
                            </span>
                          </>
                        )}
                      </button>

                      {/* Nút View Offer */}
                      {item.productLink ? (
                        <a
                          href={item.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center bg-slate-100 text-slate-800 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white active:scale-[0.98] transition-all duration-200"
                        >
                          View
                          <svg
                            className="w-4 h-4 ml-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-slate-50 text-slate-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed border border-slate-100"
                        >
                          N/A
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
