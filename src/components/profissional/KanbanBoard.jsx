import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const columns = [
  { id: 'backlog', label: 'Backlog', color: 'text-muted-foreground', accent: 'bg-muted-foreground' },
  { id: 'doing', label: 'Em Andamento', color: 'text-neon-cyan', accent: 'bg-neon-cyan' },
  { id: 'review', label: 'Revisão', color: 'text-neon-orange', accent: 'bg-neon-orange' },
  { id: 'done', label: 'Concluído', color: 'text-neon-green', accent: 'bg-neon-green' },
];

const priorityColors = {
  low: 'border-l-neon-green/50',
  medium: 'border-l-neon-cyan/50',
  high: 'border-l-neon-orange/50',
  critical: 'border-l-destructive/70',
};

const defaultProjects = [
  { id: 'p1', title: 'App LifeOS MVP', status: 'doing', priority: 'high', xp_reward: 500, category: 'profissional' },
  { id: 'p2', title: 'Curso React Advanced', status: 'doing', priority: 'medium', xp_reward: 200, category: 'aprendizado' },
  { id: 'p3', title: 'Portfólio redesign', status: 'backlog', priority: 'low', xp_reward: 150, category: 'profissional' },
  { id: 'p4', title: 'Certificação AWS', status: 'review', priority: 'high', xp_reward: 400, category: 'aprendizado' },
  { id: 'p5', title: 'Sistema de finanças pessoais', status: 'done', priority: 'medium', xp_reward: 300, category: 'pessoal' },
];

export default function KanbanBoard({ projects, onStatusChange }) {
  const [activeCol, setActiveCol] = useState('doing');
  const displayProjects = (projects && projects.length > 0) ? projects : defaultProjects;

  const colProjects = displayProjects.filter(p => p.status === activeCol);

  return (
    <div>
      {/* Column tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {columns.map(col => {
          const count = displayProjects.filter(p => p.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setActiveCol(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold font-rajdhani uppercase tracking-wider whitespace-nowrap transition-all border ${
                activeCol === col.id
                  ? `bg-card border-border ${col.color}`
                  : 'text-muted-foreground border-transparent'
              }`}
            >
              {activeCol === col.id && <div className={`w-1.5 h-1.5 rounded-full ${col.accent}`} />}
              {col.label}
              <span className={`text-[10px] px-1 rounded ${activeCol === col.id ? 'bg-secondary' : ''}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {colProjects.map((p, i) => (
            <motion.div
              key={p.id || i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border border-border border-l-2 bg-card p-3 ${priorityColors[p.priority] || priorityColors.medium}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-foreground leading-snug flex-1">{p.title}</p>
                <button className="text-muted-foreground flex-shrink-0">
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-rajdhani font-medium ${
                    p.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
                    p.priority === 'high' ? 'bg-neon-orange/10 text-neon-orange' :
                    p.priority === 'medium' ? 'bg-neon-cyan/10 text-neon-cyan' :
                    'bg-neon-green/10 text-neon-green'
                  }`}>{p.priority}</span>
                  <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{p.category}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Zap size={9} className="text-neon-orange" />
                  <span className="text-[10px] text-neon-orange font-rajdhani font-bold">+{p.xp_reward}</span>
                </div>
              </div>

              {/* Status change buttons */}
              {p.status !== 'done' && (
                <div className="flex gap-1 mt-2.5">
                  {columns.filter(c => c.id !== p.status && c.id !== 'backlog').map(c => (
                    <button
                      key={c.id}
                      onClick={() => onStatusChange && onStatusChange(p, c.id)}
                      className={`text-[9px] px-2 py-0.5 rounded border font-rajdhani uppercase tracking-wide ${c.color} border-current/20 bg-current/5 transition-opacity hover:opacity-80`}
                    >
                      → {c.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {colProjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            Nenhum item aqui
          </div>
        )}
      </div>
    </div>
  );
}