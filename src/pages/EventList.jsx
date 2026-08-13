import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faSpinner,
    faCalendarAlt,
    faArrowUpRightFromSquare,
    faBoxesStacked
} from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";

export default function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const BASE_URL = "https://localhost:44338";

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // Nếu API Event không yêu cầu token thì có thể bỏ header Authorization
                const token = localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/api/Event/getPublishedEvents`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setEvents(response.data);
            } catch (error) {
                console.error("Error loading events:", error);
                toast.error("Failed to load events.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter((item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-syne relative">
            <Toaster position="top-right" toastOptions={{ className: "font-syne text-sm font-medium" }} />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* SECTION 1: HEADER & SEARCH TOOLBAR */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="max-w-2xl">
                        <h1 className="font-urbanist md:text-3xl font-bold text-gray-900 mb-2">
                            Tiki Events
                        </h1>
                        <p className="text-gray-500 font-ggf text-sm md:text-base">
                            Discover ongoing events and see which of your tracked products are currently on sale.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400" />
                        </div>
                        <input
                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors sm:text-base"
                            type="text"
                            placeholder="Search events by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* SECTION 2: EVENT GRID */}
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-orange-500 mb-4" />
                            <p className="text-gray-500 text-lg">Loading events...</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl border-dashed">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
                            <p className="text-gray-500 max-w-sm text-center mb-6">
                                There are currently no events matching your search.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((evt) => (
                                <div key={evt.eventId} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                                    <div className="h-48 overflow-hidden bg-gray-50">
                                        <img
                                            src={evt.imageUrl}
                                            alt={evt.title}
                                            className="w-full h-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-urbanist font-bold text-lg text-gray-900 line-clamp-2 mb-4">
                                            {evt.title}
                                        </h3>

                                        <div className="mt-auto flex flex-col sm:flex-row gap-3">
                                            <a
                                                href={evt.eventLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 border-2 border-orange-100 text-orange-600 rounded-xl hover:bg-orange-50 font-questrial font-semibold transition-colors text-sm"
                                            >
                                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> Tiki
                                            </a>
                                            <Link
                                                to={`/events/${evt.eventId}`}
                                                className="flex-[2] flex justify-center items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl font-questrial font-semibold transition-all shadow-[inset_0px_1px_0px_rgba(255,255,255,0.3),0px_4px_8px_rgba(249,115,22,0.2)] text-sm"
                                            >
                                                <FontAwesomeIcon icon={faBoxesStacked} /> My Products
                                            </Link>
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