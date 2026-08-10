import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Detail() {
  const { id } = useParams();

  // Main Product States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suggestions States
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [errorSuggestions, setErrorSuggestions] = useState(null);

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
          `${BASE_URL}/api/Product/suggestion/${id}`,
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-syne">
      <div className="max-w-6xl mx-auto space-y-8" id="detail">
        {/* Navigation / Breadcrumb */}

        {/* ---------------- 1. MAIN PRODUCT SECTION ---------------- */}
        {loading ? (
          // SKELETON LOADER
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="aspect-square bg-gray-200 rounded-xl w-full"></div>
              <div className="space-y-6 pt-4">
                <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
                <div className="space-y-3 mt-8">
                  <div className="h-10 bg-gray-200 rounded-md w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          // ERROR STATE
          <div className="bg-red-50 text-red-600 rounded-2xl p-8 text-center border border-red-100">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
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
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : !product ? (
          // NOT FOUND STATE
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-xl text-gray-500 font-medium">
              Product not found!
            </p>
          </div>
        ) : (
          <>
            {/* MAIN INFO CARD */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
              <div>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xl font-bold uppercase tracking-widest rounded-full w-max mb-4">
                  Tracking Detail
                </span>
              </div>
              <div className="text-center shadow-sm">
                <h1 className="font-questrial py-4 text-start px-2 text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight text-gray-900 mb-6">
                  {product.productName}
                </h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-4">
                  <img
                    src={product.imageURL || "https://via.placeholder.com/400"}
                    alt={product.productName || "Product"}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Product Details */}

                <div className="flex flex-col h-full">
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 mb-8">
                    <p className="text-sm text-gray-500 mb-1 uppercase font-semibold tracking-wide">
                      Tracked Price
                    </p>
                    <p className="text-4xl text-orange-600 font-bold font-urbanist">
                      {product.initialPrice?.toLocaleString("vi-VN")} ₫
                    </p>

                    {/* Placeholder for Latest Price if your API provides it */}
                    {product.latestPrice && (
                      <div className="mt-4 pt-4 border-t border-orange-200/50 flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                          Current Market Price:
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          {product.latestPrice.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- 2. DESCRIPTION SECTION ---------------- */}
            <div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10"
              id="description"
            >
              <div>
                <span className="inline-block px-3 py-1 mb-10 bg-gray-100 text-gray-600 text-xl font-bold uppercase tracking-widest rounded-full w-max mb-4">
                  Product Description
                </span>
              </div>

              {product.description &&
              typeof product.description === "string" ? (
                <div
                  className="prose prose-slate font-ggf prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="text-center py-10">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
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
                  <p className="text-gray-500 font-medium">
                    No description available for this product.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ---------------- 3. SUGGESTIONS SECTION ---------------- */}
        <div className="pt-8" id="suggestion">
          <div>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xl font-bold uppercase tracking-widest rounded-full w-max mb-4">
              Suggestion Deals 
            </span>
          </div>

          {loadingSuggestions ? (
            // SUGGESTIONS SKELETON
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : errorSuggestions ? (
            <div className="bg-white p-8 rounded-2xl border border-red-100 text-center text-red-500">
              {errorSuggestions}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white py-12 px-4 rounded-2xl shadow-sm border border-gray-100 border-dashed text-center">
              <span className="text-4xl mb-3 block">🕵️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No better deals found
              </h3>
              <p className="text-gray-500">
                We couldn't find any similar products with a lower price at the
                moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggestions.map((item, index) => (
                <div
                  key={item.id || index}
                  className="group relative bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Savings Badge */}
                  {item.savingsAmount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                      Save {item.savingsAmount?.toLocaleString("vi-VN")} ₫
                    </div>
                  )}

                  <div className="relative aspect-[4/3] w-full bg-gray-50 rounded-xl mb-4 p-2 overflow-hidden">
                    <img
                      src={item.imageURL || "https://via.placeholder.com/200"}
                      alt={item.productName || "Product"}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="font-semibold font-questrial text-gray-800 text-base mb-2 line-clamp-2 leading-snug flex-grow group-hover:text-orange-600 transition-colors">
                    {item.productName}
                  </h3>

                  <div className="mt-auto pt-3 border-t border-gray-50">
                    <p className="text-orange-600 font-urbanist font-bold text-xl mb-3">
                      {item.price?.toLocaleString("vi-VN")} ₫
                    </p>

                    {item.productLink ? (
                      <a
                        href={item.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors duration-200"
                      >
                        View Offer
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
                        className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed"
                      >
                        Link Unavailable
                      </button>
                    )}
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
