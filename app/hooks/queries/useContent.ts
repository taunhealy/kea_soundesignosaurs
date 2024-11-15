import { useQuery } from "@tanstack/react-query";
import { ItemType } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";

interface UseContentProps {
  itemType: ItemType;
  filters: SearchFilters;
  view?: string | null;
  status?: string | null;
}

export function useContent({
  itemType,
  filters,
  view,
  status,
}: UseContentProps) {
  const fetchContent = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
    return response.json();
  };

  return useQuery({
    queryKey: [{ itemType, filters, view, status }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      searchParams.set('itemType', itemType.toLowerCase());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === 'searchTerm') {
            searchParams.set('q', value);
          } else {
            searchParams.set(key, value.toString());
          }
        }
      });

      if (view) searchParams.set('view', view);
      if (status) searchParams.set('status', status);

      return fetchContent(`/api/search?${searchParams}`);
    },
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
