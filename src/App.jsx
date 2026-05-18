import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Financas from './pages/Financas';
import Profissional from './pages/Profissional';
import Pessoal from './pages/Pessoal';
import Onboarding from './pages/Onboarding';
import { base44 } from '@/api/base44Client';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPublicSettings && !authError) {
      base44.entities.UserProfile.list()
        .then(profiles => {
          const hasProfile = profiles.length > 0 && profiles[0].onboarding_completed;
          setNeedsOnboarding(!hasProfile);
        })
        .catch(() => setNeedsOnboarding(false))
        .finally(() => setCheckingOnboarding(false));
    } else if (!isLoadingAuth && !isLoadingPublicSettings) {
      setCheckingOnboarding(false);
    }
  }, [isLoadingAuth, isLoadingPublicSettings, authError]);

  if (isLoadingPublicSettings || isLoadingAuth || checkingOnboarding) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0D0E12' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgb(0 229 255 / 0.2)', borderTopColor: '#00E5FF' }} />
          <p className="text-[11px] font-rajdhani uppercase tracking-widest" style={{ color: '#A0A5B5' }}>LifeOS Iniciando...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={() => setNeedsOnboarding(false)} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/financas" element={<Financas />} />
        <Route path="/profissional" element={<Profissional />} />
        <Route path="/pessoal" element={<Pessoal />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;