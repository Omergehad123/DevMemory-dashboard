"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllSubscribers, deleteSubscriber } from "@/lib/api/subscribers";

export const SUBSCRIBERS_QUERY_KEY = ["subscribers"];

/**
 * Hook to fetch list of subscribers
 * @param {Object} [params] - { page, limit, search }
 */
export function useSubscribers(params = { limit: 100 }) {
  return useQuery({
    queryKey: [...SUBSCRIBERS_QUERY_KEY, params],
    queryFn: () => getAllSubscribers(params),
    select: (data) => ({
      subscribers: data?.subscribers || [],
      pagination: data?.pagination || {},
    }),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Hook to delete a subscriber
 */
export function useDeleteSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIBERS_QUERY_KEY });
    },
  });
}
