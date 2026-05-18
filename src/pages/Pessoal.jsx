import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HabitTracker from '../components/pessoal/HabitTracker';
import MoodDiary from '../components/pessoal/MoodDiary';
import AchievementTree from '../components/pessoal/AchievementTree';
import SectionHeader from '../components/shared/SectionHeader';

export default function Pessoal() {
  const [habits, setHabits] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('habitos');

  useEffect(() => {
    Promise.all([
      base44.entities.Habit.list(),
      base44.entities.UserProfile.list(),
    ]).then(([h, u]) => {
      setHabits(h);
      if (u.length > 0) setProfile(u[0]);
    }).catch(console.error);
  }, []);

  const handleHabitToggle = async (habit) => {
    if (!habit.id) return;
    const isCompleted = !habit.completed_today;
    await base44.entities.Habit.update(habit.id, {
      completed_today: isCompleted,
      current_value: isCompleted ? 1 : 0,
      streak: isCompleted ? (habit.streak || 0) + 1 : habit.streak,
    });
    if (isCompleted && profile?.id) {
      await base44.entities.UserProfile.update(profile.id, {
        xp: (profile.xp || 0) + habit.xp_reward,
        vitality_xp: (profile.vitality_xp || 0) + habit.xp_reward,
        energy: Math.min(100, (profile.energy || 80) + 5),
      });
      setProfile(p => ({ ...p, xp: (p?.xp || 0) + habit.xp_reward, energy: Math.min(100, (p?.energy || 80) + 5) }));
    }
  };

  const tabs = ['habitos', 'diario', 'conquistas'];

  return (
    <div className="min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-rajdhani">Pilar Pessoal</p>
          <h1 className="text-xl font-bold font-rajdhani text-foreground">Rotina & Evolução</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20">
          <span className="text-xs font-bold font-rajdhani text-neon-green">🔥 {profile?.streak_days || 7} dias</span>
        </div>
      </div>

      <div className="flex gap-1 mb-5 p-1 rounded-xl bg-secondary">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold font-rajdhani uppercase tracking-wider transition-all ${
              activeTab === t ? 'bg-card text-neon-green border border-neon-green/20' : 'text-muted-foreground'
            }`}>
            {t === 'habitos' ? 'Hábitos' : t === 'diario' ? 'Diário' : 'Conquistas'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {activeTab === 'habitos' && (
          <div>
            <SectionHeader title="Tracker de Hábitos" subtitle="Hoje" accentColor="green" />
            <HabitTracker habits={habits} onToggle={handleHabitToggle} />
          </div>
        )}
        {activeTab === 'diario' && (
          <div>
            <SectionHeader title="Diário de Humor" subtitle="IA analisa seu bem-estar" accentColor="purple" />
            <MoodDiary />
          </div>
        )}
        {activeTab === 'conquistas' && (
          <div>
            <SectionHeader title="Árvore de Conquistas" subtitle="Desbloqueie habilidades reais" accentColor="orange" />
            <AchievementTree userAchievements={profile?.achievements || []} />
          </div>
        )}
      </div>
    </div>
  );
}