import { motion } from 'framer-motion';
import { Bot, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

const insights = [
  {
    type: 'warning',
    icon: AlertTriangle,
    color: 'orange',
    text: 'Com seu ritmo atual, você gastará 18% a mais em delivery este mês. Considere redirecionar R$120 para sua meta de viagem.',
  },
  {
    type: 'opportunity',
    icon: TrendingUp,
    color: 'cyan',
    text: 'Você está 73% abaixo do teto de lazer. Excelente! Mais R$200 guardados = +50 XP de Sabedoria.',
  },
  {
    type: 'tip',
    icon: Sparkles,
    color: 'purple',
    text: 'Sua energia está em queda. Priorize a missão de descanso hoje e desbloqueie o bônus de recuperação.',
  },
];

const colorMap = {
  orange: { bg: 'bg-neon-orange/10', border: 'border-neon-orange/20', text: 'text-neon-orange', icon: 'text-neon-orange' },
  cyan: { bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20', text: 'text-neon-cyan', icon: 'text-neon-cyan' },
  purple: { bg: 'bg-neon-purple/10', border: 'border-neon-purple/20', text: 'text-neon-purple', icon: 'text-neon-purple' },
};

export default function AICommandCenter({ profile }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const energy = profile?.energy || 80;

  return (
    <div className="space-y-3">
      {/* Morning briefing */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-neon-cyan/20 p-4"
        style={{ background: 'linear-gradient(135deg, hsl(222 47% 9%) 0%, hsl(197 40% 10%) 100%)' }}
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0"
          >
            <Bot size={16} className="text-neon-cyan" />
          </motion.div>
          <div>
            <p className="text-[11px] text-neon-cyan/70 font-rajdhani uppercase tracking-wider mb-1">IA · Central de Comando</p>
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">{greeting}!</span> Suas finanças estão
              <span className="text-neon-green font-medium"> estáveis</span>, mas sua energia está
              <span className={energy < 50 ? ' text-neon-orange font-medium' : ' text-neon-green font-medium'}>
                {energy < 50 ? ' baixa' : ' boa'}
              </span>. {energy < 50 ? 'Priorize descanso hoje.' : 'Continue com o plano atual.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      {insights.map((insight, i) => {
        const c = colorMap[insight.color];
        const Icon = insight.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className={`rounded-xl border p-3 flex items-start gap-2.5 ${c.bg} ${c.border}`}
          >
            <Icon size={13} className={`mt-0.5 flex-shrink-0 ${c.icon}`} />
            <p className="text-[12px] text-foreground/80 leading-relaxed">{insight.text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}