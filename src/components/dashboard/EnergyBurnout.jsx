import { motion } from 'framer-motion';
import { Battery, BatteryLow, BatteryWarning, Zap } from 'lucide-react';

export default function EnergyBurnout({ energy = 80 }) {
  const getState = () => {
    if (energy >= 70) return { label: 'Ótima', color: '#22c55e', icon: Battery, msg: 'Continue assim! Você está em plena forma.' };
    if (energy >= 40) return { label: 'Moderada', color: 'hsl(25 95% 60%)', icon: BatteryLow, msg: 'Atenção: equilibre trabalho e descanso.' };
    return { label: 'Crítica', color: 'hsl(0 72% 55%)', icon: BatteryWarning, msg: '⚠️ Risco de Burnout! Priorize o descanso hoje.' };
  };

  const state = getState();
  const Icon = state.icon;
  const bars = 10;
  const filledBars = Math.round((energy / 100) * bars);

  return (
    <div className="rounded-xl border border-border p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: state.color }} />
          <span className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-foreground">Energia / Burnout</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
          style={{ background: `${state.color}15`, border: `1px solid ${state.color}30` }}>
          <span className="text-xs font-bold font-rajdhani" style={{ color: state.color }}>{energy}%</span>
          <span className="text-[10px] font-rajdhani" style={{ color: state.color }}>{state.label}</span>
        </div>
      </div>

      {/* Segmented battery */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: bars }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="flex-1 h-6 rounded"
            style={{
              background: i < filledBars ? state.color : 'hsl(222 35% 14%)',
              boxShadow: i < filledBars ? `0 0 6px ${state.color}60` : 'none',
            }}
          />
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground">{state.msg}</p>
    </div>
  );
}