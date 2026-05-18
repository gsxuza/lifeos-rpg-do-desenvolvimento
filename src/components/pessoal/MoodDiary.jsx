import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const moods = [
  { key: 'excelente', emoji: '🤩', label: 'Excelente', score: 5, color: 'neon-green' },
  { key: 'bom', emoji: '😊', label: 'Bom', score: 4, color: 'neon-cyan' },
  { key: 'neutro', emoji: '😐', label: 'Neutro', score: 3, color: 'neon-orange' },
  { key: 'ruim', emoji: '😔', label: 'Ruim', score: 2, color: 'neon-pink' },
  { key: 'pessimo', emoji: '😩', label: 'Péssimo', score: 1, color: 'destructive' },
];

const aiInsights = {
  excelente: 'Excelente energia detectada! 🚀 Aproveite para atacar suas metas mais difíceis.',
  bom: 'Ótimo estado de espírito! Continue com sua rotina. Pequenos passos levam a grandes conquistas.',
  neutro: 'Dia neutro? Normal. Foque em 1 tarefa pequena para gerar momentum.',
  ruim: 'Dia difícil detectado 💙 Permita-se descansar. Energia baixa = priorize bem-estar.',
  pessimo: '⚠️ Sua energia está muito baixa. Descanso não é fraqueza — é estratégia. Tire a noite para recarregar.',
};

export default function MoodDiary({ onSave }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedMood || !text.trim()) return;
    setLoading(true);
    const mood = moods.find(m => m.key === selectedMood);
    const entry = {
      content: text,
      mood: selectedMood,
      mood_score: mood?.score || 3,
      ai_insight: aiInsights[selectedMood] || '',
      date: new Date().toISOString().split('T')[0],
    };
    await base44.entities.DiaryEntry.create(entry);
    setSaved(true);
    setLoading(false);
    if (onSave) onSave(entry);
  };

  if (saved) {
    const mood = moods.find(m => m.key === selectedMood);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-neon-green" />
          <p className="text-xs font-semibold font-rajdhani text-neon-green uppercase tracking-wider">Insight da IA</p>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{aiInsights[selectedMood]}</p>
        <button
          onClick={() => { setSaved(false); setSelectedMood(null); setText(''); }}
          className="mt-4 text-[11px] text-muted-foreground underline"
        >
          Nova entrada
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground">Diário de Humor</p>

      {/* Mood picker */}
      <div className="flex justify-between">
        {moods.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMood(m.key)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
              selectedMood === m.key ? 'bg-secondary border border-border scale-110' : 'opacity-50 hover:opacity-80'
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[9px] text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Text area */}
      <textarea
        placeholder="Como foi seu dia? O que você aprendeu? O que pode melhorar?"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-neon-cyan/50 resize-none"
      />

      <button
        onClick={handleSave}
        disabled={!selectedMood || !text.trim() || loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-semibold font-rajdhani uppercase tracking-wider disabled:opacity-40 transition-all hover:bg-neon-cyan/20"
      >
        <Send size={12} /> {loading ? 'Salvando...' : 'Analisar com IA'}
      </button>
    </div>
  );
}