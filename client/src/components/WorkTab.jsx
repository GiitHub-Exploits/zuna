import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  X, 
  AlertCircle, 
  Scissors,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { CONTACT_INFO } from '../data/constants';

const CATEGORIES = [
  "All",
  "Suiting",
  "Shirting",
  "Ethnic Wear",
  "Alteration",
  "Custom"
];

export default function WorkTab({ onStartOrderWithGarment }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeItem, setActiveItem] = useState(null); // for lightbox detail view

  // Fetch real work items from backend API
  const fetchWorkItems = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedCategory === 'All' 
        ? import.meta.env.VITE_API_URL + "/api/work" 
        : `/api/work?category=${encodeURIComponent(selectedCategory)}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load gallery items');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching work:', err);
      setError('Unable to load portfolio items. Please verify network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkItems();
  }, [selectedCategory]);

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Title (Upload button removed for public users) */}
        <div className="border-b border-[#eae7e0] dark:border-[#2e2b26] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
              Portfolio & Craftsmanship
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#161514] dark:text-[#f7f5f0]">
              Our Work
            </h1>
            <p className="text-xs text-[#524f48] dark:text-[#a39f96]">
              Real bespoke commissions tailored by Master Sultan Baig at our Howrah workshop.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all select-none ${
                selectedCategory === cat
                  ? 'bg-[#161514] dark:bg-white text-white dark:text-[#161514] shadow-xs font-semibold'
                  : 'bg-white dark:bg-[#1c1b18] text-[#524f48] dark:text-[#a39f96] border border-[#eae7e0] dark:border-[#2e2b26] hover:border-[#cfcac0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-8 h-8 border-2 border-[#dedbd2] border-t-[#9e7938] rounded-full animate-spin" />
            <p className="text-xs text-[#7d7a73] dark:text-[#a39f96] font-medium tracking-wide uppercase text-[10px]">
              Loading Atelier Gallery...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] text-center space-y-3 shadow-subtle">
            <AlertCircle className="w-8 h-8 text-[#9e7938] mx-auto" />
            <p className="text-xs text-[#524f48] dark:text-[#a39f96]">{error}</p>
            <button
              onClick={fetchWorkItems}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Clean Empty State (Default cards removed!) */}
        {!loading && !error && items.length === 0 && (
          <div className="py-16 px-4 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] text-center space-y-3.5 shadow-subtle">
            <div className="w-12 h-12 rounded-full bg-[#faf9f5] dark:bg-stone-900 border border-[#dedbd2] dark:border-stone-800 flex items-center justify-center mx-auto text-[#7d7a73]">
              <Layers className="w-5 h-5 text-[#9e7938]" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
              No Pieces In This Category Yet
            </h3>
            <p className="text-xs text-[#7d7a73] dark:text-[#a39f96] max-w-sm mx-auto leading-relaxed">
              Real bespoke commissions are published here by the atelier master as they are tailored and photographed.
            </p>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="mt-2 text-xs font-semibold text-[#9e7938] hover:underline"
              >
                View all categories →
              </button>
            )}
          </div>
        )}

        {/* Responsive Gallery Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {items.map((item) => {
              const aspectClass = item.aspectRatio === 'landscape' 
                ? 'aspect-[4/3]' 
                : item.aspectRatio === 'square' 
                  ? 'aspect-square' 
                  : 'aspect-[3/4]';

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] overflow-hidden shadow-subtle hover:shadow-premium hover:border-[#cfcac0] dark:hover:border-[#3d3a34] transition-all flex flex-col justify-between"
                >
                  {/* Image container */}
                  <div 
                    onClick={() => setActiveItem(item)}
                    className={`relative w-full ${aspectClass} overflow-hidden bg-stone-100 dark:bg-stone-900 cursor-pointer`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#161514]/85 text-white backdrop-blur-sm shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="p-2 rounded-full bg-white/90 text-[#161514] shadow-sm inline-flex">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 sm:p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 
                        onClick={() => setActiveItem(item)}
                        className="font-editorial text-lg sm:text-xl font-bold text-[#161514] dark:text-[#f7f5f0] group-hover:text-[#9e7938] transition-colors leading-snug cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-[#524f48] dark:text-[#a39f96] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="pt-3 border-t border-[#f2f0ea] dark:border-[#262422] flex items-center justify-between">
                      <button
                        onClick={() => onStartOrderWithGarment(item.title, item.category)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#161514] dark:text-[#f7f5f0] hover:text-[#9e7938] transition-colors group/btn"
                      >
                        <Scissors className="w-3.5 h-3.5 text-[#9e7938]" />
                        <span>Order Similar</span>
                        <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => setActiveItem(item)}
                        className="text-[11px] text-[#7d7a73] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox / Detail Modal */}
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-float p-5 sm:p-6 space-y-4">
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[#161514] dark:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#9e7938]">
                  {activeItem.category}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                  {activeItem.title}
                </h3>
                {activeItem.description && (
                  <p className="text-xs sm:text-sm text-[#524f48] dark:text-[#a39f96] leading-relaxed">
                    {activeItem.description}
                  </p>
                )}
                {activeItem.details && (
                  <div className="p-3 rounded-lg bg-[#faf9f5] dark:bg-[#121110] border border-[#eae7e0] dark:border-[#2e2b26] text-xs text-[#2e2c29] dark:text-[#d1ccc4]">
                    <span className="font-semibold block text-[10px] uppercase text-[#7d7a73] dark:text-[#a39f96] tracking-wider mb-1">
                      Tailoring Notes
                    </span>
                    {activeItem.details}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#eae7e0] dark:border-[#2e2b26] flex items-center gap-3">
                <button
                  onClick={() => {
                    const title = activeItem.title;
                    const cat = activeItem.category;
                    setActiveItem(null);
                    onStartOrderWithGarment(title, cat);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#161514] dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-100 text-white dark:text-[#161514] text-xs font-semibold tracking-wider uppercase text-center transition-all active:scale-95"
                >
                  Order This Garment
                </button>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsappNumber}?text=Hello%20ZUNA%20Tailors,%20I%20am%20interested%20in%20the%20${encodeURIComponent(activeItem.title)}%20from%20your%20portfolio.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all active:scale-95"
                >
                  Inquire WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
