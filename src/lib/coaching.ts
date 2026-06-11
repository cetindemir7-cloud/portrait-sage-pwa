export type Mode = 'headshot' | 'actor' | 'author' | 'cinematic';

export interface CoachingResult {
  status: 'noface' | 'detecting' | 'good' | 'perfect';
  scoreOverall: number;
  scoreFraming: number;
  scoreLighting: number;
  scoreComposition: number;
  message: string;
  tips: string[];
}

export const MODES = [
  {
    id: 'headshot' as Mode,
    label: 'Headshot',
    description: 'Profesyonel baş portresi',
    tips: [
      'Yüzü çerçevenin merkezine yerleştir',
      'Işık kaynağı 45 derecede olmalı',
      'Arka plan solid renk olmalı',
    ],
  },
  {
    id: 'actor' as Mode,
    label: 'Oyuncu',
    description: 'Oyuncu için profesyonel portre',
    tips: [
      'Doğal ifade koru',
      'Işık yüzü yumuşak aydınlat',
      'Gözler çerçevenin 1/3 üst kısmında',
    ],
  },
  {
    id: 'author' as Mode,
    label: 'Yazar',
    description: 'Düşünceli yazar portresi',
    tips: [
      'Hafif dış kaydırma yapı',
      'Doğal ışık tercih et',
      'Melankoli ifadesi iyi görünür',
    ],
  },
  {
    id: 'cinematic' as Mode,
    label: 'Sinematik',
    description: 'Geniş sinematik kompozisyon',
    tips: [
      'Yüz kadraja sağa ya da sola yerleştir',
      'Arka planı blur yapabilir',
      'Gözler keskin olmalı',
    ],
  },
];

export const analyzeFrame = (landmarks: any[], mode: Mode): Partial<CoachingResult> => {
  if (!landmarks || landmarks.length === 0) {
    return {
      status: 'noface',
      scoreOverall: 0,
      message: 'Lütfen kameraya bak',
      tips: [],
    };
  }

  // Calculate face position in frame
  const facePoints = landmarks.slice(0, 468);
  const minX = Math.min(...facePoints.map((p: any) => p.x));
  const maxX = Math.max(...facePoints.map((p: any) => p.x));
  const minY = Math.min(...facePoints.map((p: any) => p.y));
  const maxY = Math.max(...facePoints.map((p: any) => p.y));

  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;
  const faceCenter = minX + faceWidth / 2;
  const faceMidpoint = minY + faceHeight / 2;

  // Framing score (centered position)
  let framingScore = 0;
  const distFromCenter = Math.abs(faceCenter - 0.5);
  framingScore = Math.max(0, 100 - distFromCenter * 200);

  // Composition score (rule of thirds)
  let compositionScore = 0;
  const thirdX = Math.min(Math.abs(faceCenter - 0.33), Math.abs(faceCenter - 0.67));
  const thirdY = Math.min(Math.abs(faceMidpoint - 0.33), Math.abs(faceMidpoint - 0.67));
  compositionScore = Math.max(0, 100 - (thirdX + thirdY) * 150);

  // Lighting score (face brightness - simplified)
  let lightingScore = 75 + Math.random() * 15; // Placeholder

  // Overall score
  const overallScore = Math.round(
    (framingScore * 0.3 + compositionScore * 0.3 + lightingScore * 0.4)
  );

  const status: CoachingResult['status'] =
    overallScore >= 85 ? 'perfect' : overallScore >= 70 ? 'good' : 'detecting';

  const tips: string[] = [];
  if (distFromCenter > 0.15) tips.push('Yüzünü merkeze biraz daha yaklaştır');
  if (faceHeight < 0.3) tips.push('Kameraya biraz daha yaklaş');
  if (faceHeight > 0.8) tips.push('Kameradan biraz daha uzaklaş');

  return {
    status,
    scoreOverall: overallScore,
    scoreFraming: Math.round(framingScore),
    scoreComposition: Math.round(compositionScore),
    scoreLighting: Math.round(lightingScore),
    message: status === 'perfect' ? '✨ Mükemmel!' : status === 'good' ? '✓ İyi' : 'Düzeltme gerekli',
    tips,
  };
};
