import api from "./client";

export const getTrackedProducts = () =>
  api.get("/api/product/all").then((res) => res.data);

export const getProduct = (id) =>
  api.get("/product", { params: { id } }).then((res) => res.data);

export const getSuggestions = (productId) =>
  api.get(`/api/product/suggestion/${productId}`).then((res) => res.data);

export const refreshSuggestions = (productId) =>
  api
    .get("/api/product/refresh-suggestions", { params: { productId } })
    .then((res) => res.data);

/** targetPrice: giá mục tiêu (VND) để nhận cảnh báo, null = không đặt. */
export const addProduct = (productLink, targetPrice = null) =>
  api
    .post("/api/product/add", { productLink, targetPrice })
    .then((res) => res.data);

/** Lịch sử giá cho biểu đồ (lưu ý route số nhiều: /api/products/...). */
export const getPriceHistory = (productId, days) =>
  api
    .get(`/api/products/${productId}/price-history`, { params: { days } })
    .then((res) => res.data);

/** Video review trên YouTube (BE gọi YouTube Data API). */
export const getReviewVideos = (productId) =>
  api.get(`/api/product/${productId}/reviews`).then((res) => res.data);

export const deleteProduct = (id) =>
  api.delete("/api/product/delete", { params: { id } }).then((res) => res.data);
