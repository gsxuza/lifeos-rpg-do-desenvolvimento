import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="max-w-md mx-auto relative">
        <main className="pb-20 min-h-screen">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}