import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Zap, Link, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const categoryLabels = {
  alimentacao: 'Alimentação', transporte: 'Transporte', lazer: 'Lazer',
  saude: 'Saúde', educacao: 'Educação', investimento: 'Investimento',
  salario: 'Salário', freelance: 'Freelance', outros: 'Outros',
};

const categoryIcons = {
  alimentacao: '🍔', transporte: '🚗', lazer: '🎮', saude: '💊',
  educacao: '📚', investimento: '📈', salario: '💼', freelance: '💻', outros: '📦',
};

export default function OpenFinanceSync({ profile, onSyncComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentTxs, setRecentTxs] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const connected = profile?.open_finance_connected || false;

  // Load real transactions from DB
  useEffect(() => {
    setTxLoading(true);
    base44.entities.Transaction.list('-date', 10)
      .then(setRecentTxs)
      .catch(() => setRecentTxs([]))
      .finally(() => setTxLoading(false));
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('openFinanceConnect', {});
      const { connectToken } = res.data;

      // Open the Pluggy Widget in a popup
      const widgetUrl = `https://connect.pluggy.ai?connectToken=${connectToken}`;
      const popup = window.open(widgetUrl, 'pluggy_connect', 'width=480,height=700,left=100,top=100');

      // Poll for popup close, then mark as connected
      const timer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          // Update profile as connected
          if (profile?.id) {
            await base44.entities.UserProfile.update(profile.id, {
              open_finance_connected: true,
              open_finance_last_sync: new Date().toISOString(),
            });
          }
          // Refresh transactions
          const txs = await base44.entities.Transaction.list('-date', 10);
          setRecentTxs(txs);
          setLoading(false);
          if (onSyncComplete) onSyncComplete();
        }
      }, 800);
    } catch (e) {
      setError(e.message || 'Falha ao conectar. Verifique as credenciais da API Pluggy.');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const txs = await base44.entities.Transaction.list('-date', 10);
      setRecentTxs(txs);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const lastSync = profile?.open_finance_last_sync
    ? new Date(profile.open_finance_last_sync).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-3">
      {/* Status header */}
      <div className="rounded-xl p-4" style={{
        background: connected ? 'rgb(57 255 20 / 0.06)' : 'rgb(0 229 255 / 0.04)',
        border: `1px solid ${connected ? 'rgb(57 255 20 / 0.2)' : 'rgb(0 229 255 / 0.15)'}`
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connected ? (
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Wifi size={15} style={{ color: '#39FF14' }} />
              </motion.div>
            ) : (
              <WifiOff size={15} style={{ color: '#A0A5B5' }} />
            )}
            <div>
              <p className="text-xs font-semibold font-rajdhani uppercase tracking-wide"
                style={{ color: connected ? '#39FF14' : '#FFFFFF' }}>
                {connected ? 'Open Finance Ativo' : 'Open Finance Desconectado'}
              </p>
              <p className="text-[10px]" style={{ color: '#A0A5B5' }}>
                {connected
                  ? `Última sync: ${lastSync || 'agora'}`
                  : 'Conecte via Pluggy para sincronização automática'}
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={connected ? handleRefresh : handleConnect}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani uppercase tracking-wide disabled:opacity-50"
            style={{
              background: connected ? 'rgb(57 255 20 / 0.12)' : 'rgb(0 229 255 / 0.12)',
              color: connected ? '#39FF14' : '#00E5FF',
              border: `1px solid ${connected ? 'rgb(57 255 20 / 0.25)' : 'rgb(0 229 255 / 0.25)'}`,
            }}
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={11} />
              </motion.div>
            ) : connected ? <RefreshCw size={11} /> : <Link size={11} />}
            {loading ? 'Aguarde...' : connected ? 'Atualizar' : 'Conectar Banco'}
          </motion.button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl p-3 flex items-start gap-2"
          style={{ background: 'rgb(239 68 68 / 0.08)', border: '1px solid rgb(239 68 68 / 0.25)' }}>
          <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {/* Empty state – not connected, no transactions */}
      {!connected && recentTxs.length === 0 && !txLoading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 text-center"
          style={{ background: 'rgb(0 229 255 / 0.03)', border: '1px dashed rgb(0 229 255 / 0.15)' }}>
          <div className="text-3xl mb-3">🏦</div>
          <p className="text-sm font-semibold font-rajdhani text-foreground mb-1">
            Nenhuma transação encontrada
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: '#A0A5B5' }}>
            Conecte sua primeira conta bancária via Open Finance para sincronizar transações automaticamente e ganhar seus primeiros pontos de <span style={{ color: '#39FF14' }}>Sabedoria Financeira</span>.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleConnect}
            disabled={loading}
            className="mt-4 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg text-xs font-bold font-rajdhani uppercase tracking-wider disabled:opacity-50"
            style={{ background: 'rgb(0 229 255 / 0.12)', color: '#00E5FF', border: '1px solid rgb(0 229 255 / 0.3)' }}
          >
            <ExternalLink size={12} />
            {loading ? 'Abrindo widget...' : 'Conectar via Pluggy'}
          </motion.button>
        </motion.div>
      )}

      {/* Real transaction list with XP indicator */}
      <AnimatePresence>
        {recentTxs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl overflow-hidden" style={{ border: '1px solid #252730', background: '#161820' }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: '#252730' }}>
              <Zap size={11} style={{ color: '#00E5FF' }} />
              <p className="text-[10px] uppercase tracking-widest font-rajdhani" style={{ color: '#00E5FF' }}>
                Transações Sincronizadas · IA Categorizou
              </p>
            </div>
            {txLoading ? (
              <div className="flex justify-center py-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={18} style={{ color: '#00E5FF' }} />
                </motion.div>
              </div>
            ) : (
              recentTxs.map((tx, i) => (
                <motion.div key={tx.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0"
                  style={{ borderColor: '#252730' }}>
                  <span className="text-base">{categoryIcons[tx.category] || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>{tx.description}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-rajdhani"
                      style={{ background: 'rgb(0 229 255 / 0.08)', color: '#00E5FF' }}>
                      → {categoryLabels[tx.category] || tx.category}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold font-rajdhani"
                      style={{ color: tx.type === 'income' ? '#39FF14' : '#ef4444' }}>
                      {tx.type === 'income' ? '+' : '-'}R$ {Number(tx.amount).toFixed(2)}
                    </p>
                    {tx.xp_awarded !== 0 && (
                      <p className="text-[10px] font-rajdhani"
                        style={{ color: tx.xp_awarded > 0 ? '#39FF14' : '#f97316' }}>
                        {tx.xp_awarded > 0 ? `+${tx.xp_awarded}` : tx.xp_awarded} XP
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}