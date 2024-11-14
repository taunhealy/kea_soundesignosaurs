import { useQuery } from "@tanstack/react-query";
import { ContentType } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";

interface UseContentProps {
  contentType: ContentType;
  filters: SearchFilters;
  view?: string | null;
  status?: string | null;
}

export function useContent({
  contentType,
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
    queryKey: [{ contentType, filters, view, status }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        contentType,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== null && value !== undefined && value !== ""
          )
        ),
        ...(view && { view }),
        ...(status && { status }),
        type: contentType.toLowerCase(),
      });
      return fetchContent(`/api/search?${searchParams}`);
    },
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
