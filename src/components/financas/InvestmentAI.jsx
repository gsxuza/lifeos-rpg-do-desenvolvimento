import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, Info } from 'lucide-react';

const suggestions = [
  {
    name: 'Tesouro Direto IPCA+',
    type: 'Renda Fixa',
    allocation: 30,
    return: '+12.4% a.a.',
    risk: 'Baixo',
    icon: Shield,
    color: 'neon-green',
    reason: 'Proteção contra inflação, ideal para reserva de emergência ampliada.',
  },
  {
    name: 'ETF BOVA11',
    type: 'Renda Variável',
    allocation: 25,
    return: '+18.2% a.a.',
    risk: 'Médio',
    icon: TrendingUp,
    color: 'neon-cyan',
    reason: 'Diversificação em índice Bovespa, bom custo-benefício.',
  },
  {
    name: 'FII HGLG11',
    type: 'Fundos Imobiliários',
    allocation: 20,
    return: '+9.8% a.a.',
    risk: 'Médio',
    icon: TrendingUp,
    color: 'neon-purple',
    reason: 'Renda passiva mensal com dividendos isentos de IR.',
  },
  {
    name: 'Crypto BTC',
    type: 'Cripto',
    allocation: 5,
    return: '±60%',
    risk: 'Alto',
    icon: Zap,
    color: 'neon-orange',
    reason: 'Alta volatilidade. Limite a 5% do portfólio.',
  },
];

const colorMap = {
  'neon-green': { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
  'neon-cyan': { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
  'neon-purple': { text: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20' },
  'neon-orange': { text: 'text-neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/20' },
};

export default function InvestmentAI({ riskProfile = 'Moderado' }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground">IA de Investimentos</p>
        <div className="px-2 py-0.5 rounded bg-neon-purple/10 border border-neon-purple/20">
          <span className="text-[10px] text-neon-purple font-rajdhani">Perfil: {riskProfile}</span>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const c = colorMap[s.color];
          const Icon = s.icon;
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-lg border p-3 ${c.bg} ${c.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.bg}`}>
                    <Icon size={13} className={c.text} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold font-rajdhani ${c.text}`}>{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold font-rajdhani ${c.text}`}>{s.return}</p>
                  <p className="text-[10px] text-muted-foreground">{s.allocation}% alocação</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{s.reason}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}