import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Flame, Droplets, BookOpen, Dumbbell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  agua: Droplets,
  leitura: BookOpen,
  exercicio: Dumbbell,
  dormir: Moon,
  meditacao: Sun,
  default: CheckCircle2,
};

const defaultHabits = [
  { id: 'h1', name: 'Beber 2L de água', icon: 'agua', category: 'dia_todo', type: 'counter', target: 8, current_value: 3, xp_reward: 30, streak: 5, completed_today: false, color: 'neon-cyan' },
  { id: 'h2', name: 'Ler 30 minutos', icon: 'leitura', category: 'noite', type: 'check', target: 1, current_value: 0, xp_reward: 40, streak: 12, completed_today: false, color: 'neon-purple' },
  { id: 'h3', name: 'Exercício físico', icon: 'exercicio', category: 'manha', type: 'check', target: 1, current_value: 1, xp_reward: 60, streak: 3, completed_today: true, color: 'neon-green' },
  { id: 'h4', name: 'Meditação 10 min', icon: 'meditacao', category: 'manha', type: 'check', target: 1, current_value: 1, xp_reward: 25, streak: 7, completed_today: true, color: 'neon-orange' },
  { id: 'h5', name: 'Dormir 8h', icon: 'dormir', category: 'noite', type: 'check', target: 1, current_value: 0, xp_reward: 50, streak: 2, completed_today: false, color: 'neon-pink' },
];

const colorMap = {
  'neon-cyan': { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20', progress: 'bg-neon-cyan' },
  'neon-purple': { text: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20', progress: 'bg-neon-purple' },
  'neon-green': { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20', progress: 'bg-neon-green' },
  'neon-orange': { text: 'text-neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/20', progress: 'bg-neon-orange' },
  'neon-pink': { text: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/20', progress: 'bg-neon-pink' },
};

export default function HabitTracker({ habits, onToggle, onIncrement }) {
  const [localHabits, setLocalHabits] = useState(habits?.length > 0 ? habits : defaultHabits);

  const toggle = (habit) => {
    setLocalHabits(prev => prev.map(h =>
      h.id === habit.id ? { ...h, completed_today: !h.completed_today, current_value: h.completed_today ? 0 : 1 } : h
    ));
    if (onToggle) onToggle(habit);
  };

  const increment = (habit) => {
    setLocalHabits(prev => prev.map(h =>
      h.id === habit.id ? {
        ...h,
        current_value: Math.min(h.current_value + 1, h.target),
        completed_today: h.current_value + 1 >= h.target
      } : h
    ));
    if (onIncrement) onIncrement(habit);
  };

  const completedCount = localHabits.filter(h => h.completed_today).length;
  const totalXP = localHabits.filter(h => h.completed_today).reduce((s, h) => s + h.xp_reward, 0);

  return (
    <div>
      {/* Progress summary */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] text-muted-foreground">{completedCount}/{localHabits.length} hábitos hoje</span>
        <span className="text-[11px] font-rajdhani text-neon-orange font-bold">+{totalXP} XP</span>
      </div>

      <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-4">
        <motion.div
          animate={{ width: `${(completedCount / localHabits.length) * 100}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-neon-green"
          style={{ boxShadow: '0 0 8px hsl(142 76% 50% / 0.6)' }}
        />
      </div>

      <div className="space-y-2">
        {localHabits.map((habit, i) => {
          const c = colorMap[habit.color] || colorMap['neon-cyan'];
          const Icon = iconMap[habit.icon] || iconMap.default;
          const pct = habit.target > 0 ? (habit.current_value / habit.target) * 100 : 0;
          const isCounter = habit.type === 'counter';

          return (
            <motion.div
              key={habit.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-3 flex items-center gap-3 transition-all ${
                habit.completed_today ? `${c.bg} ${c.border} opacity-80` : 'border-border bg-card'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg}`}>
                <Icon size={15} className={c.text} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className={`text-xs font-medium ${habit.completed_today ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {habit.name}
                  </p>
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Flame size={9} className="text-neon-orange" />
                      <span className="text-[9px] text-neon-orange font-rajdhani">{habit.streak}</span>
                    </div>
                  )}
                </div>
                {isCounter && (
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: `hsl(197 100% 55%)`, boxShadow: '0 0 4px hsl(197 100% 55% / 0.6)' }} />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isCounter ? `${habit.current_value}/${habit.target} · ` : ''}<span className={c.text}>+{habit.xp_reward} XP</span>
                </p>
              </div>

              {isCounter ? (
                <button
                  onClick={() => increment(habit)}
                  disabled={habit.completed_today}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center ${c.bg} ${c.border}`}
                >
                  <Plus size={13} className={c.text} />
                </button>
              ) : (
                <button onClick={() => toggle(habit)} className="flex-shrink-0">
                  {habit.completed_today ? (
                    <CheckCircle2 size={22} className={c.text} />
                  ) : (
                    <Circle size={22} className="text-muted-foreground" />
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}