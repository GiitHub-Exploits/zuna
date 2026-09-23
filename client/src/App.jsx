import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import OrderTab from './components/OrderTab';
import WorkTab from './components/WorkTab';
import AdminSection from './components/AdminSection';
import AIAssistantWidget from './components/AIAssistantWidget';
import { CONTACT_INFO } from './data/constants';
import { getOrCreateUserId } from './utils/user';
import { registerServiceWorker, subscribeUserToPush } from './utils/push';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [orderPrefill, setOrderPrefill] = useState(null);

  // Dark / Light theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || 'light';
  });

  // Admin authentication: persists forever across page refreshes
  const [isAdmin, setIsAdmin] = useState(() => {
    const isAuth = localStorage.getItem("zuna_admin_auth");
    const pass = localStorage.getItem("adminpass");
    return isAuth === "true" || pass === "zustang";
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle URL deep-links and Initialize Web Push Notification on visit
  useEffect(() => {
    // 1. Deep link from push notifications
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['home', 'order', 'work', 'admin'].includes(tabParam)) {
      setCurrentTab(tabParam);
    }

    // 2. Register Service Worker and ask notification permission on first visit
    const initPush = async () => {
      const userId = getOrCreateUserId();
      await registerServiceWorker();

      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          // Gracefully prompt user for notifications after brief page settling
          setTimeout(async () => {
            try {
              await subscribeUserToPush(userId, isAdmin);
            } catch (e) {
              console.warn('Push subscription prompt deferred:', e);
            }
          }, 2000);
        } else if (Notification.permission === 'granted') {
          // Resync current device subscription with server
          subscribeUserToPush(userId, isAdmin);
        }
      }
    };

    initPush();
  }, [isAdmin]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Open Admin: Navigates cleanly to dedicated full-page Admin Section
  const handleOpenAdmin = () => {
    setCurrentTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    const userId = getOrCreateUserId();
    subscribeUserToPush(userId, true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("zuna_admin_auth");
    localStorage.removeItem("adminpass");
    setIsAdmin(false);
    const userId = getOrCreateUserId();
    subscribeUserToPush(userId, false);
  };

  // Cross-tab triggers from service cards
  const handleStartOrderWithService = (serviceTitle, garmentSuggestion, measurementType) => {
    setOrderPrefill({
      garment: garmentSuggestion || serviceTitle,
      serviceType: serviceTitle.includes('ALTERATION') ? 'Alteration / Re-cut' : 'Bespoke New Garment',
      measurementType: measurementType || 'HOME SERVICE',
      additionalRequirements: `Preferred service: ${serviceTitle}`
    });
    setCurrentTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartOrderWithGarment = (garmentTitle, category) => {
    setOrderPrefill({
      garment: garmentTitle,
      serviceType: category.toLowerCase().includes('alter') ? 'Alteration / Re-cut' : 'Bespoke New Garment',
      measurementType: 'HOME SERVICE',
      additionalRequirements: `Commission inspired by portfolio piece: ${garmentTitle}`
    });
    setCurrentTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-full flex flex-col bg-[#faf9f5] dark:bg-[#121110] text-[#161514] dark:text-[#f7f5f0] transition-colors duration-200 selection:bg-[#9e7938]/20 selection:text-[#161514]">
      {/* 1. Top Navigation Bar: ZUNA Name, WhatsApp, Call, Dark Mode Toggler, Fullscreen Toggler */}
      <Header 
        currentTab={currentTab} 
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        isAdmin={isAdmin}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 2. Main Content Area with generous bottom padding so taller bottom nav never obscures content */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-36 sm:pb-32">
        {currentTab === 'home' && (
          <HomeTab
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartOrderWithService={handleStartOrderWithService}
            isAdmin={isAdmin}
            onOpenAdminPanel={handleOpenAdmin}
          />
        )}

        {currentTab === 'order' && (
          <OrderTab
            initialPrefill={orderPrefill}
            onResetPrefill={() => setOrderPrefill(null)}
          />
        )}

        {currentTab === 'work' && (
          <WorkTab
            onStartOrderWithGarment={handleStartOrderWithGarment}
          />
        )}

        {currentTab === 'admin' && (
          <AdminSection
            isAdmin={isAdmin}
            onAdminLogin={handleAdminLoginSuccess}
            onLogout={handleAdminLogout}
            onReturnToStorefront={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* 3. Atelier Brand Footer */}
      <footer className="w-full border-t border-[#eae7e0] dark:border-[#262422] bg-[#f5f4ef] dark:bg-[#161514] py-8 pb-28 text-center text-xs text-[#7d7a73] dark:text-[#a39f96] space-y-2">
        <div className="max-w-2xl mx-auto px-4 space-y-2">
          <p className="font-editorial text-base text-[#161514] dark:text-[#f7f5f0] font-bold tracking-widest uppercase">
            ZUNA TAILORS
          </p>
          <p className="text-[11px] text-[#524f48] dark:text-[#c4c0b6]">
            Master Tailor Sultan Baig • Former Pantaloons Showroom Master
          </p>
          <p className="text-[10px] text-[#8c8880] dark:text-[#7d7a73] font-mono">
            Studio: {CONTACT_INFO.studioAddress} • Workshop: {CONTACT_INFO.workshopAddress}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3 text-[10px]">
            <span>© {new Date().getFullYear()} ZUNA TAILORS</span>
            <span>•</span>
            <button
              onClick={handleOpenAdmin}
              className="text-[#9e7938] hover:underline cursor-pointer"
            >
              {isAdmin ? "Atelier Suite Active (zustang)" : "Master Admin Login"}
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Bottom Navigation Tabs with increased height & notch clearance */}
      <BottomNav
        currentTab={currentTab}
        isAdmin={isAdmin}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 5. Floating, Swipeable & Draggable AI Assistant Icon & Mini Window */}
      <AIAssistantWidget />
    </div>
  );
}
