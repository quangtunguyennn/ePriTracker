import api from "./client";

// ---------- Người dùng ----------
export const getPublishedEvents = () =>
  api.get("/api/Event/getPublishedEvents").then((res) => res.data);

export const getLiveEventProducts = (eventId) =>
  api.get(`/api/Event/getLiveEventProducts/${eventId}`).then((res) => res.data);

// ---------- Admin ----------
export const crawlPreviewEvents = () =>
  api.get("/api/Event/crawlPreview").then((res) => res.data);

export const postEvent = (tikiEvent) =>
  api.post("/api/Event/postEvent", tikiEvent).then((res) => res.data);

export const togglePublishEvent = (eventId) =>
  api.put(`/api/Event/togglePublish/${eventId}`).then((res) => res.data);

export const deleteEvent = (eventId) =>
  api.delete(`/api/Event/deleteEvent/${eventId}`).then((res) => res.data);
