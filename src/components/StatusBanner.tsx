import { CoachingResult } from '@/lib/coaching';

interface StatusBannerProps {
  result: CoachingResult;
}

export function StatusBanner({ result }: StatusBannerProps) {
  const getStatusColor = () => {
    switch (result.status) {
      case 'perfect':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'good':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      default:
        return 'bg-red-500/20 border-red-500/50 text-red-400';
    }
  };

  return (
    <div
      className={`absolute top-4 left-4 right-4 z-20 px-4 py-2 rounded-lg border backdrop-blur text-sm font-medium ${
        getStatusColor()
      }`}
    >
      {result.message}
    </div>
  );
}
