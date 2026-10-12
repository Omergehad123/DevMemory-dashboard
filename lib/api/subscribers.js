import { apiClient } from "./client";

/**
 * Fetch all subscribers with optional query params (page, limit, search)
 * @param {Object} [params] - { page, limit, search }
 * @returns {Promise<{ subscribers: Array, pagination: Object }>}
 */
export async function getAllSubscribers(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page);
  if (params.limit) searchParams.set("limit", params.limit);
  if (params.search) searchParams.set("search", params.search);

  const queryStr = searchParams.toString();
  const endpoint = `/subscribers${queryStr ? `?${queryStr}` : ""}`;
  const response = await apiClient(endpoint, { method: "GET" });
  return response.data; // { subscribers, pagination }
}

/**
 * Delete a subscriber by ID
 * @param {string} id - Subscriber ID
 * @returns {Promise<Object>}
 */
export async function deleteSubscriber(id) {
  if (!id) throw new Error("Subscriber ID is required");
  const response = await apiClient(`/subscribers/${id}`, {
    method: "DELETE",
  });
  return response.data;
}
