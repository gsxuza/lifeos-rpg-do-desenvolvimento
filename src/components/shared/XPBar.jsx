import { motion } from 'framer-motion';

export default function XPBar({ current, max, color = 'cyan', label, showNumbers = true }) {
  const pct = Math.min(100, (current / max) * 100);
  const colorMap = {
    cyan: 'hsl(197 100% 55%)',
    purple: 'hsl(265 80% 65%)',
    green: 'hsl(142 76% 50%)',
    orange: 'hsl(25 95% 60%)',
    pink: 'hsl(330 80% 65%)',
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className="w-full">
      {(label || showNumbers) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-[11px] text-muted-foreground font-rajdhani uppercase tracking-wider">{label}</span>}
          {showNumbers && <span className="text-[11px] font-rajdhani" style={{ color: c }}>{current.toLocaleString()} / {max.toLocaleString()}</span>}
        </div>
      )}
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${c}99, ${c})`, boxShadow: `0 0 8px ${c}80` }}
        />
      </div>
    </div>
  );
}