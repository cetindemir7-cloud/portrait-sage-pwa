import { motion } from 'framer-motion';

interface ScoreRingProps {
  value: number;
  label: string;
  size?: number;
}

export function ScoreRing({ value, label, size = 48 }: ScoreRingProps) {
  const circumference = 2 * Math.PI * (size / 2 - 2);
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 85) return '#22c55e';
    if (value >= 70) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={getColor()}
            strokeWidth="2"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-[10px] text-white/60 text-center">{label}</span>
    </div>
  );
}
