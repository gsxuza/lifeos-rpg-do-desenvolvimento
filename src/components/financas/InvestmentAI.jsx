import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, RefreshCw, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const colorMap = {
  0: { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
  1: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
  2: { text: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20' },
  3: { text: 'text-neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/20' },
};

export default function InvestmentAI({ riskProfile, transactions = [] }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `Você é um consultor financeiro especialista no mercado brasileiro.
Perfil do usuário:
- Tolerância a risco: ${riskProfile || 'Moderado'}
- Receita total registrada: R$ ${totalIncome.toFixed(2)}
- Despesas totais registradas: R$ ${totalExpense.toFixed(2)}
- Taxa de poupança estimada: ${savingsRate}%

Gere 4 sugestões de investimento personalizadas para este perfil, priorizando produtos do mercado brasileiro (Tesouro Direto, CDB, FIIs, ETFs da B3, etc.).
Ajuste o risco dos produtos ao perfil declarado.
Para perfil Conservador: priorize renda fixa e liquidez.
Para perfil Moderado: misture renda fixa e variável.
Para perfil Arrojado: inclua mais renda variável e cripto com cautela.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  allocation: { type: 'number' },
                  expected_return: { type: 'string' },
                  risk: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setSuggestions(result.suggestions || []);
      setGenerated(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!generated && !loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center mx-auto mb-3">
          <Sparkles size={18} className="text-neon-purple" />
        </div>
        <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-foreground mb-1">
          Consultoria de Investimentos por IA
        </p>
        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
          A IA analisa seu perfil <span className="text-neon-purple font-medium">{riskProfile || 'Moderado'}</span> e seus dados financeiros reais para gerar sugestões personalizadas.
        </p>
        <button
          onClick={generate}
          className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-rajdhani uppercase tracking-wider"
          style={{ background: 'rgb(189 0 255 / 0.12)', color: '#BD00FF', border: '1px solid rgb(189 0 255 / 0.3)' }}
        >
          <Sparkles size={12} /> Gerar Sugestões
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={20} className="text-neon-purple" />
        </motion.div>
        <p className="text-xs font-rajdhani text-muted-foreground">IA analisando seu perfil financeiro...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground">IA de Investimentos</p>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-neon-purple/10 border border-neon-purple/20">
            <span className="text-[10px] text-neon-purple font-rajdhani">Perfil: {riskProfile || 'Moderado'}</span>
          </div>
          <button onClick={generate} className="p-1 rounded hover:bg-secondary transition-colors">
            <RefreshCw size={11} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const c = colorMap[i] || colorMap[0];
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-lg border p-3 ${c.bg} ${c.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-xs font-semibold font-rajdhani ${c.text}`}>{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.type} · Risco {s.risk}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-bold font-rajdhani ${c.text}`}>{s.expected_return}</p>
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