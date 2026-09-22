import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginDialog({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Please enter the admin password');
      return;
    }

    setIsVerifying(true);

    // Check against configured admin password "zustang"
    if (password.trim() === 'zustang') {
      // Assign admin access forever across refreshes
      localStorage.setItem("zuna_admin_auth", "true");
      localStorage.setItem("adminpass", "zustang");
      setIsVerifying(false);
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setIsVerifying(false);
      setErrorMsg('Incorrect password. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-float p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#f2f0ea] dark:border-[#262422] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#9e7938]/15 border border-[#9e7938]/30 flex items-center justify-center text-[#9e7938]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                Admin Access
              </h3>
              <p className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider">
                ZUNA Tailors Atelier
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setErrorMsg('');
              setPassword('');
              onClose();
            }}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#524f48] dark:text-[#a39f96] leading-relaxed">
          Please enter the master admin password to access orders and manage the Our Work portfolio. Once unlocked, you remain logged in forever on this device.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs text-[#7d7a73] dark:text-[#a39f96] hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] text-xs font-semibold tracking-wide uppercase shadow-sm disabled:opacity-50"
            >
              <span>Unlock</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9e7938]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
