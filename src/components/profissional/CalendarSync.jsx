import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, Link, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const mockEvents = [
  { id: 'e1', title: 'Reunião de Design Sprint', start_time: new Date(Date.now() + 3600000).toISOString(), end_time: new Date(Date.now() + 7200000).toISOString(), pillar: 'profissional', xp_reward: 75, converted_to_quest: true },
  { id: 'e2', title: 'Call com Investidor', start_time: new Date(Date.now() + 86400000).toISOString(), end_time: new Date(Date.now() + 90000000).toISOString(), pillar: 'financeiro', xp_reward: 100, converted_to_quest: true },
  { id: 'e3', title: 'Dentista', start_time: new Date(Date.now() + 172800000).toISOString(), end_time: new Date(Date.now() + 176400000).toISOString(), pillar: 'pessoal', xp_reward: 50, converted_to_quest: false },
  { id: 'e4', title: 'Review de Código', start_time: new Date(Date.now() + 43200000).toISOString(), end_time: new Date(Date.now() + 46800000).toISOString(), pillar: 'profissional', xp_reward: 80, converted_to_quest: true },
];

const pillarColors = {
  profissional: { color: '#00E5FF', bg: 'rgb(0 229 255 / 0.08)', border: 'rgb(0 229 255 / 0.2)' },
  pessoal:      { color: '#BD00FF', bg: 'rgb(189 0 255 / 0.08)', border: 'rgb(189 0 255 / 0.2)' },
  financeiro:   { color: '#39FF14', bg: 'rgb(57 255 20 / 0.08)', border: 'rgb(57 255 20 / 0.2)' },
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((d - today) / 86400000);
  if (diff < 1) return 'Hoje';
  if (diff < 2) return 'Amanhã';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function CalendarSync({ profile }) {
  const [connected, setConnected] = useState(profile?.calendar_connected || false);
  const [syncing, setSyncing] = useState(false);
  const [events, setEvents] = useState([]);
  const [converting, setConverting] = useState(null);

  useEffect(() => {
    if (connected) {
      base44.entities.CalendarEvent.list('-start_time', 10)
        .then(data => setEvents(data.length > 0 ? data : mockEvents))
        .catch(() => setEvents(mockEvents));
    }
  }, [connected]);

  const handleConnect = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1800));
    if (profile?.id) {
      await base44.entities.UserProfile.update(profile.id, { calendar_connected: true });
    }
    setConnected(true);
    setEvents(mockEvents);
    setSyncing(false);
  };

  const convertToQuest = async (event) => {
    setConverting(event.id);
    await new Promise(r => setTimeout(r, 600));
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, converted_to_quest: true } : e));
    if (event.id && !event.id.startsWith('e')) {
      await base44.entities.CalendarEvent.update(event.id, { converted_to_quest: true });
    }
    setConverting(null);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-xl p-4" style={{ background: connected ? 'rgb(0 229 255 / 0.05)' : 'rgb(0 229 255 / 0.03)', border: `1px solid ${connected ? 'rgb(0 229 255 / 0.18)' : '#252730'}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: connected ? '#00E5FF' : '#A0A5B5' }} />
            <div>
              <p className="text-xs font-semibold font-rajdhani uppercase tracking-wide" style={{ color: connected ? '#00E5FF' : '#FFFFFF' }}>
                {connected ? 'Google Calendar Sincronizado' : 'Conectar Calendário'}
              </p>
              <p className="text-[10px]" style={{ color: '#A0A5B5' }}>
                {connected ? 'Eventos são convertidos em Missões automaticamente' : 'Sync 2 vias: Google Calendar & Outlook'}
              </p>
            </div>
          </div>
          {!connected ? (
            <motion.button whileTap={{ scale: 0.94 }} onClick={handleConnect} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-rajdhani disabled:opacity-50"
              style={{ background: 'rgb(0 229 255 / 0.12)', color: '#00E5FF', border: '1px solid rgb(0 229 255 / 0.25)' }}>
              {syncing ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw size={11} /></motion.div> : <Link size={11} />}
              {syncing ? 'Conectando...' : 'Conectar'}
            </motion.button>
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#39FF14' }} />
              <span className="text-[10px] font-rajdhani" style={{ color: '#39FF14' }}>Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Events list */}
      <AnimatePresence>
        {connected && events.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl overflow-hidden" style={{ border: '1px solid #252730', background: '#161820' }}>
            <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: '#252730' }}>
              <div className="flex items-center gap-2">
                <Zap size={11} style={{ color: '#00E5FF' }} />
                <p className="text-[10px] uppercase tracking-widest font-rajdhani" style={{ color: '#00E5FF' }}>Próximos Eventos → Quests</p>
              </div>
              <span className="text-[10px] font-rajdhani" style={{ color: '#A0A5B5' }}>{events.length} eventos</span>
            </div>

            {events.map((ev, i) => {
              const c = pillarColors[ev.pillar] || pillarColors.profissional;
              return (
                <motion.div key={ev.id || i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0" style={{ borderColor: '#252730', borderLeft: `3px solid ${c.color}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
                    <Clock size={12} style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>{ev.title}</p>
                    <p className="text-[10px]" style={{ color: '#A0A5B5' }}>
                      {formatDate(ev.start_time)} · {formatTime(ev.start_time)} — {formatTime(ev.end_time)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-0.5">
                      <Zap size={9} style={{ color: '#f97316' }} />
                      <span className="text-[10px] font-bold font-rajdhani" style={{ color: '#f97316' }}>+{ev.xp_reward}</span>
                    </div>
                    {ev.converted_to_quest ? (
                      <div className="flex items-center gap-0.5">
                        <CheckCircle2 size={10} style={{ color: '#39FF14' }} />
                        <span className="text-[9px] font-rajdhani" style={{ color: '#39FF14' }}>Quest</span>
                      </div>
                    ) : (
                      <button onClick={() => convertToQuest(ev)} disabled={converting === ev.id}
                        className="text-[9px] font-rajdhani px-1.5 py-0.5 rounded"
                        style={{ background: 'rgb(0 229 255 / 0.1)', color: '#00E5FF' }}>
                        {converting === ev.id ? '...' : '→ Quest'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}