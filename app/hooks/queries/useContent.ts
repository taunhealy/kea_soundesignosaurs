import { useQuery } from "@tanstack/react-query";
import { ContentType } from "@prisma/client";
import type { SearchFilters } from "@/types/SearchTypes";

export function useContent(contentType: ContentType, filters: SearchFilters) {
  const queryString = new URLSearchParams();

  // Add all filters to query string
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.length > 0 && queryString.append(key, value.join(","));
      } else if (value !== "") {
        queryString.append(key, String(value));
      }
    }
  });

  // Add content type
  queryString.append("contentType", contentType);

  return useQuery({
    queryKey: ["content", contentType, queryString.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/content?${queryString.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType.toLowerCase()}`);
      }
      return response.json();
    },
  });
}
