import { useQuery } from "@tanstack/react-query";

export function useUserPresets({ type }: { type: "uploaded" | "downloaded" }) {
  return useQuery({
    queryKey: ["presets", type],
    queryFn: async () => {
      const response = await fetch(`/api/presets?type=${type}`);
      if (!response.ok) {
        throw new Error("Failed to fetch presets");
      }
      return response.json();
    },
  });
}
