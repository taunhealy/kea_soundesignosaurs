import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

export interface AudioTrack {
  id: string;
  url?: string;
}

export interface UseAudioPlayerOptions {
  onEnd?: () => void;
  volume?: number;
  onError?: (error: Error) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  activeTrack: string | null;
  play: (id: string, url?: string) => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
}

export function useAudioPlayer(
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [volume, setVolumeState] = useState<number>(options.volume ?? 1.0);

  const cleanup = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
      setActiveTrack(null);
    }
  }, [audio]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const setVolume = useCallback(
    (newVolume: number) => {
      setVolumeState(newVolume);
      if (audio) {
        audio.volume = newVolume;
      }
    },
    [audio]
  );

  const pause = useCallback(() => {
    if (audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      options.onPause?.();
    }
  }, [audio, isPlaying, options]);

  const stop = useCallback(() => {
    cleanup();
    options.onEnd?.();
  }, [cleanup, options]);

  const play = useCallback(
    (id: string, url?: string) => {
      if (!url) {
        toast.info("No preview available");
        return;
      }

      if (activeTrack && activeTrack !== id) {
        cleanup();
      }

      if (!audio || activeTrack !== id) {
        const newAudio = new Audio(url);
        newAudio.volume = volume;

        const handleEnded = () => {
          setIsPlaying(false);
          setActiveTrack(null);
          options.onEnd?.();
        };

        const handleError = (error: ErrorEvent) => {
          toast.error("Failed to load audio");
          options.onError?.(new Error(error.message));
          cleanup();
        };

        newAudio.addEventListener("ended", handleEnded);
        newAudio.addEventListener("error", handleError);

        setAudio(newAudio);
        setActiveTrack(id);

        newAudio
          .play()
          .then(() => {
            setIsPlaying(true);
            options.onPlay?.();
          })
          .catch((error) => {
            toast.error("Failed to play audio");
            options.onError?.(error);
            cleanup();
          });
      } else {
        if (isPlaying) {
          pause();
        } else {
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              options.onPlay?.();
            })
            .catch((error) => {
              toast.error("Failed to play audio");
              options.onError?.(error);
              cleanup();
            });
        }
      }
    },
    [audio, isPlaying, cleanup, activeTrack, volume, options, pause]
  );

  return {
    isPlaying,
    activeTrack,
    play,
    pause,
    stop,
    setVolume,
  };
}
