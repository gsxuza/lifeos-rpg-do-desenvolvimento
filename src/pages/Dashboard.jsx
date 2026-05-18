import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CharacterCard from '../components/dashboard/CharacterCard';
import AICommandCenter from '../components/dashboard/AICommandCenter';
import DailyQuests from '../components/dashboard/DailyQuests';
import EnergyBurnout from '../components/dashboard/EnergyBurnout';
import SectionHeader from '../components/shared/SectionHeader';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-rajdhani">LifeOS</p>
          <h1 className="text-xl font-bold font-rajdhani text-foreground">Sede do Herói</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center bg-secondary">
            <Bell size={14} className="text-muted-foreground" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center bg-secondary">
            <Settings size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Character Card */}
        <CharacterCard profile={profile} />

        {/* AI Command Center */}
        <div>
          <SectionHeader title="Central IA" subtitle="Briefing matinal" accentColor="cyan" />
          <AICommandCenter profile={profile} />
        </div>

        {/* Daily Quests */}
        <div>
          <SectionHeader
            title="Missões"
            subtitle="Hoje e esta semana"
            accentColor="purple"
            action={
              <span className="text-[11px] text-neon-purple font-rajdhani cursor-pointer">Ver todas →</span>
            }
          />
          <DailyQuests quests={quests} onQuestComplete={handleQuestComplete} />
        </div>

        {/* Energy */}
        <EnergyBurnout energy={profile?.energy || 80} />
      </div>
    </div>
  );
}