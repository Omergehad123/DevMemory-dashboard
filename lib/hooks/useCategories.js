"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categories";

export const CATEGORIES_QUERY_KEY = ["categories"];

/**
 * Hook to fetch list of categories
 * @param {Object} [params] - { page, limit, search }
 */
export function useCategories(params = { limit: 100 }) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, params],
    queryFn: () => getAllCategories(params),
    select: (data) => ({
      categories: data?.categories || [],
      pagination: data?.pagination || {},
    }),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch a single category by ID
 * @param {string} id
 */
export function useCategory(id) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
      }
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
