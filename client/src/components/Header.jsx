import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Sun, Moon, Maximize2, Minimize2, ShieldCheck, Lock } from 'lucide-react';
import { CONTACT_INFO } from '../data/constants';

export default function Header({ 
  onTabChange, 
  theme, 
  onToggleTheme, 
  isAdmin, 
  onOpenAdmin 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    document.addEventListener('webkitfullscreenchange', handleFs);
    return () => {
      document.removeEventListener('fullscreenchange', handleFs);
      document.removeEventListener('webkitfullscreenchange', handleFs);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle error:', e);
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full bg-[#faf9f5]/96 dark:bg-[#121110]/96 backdrop-blur-lg border-b border-[#eae7e0] dark:border-[#262422] transition-colors duration-200 shadow-[0_2px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.25)]"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0.35rem)',
        paddingBottom: '0.35rem'
      }}
    >
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 min-h-[3.25rem] sm:min-h-[3.6rem] flex items-center justify-between">
        
        {/* Left: Pure Clean ZUNA Name (Vertically centered) */}
        <div 
          onClick={() => onTabChange('home')}
          className="cursor-pointer select-none flex items-center py-1 group"
        >
          <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-[0.18em] text-[#161514] dark:text-[#f7f5f0] group-hover:text-[#9e7938] transition-colors">
            ZUNA
          </span>
        </div>

        {/* Right: Fullscreen, Dark Mode, Call, WhatsApp, Admin (Vertically centered) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* 1. Fullscreen Toggler */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#524f48] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-all active:scale-95 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#9e7938]" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* 2. Dark / Light Mode Toggler */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#524f48] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-all active:scale-95 cursor-pointer"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#524f48]" />
            )}
          </button>

          {/* 3. Call Action */}
          <a
            href={`tel:${CONTACT_INFO.primaryPhone}`}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#161514] dark:text-[#f7f5f0] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-[#dedbd2] dark:border-stone-700 transition-all active:scale-95"
            title={`Call ZUNA (${CONTACT_INFO.primaryPhone})`}
            aria-label="Call ZUNA"
          >
            <Phone className="w-4 h-4 text-[#9e7938]" />
          </a>

          {/* 4. WhatsApp Action */}
          <a
            href={`https://wa.me/${CONTACT_INFO.whatsappNumber}?text=Hello%20ZUNA%20Tailors,%20I%20would%20like%20to%20inquire%20about%20custom%20tailoring.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800 transition-all active:scale-95"
            title="Chat on WhatsApp"
            aria-label="WhatsApp ZUNA"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* 5. Admin Access Action */}
          <button
            onClick={onOpenAdmin}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
              isAdmin 
                ? 'text-[#9e7938] bg-[#9e7938]/15 border border-[#9e7938]/30 shadow-xs' 
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={isAdmin ? "Atelier Admin Panel (zustang active)" : "Admin Password Access"}
            aria-label="Admin Access"
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </header>
  );
}
