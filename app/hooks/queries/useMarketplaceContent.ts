import { useQuery } from "@tanstack/react-query";
import { ContentType } from "@prisma/client";
import { useSearch } from "@/contexts/SearchContext";

export function useMarketplaceContent({
  contentType,
}: {
  contentType: ContentType;
}) {
  const { filters } = useSearch();

  const queryString = new URLSearchParams();

  // Add search filters from context, excluding contentType since we'll add it separately
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== "contentType") {
      if (Array.isArray(value)) {
        value.length > 0 && queryString.append(key, value.join(","));
      } else if (value !== "") {
        queryString.append(key, String(value));
      }
    }
  });

  // Add contentType last to ensure it's not duplicated
  queryString.append("contentType", contentType);

  return useQuery({
    queryKey: ["marketplace-content", contentType, queryString.toString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketplace/content?${queryString.toString()}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch marketplace ${contentType.toLowerCase()}`
        );
      }
      return response.json();
    },
  });
}
