import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Zap, Clock, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';

const pillarColors = {
  financeiro: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
  profissional: { text: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20' },
  pessoal: { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
};

export default function DailyQuests({ quests, onQuestComplete }) {
  const displayQuests = (quests && quests.length > 0) ? quests : [];
  const [completing, setCompleting] = useState(null);

  const handleComplete = async (quest) => {
    if (quest.status === 'completed') return;
    setCompleting(quest.id);
    setTimeout(() => {
      setCompleting(null);
      if (onQuestComplete) onQuestComplete(quest);
    }, 600);
  };

  if (displayQuests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 text-center"
        style={{ background: 'rgb(189 0 255 / 0.04)', border: '1px dashed rgb(189 0 255 / 0.2)' }}
      >
        <div className="text-3xl mb-3">⚔️</div>
        <p className="text-sm font-semibold font-rajdhani text-foreground mb-1">Nenhuma missão ativa</p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#A0A5B5' }}>
          A IA irá gerar sua <span style={{ color: '#BD00FF' }}>Questline Diária</span> automaticamente esta noite, baseada no seu perfil e histórico real.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {displayQuests.slice(0, 4).map((quest, i) => {
          const c = pillarColors[quest.pillar] || pillarColors.pessoal;
          const isCompleted = quest.status === 'completed';
          const pct = quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0;

          return (
            <motion.div
              key={quest.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border p-3 flex items-center gap-3 transition-all duration-300 ${
                isCompleted ? 'bg-neon-green/5 border-neon-green/20 opacity-70' : 'bg-card border-border'
              }`}
            >
              <button
                onClick={() => handleComplete(quest)}
                className="flex-shrink-0"
              >
                {isCompleted ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 size={20} className="text-neon-green" />
                  </motion.div>
                ) : completing === (quest.id || i) ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Circle size={20} className="text-neon-cyan" />
                  </motion.div>
                ) : (
                  <Circle size={20} className="text-muted-foreground" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{quest.icon}</span>
                  <span className={`text-[9px] uppercase tracking-wider font-rajdhani font-medium ${c.text}`}>
                    {quest.type === 'weekly' ? 'Semanal' : 'Diária'} · {quest.pillar}
                  </span>
                </div>
                <p className={`text-xs font-medium leading-tight ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {quest.title}
                </p>
                {quest.target > 1 && (
                  <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-neon-purple/60 transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Zap size={10} className="text-neon-orange" />
                <span className="text-[11px] font-bold font-rajdhani text-neon-orange">+{quest.xp_reward}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}