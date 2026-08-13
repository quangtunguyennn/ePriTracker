import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faMagnifyingGlass,
    faSpinner,
    faBoxOpen
} from "@fortawesome/free-solid-svg-icons";
import ProductItem from "../components/ProductItem";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function EventDetail() {
    const { eventId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // ĐÃ SỬA: Đổi tên biến thành API_BASE_URL để đồng bộ với toàn bộ code bên dưới
    const API_BASE_URL = "https://localhost:44338";

    useEffect(() => {
        const fetchEventProducts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token"); // Lấy token

                // ĐÃ SỬA: Gọi đúng biến API_BASE_URL
                const response = await axios.get(`${API_BASE_URL}/api/Event/getLiveEventProducts/${eventId}`,
                    { headers: { Authorization: `Bearer ${token}` } } // Gửi kèm token
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

    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Remove this product from your tracking list?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ea580c",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "Yes, remove it!",
            customClass: {
                popup: "rounded-2xl font-syne",
                confirmButton: "rounded-xl font-bold px-6",
                cancelButton: "rounded-xl font-bold px-6",
            },
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem("token");
            // ĐÃ SỬA: Dùng API_BASE_URL thay cho BASE_URL
            await axios.delete(`${API_BASE_URL}/api/product/delete`, {
                params: { id },
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts((prev) => prev.filter((p) => p.productId !== id));
            toast.success("Product removed successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed!");
        }
    };

    const filteredProducts = products.filter((item) =>
        item.productName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-syne relative">
            <Toaster position="top-right" toastOptions={{ className: "font-syne text-sm font-medium" }} />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* SECTION 1: HEADER & BACK BUTTON */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <Link
                        to="/events"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors font-questrial font-semibold text-sm mb-6"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <div className="max-w-2xl">
                            <h1 className="font-urbanist md:text-3xl font-bold text-gray-900 mb-2">
                                Event Products
                            </h1>
                            <p className="text-gray-500 font-ggf text-sm md:text-base">
                                Your tracked products that are participating in this specific event.
                            </p>
                        </div>

                        {/* Search Box */}
                        <div className="relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400" />
                            </div>
                            <input
                                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors sm:text-sm"
                                type="text"
                                placeholder="Search your items in this event..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PRODUCT GRID */}
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-orange-500 mb-4" />
                            <p className="text-gray-500 text-lg">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl border-dashed">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faBoxOpen} className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                No products found
                            </h3>
                            <p className="text-gray-500 max-w-sm text-center mb-6">
                                You haven't tracked any products participating in this event yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex justify-center transition-transform hover:-translate-y-1 duration-300"
                                >
                                    <ProductItem
                                        productId={item.productId}
                                        productName={item.productName}
                                        image={item.imageURL}
                                        desc={item.desc}
                                        initialPrice={
                                            item.initialPrice
                                                ? `${item.initialPrice.toLocaleString("vi-VN")} ₫`
                                                : "0 ₫"
                                        }
                                        latestPrice={
                                            item.latestPrice
                                                ? `${item.latestPrice.toLocaleString("vi-VN")} ₫`
                                                : "0 ₫"
                                        }
                                        productLink={item.productLink}
                                        lastUpdatedAt={item.lastUpdatedAt}
                                        onDelete={() => handleDeleteProduct(item.productId)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}