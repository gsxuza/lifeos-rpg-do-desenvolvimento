import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sparkles, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CharacterCard from '../components/dashboard/CharacterCard';
import AICommandCenter from '../components/dashboard/AICommandCenter';
import DailyQuests from '../components/dashboard/DailyQuests';
import EnergyBurnout from '../components/dashboard/EnergyBurnout';
import NotificationCenter from '../components/dashboard/NotificationCenter';
import SectionHeader from '../components/shared/SectionHeader';
import BalanceCard from '../components/financas/BalanceCard';
import SpendingChart from '../components/financas/SpendingChart';
import KanbanBoard from '../components/profissional/KanbanBoard';
import SkillRadar from '../components/profissional/SkillRadar';

// Layout order based on user archetype
function getArchetypeLayout(archetype) {
  switch (archetype) {
    case 'Poupador':
      return ['character', 'finance', 'ai', 'quests', 'energy'];
    case 'Transição de Carreira':
      return ['character', 'kanban', 'skills', 'ai', 'quests', 'energy'];
    case 'Hábitos Saudáveis':
    default:
      return ['character', 'ai', 'quests', 'energy'];
  }
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuests, setGeneratingQuests] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profiles, questData, projectData] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.Quest.filter({ status: 'active' }, '-created_date', 10),
        base44.entities.Project.list('-created_date', 10),
      ]);
      if (profiles.length > 0) setProfile(profiles[0]);
      setQuests(questData);
      setProjects(projectData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestComplete = async (quest) => {
    if (quest.id) {
      await base44.entities.Quest.update(quest.id, { status: 'completed', progress: quest.target });
    }
    if (profile && profile.id) {
      const xpGain = quest.xp_reward || 100;
      const wisdomGain = quest.pillar === 'financeiro' ? xpGain : 0;
      const craftGain = quest.pillar === 'profissional' ? xpGain : 0;
      const vitalityGain = quest.pillar === 'pessoal' ? xpGain : 0;
      const newXp = (profile.xp || 0) + xpGain;
      const updates = {
        xp: newXp,
        wisdom_xp: (profile.wisdom_xp || 0) + wisdomGain,
        craft_xp: (profile.craft_xp || 0) + craftGain,
        vitality_xp: (profile.vitality_xp || 0) + vitalityGain,
      };
      if (newXp >= (profile.xp_next_level || 1000)) {
        updates.level = (profile.level || 1) + 1;
        updates.xp = newXp - (profile.xp_next_level || 1000);
        updates.xp_next_level = Math.round((profile.xp_next_level || 1000) * 1.4);
      }
      await base44.entities.UserProfile.update(profile.id, updates);
      setProfile({ ...profile, ...updates });
    }
    setQuests(prev => prev.map(q => (q.id === quest.id) ? { ...q, status: 'completed' } : q));
  };

  const handleGenerateQuestline = async () => {
    setGeneratingQuests(true);
    try {
      await base44.functions.invoke('generateDailyQuestline', {});
      const freshQuests = await base44.entities.Quest.filter({ status: 'active' }, '-created_date', 10);
      setQuests(freshQuests);
    } catch (e) {
      console.error(e);
    }
    setGeneratingQuests(false);
  };

  const handleProjectStatus = async (project, newStatus) => {
    if (project.id) {
      await base44.entities.Project.update(project.id, { status: newStatus });
    }
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0D0E12' }}>
        <div className="flex flex-col items-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full border-2" style={{ borderColor: 'rgb(0 229 255 / 0.2)', borderTopColor: '#00E5FF' }} />
          <p className="text-[11px] font-rajdhani uppercase tracking-widest" style={{ color: '#A0A5B5' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  const archetype = profile?.archetype || 'Hábitos Saudáveis';
  const layout = getArchetypeLayout(archetype);

  const archetypeLabel = {
    'Poupador': { label: 'Modo Investidor', color: '#39FF14' },
    'Transição de Carreira': { label: 'Modo Carreira', color: '#00E5FF' },
    'Hábitos Saudáveis': { label: 'Modo Bem-estar', color: '#BD00FF' },
  }[archetype] || { label: archetype, color: '#A0A5B5' };

  const blocks = {
    character: (
      <CharacterCard key="character" profile={profile} />
    ),
    finance: (
      <div key="finance">
        <SectionHeader title="Visão Financeira" subtitle="Resumo do seu patrimônio" accentColor="green" />
        <div className="space-y-3">
          <BalanceCard />
          <SpendingChart />
        </div>
      </div>
    ),
    kanban: (
      <div key="kanban">
        <SectionHeader title="Projetos em Andamento" subtitle="Kanban de metas" accentColor="purple" />
        <KanbanBoard projects={projects} onStatusChange={handleProjectStatus} />
      </div>
    ),
    skills: (
      <div key="skills">
        <SectionHeader title="Matriz de Competências" subtitle="Evolui com conquistas" accentColor="cyan" />
        <SkillRadar skills={profile?.skills} />
      </div>
    ),
    ai: (
      <div key="ai">
        <SectionHeader title="Central IA" subtitle="Briefing personalizado" accentColor="cyan" />
        <AICommandCenter profile={profile} />
      </div>
    ),
    quests: (
      <div key="quests">
        <SectionHeader title="Missões" subtitle="Hoje e esta semana" accentColor="purple"
          action={
            <button
              onClick={handleGenerateQuestline}
              disabled={generatingQuests}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold font-rajdhani uppercase tracking-wide disabled:opacity-50"
              style={{ background: 'rgb(189 0 255 / 0.1)', color: '#BD00FF', border: '1px solid rgb(189 0 255 / 0.25)' }}
            >
              {generatingQuests
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw size={9} /></motion.div>
                : <Sparkles size={9} />}
              {generatingQuests ? 'Gerando...' : 'IA Gerar'}
            </button>
          }
        />
        <DailyQuests quests={quests} onQuestComplete={handleQuestComplete} />
      </div>
    ),
    energy: (
      <EnergyBurnout key="energy" energy={profile?.energy || 80} />
    ),
  };

  return (
    <div className="min-h-screen px-4 pt-4 pb-6" style={{ background: '#0D0E12' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[11px] uppercase tracking-widest font-rajdhani" style={{ color: '#A0A5B5' }}>LifeOS · v2.0</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-rajdhani font-bold uppercase"
              style={{ background: `${archetypeLabel.color}15`, color: archetypeLabel.color, border: `1px solid ${archetypeLabel.color}30` }}>
              {archetypeLabel.label}
            </span>
          </div>
          <h1 className="text-xl font-bold font-space" style={{ color: '#FFFFFF' }}>
            Sede do <span style={{ color: '#00E5FF' }}>Herói</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#252730', background: '#161820' }}>
            <Settings size={14} style={{ color: '#A0A5B5' }} />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {layout.map(blockKey => blocks[blockKey])}
      </div>
    </div>
  );
}