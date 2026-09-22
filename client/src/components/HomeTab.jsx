import React from 'react';
import { 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Ruler, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Clock,
  Compass,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { CONTACT_INFO, SERVICES, HOW_IT_WORKS } from '../data/constants';
import logoImg from '../assets/logo.jpg';

export default function HomeTab({ onNavigate, onStartOrderWithService, isAdmin, onOpenAdminPanel }) {
  return (
    <div className="pb-28 space-y-16 animate-fadeIn">
      {/* 0. ADMIN ACTION BANNER (Only visible to Admin) */}
      {isAdmin && (
        <section className="pt-4 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div 
              onClick={onOpenAdminPanel}
              className="p-3.5 sm:p-4 rounded-2xl bg-stone-900 text-white border border-stone-700 shadow-md cursor-pointer hover:bg-stone-800 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#9e7938]/20 border border-[#9e7938]/40 flex items-center justify-center text-[#9e7938]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-[#fdfbf7] flex items-center gap-1.5">
                    <span>Atelier Admin Panel</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#9e7938] text-white font-mono">ACTIVE</span>
                  </span>
                  <p className="text-[10px] text-stone-300">
                    Manage client orders, update status & upload new pieces to Our Work.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#9e7938] group-hover:translate-x-0.5 transition-transform">
                <span className="hidden sm:inline">Open Panel</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 1. HERO SECTION */}
      <section className={`${isAdmin ? '!mt-4 sm:!mt-6' : ''} pt-2 sm:pt-4 px-4 sm:px-6`}>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Centered Square Logo with Rounded Corners and Atelier Border */}
          <div className="flex justify-center items-center py-1">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 aspect-square rounded-3xl overflow-hidden border-2 border-[#eae7e0] dark:border-[#2e2b26] ring-2 ring-[#9e7938]/30 shadow-float bg-white dark:bg-[#181716] group transition-transform duration-300 hover:scale-105">
              <img 
                src={logoImg} 
                alt="ZUNA Tailors Atelier Logo" 
                className="w-full h-full object-cover object-center select-none"
              />
            </div>
          </div>

          {/* Brand Heading & Statement */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold tracking-[0.28em] text-[#9e7938] uppercase block">
              Bespoke Atelier • Howrah
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#161514] dark:text-[#f7f5f0] leading-[1.08]">
              ZUNA TAILORS
            </h1>
            <p className="font-editorial italic text-xl sm:text-2xl text-[#524f48] dark:text-[#a39f96] tracking-wide">
              Elegance. Mastery. Custom Fit.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('order')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] hover:bg-stone-800 dark:hover:bg-stone-100 transition-all font-semibold text-xs tracking-[0.16em] uppercase shadow-sm active:scale-[0.98]"
            >
              <span>Start An Order</span>
              <ArrowRight className="w-4 h-4 text-[#9e7938]" />
            </button>

            <button
              onClick={() => onNavigate('work')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-[#1c1b18] border border-[#e2dfd7] dark:border-[#2e2b26] text-[#161514] dark:text-[#f7f5f0] hover:bg-[#f5f4ef] dark:hover:bg-stone-800 transition-all font-semibold text-xs tracking-[0.16em] uppercase active:scale-[0.98]"
            >
              <span>View Our Work</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. ABOUT / BRAND */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#fdf8ee] dark:bg-[#9e7938]/15 border border-[#e5d4b5] dark:border-[#9e7938]/30 flex items-center justify-center shrink-0">
              <Ruler className="w-5 h-5 text-[#9e7938]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
                The Atelier
              </span>
              <p className="text-base sm:text-lg text-[#262422] dark:text-[#e8e5df] font-normal leading-relaxed">
                <span className="font-semibold text-[#161514] dark:text-white">ZUNA TAILORS</span> provides custom tailoring directly to customers, focused on fit, craftsmanship and elegance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-end justify-between border-b border-[#eae7e0] dark:border-[#2e2b26] pb-3">
            <div>
              <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
                Craftsmanship
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                Services
              </h2>
            </div>
            <span className="text-xs text-[#7d7a73] dark:text-[#a39f96] font-mono">05 Specialties</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {SERVICES.map((srv) => (
              <div
                key={srv.id}
                onClick={() => onStartOrderWithService(srv.title, srv.garmentSuggestion)}
                className="group p-5 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] hover:border-[#cfcac0] dark:hover:border-[#3d3a34] transition-all cursor-pointer shadow-subtle hover:shadow-premium relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold tracking-[0.18em] text-[#161514] dark:text-[#f7f5f0] uppercase">
                      {srv.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#9e7938] group-hover:translate-x-0.5 transition-transform">
                      <span className="text-[10px] tracking-wider uppercase">Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-[#524f48] dark:text-[#a39f96] leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f2f0ea] dark:border-[#262422] flex flex-wrap items-center gap-1.5">
                  {srv.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-block text-[10px] tracking-wide text-[#737067] dark:text-[#a39f96] bg-[#f7f6f2] dark:bg-stone-900 px-2 py-0.5 rounded-md border border-[#eae7e0] dark:border-stone-800"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MASTER TAILOR */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-[#161514] dark:bg-stone-950 text-white p-6 sm:p-8 border border-stone-800 shadow-float">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-[#9e7938]/10 blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#d4af37]">
                <Sparkles className="w-3 h-3" />
                <span>Atelier Leadership</span>
              </div>

              <div>
                <h3 className="font-editorial text-3xl sm:text-4xl font-bold tracking-wide text-[#fdfbf7]">
                  SULTAN BAIG
                </h3>
                <p className="text-xs font-semibold tracking-[0.24em] text-[#9e7938] uppercase mt-1">
                  MASTER TAILOR
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
                  Former Pantaloons showroom master.
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Direct personal oversight on cutting, fitting lines, and final finishing for every client order.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#9e7938]" />
                  <span>Showroom Precision</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#9e7938]" />
                  <span>Bespoke Drafting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#9e7938]" />
                  <span>Personal Consultation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border-b border-[#eae7e0] dark:border-[#2e2b26] pb-3">
            <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
              Process
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#161514] dark:text-[#f7f5f0]">
              How It Works
            </h2>
          </div>

          <div className="space-y-3">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle flex items-start gap-4"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-[#f5f4ef] dark:bg-stone-900 border border-[#e2dfd7] dark:border-stone-800 flex items-center justify-center font-mono text-xs font-bold text-[#9e7938]">
                  {step.step}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold tracking-[0.18em] text-[#161514] dark:text-[#f7f5f0] uppercase">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#524f48] dark:text-[#a39f96] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOME SERVICE */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 sm:p-7 rounded-2xl bg-[#fdfbf7] dark:bg-[#1c1b18] border border-[#e5d4b5] dark:border-[#2e2b26] shadow-subtle space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9e7938]" />
              <span className="text-[10px] font-bold tracking-[0.24em] text-[#9e7938] uppercase">
                Doorstep Convenience
              </span>
            </div>

            <div>
              <h3 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                Home Measurement Service
              </h3>
              <p className="text-xs sm:text-sm text-[#524f48] dark:text-[#a39f96] mt-1 leading-relaxed">
                Prefer not to travel? Request Master Sultan Baig to visit your residence for measurement, fabric advice, and fitting consultation in Howrah and surrounding areas.
              </p>
            </div>

            <button
              onClick={() => onStartOrderWithService('Custom Tailoring', '', 'HOME SERVICE')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#9e7938] hover:bg-[#88672e] text-white font-semibold text-xs tracking-[0.16em] uppercase transition-all shadow-sm active:scale-[0.98]"
            >
              <span>Request Home Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. LOCATION + CONTACT */}
      <section className="px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border-b border-[#eae7e0] dark:border-[#2e2b26] pb-3">
            <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
              Howrah Atelier
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#161514] dark:text-[#f7f5f0]">
              Location & Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Studio Address */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#161514] dark:text-[#f7f5f0] uppercase">
                <MapPin className="w-4 h-4 text-[#9e7938]" />
                <span>Customer Studio</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2b2926] dark:text-[#e8e5df] font-medium leading-relaxed">
                {CONTACT_INFO.studioAddress}
              </p>
              <p className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">
                Client consultations & fabric drop-off
              </p>
            </div>

            {/* Workshop Address */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#161514] dark:text-[#f7f5f0] uppercase">
                <Compass className="w-4 h-4 text-[#9e7938]" />
                <span>Master Workshop</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2b2926] dark:text-[#e8e5df] font-medium leading-relaxed">
                Workshop: {CONTACT_INFO.workshopAddress}
              </p>
              <p className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">
                Master cutting, craftsmanship & trials
              </p>
            </div>
          </div>

          {/* Phone Numbers & Direct Actions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f2f0ea] dark:border-[#262422] pb-4">
              <div>
                <span className="text-[10px] tracking-[0.24em] font-bold text-[#7d7a73] dark:text-[#a39f96] uppercase">
                  Direct Atelier Line
                </span>
                <div className="flex items-center gap-3 mt-1 font-mono text-sm sm:text-base font-bold text-[#161514] dark:text-[#f7f5f0]">
                  <span>{CONTACT_INFO.primaryPhone}</span>
                  <span className="text-[#dedbd2] dark:text-stone-700">•</span>
                  <span>{CONTACT_INFO.secondaryPhone}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#524f48] dark:text-[#a39f96]">
                <Clock className="w-3.5 h-3.5 text-[#9e7938]" />
                <span>Mon – Sun: 10:00 AM – 9:00 PM</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${CONTACT_INFO.primaryPhone}`}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] hover:bg-stone-800 dark:hover:bg-stone-100 text-xs font-semibold tracking-[0.16em] uppercase transition-all shadow-sm active:scale-[0.98]"
              >
                <Phone className="w-3.5 h-3.5 text-[#9e7938]" />
                <span>CALL</span>
              </a>

              <a
                href={`https://wa.me/${CONTACT_INFO.whatsappNumber}?text=Hello%20ZUNA%20Tailors,%20I%20would%20like%20to%20consult%20Master%20Sultan%20Baig%20regarding%20tailoring.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold tracking-[0.16em] uppercase transition-all shadow-sm active:scale-[0.98]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
