import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const accounts = [
  { name: 'Nubank', balance: 3240.5, color: '#9333ea', icon: '💜' },
  { name: 'Bradesco', balance: 12800.0, color: 'hsl(197 100% 55%)', icon: '🔵' },
  { name: 'XP Investimentos', balance: 45600.0, color: 'hsl(142 76% 50%)', icon: '📈' },
];

export default function BalanceCard() {
  const [hidden, setHidden] = useState(false);
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  const monthChange = 3.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-neon-cyan/20 p-5 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(210 50% 10%) 100%)' }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 blur-3xl"
        style={{ background: 'hsl(197 100% 55%)' }} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-rajdhani">Patrimônio Total</p>
            <motion.div
              key={hidden ? 'hidden' : 'visible'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-2 mt-1"
            >
              {hidden ? (
                <span className="text-2xl font-bold font-rajdhani text-foreground">R$ ••••••</span>
              ) : (
                <span className="text-2xl font-bold font-rajdhani text-neon-cyan">
                  R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </motion.div>
          </div>
          <button
            onClick={() => setHidden(h => !h)}
            className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center"
          >
            {hidden ? <Eye size={14} className="text-muted-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-5">
          <TrendingUp size={12} className="text-neon-green" />
          <span className="text-xs text-neon-green font-medium">+{monthChange}% este mês</span>
          <span className="text-[11px] text-muted-foreground">vs mês anterior</span>
        </div>

        {/* Account list */}
        <div className="space-y-2.5">
          {accounts.map((acc) => (
            <div key={acc.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center text-sm"
                  style={{ background: `${acc.color}15` }}>
                  {acc.icon}
                </div>
                <span className="text-xs text-foreground font-medium">{acc.name}</span>
              </div>
              {hidden ? (
                <span className="text-xs font-rajdhani text-muted-foreground">R$ ••••</span>
              ) : (
                <span className="text-xs font-bold font-rajdhani" style={{ color: acc.color }}>
                  R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}