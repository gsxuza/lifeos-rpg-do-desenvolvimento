import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import KanbanBoard from '../components/profissional/KanbanBoard';
import SkillRadar from '../components/profissional/SkillRadar';
import PomodoroTimer from '../components/profissional/PomodoroTimer';
import CalendarSync from '../components/profissional/CalendarSync';
import SectionHeader from '../components/shared/SectionHeader';

export default function Profissional() {
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', category: 'profissional', xp_reward: 100 });

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list('-created_date', 20),
      base44.entities.UserProfile.list(),
    ]).then(([p, u]) => {
      setProjects(p);
      if (u.length > 0) setProfile(u[0]);
    }).catch(console.error);
  }, []);

  const handleStatusChange = async (project, newStatus) => {
    if (project.id) {
      await base44.entities.Project.update(project.id, { status: newStatus, ...(newStatus === 'done' ? { completed_at: new Date().toISOString().split('T')[0] } : {}) });
      if (newStatus === 'done' && profile?.id) {
        const xp = project.xp_reward || 100;
        await base44.entities.UserProfile.update(profile.id, {
          xp: (profile.xp || 0) + xp,
          craft_xp: (profile.craft_xp || 0) + xp,
        });
        setProfile(p => ({ ...p, xp: (p?.xp || 0) + xp, craft_xp: (p?.craft_xp || 0) + xp }));
      }
    }
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p));
  };

  const handleAdd = async () => {
    if (!form.title) return;
    const rec = await base44.entities.Project.create({ ...form, status: 'backlog' });
    setProjects(prev => [rec, ...prev]);
    setShowAdd(false);
    setForm({ title: '', priority: 'medium', category: 'profissional', xp_reward: 100 });
  };

  const handlePomodoroComplete = async (xpGain) => {
    if (profile?.id) {
      await base44.entities.UserProfile.update(profile.id, {
        xp: (profile.xp || 0) + xpGain,
        craft_xp: (profile.craft_xp || 0) + xpGain,
        energy: Math.max(0, (profile.energy || 80) - 5),
      });
      setProfile(p => ({ ...p, xp: (p?.xp || 0) + xpGain, craft_xp: (p?.craft_xp || 0) + xpGain }));
    }
  };

  const tabs = ['kanban', 'agenda', 'skills', 'foco'];

  return (
    <div className="min-h-screen px-4 pt-4 pb-6" style={{ background: '#0D0E12' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-rajdhani" style={{ color: '#A0A5B5' }}>Pilar Profissional</p>
          <h1 className="text-xl font-bold font-space" style={{ color: '#FFFFFF' }}>Hub de <span style={{ color: '#00E5FF' }}>Carreira</span></h1>
        </div>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-semibold font-rajdhani"
        >
          <Plus size={13} /> Meta
        </button>
      </div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-neon-purple/20 bg-card p-4 mb-5 space-y-3"
        >
          <p className="text-xs font-rajdhani uppercase tracking-wider text-neon-purple font-semibold">Nova Meta/Projeto</p>
          <input
            placeholder="Título do projeto ou meta"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-neon-purple/50"
          />
          <div className="flex gap-2">
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="flex-1 bg-secondary border border-border rounded-lg px-2 py-2 text-xs text-foreground outline-none">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="flex-1 bg-secondary border border-border rounded-lg px-2 py-2 text-xs text-foreground outline-none">
              <option value="profissional">Profissional</option>
              <option value="aprendizado">Aprendizado</option>
              <option value="pessoal">Pessoal</option>
            </select>
          </div>
          <button onClick={handleAdd}
            className="w-full py-2 rounded-lg bg-neon-purple text-background text-xs font-bold font-rajdhani uppercase tracking-wider"
            style={{ boxShadow: '0 0 16px hsl(265 80% 65% / 0.4)' }}>
            Criar Projeto
          </button>
        </motion.div>
      )}

      <div className="flex gap-1 mb-5 p-1 rounded-xl bg-secondary">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold font-rajdhani uppercase tracking-wider transition-all ${
              activeTab === t ? 'bg-card text-neon-purple border border-neon-purple/20' : 'text-muted-foreground'
            }`}>
            {t === 'kanban' ? 'Projetos' : t === 'agenda' ? 'Agenda' : t === 'skills' ? 'Skills' : 'Foco'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {activeTab === 'kanban' && (
          <div>
            <SectionHeader title="Kanban de Metas" subtitle="Arraste entre colunas" accentColor="purple" />
            <KanbanBoard projects={projects} onStatusChange={handleStatusChange} />
          </div>
        )}
        {activeTab === 'skills' && (
          <div>
            <SectionHeader title="Matriz de Competências" subtitle="Evolui com cada conquista" accentColor="cyan" />
            <SkillRadar skills={profile?.skills} />
          </div>
        )}
        {activeTab === 'agenda' && (
          <div>
            <SectionHeader title="Calendário → Quests" subtitle="Eventos viram missões com XP" accentColor="cyan" />
            <CalendarSync profile={profile} />
          </div>
        )}
        {activeTab === 'foco' && (
          <div>
            <SectionHeader title="Sessão de Foco" subtitle="25 min = +50 XP de Ofício" accentColor="orange" />
            <PomodoroTimer onSessionComplete={handlePomodoroComplete} />
          </div>
        )}
      </div>
    </div>
  );
}