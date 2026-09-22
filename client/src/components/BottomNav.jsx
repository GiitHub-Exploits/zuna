import React from 'react';
import { Compass, Scissors, Image as ImageIcon, ShieldCheck } from 'lucide-react';

export default function BottomNav({ currentTab, onTabChange, isAdmin }) {
  const tabs = [
    {
      id: 'home',
      label: 'HOME',
      icon: Compass,
      desc: 'Atelier & Brand'
    },
    {
      id: 'order',
      label: 'ORDER',
      icon: Scissors,
      desc: 'Bespoke Order'
    },
    {
      id: 'work',
      label: 'WORK',
      icon: ImageIcon,
      desc: 'Gallery & Craft'
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'ADMIN',
      icon: ShieldCheck,
      desc: 'Atelier Suite'
    }] : [])
  ];

  return (
    <nav 
      aria-label="Bottom Navigation" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf9f5]/96 dark:bg-[#121110]/96 backdrop-blur-lg border-t border-[#eae7e0] dark:border-[#262422] shadow-[0_-6px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-6px_25px_rgba(0,0,0,0.4)] transition-colors"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.25rem)',
        minHeight: '4.75rem' // ~76px min height for clear notch / system nav bar separation
      }}
    >
      <div className="max-w-md mx-auto px-3 sm:px-4 h-16 sm:h-18 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 sm:py-1.5 transition-all duration-200 select-none group cursor-pointer ${
                isActive 
                  ? 'text-[#161514] dark:text-white' 
                  : 'text-[#7d7a73] dark:text-[#a39f96] hover:text-[#383633] dark:hover:text-stone-200'
              }`}
            >
              {/* Active gold accent pill */}
              {isActive && (
                <span className="absolute inset-x-3 -top-1 h-0.5 bg-[#9e7938] rounded-full shadow-[0_0_8px_rgba(158,121,56,0.6)]" />
              )}
              
              <div className={`relative p-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-stone-200/80 dark:bg-stone-800 scale-105' 
                  : 'group-hover:bg-stone-100 dark:group-hover:bg-stone-900'
              }`}>
                <Icon className={`w-5 h-5 transition-transform ${
                  isActive 
                    ? tab.id === 'admin' 
                      ? 'stroke-[2.25px] text-[#9e7938]' 
                      : 'stroke-[2.25px] text-[#161514] dark:text-white' 
                    : 'stroke-[1.75px]'
                }`} />
              </div>

              <span className={`text-[10px] tracking-[0.16em] uppercase transition-all mt-0.5 ${
                isActive 
                  ? tab.id === 'admin'
                    ? 'font-bold text-[#9e7938]'
                    : 'font-bold text-[#161514] dark:text-white' 
                  : 'font-medium text-[#7d7a73] dark:text-[#a39f96]'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
