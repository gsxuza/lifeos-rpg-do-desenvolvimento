import { motion } from 'framer-motion';
import { Lock, Star, Trophy, TrendingUp, Zap, Shield, BookOpen, Flame } from 'lucide-react';

const achievements = [
  {
    id: 'inv_init', icon: TrendingUp, title: 'Investidor Iniciante', desc: 'Guarde R$ 1.000',
    unlocked: true, xpBonus: 0, color: 'neon-cyan',
    unlocks: 'Novos insights de IA sobre portfólio',
  },
  {
    id: 'reader', icon: BookOpen, title: 'Mente Ativa', desc: 'Leia por 7 dias seguidos',
    unlocked: true, xpBonus: 0, color: 'neon-purple',
    unlocks: 'Bônus de +15% XP em tarefas de aprendizado',
  },
  {
    id: 'pomodoro', icon: Flame, title: 'Mestre do Foco', desc: 'Complete 20 Pomodoros',
    unlocked: false, xpBonus: 0, color: 'neon-orange',
    progress: 8, target: 20,
    unlocks: 'Desbloqueio do Modo Ultra Foco (45 min)',
  },
  {
    id: 'saver', icon: Shield, title: 'Guardião do Capital', desc: 'Guarde R$ 5.000',
    unlocked: false, xpBonus: 0, color: 'neon-green',
    progress: 3240, target: 5000,
    unlocks: 'IA de Portfólio Avançada',
  },
  {
    id: 'streak30', icon: Zap, title: 'Consistência Épica', desc: '30 dias de streak',
    unlocked: false, xpBonus: 0, color: 'neon-pink',
    progress: 7, target: 30,
    unlocks: 'Título exclusivo: "Imparável"',
  },
  {
    id: 'lvl10', icon: Trophy, title: 'Veterano', desc: 'Alcance o Nível 10',
    unlocked: false, xpBonus: 0, color: 'neon-cyan',
    progress: 1, target: 10,
    unlocks: 'Nova classe disponível: Arquiteto',
  },
];

const colorMap = {
  'neon-cyan': { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30', glow: '0 0 16px hsl(197 100% 55% / 0.3)' },
  'neon-purple': { text: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/30', glow: '0 0 16px hsl(265 80% 65% / 0.3)' },
  'neon-orange': { text: 'text-neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/30', glow: '0 0 16px hsl(25 95% 60% / 0.3)' },
  'neon-green': { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30', glow: '0 0 16px hsl(142 76% 50% / 0.3)' },
  'neon-pink': { text: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30', glow: '0 0 16px hsl(330 80% 65% / 0.3)' },
};

export default function AchievementTree({ userAchievements = [] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {achievements.map((ach, i) => {
        const c = colorMap[ach.color] || colorMap['neon-cyan'];
        const Icon = ach.icon;
        const pct = ach.progress && ach.target ? Math.min(100, (ach.progress / ach.target) * 100) : 0;

        return (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-xl border p-3 relative overflow-hidden ${
              ach.unlocked ? `${c.bg} ${c.border}` : 'bg-card border-border opacity-70'
            }`}
            style={ach.unlocked ? { boxShadow: c.glow } : {}}
          >
            {!ach.unlocked && (
              <div className="absolute top-2 right-2">
                <Lock size={10} className="text-muted-foreground" />
              </div>
            )}
            {ach.unlocked && (
              <div className="absolute top-2 right-2">
                <Star size={10} className={c.text} fill="currentColor" />
              </div>
            )}

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${c.bg}`}>
              <Icon size={15} className={ach.unlocked ? c.text : 'text-muted-foreground'} />
            </div>

            <p className={`text-[11px] font-bold font-rajdhani leading-tight mb-0.5 ${ach.unlocked ? c.text : 'text-muted-foreground'}`}>
              {ach.title}
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight mb-2">{ach.desc}</p>

            {!ach.unlocked && ach.progress !== undefined && (
              <div>
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-muted-foreground/40 transition-all"
                    style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">{ach.progress}/{ach.target}</p>
              </div>
            )}

            {ach.unlocked && (
              <p className="text-[9px] text-muted-foreground leading-tight italic">"{ach.unlocks}"</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}