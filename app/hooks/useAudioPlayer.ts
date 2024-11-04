import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

interface UseAudioPlayerOptions {
  onEnd?: () => void;
  volume?: number;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
      setActiveId(null);
    }
  }, [audio]);

  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  const togglePlay = useCallback(
    (id: string, url?: string) => {
      if (!url) {
        toast.info("No preview available");
        return;
      }

      if (activeId && activeId !== id) {
        cleanupAudio();
      }

      if (!audio || activeId !== id) {
        const newAudio = new Audio(url);
        newAudio.volume = options.volume ?? 1.0;
        
        newAudio.addEventListener("ended", () => {
          setIsPlaying(false);
          setActiveId(null);
          options.onEnd?.();
        });

        newAudio.addEventListener("error", () => {
          toast.error("Failed to load audio");
          cleanupAudio();
        });

        setAudio(newAudio);
        setActiveId(id);
        
        newAudio.play().catch(() => {
          toast.error("Failed to play audio");
          cleanupAudio();
        });
        
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play().catch(() => {
            toast.error("Failed to play audio");
            cleanupAudio();
          });
          setIsPlaying(true);
        }
      }
    },
    [audio, isPlaying, cleanupAudio, activeId, options]
  );

  return {
    isPlaying,
    activeId,
    togglePlay,
    cleanupAudio
  };
}
