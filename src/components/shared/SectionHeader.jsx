export default function SectionHeader({ title, subtitle, action, accentColor = 'cyan' }) {
  const colorMap = {
    cyan: 'bg-neon-cyan',
    purple: 'bg-neon-purple',
    green: 'bg-neon-green',
    orange: 'bg-neon-orange',
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-5 rounded-full ${colorMap[accentColor] || colorMap.cyan}`} />
        <div>
          <h2 className="text-sm font-semibold font-rajdhani uppercase tracking-wider text-foreground">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && action}
    </div>
  );
}