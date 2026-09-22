import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, X, Smartphone } from 'lucide-react';

export default function FullscreenBanner() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
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
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // If dismissed and not in fullscreen, don't show the banner
  if (isDismissed && !isFullscreen) return null;

  return (
    <aside 
      aria-label="Fullscreen Controls"
      className="bg-[#161514] text-white border-b border-stone-800 text-xs px-4 py-2.5 transition-all shadow-md relative z-50 dark:bg-stone-950 dark:border-stone-800"
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <Smartphone className="w-3.5 h-3.5 text-[#9e7938] shrink-0" />
          <span className="text-stone-300">
            {isFullscreen 
              ? "Running in clean app mode" 
              : "Experience ZUNA like a mobile app (removes browser navigation)"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9e7938] hover:bg-[#88672e] text-white font-medium text-[11px] tracking-wide uppercase transition-all shadow-sm active:scale-95"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>Go Full Screen</span>
              </>
            )}
          </button>

          {!isFullscreen && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-full text-stone-400 hover:text-white transition-colors"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
