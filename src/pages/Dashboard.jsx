import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CharacterCard from '../components/dashboard/CharacterCard';
import AICommandCenter from '../components/dashboard/AICommandCenter';
import DailyQuests from '../components/dashboard/DailyQuests';
import EnergyBurnout from '../components/dashboard/EnergyBurnout';
import NotificationCenter from '../components/dashboard/NotificationCenter';
import SectionHeader from '../components/shared/SectionHeader';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profiles, questData] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.Quest.filter({ status: 'active' }, '-created_date', 10),
      ]);
      if (profiles.length > 0) setProfile(profiles[0]);
      setQuests(questData);
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

  return (
    <div className="min-h-screen px-4 pt-4 pb-6" style={{ background: '#0D0E12' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-rajdhani" style={{ color: '#A0A5B5' }}>LifeOS · v2.0</p>
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
        <CharacterCard profile={profile} />

        <div>
          <SectionHeader title="Central IA" subtitle="Briefing personalizado" accentColor="cyan" />
          <AICommandCenter profile={profile} />
        </div>

        <div>
          <SectionHeader title="Missões" subtitle="Hoje e esta semana" accentColor="purple"
            action={<span className="text-[11px] font-rajdhani cursor-pointer" style={{ color: '#BD00FF' }}>Ver todas →</span>} />
          <DailyQuests quests={quests} onQuestComplete={handleQuestComplete} />
        </div>

        <EnergyBurnout energy={profile?.energy || 80} />
      </div>
    </div>
  );
}