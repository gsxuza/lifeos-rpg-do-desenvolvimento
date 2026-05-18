export default function StatBadge({ label, value, color = 'cyan', icon: Icon }) {
  const colorMap = {
    cyan: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
    purple: { text: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20' },
    green: { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
    orange: { text: 'text-neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/20' },
    pink: { text: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/20' },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border ${c.bg} ${c.border}`}>
      {Icon && <Icon size={14} className={c.text} />}
      <span className={`text-base font-bold font-rajdhani ${c.text}`}>{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}