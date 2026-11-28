import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { getLiveEventProducts, getPublishedEvents } from "../api/eventApi";
import { getErrorMessage } from "../api/client";
import { isLoggedIn } from "../api/authStorage";
import { withRedirect } from "../utils/redirect";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import PlatformBadge from "../components/PlatformBadge";
import { getEventEndLabel } from "../utils/eventTime";
import { parseTargetPrice, validateTargetPrice } from "../utils/targetPrice";
import { addProduct } from "../api/productApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMagnifyingGlass,
  faSpinner,
  faBoxOpen,
  faExternalLinkAlt,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

// Khách xem sự kiện chỉ đọc dữ liệu có sẵn; BE trả 503 khi sản phẩm còn đang được tải từ sàn → tự thử lại
const LOADING_RETRY_MS = 15000;
const LOADING_MAX_RETRIES = 8; // ~2 phút

// Kiểu popup dùng chung (đặt giá mục tiêu, yêu cầu đăng nhập)
const POPUP_CLASSES = {
  container: "!font-sans",
  popup: "!rounded-3xl !shadow-2xl !border !border-slate-100 !p-8 !bg-white !max-w-lg !w-full",
  title: "!text-3xl !font-bold !font-urbanist !text-slate-900 !p-0 !m-0 !mt-2",
  htmlContainer: "!text-base !font-questrial !text-slate-500 !mt-3 !mb-6 !p-0",
  actions: "!flex !w-full !gap-4 !justify-center !mt-0 !p-0",
  confirmButton: "!bg-[#ea580c] !font-questrial !cursor-pointer hover:!bg-[#c2410c] !text-white !font-bold !rounded-xl !px-8 !py-3 !transition-all !shadow-sm",
  cancelButton: "!bg-white !font-questrial !font-bold !cursor-pointer hover:!bg-slate-50 !text-slate-700 !rounded-xl !px-8 !py-3 !border !border-slate-200 !transition-all !shadow-sm",
};

export default function EventDetail() {
  const { eventId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [event, setEvent] = useState(null); // tên, sàn, giờ kết thúc – lấy từ danh sách sự kiện
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadError, setLoadError] = useState(null); // lý do không tải được sản phẩm (BE trả về)

  // State quản lý hiệu ứng loading cho nút Track của từng sản phẩm
  const [trackingId, setTrackingId] = useState(null);

  // Đổi sự kiện → đếm lại số lần thử
  useEffect(() => {
    setRetryCount(0);
  }, [eventId]);

  useEffect(() => {
    let retryTimer;
    const fetchEventProducts = async () => {
      try {
        if (retryCount === 0) setLoading(true); // lần tự thử lại: giữ thông báo "đang tải", không nháy khung xương
        setLoadError(null);
        setProducts(await getLiveEventProducts(eventId));
      } catch (error) {
        console.error("Error loading event products:", error);
        // BE báo lý do cụ thể: sự kiện chưa có sản phẩm, hoặc đang tải từ sàn (thử lại sau ít phút)
        setLoadError(getErrorMessage(error, i18n.t("Failed to load products for this event.")));
        if (error.response?.status === 503 && retryCount < LOADING_MAX_RETRIES) {
          retryTimer = setTimeout(() => setRetryCount((n) => n + 1), LOADING_RETRY_MS);
        }
      } finally {
        setLoading(false);
      }
    };

    // Thông tin sự kiện chỉ để hiển thị – lỗi thì vẫn xem được sản phẩm
    const fetchEventInfo = async () => {
      try {
        const events = await getPublishedEvents();
        setEvent(events.find((e) => e.eventId === eventId) ?? null);
      } catch (error) {
        console.error("Error loading event info:", error);
      }
    };

    fetchEventProducts();
    if (retryCount === 0) fetchEventInfo();
    return () => clearTimeout(retryTimer);
  }, [eventId, retryCount]);

  const endLabel = getEventEndLabel(event);

  // Xử lý khi bấm nút Track Deal với Popup nhập Target Price
  const handleTrackProduct = async (productLink, productId) => {
    if (!productLink) {
      toast.error(t("Cannot track this product: Missing product link."));
      return;
    }

    // Khách chưa đăng nhập: hỏi trước, không đẩy thẳng sang trang đăng nhập; đăng nhập xong quay lại sự kiện này
    if (!isLoggedIn()) {
      const choice = await Swal.fire({
        title: t("Sign in to track this deal"),
        text: t("Track prices and get alerted when this deal drops further. It only takes a moment."),
        icon: "info",
        iconColor: "#ea580c",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: t("Sign in"),
        denyButtonText: t("Create account"),
        cancelButtonText: t("Not now"),
        buttonsStyling: false,
        reverseButtons: true,
        focusConfirm: true,
        customClass: {
          ...POPUP_CLASSES,
          actions: "!flex !flex-wrap !w-full !gap-3 !justify-center !mt-0 !p-0",
          denyButton: POPUP_CLASSES.cancelButton,
          cancelButton: "!bg-transparent !font-questrial !font-semibold !cursor-pointer !text-slate-500 hover:!text-slate-700 !px-4 !py-3",
        },
      });
      const backHere = location.pathname + location.search;
      if (choice.isConfirmed) navigate(withRedirect("/login", backHere));
      else if (choice.isDenied) navigate(withRedirect("/register", backHere));
      return;
    }

    // Popup nhập Target Price chuẩn UI/UX (Đã căn giữa ô input và bỏ nút tăng giảm)
    const { value: targetPriceInput, isConfirmed } = await Swal.fire({
      title: t("Set Target Price"),
      text: t("Get alerted when the price drops to this level. Optional – leave blank to just track."),
      input: "text",
      inputAttributes: {
        inputmode: "numeric",
        pattern: "[0-9]*"
      },
      inputPlaceholder: t("e.g. 22000000"),
      icon: "question",
      iconColor: "#ea580c",
      showCancelButton: true,
      confirmButtonText: t("Confirm"),
      cancelButtonText: t("Cancel"),
      buttonsStyling: false,
      reverseButtons: true,
      focusCancel: true,
      backdrop: `
        rgba(0, 0, 0, 0.4)
        backdrop-filter
        backdrop-blur-sm
      `,
      customClass: {
        ...POPUP_CLASSES,
        validationMessage: "!text-center",
        input: "!border !border-slate-300 !rounded-2xl !px-4 !py-3 !text-lg !text-center !w-[85%] !mx-auto !block !mb-6 focus:!outline-none focus:!ring-2 focus:!ring-orange-500/20 focus:!border-orange-500",
      },
      inputValidator: validateTargetPrice,
    });

    if (!isConfirmed) return;

    setTrackingId(productId);
    const toastId = toast.loading(t("Adding product to your tracking list..."));

    try {
      await addProduct(productLink.trim(), parseTargetPrice(targetPriceInput));

      toast.success(t("Product tracked successfully!"), { id: toastId });
    } catch (error) {
      console.error("Error tracking product:", error);
      const errorMsg =
        error.response?.data?.message || t("Failed to track this product.");
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
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t("Live Event")}
                </div>
                <PlatformBadge platform={event?.platform} />
                {endLabel && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold font-questrial">
                    {endLabel}
                  </span>
                )}
              </div>
              <h1 className="font-urbanist md:text-4xl text-3xl font-black text-slate-900 mb-2 tracking-tight">
                {event?.title || t("Event Products")}
              </h1>
              <p className="text-slate-500 font-ggf text-sm md:text-base">
                {t("Explore and track products participating in this specific event. Get notified when prices drop.")}
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
                placeholder={t("Search products in this event...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT GRID */}
        <div>
          {loading ? (
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
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200/60 rounded-3xl border-dashed">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="text-4xl text-slate-300"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-urbanist">
                {t("No products found")}
              </h3>
              {loadError ? (
                <p className="text-slate-500 max-w-md text-center mb-6 font-medium">{loadError}</p>
              ) : (
                <p className="text-slate-500 max-w-md text-center mb-6 font-medium">
                  {t("We couldn't find any products matching \"{{query}}\" in this event.", { query: searchQuery })}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((item, index) => {
                const isTracking = trackingId === item.productId;

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
                    style={{ "--i": Math.min(index, 11) }}
                    className="anim-item group relative bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
                    {isDiscounted && (
                      <div className="absolute font-urbanist text-base top-4 left-4 z-10 bg-red-900 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-red-50 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                        -{discountPercent}%
                      </div>
                    )}

                    <div className="relative aspect-[4/3] w-full bg-slate-50 rounded-2xl mb-4 p-4 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.imageURL || "https://via.placeholder.com/200"}
                        alt={item.productName || t("Product")}
                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>

                    <h3
                      title={item.productName}
                      className="font-bold font-questrial text-slate-800 text-base mb-2 line-clamp-2 leading-snug flex-grow group-hover:text-orange-600 transition-colors break-words"
                    >
                      {item.productName}
                    </h3>

                    {/* Ghi chú của sàn, vd flash sale CellphoneS: "Đã bán 1/10 suất" */}
                    {item.desc && (
                      <p className="text-xs font-semibold text-red-600 font-questrial mb-2">
                        {item.desc}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="flex flex-col mb-5 min-h-[64px] justify-end">
                          {isDiscounted ? (
                            <>
                              <div className="flex items-center gap-1.5 font-questrial mb-1.5">
                                <span className="font-semibold text-[12px] text-slate-400">
                                  {t("Original:")}
                                </span>
                                <span className="font-medium text-[14px] text-slate-400 line-through decoration-1 decoration-slate-400/60">
                                  {oldPrice.toLocaleString("vi-VN")} ₫
                                </span>
                              </div>

                              <div>
                                <span className="text-[11px] text-red-600 font-bold font-questrial uppercase tracking-wider block leading-none mb-1">
                                  {t("DISCOUNTED PRICE")}
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
                              <div className="h-[22px]"></div>
                              <div>
                                <span className="text-[11px] font-bold font-questrial uppercase tracking-wider text-slate-400 block leading-none mb-1">
                                  {t("REGULAR PRICE")}
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

                      <div className="flex gap-2">
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
                              <span>{t("Tracking...")}</span>
                            </>
                          ) : (
                            <>
                              <span>{t("Track Deal")}</span>
                            </>
                          )}
                        </button>

                        {item.productLink ? (
                          <a
                            href={item.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-50/50 text-blue-700 border border-blue-100 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-[0.97] transition-all duration-200"
                          >
                            {t("View")}
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