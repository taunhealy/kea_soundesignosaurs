import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteSearch(searchTerm: string, filters: any) {
  return useInfiniteQuery({
    queryKey: ["infiniteSearch", searchTerm, filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        q: searchTerm,
        page: pageParam.toString(),
        limit: "20",
        ...filters,
      });
      const response = await fetch(`/api/search?${params.toString()}`);
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length + 1 : undefined;
    },
  });
}
