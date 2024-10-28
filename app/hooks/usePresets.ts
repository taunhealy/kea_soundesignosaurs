import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export function usePresets(type: "downloaded" | "uploaded") {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ["presets", type, userId],
    queryFn: async () => {
      const response = await fetch(`/api/presets/user?type=${type}&userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch presets");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}
