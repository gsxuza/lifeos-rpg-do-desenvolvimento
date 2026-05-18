import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const colorMap = {
  orange: { bg: 'bg-neon-orange/10', border: 'border-neon-orange/20', icon: 'text-neon-orange' },
  cyan:   { bg: 'bg-neon-cyan/10',   border: 'border-neon-cyan/20',   icon: 'text-neon-cyan' },
  purple: { bg: 'bg-neon-purple/10', border: 'border-neon-purple/20', icon: 'text-neon-purple' },
};

function buildInsights(profile, transactions) {
  const insights = [];
  if (!profile && transactions.length === 0) return insights;

  const energy = profile?.energy ?? 80;
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date?.startsWith(thisMonth));
  const totalExpense = monthExpenses.reduce((s, t) => s + (t.amount || 0), 0);
  const lazerExpense = monthExpenses.filter(t => t.category === 'lazer' || t.category === 'alimentacao')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const spendingLimit = profile?.spending_limits?.lazer ?? 500;
  const lazerPct = spendingLimit > 0 ? (lazerExpense / spendingLimit) * 100 : 0;

  if (lazerPct > 80) {
    insights.push({
      icon: AlertTriangle, color: 'orange',
      text: `Você usou ${lazerPct.toFixed(0)}% do teto de lazer/alimentação (R$ ${spendingLimit}). Considere segurar os gastos.`,
    });
  } else if (lazerPct < 50 && lazerExpense > 0) {
    insights.push({
      icon: TrendingUp, color: 'cyan',
      text: `Você está ${(100 - lazerPct).toFixed(0)}% abaixo do teto de lazer. Excelente! Mantenha esse ritmo e ganhe +50 XP de Sabedoria.`,
    });
  }

  if (energy < 50) {
    insights.push({
      icon: AlertTriangle, color: 'orange',
      text: `Sua energia está em ${energy}%. Priorize a missão de descanso hoje para evitar burnout.`,
    });
  }

  const wisdom = profile?.wisdom_xp ?? 0;
  if (wisdom > 0) {
    insights.push({
      icon: Sparkles, color: 'purple',
      text: `Você acumulou ${wisdom} XP de Sabedoria Financeira. ${wisdom > 200 ? 'Excelente gestão!' : 'Continue registrando transações para evoluir.'}`,
    });
  }

  if (totalExpense > 0) {
    const lastMonth = `${new Date(now.getFullYear(), now.getMonth() - 1).getFullYear()}-${String(new Date(now.getFullYear(), now.getMonth() - 1).getMonth() + 1).padStart(2, '0')}`;
    const lastMonthExp = transactions.filter(t => t.type === 'expense' && t.date?.startsWith(lastMonth))
      .reduce((s, t) => s + (t.amount || 0), 0);
    if (lastMonthExp > 0) {
      const delta = ((totalExpense - lastMonthExp) / lastMonthExp) * 100;
      insights.push({
        icon: delta < 0 ? TrendingUp : AlertTriangle,
        color: delta < 0 ? 'cyan' : 'orange',
        text: delta < 0
          ? `Seus gastos este mês estão ${Math.abs(delta).toFixed(1)}% menores que o mês passado. Ótimo controle!`
          : `Seus gastos este mês estão ${delta.toFixed(1)}% maiores que o mês passado. Atenção ao orçamento.`,
      });
    }
  }

  return insights;
}

export default function AICommandCenter({ profile }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Transaction.list('-date', 200)
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const energy = profile?.energy ?? 80;
  const insights = buildInsights(profile, transactions);

  return (
    <div className="space-y-3">
      {/* Greeting */}
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
              <span className="font-semibold">{greeting}{profile ? `, ${profile.title || 'Herói'}` : ''}!</span>{' '}
              {transactions.length === 0
                ? 'Adicione suas primeiras transações ou conecte seu banco para receber insights personalizados.'
                : `Analisei ${transactions.length} transações. Energia: `}
              {transactions.length > 0 && (
                <span className={energy < 50 ? 'text-neon-orange font-medium' : 'text-neon-green font-medium'}>
                  {energy < 50 ? `${energy}% — baixa` : `${energy}% — boa`}
                </span>
              )}
              {transactions.length > 0 && (energy < 50 ? '. Priorize descanso hoje.' : '. Continue o plano atual.')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dynamic insights */}
      {loading ? (
        <div className="flex justify-center py-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <RefreshCw size={16} style={{ color: '#00E5FF' }} />
          </motion.div>
        </div>
      ) : (
        insights.map((insight, i) => {
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
        })
      )}
    </div>
  );
}