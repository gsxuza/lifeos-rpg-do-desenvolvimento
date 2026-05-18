import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function BalanceCard() {
  const [hidden, setHidden] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Transaction.list('-date', 100)
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  // Calculate totals from real transactions
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // This month vs last month
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date?.startsWith(thisMonth))
    .reduce((s, t) => s + (t.amount || 0), 0);
  const lastMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date?.startsWith(lastMonth))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const monthChange = lastMonthExpenses > 0
    ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    : 0;
  const improving = monthChange < 0;

  if (loading) {
    return (
      <div className="rounded-2xl border border-neon-cyan/20 p-5 flex items-center justify-center h-32"
        style={{ background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(210 50% 10%) 100%)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={18} style={{ color: '#00E5FF' }} />
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-neon-cyan/20 p-5 text-center"
        style={{ background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(210 50% 10%) 100%)' }}>
        <div className="text-3xl mb-2">💳</div>
        <p className="text-sm font-semibold font-rajdhani text-foreground mb-1">Patrimônio: R$ 0,00</p>
        <p className="text-[11px]" style={{ color: '#A0A5B5' }}>
          Adicione transações ou conecte seu banco na aba <span style={{ color: '#39FF14' }}>Sync</span> para ver seu saldo real.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-neon-cyan/20 p-5 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(210 50% 10%) 100%)' }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 blur-3xl"
        style={{ background: '#00E5FF' }} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-rajdhani">Saldo Total</p>
            <motion.div key={hidden ? 'h' : 'v'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2 mt-1">
              {hidden ? (
                <span className="text-2xl font-bold font-rajdhani text-foreground">R$ ••••••</span>
              ) : (
                <span className="text-2xl font-bold font-rajdhani" style={{ color: balance >= 0 ? '#00E5FF' : '#ef4444' }}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </motion.div>
          </div>
          <button onClick={() => setHidden(h => !h)}
            className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
            {hidden ? <Eye size={14} className="text-muted-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
          </button>
        </div>

        {lastMonthExpenses > 0 && (
          <div className="flex items-center gap-1.5 mb-5">
            {improving
              ? <TrendingDown size={12} style={{ color: '#39FF14' }} />
              : <TrendingUp size={12} style={{ color: '#ef4444' }} />}
            <span className="text-xs font-medium" style={{ color: improving ? '#39FF14' : '#ef4444' }}>
              {improving ? '' : '+'}{monthChange.toFixed(1)}% nos gastos
            </span>
            <span className="text-[11px] text-muted-foreground">vs mês anterior</span>
          </div>
        )}

        {/* Income / Expense summary */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl p-3" style={{ background: 'rgb(57 255 20 / 0.06)', border: '1px solid rgb(57 255 20 / 0.15)' }}>
            <p className="text-[10px] uppercase tracking-wider font-rajdhani" style={{ color: '#A0A5B5' }}>Receitas</p>
            {hidden ? (
              <p className="text-sm font-bold font-rajdhani" style={{ color: '#39FF14' }}>R$ ••••</p>
            ) : (
              <p className="text-sm font-bold font-rajdhani" style={{ color: '#39FF14' }}>
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <div className="flex-1 rounded-xl p-3" style={{ background: 'rgb(239 68 68 / 0.06)', border: '1px solid rgb(239 68 68 / 0.15)' }}>
            <p className="text-[10px] uppercase tracking-wider font-rajdhani" style={{ color: '#A0A5B5' }}>Despesas</p>
            {hidden ? (
              <p className="text-sm font-bold font-rajdhani" style={{ color: '#ef4444' }}>R$ ••••</p>
            ) : (
              <p className="text-sm font-bold font-rajdhani" style={{ color: '#ef4444' }}>
                R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}