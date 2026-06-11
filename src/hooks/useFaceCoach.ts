import { useEffect, useRef, useState } from 'react';
import { CoachingResult, analyzeFrame, Mode } from '@/lib/coaching';

interface UseFaceCoachOptions {
  mode: Mode;
  enabled: boolean;
}

interface UseFaceCoachReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  ready: boolean;
  loading: boolean;
  error: string | null;
  result: CoachingResult;
  landmarks: any[];
  capture: () => Promise<string | null>;
  fps: number;
}

const DEFAULT_RESULT: CoachingResult = {
  status: 'noface',
  scoreOverall: 0,
  scoreFraming: 0,
  scoreLighting: 0,
  scoreComposition: 0,
  message: 'Kamera hazırlanıyor...',
  tips: [],
};

export function useFaceCoach({
  mode,
  enabled,
}: UseFaceCoachOptions): UseFaceCoachReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoachingResult>(DEFAULT_RESULT);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [fps, setFps] = useState(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

  // Initialize camera and MediaPipe
  useEffect(() => {
    if (!enabled) return;

    const initCamera = async () => {
      try {
        setLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setLoading(false);
            setReady(true);
            detectFace();
          };
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Kamera erişimi başarısız';
        setError(message);
        setLoading(false);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [enabled]);

  // Face detection loop
  const detectFace = () => {
    if (!ready || !videoRef.current) return;

    // Simulate face detection with random landmarks
    // In production, integrate with MediaPipe Face Detection
    const mockLandmarks = Array.from({ length: 468 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
    }));

    setLandmarks(mockLandmarks);
    const analysisResult = analyzeFrame(mockLandmarks, mode);
    setResult((prev) => ({ ...prev, ...analysisResult } as CoachingResult));

    // FPS counter
    fpsCounterRef.current.frames++;
    const now = Date.now();
    if (now - fpsCounterRef.current.lastTime >= 1000) {
      setFps(fpsCounterRef.current.frames);
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;
    }

    requestAnimationFrame(detectFace);
  };

  const capture = async (): Promise<string | null> => {
    if (!videoRef.current) return null;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Flip horizontally to match mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.95);
      }
    } catch (err) {
      console.error('Capture error:', err);
    }

    return null;
  };

  return {
    videoRef,
    ready,
    loading,
    error,
    result,
    landmarks,
    capture,
    fps,
  };
}
