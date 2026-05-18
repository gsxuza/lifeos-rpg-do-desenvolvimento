import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const categoryColors = {
  alimentacao: 'hsl(25 95% 60%)',
  transporte: 'hsl(197 100% 55%)',
  lazer: 'hsl(265 80% 65%)',
  saude: 'hsl(142 76% 50%)',
  educacao: 'hsl(330 80% 65%)',
  investimento: 'hsl(142 76% 50%)',
  salario: 'hsl(142 76% 50%)',
  freelance: 'hsl(197 100% 55%)',
  outros: 'hsl(215 20% 55%)',
};

const categoryLabels = {
  alimentacao: 'Alimentação', transporte: 'Transporte', lazer: 'Lazer',
  saude: 'Saúde', educacao: 'Educação', investimento: 'Investimento',
  salario: 'Salário', freelance: 'Freelance', outros: 'Outros',
};

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <p className="font-rajdhani font-bold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-muted-foreground">{p.dataKey === 'receita' ? 'Receita' : 'Despesa'}:</span>
          <span className="font-medium" style={{ color: p.fill }}>R$ {p.value.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  );
};

export default function SpendingChart() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Transaction.list('-date', 500)
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  // Build last 6 months bar chart data from real transactions
  const monthlyData = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthTxs = transactions.filter(t => t.date?.startsWith(key));
      return {
        name: MONTH_NAMES[d.getMonth()],
        receita: monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0),
        despesa: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0),
      };
    });
  })();

  // Build category breakdown from real expense transactions
  const categoryData = (() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + (t.amount || 0);
    });
    return Object.entries(map)
      .map(([cat, value]) => ({ name: categoryLabels[cat] || cat, value, color: categoryColors[cat] || '#A0A5B5' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  const totalExpenses = categoryData.reduce((s, c) => s + c.value, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: 'rgb(0 229 255 / 0.2)', borderTopColor: '#00E5FF' }} />
        </motion.div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-xl border p-6 text-center"
        style={{ background: 'rgb(0 229 255 / 0.03)', border: '1px dashed rgb(0 229 255 / 0.15)' }}>
        <div className="text-2xl mb-2">📊</div>
        <p className="text-xs font-rajdhani text-foreground font-semibold mb-1">Sem dados para exibir</p>
        <p className="text-[11px]" style={{ color: '#A0A5B5' }}>Os gráficos aparecerão conforme você lança transações.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground mb-4">Receita vs Despesas (6 meses)</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={monthlyData} barGap={2}>
            <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10, fontFamily: 'Rajdhani' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(222 35% 14%)' }} />
            <Bar dataKey="receita" fill="hsl(142 76% 50%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="despesa" fill="hsl(0 72% 55% / 0.7)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground mb-3">Gastos por Categoria</p>
          <div className="space-y-2.5">
            {categoryData.map((cat, i) => {
              const pct = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-foreground/80">{cat.name}</span>
                    <span className="font-rajdhani font-bold" style={{ color: cat.color }}>
                      R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="text-muted-foreground font-normal"> ({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}60` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}