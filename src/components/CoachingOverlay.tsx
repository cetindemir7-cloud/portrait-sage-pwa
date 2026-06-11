import { CoachingResult } from '@/lib/coaching';

interface CoachingOverlayProps {
  result: CoachingResult;
  landmarks: any[];
}

export function CoachingOverlay({ result, landmarks }: CoachingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Face frame indicator */}
      {landmarks.length > 0 && (
        <svg className="absolute inset-0 w-full h-full">
          {/* Draw landmarks as circles */}
          {landmarks.slice(0, 468).map((point: any, idx: number) => (
            <circle
              key={idx}
              cx={point.x * 100 + '%'}
              cy={point.y * 100 + '%'}
              r="2"
              fill="rgba(251, 191, 36, 0.3)"
            />
          ))}
        </svg>
      )}

      {/* Center guide */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-1 h-1 bg-amber-400 rounded-full" />
      </div>

      {/* Top message */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <p className="text-xl font-bold text-amber-400">{result.message}</p>
        <p className="text-xs text-white/70 mt-1">Mode: {result.status}</p>
      </div>

      {/* Tips */}
      {result.tips.length > 0 && (
        <div className="absolute top-24 left-4 right-4 bg-black/60 backdrop-blur p-3 rounded-lg border border-amber-400/30">
          {result.tips.map((tip, idx) => (
            <p key={idx} className="text-xs text-white/80 mb-1">
              • {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
