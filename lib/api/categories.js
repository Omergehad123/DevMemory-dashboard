import { apiClient } from "./client";

/**
 * Fetch all categories with optional query params (page, limit, search)
 * @param {Object} [params] - { page, limit, search }
 * @returns {Promise<{ categories: Array, pagination: Object }>}
 */
export async function getAllCategories(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page);
  if (params.limit) searchParams.set("limit", params.limit);
  if (params.search) searchParams.set("search", params.search);

  const queryStr = searchParams.toString();
  const endpoint = `/categories${queryStr ? `?${queryStr}` : ""}`;
  const response = await apiClient(endpoint, { method: "GET" });
  return response.data; // { categories, pagination }
}

/**
 * Fetch a single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<{ category: Object }>}
 */
export async function getCategoryById(id) {
  if (!id) throw new Error("Category ID is required");
  const response = await apiClient(`/categories/${id}`, { method: "GET" });
  return response.data?.category;
}

/**
 * Create a new category
 * @param {Object} categoryData - { name, description, image, stack }
 * @returns {Promise<Object>} Created category
 */
export async function createCategory(categoryData) {
  const response = await apiClient("/categories", {
    method: "POST",
    body: categoryData,
  });
  return response.data?.category;
}

/**
 * Update a category by ID
 * @param {string} id - Category ID
 * @param {Object} categoryData - fields to update
 * @returns {Promise<Object>} Updated category
 */
export async function updateCategory(id, categoryData) {
  if (!id) throw new Error("Category ID is required");
  const response = await apiClient(`/categories/${id}`, {
    method: "PATCH",
    body: categoryData,
  });
  return response.data?.category;
}

/**
 * Delete a category by ID
 * @param {string} id - Category ID
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  if (!id) throw new Error("Category ID is required");
  const response = await apiClient(`/categories/${id}`, {
    method: "DELETE",
  });
  return response.data;
}
