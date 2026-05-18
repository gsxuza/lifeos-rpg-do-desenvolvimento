import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Briefcase, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: LayoutDashboard, label: 'HQ' },
  { path: '/financas', icon: Wallet, label: 'Finanças' },
  { path: '/profissional', icon: Briefcase, label: 'Carreira' },
  { path: '/pessoal', icon: Heart, label: 'Pessoal' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border"
      style={{ background: 'hsl(222 47% 5% / 0.95)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-0.5 relative px-4 py-1.5">
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'hsl(197 100% 55% / 0.1)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={`transition-colors duration-200 ${active ? 'text-neon-cyan' : 'text-muted-foreground'}`}
                style={active ? { filter: 'drop-shadow(0 0 6px hsl(197 100% 55% / 0.8))' } : {}}
              />
              <span className={`text-[10px] font-medium font-rajdhani transition-colors duration-200 ${active ? 'text-neon-cyan' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}