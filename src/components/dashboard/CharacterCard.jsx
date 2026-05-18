import { motion } from 'framer-motion';
import { Zap, Shield, Star, Flame } from 'lucide-react';
import XPBar from '../shared/XPBar';

const classIcons = {
  Estrategista: '⚔️',
  Empreendedor: '🚀',
  Sábio: '📚',
  Guardião: '🛡️',
};

export default function CharacterCard({ profile }) {
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const xpNext = profile?.xp_next_level || 1000;
  const energy = profile?.energy || 80;
  const avatarClass = profile?.avatar_class || 'Estrategista';
  const title = profile?.title || 'Iniciante';
  const streak = profile?.streak_days || 0;

  const energyColor = energy > 60 ? 'green' : energy > 30 ? 'orange' : 'pink';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-neon-cyan/20 p-5"
      style={{
        background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(210 50% 10%) 100%)',
        boxShadow: '0 0 40px hsl(197 100% 55% / 0.08)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
        style={{ background: 'hsl(197 100% 55%)' }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 blur-3xl"
        style={{ background: 'hsl(265 80% 65%)' }} />

      <div className="relative flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ boxShadow: ['0 0 10px hsl(197 100% 55% / 0.4)', '0 0 20px hsl(197 100% 55% / 0.8)', '0 0 10px hsl(197 100% 55% / 0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl border border-neon-cyan/40 flex items-center justify-center text-3xl"
            style={{ background: 'hsl(222 47% 12%)' }}
          >
            {classIcons[avatarClass]}
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-neon-cyan flex items-center justify-center"
            style={{ boxShadow: '0 0 10px hsl(197 100% 55%)' }}>
            <span className="text-[10px] font-bold text-background font-rajdhani">{level}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] uppercase tracking-widest text-neon-cyan/70 font-rajdhani">{avatarClass}</span>
            {streak > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-neon-orange/10 border border-neon-orange/20">
                <Flame size={9} className="text-neon-orange" />
                <span className="text-[9px] text-neon-orange font-rajdhani font-bold">{streak}d</span>
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold font-rajdhani text-foreground leading-tight">{title}</h2>
          <p className="text-[11px] text-muted-foreground mb-3">Nível {level} · {xp.toLocaleString()} XP</p>

          <div className="space-y-2">
            <XPBar current={xp} max={xpNext} color="cyan" label="XP" />
            <XPBar current={energy} max={100} color={energyColor} label="Energia" showNumbers={false} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="relative mt-4 pt-4 border-t border-border flex justify-between">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-0.5">
            <Star size={11} className="text-neon-cyan" />
            <span className="text-xs font-bold font-rajdhani text-neon-cyan">{profile?.wisdom_xp || 0}</span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase">Sabedoria</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-0.5">
            <Zap size={11} className="text-neon-purple" />
            <span className="text-xs font-bold font-rajdhani text-neon-purple">{profile?.craft_xp || 0}</span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase">Ofício</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-0.5">
            <Shield size={11} className="text-neon-green" />
            <span className="text-xs font-bold font-rajdhani text-neon-green">{profile?.vitality_xp || 0}</span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase">Vitalidade</span>
        </div>
      </div>
    </motion.div>
  );
}