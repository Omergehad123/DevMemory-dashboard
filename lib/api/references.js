import { apiClient } from "./client";

/**
 * Fetch all references with optional query params (page, limit, search, categoryId, sortBy)
 * @param {Object} [params] - { page, limit, search, categoryId, sortBy }
 * @returns {Promise<{ references: Array, pagination: Object }>}
 */
export async function getAllReferences(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page);
  if (params.limit) searchParams.set("limit", params.limit);
  if (params.search) searchParams.set("search", params.search);
  if (params.categoryId && params.categoryId !== "all") {
    searchParams.set("categoryId", params.categoryId);
  }
  if (params.category && params.category !== "all") {
    searchParams.set("categoryId", params.category);
  }
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);

  const queryStr = searchParams.toString();
  const endpoint = `/references${queryStr ? `?${queryStr}` : ""}`;
  const response = await apiClient(endpoint, { method: "GET" });
  return response.data; // { references, pagination }
}

/**
 * Fetch a single reference by ID
 * @param {string} id - Reference ID
 * @returns {Promise<Object>} Reference object
 */
export async function getReferenceById(id) {
  if (!id) throw new Error("Reference ID is required");
  const response = await apiClient(`/references/${id}`, { method: "GET" });
  return response.data?.reference;
}

/**
 * Create a new reference
 * @param {Object} referenceData - { title, categoryId, content, description }
 * @returns {Promise<Object>} Created reference
 */
export async function createReference(referenceData) {
  const response = await apiClient("/references", {
    method: "POST",
    body: referenceData,
  });
  return response.data?.reference;
}

/**
 * Update a reference by ID
 * @param {string} id - Reference ID
 * @param {Object} referenceData - Fields to update
 * @returns {Promise<Object>} Updated reference
 */
export async function updateReference(id, referenceData) {
  if (!id) throw new Error("Reference ID is required");
  const response = await apiClient(`/references/${id}`, {
    method: "PATCH",
    body: referenceData,
  });
  return response.data?.reference;
}

/**
 * Delete a reference by ID
 * @param {string} id - Reference ID
 * @returns {Promise<void>}
 */
export async function deleteReference(id) {
  if (!id) throw new Error("Reference ID is required");
  const response = await apiClient(`/references/${id}`, {
    method: "DELETE",
  });
  return response.data;
}
