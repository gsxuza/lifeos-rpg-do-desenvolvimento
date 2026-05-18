import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', receita: 8500, despesa: 5200 },
  { name: 'Fev', receita: 8500, despesa: 4800 },
  { name: 'Mar', receita: 9200, despesa: 5600 },
  { name: 'Abr', receita: 8800, despesa: 5100 },
  { name: 'Mai', receita: 9500, despesa: 4300 },
  { name: 'Jun', receita: 9500, despesa: 5800 },
];

const categoryData = [
  { name: 'Alimentação', value: 1200, color: 'hsl(25 95% 60%)' },
  { name: 'Transporte', value: 680, color: 'hsl(197 100% 55%)' },
  { name: 'Lazer', value: 450, color: 'hsl(265 80% 65%)' },
  { name: 'Saúde', value: 380, color: 'hsl(142 76% 50%)' },
  { name: 'Educação', value: 299, color: 'hsl(330 80% 65%)' },
  { name: 'Outros', value: 580, color: 'hsl(215 20% 55%)' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <p className="font-rajdhani font-bold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-muted-foreground">{p.dataKey === 'receita' ? 'Receita' : 'Despesa'}:</span>
          <span className="font-medium" style={{ color: p.fill }}>R$ {p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function SpendingChart() {
  const total = categoryData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground mb-4">Receita vs Despesas (6 meses)</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} barGap={2}>
            <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10, fontFamily: 'Rajdhani' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(222 35% 14%)' }} />
            <Bar dataKey="receita" fill="hsl(142 76% 50%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="despesa" fill="hsl(0 72% 55% / 0.7)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground mb-3">Gastos por Categoria</p>
        <div className="space-y-2.5">
          {categoryData.map((cat, i) => {
            const pct = (cat.value / total) * 100;
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-foreground/80">{cat.name}</span>
                  <span className="font-rajdhani font-bold" style={{ color: cat.color }}>
                    R$ {cat.value.toLocaleString()} <span className="text-muted-foreground font-normal">({pct.toFixed(0)}%)</span>
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
    </div>
  );
}