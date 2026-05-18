import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Swords, Coffee, Calendar, TrendingUp, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const typeConfig = {
  finance_alert:  { icon: AlertTriangle, color: '#39FF14', label: 'Finanças' },
  habit_reminder: { icon: Swords, color: '#BD00FF', label: 'Hábito' },
  morning_brief:  { icon: Coffee, color: '#00E5FF', label: 'Briefing' },
  calendar_quest: { icon: Calendar, color: '#00E5FF', label: 'Agenda' },
  level_up:       { icon: Star, color: '#39FF14', label: 'Level Up!' },
  achievement:    { icon: TrendingUp, color: '#BD00FF', label: 'Conquista' },
};

const defaultNotifications = [
  {
    id: 'n1', title: '🚨 Alerta Open Finance', priority: 'urgent', read: false, type: 'finance_alert',
    body: 'Você atingiu 80% do limite de Lazer esta semana. Missão de contenção ativada!',
    created_date: new Date().toISOString(),
  },
  {
    id: 'n2', title: '⚔️ Vitalidade caindo', priority: 'normal', read: false, type: 'habit_reminder',
    body: 'Faltam 2h para o fim do dia e sua leitura diária ainda não foi marcada. Não perca o streak!',
    created_date: new Date().toISOString(),
  },
  {
    id: 'n3', title: '☕ Bom dia, Jogador!', priority: 'info', read: true, type: 'morning_brief',
    body: 'Suas missões de hoje estão prontas no painel. Energia: 65%. Foco na meta profissional.',
    created_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'n4', title: '📅 Missão agendada criada', priority: 'info', read: false, type: 'calendar_quest',
    body: 'Seu evento "Reunião de Design" foi convertido em Quest. Complete para ganhar +75 XP Profissional.',
    created_date: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    base44.entities.Notification.list('-created_date', 15)
      .then(data => setNotifications(data.length > 0 ? data : defaultNotifications))
      .catch(() => setNotifications(defaultNotifications));
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = async (n) => {
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    if (n.id && !n.id.startsWith('n')) {
      await base44.entities.Notification.update(n.id, { read: true }).catch(() => {});
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(x => ({ ...x, read: true })));
  };

  const priorityBorder = { urgent: '#39FF14', normal: '#00E5FF', info: '#252730' };

  return (
    <>
      {/* Bell button */}
      <button onClick={() => setOpen(true)} className="relative w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#252730', background: '#161820' }}>
        <Bell size={14} style={{ color: '#A0A5B5' }} />
        {unread > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-rajdhani"
            style={{ background: '#39FF14', color: '#0D0E12' }}>
            {unread}
          </motion.div>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: 'rgb(0 0 0 / 0.6)' }}
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              className="fixed top-14 right-4 left-4 max-w-sm mx-auto z-50 rounded-2xl overflow-hidden"
              style={{ background: '#161820', border: '1px solid #252730', boxShadow: '0 24px 60px rgb(0 0 0 / 0.6)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#252730' }}>
                <div className="flex items-center gap-2">
                  <Bell size={14} style={{ color: '#00E5FF' }} />
                  <span className="text-sm font-semibold font-rajdhani uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Notificações</span>
                  {unread > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-rajdhani font-bold" style={{ background: 'rgb(0 229 255 / 0.15)', color: '#00E5FF' }}>{unread} novas</span>}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && <button onClick={markAllRead} className="text-[10px] font-rajdhani" style={{ color: '#A0A5B5' }}>Marcar lidas</button>}
                  <button onClick={() => setOpen(false)}><X size={14} style={{ color: '#A0A5B5' }} /></button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto divide-y" style={{ divideColor: '#252730' }}>
                {notifications.map((n, i) => {
                  const cfg = typeConfig[n.type] || typeConfig.morning_brief;
                  const Icon = cfg.icon;
                  return (
                    <motion.button
                      key={n.id || i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => markRead(n)}
                      className="w-full text-left p-3 flex items-start gap-3 transition-colors hover:bg-white/[0.02]"
                      style={{ borderLeft: `3px solid ${n.read ? 'transparent' : priorityBorder[n.priority] || '#252730'}` }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${cfg.color}15` }}>
                        <Icon size={13} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold mb-0.5" style={{ color: n.read ? '#A0A5B5' : '#FFFFFF' }}>{n.title}</p>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#A0A5B5' }}>{n.body}</p>
                        <span className="text-[10px] mt-1 block" style={{ color: '#252730' }}>
                          {new Date(n.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}