import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Target, Wallet, Heart, Briefcase, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const slides = [
  {
    icon: '🎮',
    title: 'Sua vida virou um RPG.',
    subtitle: 'Finanças, carreira e hábitos agora ditam o seu nível. Cada ação real gera XP e evolução.',
    color: '#00E5FF',
  },
  {
    icon: '🧠',
    title: 'IA como seu copiloto.',
    subtitle: 'Um motor inteligente analisa seu comportamento e gera missões, alertas e insights personalizados — sem você digitar um centavo.',
    color: '#BD00FF',
  },
  {
    icon: '⚔️',
    title: 'Missões. Conquistas. Níveis.',
    subtitle: 'Cada meta concluída, hábito mantido ou economia feita te aproxima do próximo nível de vida.',
    color: '#39FF14',
  },
];

const archetypes = [
  { key: 'Poupador', icon: Wallet, label: 'Guardar Dinheiro', desc: 'Foco em metas financeiras e controle de gastos', color: '#39FF14' },
  { key: 'Transição de Carreira', icon: Briefcase, label: 'Transição de Carreira', desc: 'Mudar de área, crescer profissionalmente', color: '#00E5FF' },
  { key: 'Hábitos Saudáveis', icon: Heart, label: 'Criar Hábitos Saudáveis', desc: 'Rotinas, bem-estar e desenvolvimento pessoal', color: '#BD00FF' },
];

const hoursOptions = [0.5, 1, 1.5, 2, 3];
const riskOptions = [
  { key: 'Conservador', label: 'Conservador', desc: 'Prefiro segurança e previsibilidade', emoji: '🛡️' },
  { key: 'Moderado', label: 'Moderado', desc: 'Equilíbrio entre risco e retorno', emoji: '⚖️' },
  { key: 'Arrojado', label: 'Arrojado', desc: 'Aceito volatilidade por maiores ganhos', emoji: '🚀' },
];

export default function Onboarding({ onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro | quiz
  const [slideIdx, setSlideIdx] = useState(0);
  const [answers, setAnswers] = useState({ archetype: '', hours: 1, risk: 'Moderado' });
  const [quizStep, setQuizStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const nextSlide = () => {
    if (slideIdx < slides.length - 1) setSlideIdx(i => i + 1);
    else setPhase('quiz');
  };

  const prevSlide = () => {
    if (slideIdx > 0) setSlideIdx(i => i - 1);
  };

  const nextQuiz = () => {
    if (quizStep < 2) setQuizStep(q => q + 1);
    else handleFinish();
  };

  const prevQuiz = () => {
    if (quizStep > 0) setQuizStep(q => q - 1);
    else setPhase('intro');
  };

  const aiToneFromAnswers = () => {
    if (answers.archetype === 'Poupador') return 'analítico';
    if (answers.archetype === 'Transição de Carreira') return 'motivador';
    return 'motivador';
  };

  const handleFinish = async () => {
    setSaving(true);
    const profileData = {
      onboarding_completed: true,
      archetype: answers.archetype || 'Hábitos Saudáveis',
      daily_hours: answers.hours,
      risk_profile: answers.risk,
      ai_tone: aiToneFromAnswers(),
      avatar_class:
        answers.archetype === 'Poupador' ? 'Estrategista' :
        answers.archetype === 'Transição de Carreira' ? 'Empreendedor' : 'Guardião',
      title:
        answers.archetype === 'Poupador' ? 'Guardião do Capital' :
        answers.archetype === 'Transição de Carreira' ? 'Ascendente' : 'Cultivador',
    };
    const existing = await base44.entities.UserProfile.list();
    if (existing.length > 0) {
      await base44.entities.UserProfile.update(existing[0].id, profileData);
    } else {
      await base44.entities.UserProfile.create({ ...profileData, level: 1, xp: 0, xp_next_level: 1000, energy: 80 });
    }
    setSaving(false);
    onComplete();
  };

  const slide = slides[slideIdx];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0D0E12' }}>
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key={`slide-${slideIdx}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-sm flex flex-col items-center text-center"
          >
            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
              <span className="text-xs font-rajdhani uppercase tracking-widest" style={{ color: '#A0A5B5' }}>LifeOS</span>
              <span style={{ color: '#252730' }}>·</span>
              <span className="text-xs font-rajdhani uppercase tracking-widest" style={{ color: '#A0A5B5' }}>RPG da Vida</span>
            </div>

            {/* Icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl mb-8"
            >{slide.icon}</motion.div>

            {/* Glow ring */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-20"
                style={{ background: slide.color, transform: 'scale(1.5)' }} />
              <h1 className="relative text-2xl font-bold font-space leading-tight" style={{ color: '#FFFFFF' }}>
                {slide.title}
              </h1>
            </div>
            <p className="text-sm leading-relaxed mb-10" style={{ color: '#A0A5B5' }}>
              {slide.subtitle}
            </p>

            {/* Dots */}
            <div className="flex gap-2 mb-8">
              {slides.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === slideIdx ? 20 : 6, height: 6,
                    background: i === slideIdx ? slide.color : '#252730',
                  }} />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              {slideIdx > 0 && (
                <button onClick={prevSlide}
                  className="flex-1 py-3 rounded-xl border text-sm font-semibold font-rajdhani"
                  style={{ borderColor: '#252730', color: '#A0A5B5', background: '#161820' }}>
                  Voltar
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={nextSlide}
                className="flex-1 py-3 rounded-xl text-sm font-bold font-rajdhani uppercase tracking-wider flex items-center justify-center gap-2"
                style={{ background: slide.color, color: '#0D0E12', boxShadow: `0 0 20px ${slide.color}50` }}
              >
                {slideIdx < slides.length - 1 ? 'Próximo' : 'Começar'} <ChevronRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'quiz' && (
          <motion.div
            key={`quiz-${quizStep}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={prevQuiz}>
                <ChevronLeft size={20} style={{ color: '#A0A5B5' }} />
              </button>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="rounded-full transition-all"
                    style={{ width: i === quizStep ? 20 : 6, height: 6, background: i <= quizStep ? '#00E5FF' : '#252730' }} />
                ))}
              </div>
              <span className="text-xs font-rajdhani" style={{ color: '#A0A5B5' }}>{quizStep + 1}/3</span>
            </div>

            {/* Q1 – Archetype */}
            {quizStep === 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2 font-rajdhani" style={{ color: '#00E5FF' }}>Pergunta 1 de 3</p>
                <h2 className="text-xl font-bold font-space mb-2" style={{ color: '#FFFFFF' }}>Qual seu foco principal?</h2>
                <p className="text-sm mb-6" style={{ color: '#A0A5B5' }}>Isso define seu arquétipo e adapta as missões.</p>
                <div className="space-y-3">
                  {archetypes.map(a => {
                    const Icon = a.icon;
                    const sel = answers.archetype === a.key;
                    return (
                      <motion.button key={a.key} whileTap={{ scale: 0.97 }}
                        onClick={() => setAnswers(p => ({ ...p, archetype: a.key }))}
                        className="w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3"
                        style={{
                          background: sel ? `${a.color}10` : '#161820',
                          borderColor: sel ? a.color : '#252730',
                          boxShadow: sel ? `0 0 16px ${a.color}25` : 'none',
                        }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${a.color}15` }}>
                          <Icon size={18} style={{ color: a.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: sel ? a.color : '#FFFFFF' }}>{a.label}</p>
                          <p className="text-[11px]" style={{ color: '#A0A5B5' }}>{a.desc}</p>
                        </div>
                        {sel && <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: a.color }}>
                          <div className="w-2 h-2 rounded-full bg-black" />
                        </div>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q2 – Hours */}
            {quizStep === 1 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2 font-rajdhani" style={{ color: '#00E5FF' }}>Pergunta 2 de 3</p>
                <h2 className="text-xl font-bold font-space mb-2" style={{ color: '#FFFFFF' }}>Horas disponíveis por dia?</h2>
                <p className="text-sm mb-6" style={{ color: '#A0A5B5' }}>A IA calibra a quantidade de missões diárias com base nisso.</p>
                <div className="flex flex-wrap gap-3">
                  {hoursOptions.map(h => (
                    <motion.button key={h} whileTap={{ scale: 0.94 }}
                      onClick={() => setAnswers(p => ({ ...p, hours: h }))}
                      className="flex-1 min-w-16 py-4 rounded-xl border font-bold font-rajdhani text-lg transition-all"
                      style={{
                        background: answers.hours === h ? 'rgb(0 229 255 / 0.1)' : '#161820',
                        borderColor: answers.hours === h ? '#00E5FF' : '#252730',
                        color: answers.hours === h ? '#00E5FF' : '#A0A5B5',
                        boxShadow: answers.hours === h ? '0 0 16px rgb(0 229 255 / 0.25)' : 'none',
                      }}>
                      {h}h
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Q3 – Risk */}
            {quizStep === 2 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2 font-rajdhani" style={{ color: '#00E5FF' }}>Pergunta 3 de 3</p>
                <h2 className="text-xl font-bold font-space mb-2" style={{ color: '#FFFFFF' }}>Tolerância a riscos financeiros?</h2>
                <p className="text-sm mb-6" style={{ color: '#A0A5B5' }}>Personaliza sugestões de investimento e alertas da IA.</p>
                <div className="space-y-3">
                  {riskOptions.map(r => {
                    const sel = answers.risk === r.key;
                    return (
                      <motion.button key={r.key} whileTap={{ scale: 0.97 }}
                        onClick={() => setAnswers(p => ({ ...p, risk: r.key }))}
                        className="w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all"
                        style={{
                          background: sel ? 'rgb(0 229 255 / 0.08)' : '#161820',
                          borderColor: sel ? '#00E5FF' : '#252730',
                        }}>
                        <span className="text-2xl">{r.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: sel ? '#00E5FF' : '#FFFFFF' }}>{r.label}</p>
                          <p className="text-[11px]" style={{ color: '#A0A5B5' }}>{r.desc}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={nextQuiz}
              disabled={quizStep === 0 && !answers.archetype || saving}
              className="w-full mt-8 py-3.5 rounded-xl font-bold font-rajdhani uppercase tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              style={{ background: '#00E5FF', color: '#0D0E12', boxShadow: '0 0 24px rgb(0 229 255 / 0.4)' }}
            >
              {saving ? 'Configurando IA...' : quizStep < 2 ? 'Próximo' : 'Criar Personagem'}
              {!saving && <ChevronRight size={14} />}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}