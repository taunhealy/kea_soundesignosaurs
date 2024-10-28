import { useQuery } from "@tanstack/react-query";

interface Genre {
  id: string;
  name: string;
  type: string;
  isSystem: boolean;
}

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      const response = await fetch("/api/admin/genres");
      if (!response.ok) {
        throw new Error("Failed to fetch genres");
      }
      return response.json();
    },
  });
}
