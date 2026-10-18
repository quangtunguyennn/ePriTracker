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

/** Backend nhận body là một chuỗi JSON: "https://tiki.vn/..." */
export const addProduct = (productLink) =>
  api
    .post("/api/product/add", JSON.stringify(productLink), {
      headers: { "Content-Type": "application/json" },
    })
    .then((res) => res.data);

export const deleteProduct = (id) =>
  api.delete("/api/product/delete", { params: { id } }).then((res) => res.data);
