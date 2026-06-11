import { MODES, Mode } from '@/lib/coaching';
import { motion } from 'framer-motion';

interface ModeSelectorProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 px-4 py-3 justify-center flex-wrap">
      {MODES.map((mode) => (
        <motion.button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === mode.id
              ? 'bg-amber-gradient text-black shadow-amber'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {mode.label}
        </motion.button>
      ))}
    </div>
  );
}
