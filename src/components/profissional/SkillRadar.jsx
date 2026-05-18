import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const defaultSkills = [
  { skill: 'Liderança', value: 30 },
  { skill: 'Comunicação', value: 40 },
  { skill: 'Técnico', value: 50 },
  { skill: 'Finanças', value: 20 },
  { skill: 'Criatividade', value: 35 },
  { skill: 'Bem-Estar', value: 45 },
];

export default function SkillRadar({ skills }) {
  const data = skills
    ? Object.entries(skills).map(([k, v]) => ({
        skill: k.charAt(0).toUpperCase() + k.replace('_', ' ').slice(1),
        value: v,
      }))
    : defaultSkills;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold font-rajdhani uppercase tracking-wider text-muted-foreground mb-4">Matriz de Competências</p>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid gridType="polygon" stroke="hsl(222 30% 16%)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10, fontFamily: 'Rajdhani' }}
          />
          <Radar
            dataKey="value"
            stroke="hsl(197 100% 55%)"
            fill="hsl(197 100% 55% / 0.15)"
            strokeWidth={2}
            dot={{ fill: 'hsl(197 100% 55%)', r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {data.map(skill => (
          <div key={skill.skill} className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-neon-cyan" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">{skill.skill}</p>
              <p className="text-[11px] font-bold font-rajdhani text-neon-cyan">{skill.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}