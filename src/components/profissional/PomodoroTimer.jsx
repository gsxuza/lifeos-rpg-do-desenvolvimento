import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

const MODES = {
  focus: { label: 'Foco', duration: 25 * 60, color: 'hsl(197 100% 55%)', xp: 50 },
  short: { label: 'Pausa Curta', duration: 5 * 60, color: 'hsl(142 76% 50%)', xp: 0 },
  long: { label: 'Pausa Longa', duration: 15 * 60, color: 'hsl(265 80% 65%)', xp: 0 },
};

export default function PomodoroTimer({ onSessionComplete }) {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const intervalRef = useRef(null);

  const current = MODES[mode];
  const pct = ((current.duration - timeLeft) / current.duration) * 100;
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'focus') {
              const newSessions = sessions + 1;
              setSessions(newSessions);
              const xpGain = MODES.focus.xp;
              setTotalXP(x => x + xpGain);
              if (onSessionComplete) onSessionComplete(xpGain);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, sessions]);

  const switchMode = (m) => {
    setMode(m);
    setTimeLeft(MODES[m].duration);
    setRunning(false);
  };

  const reset = () => {
    setTimeLeft(current.duration);
    setRunning(false);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground">Timer Pomodoro</p>
        {totalXP > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-neon-orange/10 border border-neon-orange/20">
            <Zap size={10} className="text-neon-orange" />
            <span className="text-[11px] font-bold font-rajdhani text-neon-orange">+{totalXP} XP</span>
          </div>
        )}
      </div>

      {/* Mode select */}
      <div className="flex gap-1 mb-5">
        {Object.entries(MODES).map(([k, v]) => (
          <button
            key={k}
            onClick={() => switchMode(k)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-rajdhani font-semibold uppercase tracking-wide transition-all border ${
              mode === k ? 'border-border bg-secondary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* SVG Timer */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={180} height={180} className="-rotate-90">
            <circle cx={90} cy={90} r={radius} fill="none" stroke="hsl(222 35% 14%)" strokeWidth={8} />
            <motion.circle
              cx={90} cy={90} r={radius}
              fill="none"
              stroke={current.color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ filter: `drop-shadow(0 0 8px ${current.color}60)` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-rajdhani" style={{ color: current.color }}>{mins}:{secs}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{current.label}</span>
            {sessions > 0 && (
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: Math.min(sessions, 4) }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-neon-orange" />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button onClick={reset} className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center">
            <RotateCcw size={14} className="text-muted-foreground" />
          </button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setRunning(r => !r)}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-background font-bold"
            style={{ background: current.color, boxShadow: `0 0 20px ${current.color}50` }}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
          </motion.button>
          <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center">
            <span className="text-xs font-bold font-rajdhani text-neon-orange">{sessions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}