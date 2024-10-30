import { useEffect, useRef } from "react";
import { audioContextManager } from "@/utils/audioContext";

interface WaveformVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  amplitudeMultiplier?: number;
}

export function WaveformVisualizer({
  audioElement,
  isPlaying,
  amplitudeMultiplier = 1.5,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    try {
      analyserRef.current = audioContextManager.setupAudioNode(audioElement);
      if (analyserRef.current) {
        // Increase FFT size for better frequency resolution
        analyserRef.current.fftSize = 2048;
      }
    } catch (error) {
      console.error("Error setting up audio context:", error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !isPlaying) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight =
          (dataArray[i] / 255) * canvas.height * amplitudeMultiplier;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "#2563eb33"); // Transparent blue
        gradient.addColorStop(1, "#2563eb"); // Solid blue

        // Fill style
        ctx.fillStyle = gradient;

        // Draw bar
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1; // Add small gap between bars
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, amplitudeMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-8 bg-transparent"
      width={300}
      height={32}
    />
  );
}
