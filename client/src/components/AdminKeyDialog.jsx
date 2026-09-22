import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, LogOut } from 'lucide-react';

export default function AdminKeyDialog({ isOpen, onClose, onKeySaved, currentPass }) {
  const [passInput, setPassInput] = useState(currentPass || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (passInput.trim()) {
      localStorage.setItem("adminpass", passInput.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onKeySaved(passInput.trim());
        onClose();
      }, 700);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("adminpass");
    onKeySaved(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-float p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#f2f0ea] dark:border-[#2a2824] pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#9e7938]" />
            <h3 className="font-editorial text-xl font-bold text-[#161514] dark:text-[#f7f5f0]">
              Admin Device Key
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#524f48] dark:text-[#a39f96] leading-relaxed">
          Enter your custom admin key. This key will be stored securely in <code className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">localStorage.getItem("adminpass")</code> to unlock the atelier management panel on this device.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
              Custom Admin Key / Password
            </label>
            <input
              type="text"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="e.g. zuna-master-2026 or any custom key"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs font-mono text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            {currentPass ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Remove Key</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs text-[#7d7a73] dark:text-[#a39f96] hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] text-xs font-semibold tracking-wide uppercase shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Key</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
