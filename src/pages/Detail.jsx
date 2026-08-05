import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Detail() {
  // 1. Get ID from URL
  const { id } = useParams();

  // 2. Initialize State for Main Product
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize State for Suggestion List (Cheaper products)
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [errorSuggestions, setErrorSuggestions] = useState(null);

  const BASE_URL = "https://localhost:44338";

  // 3. Call API when component mounts
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(`${BASE_URL}/product`, {
          params: { id: id },
          headers: { Authorization: `Bearer ${token}` },
        });

        setProduct(response.data);
      } catch (err) {
        console.error("Error loading product details:", err);
        setError("Cannot load product information. Please try again!");
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        const token = localStorage.getItem("token");

        // Call API to get suggestion list. 
        // Note: Update the URL path to match your C# Controller Route
        const response = await axios.get(`${BASE_URL}/api/Product/suggestion/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSuggestions(response.data);
      } catch (err) {
        console.error("Error loading suggestion list:", err);
        setErrorSuggestions("Cannot load better price product list.");
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (id) {
      // Call both APIs at the same time to increase page load speed (Parallel requests)
      fetchProductDetail();
      fetchSuggestions();
    }
  }, [id]);

  // 4. Handle UI for main states
  if (loading) {
    return (
      <div className="w-full text-center py-12 font-syne text-xl text-gray-500">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-12 font-syne text-xl text-red-500">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full text-center py-12 font-syne text-xl text-gray-500">
        Product not found!
      </div>
    );
  }

  // 5. Display UI
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* ---------------- MAIN PRODUCT INFORMATION ---------------- */}
      <h1 className=" font-lexend text-3xl italic font-semibold mb-6 text-gray-900">
        {product.productName}
      </h1>

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="w-full md:w-1/2">
          <img
            src={product.imageURL || "https://via.placeholder.com/400"}
            alt={product.productName}
            className="w-full h-auto rounded-lg shadow-md border-2 border-gray-100 object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-4 text-lg">
          <p>
            <span className="font-bold text-gray-700">Product ID:</span> {id}
          </p>
          <p>
            <span className="font-bold text-gray-700">Tracked price:</span>{" "}
            <span className="text-2xl text-orange-500 font-bold">
              {product.initialPrice?.toLocaleString("vi-VN")} ₫
            </span>
          </p>

          <button className="mt-8 bg-orange-500 text-white py-3 px-6 rounded-md font-bold hover:bg-orange-600 transition-colors w-fit">
            Update price / Track
          </button>
        </div>
      </div>

      {/* ---------------- SUGGESTED PRODUCTS BLOCK ---------------- */}
      <hr className="border-gray-200 mb-8" />
      <h2 className="text-3xl font-lexend font-semibold mb-6 text-gray-800">
         Similar products with better prices
      </h2>

      {loadingSuggestions ? (
        <div className="text-gray-500 text-center py-8">
          Scanning for better prices in the system...
        </div>
      ) : errorSuggestions ? (
        <div className="text-red-500 py-4">{errorSuggestions}</div>
      ) : suggestions.length === 0 ? (
        <div className="text-gray-500 py-4 bg-gray-50 text-center rounded-lg">
          No products with a lower price found yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-lg transition-shadow bg-white flex flex-col h-full"
            >
              <img
                src={item.imageURL}
                alt={item.productName}
                className="w-full h-48 object-contain mb-4 rounded"
              />
              <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 flex-grow">
                {item.productName}
              </h3>
              
              <div className="mt-auto pt-2">
                <p className="text-orange-500 font-bold text-lg">
                  {item.price?.toLocaleString("vi-VN")} ₫
                </p>
                {item.savingsAmount > 0 && (
                  <p className="text-green-600 text-xs font-semibold mt-1">
                    📉 Savings: {item.savingsAmount?.toLocaleString("vi-VN")} ₫
                  </p>
                )}
                <a
                  href={item.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 text-center bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded font-semibold hover:bg-blue-600 hover:text-white transition-colors text-sm"
                >
                  View now on Tiki
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}