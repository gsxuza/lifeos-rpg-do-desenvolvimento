import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BalanceCard from '../components/financas/BalanceCard';
import SpendingChart from '../components/financas/SpendingChart';
import InvestmentAI from '../components/financas/InvestmentAI';
import OpenFinanceSync from '../components/financas/OpenFinanceSync';
import SectionHeader from '../components/shared/SectionHeader';

const categoryIcons = {
  alimentacao: '🍔', transporte: '🚗', lazer: '🎮', saude: '💊',
  educacao: '📚', investimento: '📈', salario: '💼', freelance: '💻', outros: '📦',
};

export default function Financas() {
  const [transactions, setTransactions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', type: 'expense', category: 'outros', date: new Date().toISOString().split('T')[0], account: 'Nubank' });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    base44.entities.Transaction.list('-date', 20).then(setTransactions).catch(console.error);
  }, []);

  const handleAdd = async () => {
    if (!form.description || !form.amount) return;
    const rec = await base44.entities.Transaction.create({ ...form, amount: parseFloat(form.amount) });
    setTransactions(prev => [rec, ...prev]);
    setShowAdd(false);
    setForm({ description: '', amount: '', type: 'expense', category: 'outros', date: new Date().toISOString().split('T')[0], account: 'Nubank' });
  };

  const [profile, setProfile] = useState(null);
  const tabs = ['overview', 'sync', 'histórico', 'investir'];

  useEffect(() => {
    base44.entities.UserProfile.list().then(p => { if (p.length > 0) setProfile(p[0]); }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen px-4 pt-4 pb-6" style={{ background: '#0D0E12' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-rajdhani" style={{ color: '#A0A5B5' }}>Pilar Financeiro</p>
          <h1 className="text-xl font-bold font-space" style={{ color: '#FFFFFF' }}>Open <span style={{ color: '#39FF14' }}>Finance</span></h1>
        </div>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-semibold font-rajdhani"
          style={{ boxShadow: '0 0 12px hsl(197 100% 55% / 0.15)' }}
        >
          <Plus size={13} /> Lançar
        </button>
      </div>

      {/* Quick add form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-neon-cyan/20 bg-card p-4 mb-5 space-y-3"
        >
          <p className="text-xs font-rajdhani uppercase tracking-wider text-neon-cyan font-semibold">Novo Lançamento</p>
          <div className="flex gap-2">
            {['expense', 'income'].map(t => (
              <button key={t}
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-rajdhani border transition-all ${form.type === t
                  ? t === 'expense' ? 'bg-destructive/20 border-destructive/40 text-destructive' : 'bg-neon-green/20 border-neon-green/40 text-neon-green'
                  : 'border-border text-muted-foreground'}`}
              >
                {t === 'expense' ? 'Despesa' : 'Receita'}
              </button>
            ))}
          </div>
          <input
            placeholder="Descrição"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-neon-cyan/50"
          />
          <div className="flex gap-2">
            <input
              placeholder="R$ 0,00"
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-neon-cyan/50"
            />
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="flex-1 bg-secondary border border-border rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-neon-cyan/50"
            >
              {Object.keys(categoryIcons).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-2 rounded-lg bg-neon-cyan text-background text-xs font-bold font-rajdhani uppercase tracking-wider"
            style={{ boxShadow: '0 0 16px hsl(197 100% 55% / 0.4)' }}
          >
            Confirmar Lançamento
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl bg-secondary">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold font-rajdhani uppercase tracking-wider transition-all ${activeTab === t ? 'bg-card text-neon-cyan border border-neon-cyan/20' : 'text-muted-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {activeTab === 'overview' && (
          <>
            <BalanceCard />
            <div>
              <SectionHeader title="Análise de Gastos" accentColor="cyan" />
              <SpendingChart />
            </div>
          </>
        )}

        {activeTab === 'sync' && (
          <div>
            <SectionHeader title="Open Finance" subtitle="Sincronização automática de contas" accentColor="green" />
            <OpenFinanceSync profile={profile} onSyncComplete={() => {}} />
          </div>
        )}

        {activeTab === 'histórico' && (
          <div>
            <SectionHeader title="Transações Recentes" accentColor="orange" />
            {transactions.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-6 text-center"
                style={{ background: 'rgb(249 115 22 / 0.04)', border: '1px dashed rgb(249 115 22 / 0.2)' }}>
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm font-semibold font-rajdhani text-foreground mb-1">Nenhuma transação ainda</p>
                <p className="text-[11px]" style={{ color: '#A0A5B5' }}>
                  Use o botão <span style={{ color: '#00E5FF' }}>Lançar</span> para adicionar manualmente ou conecte seu banco na aba <span style={{ color: '#39FF14' }}>Sync</span>.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-secondary">
                      {categoryIcons[tx.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">{tx.category} · {tx.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        {tx.type === 'income'
                          ? <ArrowUpCircle size={13} className="text-neon-green" />
                          : <ArrowDownCircle size={13} className="text-destructive" />}
                        <span className={`text-xs font-bold font-rajdhani ${tx.type === 'income' ? 'text-neon-green' : 'text-destructive'}`}>
                          {tx.type === 'income' ? '+' : '-'}R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {tx.xp_awarded !== 0 && (
                        <span className="text-[10px] font-rajdhani"
                          style={{ color: tx.xp_awarded > 0 ? '#39FF14' : '#f97316' }}>
                          {tx.xp_awarded > 0 ? `+${tx.xp_awarded}` : tx.xp_awarded} XP
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'investir' && (
          <div>
            <SectionHeader title="Sugestões de IA" subtitle="Baseadas no seu perfil" accentColor="green" />
            <InvestmentAI riskProfile="Moderado" />
          </div>
        )}
      </div>
    </div>
  );
}