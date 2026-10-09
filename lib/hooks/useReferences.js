"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
} from "@/lib/api/references";
import { CATEGORIES_QUERY_KEY } from "./useCategories";

export const REFERENCES_QUERY_KEY = ["references"];

/**
 * Hook to fetch list of references
 * @param {Object} [params] - { page, limit, search, categoryId, sortBy }
 */
export function useReferences(params = {}) {
  return useQuery({
    queryKey: [...REFERENCES_QUERY_KEY, params],
    queryFn: () => getAllReferences(params),
    select: (data) => ({
      references: data?.references || [],
      pagination: data?.pagination || {},
    }),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch a single reference by ID
 * @param {string} id
 */
export function useReference(id) {
  return useQuery({
    queryKey: ["reference", id],
    queryFn: () => getReferenceById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a reference
 */
export function useCreateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (referenceData) => createReference(referenceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERENCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

/**
 * Hook to update a reference
 */
export function useUpdateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateReference(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REFERENCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["reference", variables.id] });
      }
    },
  });
}

/**
 * Hook to delete a reference
 */
export function useDeleteReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteReference(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERENCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
