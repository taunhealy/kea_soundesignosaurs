import { useQuery } from '@tanstack/react-query';

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const response = await fetch('/api/genres');
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      return response.json();
    }
  });
}
