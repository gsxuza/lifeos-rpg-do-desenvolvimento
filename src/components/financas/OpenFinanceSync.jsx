import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Zap, Link } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const banks = [
  { name: 'Nubank', icon: '💜', color: '#9333ea', status: 'connected', lastSync: '2 min atrás', balance: 3240.5 },
  { name: 'Bradesco', icon: '🔴', color: '#cc0000', status: 'connected', lastSync: '5 min atrás', balance: 12800.0 },
  { name: 'XP Investimentos', icon: '🟢', color: '#39FF14', status: 'connected', lastSync: '1 min atrás', balance: 45600.0 },
  { name: 'Itaú', icon: '🟠', color: '#f97316', status: 'pending', lastSync: 'Aguardando', balance: null },
];

const autoCategories = [
  { merchant: 'iFood', category: 'alimentacao', icon: '🍔', amount: 45.9 },
  { merchant: 'Uber', category: 'transporte', icon: '🚗', amount: 23.5 },
  { merchant: 'Netflix', category: 'lazer', icon: '🎬', amount: 39.9 },
  { merchant: 'Farmácias Pacheco', category: 'saude', icon: '💊', amount: 67.0 },
  { merchant: 'Udemy', category: 'educacao', icon: '📚', amount: 29.9 },
];

export default function OpenFinanceSync({ profile, onSyncComplete }) {
  const [syncing, setSyncing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const connected = profile?.open_finance_connected || false;

  const handleConnect = async () => {
    setSyncing(true);
    // Simulate Open Finance (Pluggy/Belvo) OAuth + sync
    await new Promise(r => setTimeout(r, 2000));
    if (profile?.id) {
      await base44.entities.UserProfile.update(profile.id, {
        open_finance_connected: true,
        open_finance_last_sync: new Date().toISOString(),
      });
    }
    setSyncing(false);
    setSyncDone(true);
    setShowCategories(true);
    if (onSyncComplete) onSyncComplete();
  };

  const handleResync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSyncing(false);
    setShowCategories(true);
  };

  return (
    <div className="space-y-3">
      {/* Connection status header */}
      <div className="rounded-xl p-4" style={{ background: connected ? 'rgb(57 255 20 / 0.06)' : 'rgb(0 229 255 / 0.04)', border: `1px solid ${connected ? 'rgb(57 255 20 / 0.2)' : 'rgb(0 229 255 / 0.15)'}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {connected ? (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Wifi size={15} style={{ color: '#39FF14' }} />
              </motion.div>
            ) : (
              <WifiOff size={15} style={{ color: '#A0A5B5' }} />
            )}
            <div>
              <p className="text-xs font-semibold font-rajdhani uppercase tracking-wide" style={{ color: connected ? '#39FF14' : '#FFFFFF' }}>
                {connected ? 'Open Finance Ativo' : 'Open Finance Inativo'}
              </p>
              <p className="text-[10px]" style={{ color: '#A0A5B5' }}>
                {connected ? `Última sincronização: ${profile?.open_finance_last_sync ? new Date(profile.open_finance_last_sync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'agora'}` : 'Conecte suas contas para sincronização automática'}
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={connected ? handleResync : handleConnect}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani uppercase tracking-wide disabled:opacity-50"
            style={{ background: connected ? 'rgb(57 255 20 / 0.12)' : 'rgb(0 229 255 / 0.12)', color: connected ? '#39FF14' : '#00E5FF', border: `1px solid ${connected ? 'rgb(57 255 20 / 0.25)' : 'rgb(0 229 255 / 0.25)'}` }}
          >
            {syncing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={11} />
              </motion.div>
            ) : connected ? <RefreshCw size={11} /> : <Link size={11} />}
            {syncing ? 'Sincronizando...' : connected ? 'Re-sync' : 'Conectar'}
          </motion.button>
        </div>
      </div>

      {/* Bank accounts */}
      {(connected || syncDone) && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden" style={{ border: '1px solid #252730', background: '#161820' }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: '#252730' }}>
            <p className="text-[10px] uppercase tracking-widest font-rajdhani" style={{ color: '#A0A5B5' }}>Contas Conectadas</p>
          </div>
          {banks.map((bank, i) => (
            <div key={bank.name} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0" style={{ borderColor: '#252730' }}>
              <span className="text-base">{bank.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: '#FFFFFF' }}>{bank.name}</p>
                <p className="text-[10px]" style={{ color: '#A0A5B5' }}>{bank.lastSync}</p>
              </div>
              {bank.status === 'connected' ? (
                <div className="text-right">
                  <p className="text-xs font-bold font-rajdhani" style={{ color: '#39FF14' }}>
                    R$ {bank.balance?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                  <CheckCircle2 size={10} style={{ color: '#39FF14', marginLeft: 'auto' }} />
                </div>
              ) : (
                <AlertCircle size={13} style={{ color: '#A0A5B5' }} />
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Auto-categorization */}
      <AnimatePresence>
        {showCategories && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #252730', background: '#161820' }}>
              <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: '#252730' }}>
                <Zap size={11} style={{ color: '#00E5FF' }} />
                <p className="text-[10px] uppercase tracking-widest font-rajdhani" style={{ color: '#00E5FF' }}>IA Categorizou Automaticamente</p>
              </div>
              {autoCategories.map((tx, i) => (
                <motion.div key={tx.merchant} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 px-4 py-2 border-b last:border-0" style={{ borderColor: '#252730' }}>
                  <span className="text-base">{tx.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: '#FFFFFF' }}>{tx.merchant}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-rajdhani" style={{ background: 'rgb(0 229 255 / 0.08)', color: '#00E5FF' }}>
                      → {tx.category}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-rajdhani" style={{ color: '#ff4d4d' }}>-R$ {tx.amount.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}