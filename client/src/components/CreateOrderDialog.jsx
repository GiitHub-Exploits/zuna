import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Scissors, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Copy, 
  AlertCircle,
  Ruler
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONTACT_INFO } from '../data/constants';
import { getOrCreateUserId } from '../utils/user';

export default function CreateOrderDialog({ isOpen, onClose, onOrderPlaced, initialCategory }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [clothCategory, setClothCategory] = useState(initialCategory || '');
  const [quantity, setQuantity] = useState(1);
  const [materialProvision, setMaterialProvision] = useState("Customer Provided");
  const [materialType, setMaterialType] = useState('');
  const [customizationNote, setCustomizationNote] = useState('');
  
  // Measurements
  const [measurementType, setMeasurementType] = useState('HOME SERVICE'); // HOME SERVICE, WORKSHOP, MY MEASUREMENTS
  const [customMeasurements, setCustomMeasurements] = useState('');

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clothCategory.trim()) {
      setErrorMsg('Please enter the cloth category / garment you need tailored.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    if (measurementType === 'MY MEASUREMENTS' && !customMeasurements.trim()) {
      setErrorMsg('Please enter your measurements in the field provided.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: getOrCreateUserId(),
        clothCategory: clothCategory.trim(),
        quantity: Number(quantity) || 1,
        materialProvision,
        materialType: materialType.trim(),
        customizationNote: customizationNote.trim(),
        measurementType,
        customMeasurements: customMeasurements.trim(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim(),
        address: address.trim()
      };

      const res = await fetch(import.meta.env.VITE_API_URL + "/api/orders", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit order request to database');
      }

      setSuccessOrder(data.order);

      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#9e7938', '#161514', '#e5d4b5']
        });
      } catch (err) {}

      if (onOrderPlaced) {
        onOrderPlaced(data.order);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error submitting order. MongoDB must be configured.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (successOrder?.id) {
      navigator.clipboard.writeText(successOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setSuccessOrder(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-float overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#eae7e0] dark:border-[#2e2b26] flex items-center justify-between bg-[#faf9f5] dark:bg-[#161514]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#9e7938]/15 border border-[#9e7938]/30 flex items-center justify-center text-[#9e7938]">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#161514] dark:text-[#f7f5f0] leading-none">
                {successOrder ? "Order Confirmed" : "Create Bespoke Order"}
              </h2>
              <p className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider mt-1">
                ZUNA Tailors • Pure MongoDB Backend
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {successOrder ? (
            /* ======================================================== */
            /* SUCCESS SCREEN & ORDER CARD */
            /* ======================================================== */
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2 pt-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="inline-block text-[10px] font-bold tracking-[0.24em] text-stone-900 dark:text-stone-100 uppercase bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">
                  ORDER REQUEST RECEIVED
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                  Thank You, {successOrder.customerName}
                </h3>
                <p className="text-xs text-[#524f48] dark:text-[#a39f96] max-w-sm mx-auto leading-relaxed">
                  Your order has been recorded in the database. Master Sultan Baig will contact you on your phone to confirm requirements and schedule.
                </p>
              </div>

              {/* Polished Order Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f5] dark:bg-[#161514] border border-[#eae7e0] dark:border-[#2e2b26] space-y-3.5 shadow-subtle">
                <div className="flex items-center justify-between border-b border-[#eae7e0] dark:border-[#262422] pb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#7d7a73] dark:text-[#a39f96] block">
                      Order ID
                    </span>
                    <span className="font-mono text-lg font-bold text-[#161514] dark:text-[#f7f5f0]">
                      {successOrder.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-[#9e7938] border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9e7938] animate-pulse" />
                      {successOrder.status}
                    </span>
                    <button
                      onClick={copyOrderId}
                      className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-[#dedbd2] dark:border-stone-700 text-[#161514] dark:text-white"
                      title="Copy Order ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#7d7a73]" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase block">Cloth Category</span>
                    <span className="font-semibold text-[#161514] dark:text-[#f7f5f0]">
                      {successOrder.clothCategory} ({successOrder.quantity} pcs)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase block">Material</span>
                    <span className="font-medium text-[#161514] dark:text-[#f7f5f0]">
                      {successOrder.materialProvision}
                      {successOrder.materialType ? ` • ${successOrder.materialType}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase block">Customer Phone</span>
                    <span className="font-mono text-[#161514] dark:text-[#f7f5f0]">{successOrder.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase block">Measurement Mode</span>
                    <span className="font-medium text-[#161514] dark:text-[#f7f5f0]">{successOrder.measurementType}</span>
                  </div>
                  {successOrder.customMeasurements && (
                    <div className="col-span-2 p-2.5 rounded-lg bg-white dark:bg-[#1f1d19] border border-[#dedbd2] dark:border-[#383530] text-xs">
                      <span className="font-bold text-[10px] uppercase text-[#9e7938] block mb-0.5">
                        Provided Measurements:
                      </span>
                      <span className="font-mono text-[#161514] dark:text-[#f7f5f0]">{successOrder.customMeasurements}</span>
                    </div>
                  )}
                  {successOrder.address && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase block">Address</span>
                      <span className="text-[#524f48] dark:text-[#c4c0b6]">{successOrder.address}</span>
                    </div>
                  )}
                  {successOrder.customizationNote && (
                    <div className="col-span-2 p-2 rounded-lg bg-stone-100 dark:bg-stone-900 border border-[#eae7e0] dark:border-stone-800 text-[11px] text-[#2c2a27] dark:text-[#d1ccc4]">
                      <span className="font-semibold uppercase text-[9px] text-[#7d7a73] dark:text-[#a39f96] block mb-0.5">
                        Customization Note:
                      </span>
                      {successOrder.customizationNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`tel:${CONTACT_INFO.primaryPhone}`}
                  className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] text-xs font-semibold tracking-wider uppercase transition-all shadow-sm active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-[#9e7938]" />
                  <span>Call ZUNA</span>
                </a>

                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsappNumber}?text=Hello%20Master%20Sultan%20Baig,%20I%20have%20submitted%20order%20%23${successOrder.id}%20for%20${encodeURIComponent(successOrder.clothCategory)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-xs font-medium text-[#7d7a73] dark:text-[#a39f96] hover:underline"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* ORDER FORM */
            /* ======================================================== */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* 1. Cloth Category (Custom text input - NOT a dropdown) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                  Cloth Category / Garment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clothCategory}
                  onChange={(e) => setClothCategory(e.target.value)}
                  placeholder="e.g. 3-Piece Peak Lapel Suit, Bandhgala, Linen Shirt, Gurkha Trousers, Blazer Alteration..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] placeholder-[#a6a29a] focus:outline-none focus:border-[#9e7938]"
                />
                <p className="text-[10px] text-[#7d7a73] dark:text-[#a39f96]">
                  Enter any garment or alteration you want tailored. Not limited to fixed dropdown options.
                </p>
              </div>

              {/* 2. Quantity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 border border-[#dedbd2] dark:border-stone-700 text-sm font-bold text-[#161514] dark:text-white"
                  >
                    –
                  </button>
                  <span className="font-mono text-sm font-bold text-[#161514] dark:text-[#f7f5f0] w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 border border-[#dedbd2] dark:border-stone-700 text-sm font-bold text-[#161514] dark:text-white"
                  >
                    +
                  </button>
                  <span className="text-xs text-[#7d7a73] dark:text-[#a39f96]">
                    {quantity === 1 ? 'Garment piece' : 'Garment pieces'}
                  </span>
                </div>
              </div>

              {/* 3. Material Provision & Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                  Material / Fabric Provision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "Customer Provided", label: "You'll provide the fabric", desc: "You have your own cloth ready" },
                    { id: "We will manage it", label: "We will manage / source it", desc: "Sultan Baig advises & arranges cloth" }
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMaterialProvision(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        materialProvision === m.id
                          ? 'border-[#9e7938] bg-[#fdf8ee] dark:bg-[#9e7938]/15'
                          : 'border-[#eae7e0] dark:border-[#2e2b26] bg-[#faf9f5] dark:bg-[#121110]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#161514] dark:text-[#f7f5f0]">{m.label}</span>
                        {materialProvision === m.id && <Check className="w-3.5 h-3.5 text-[#9e7938]" />}
                      </div>
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] block mt-0.5">{m.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    placeholder="Material type or color (e.g. Italian Wool, Irish Linen, Raw Silk, Egyptian Cotton...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] placeholder-[#a6a29a] focus:outline-none focus:border-[#9e7938]"
                  />
                </div>
              </div>

              {/* 4. Note for Customizations */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                  Note for Customizations
                </label>
                <textarea
                  rows={2}
                  value={customizationNote}
                  onChange={(e) => setCustomizationNote(e.target.value)}
                  placeholder="Detail any specific collar, lapel, cut, pocket styling, special fitting requests..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] placeholder-[#a6a29a] focus:outline-none focus:border-[#9e7938]"
                />
              </div>

              {/* 5. Measurement Option & Input for MY MEASUREMENTS */}
              <div className="space-y-2 pt-1 border-t border-[#eae7e0] dark:border-[#2e2b26]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                  Measurement Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "HOME SERVICE", label: "Home Visit" },
                    { id: "WORKSHOP", label: "Workshop" },
                    { id: "MY MEASUREMENTS", label: "My Measurements" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMeasurementType(opt.id)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-semibold text-center border transition-all ${
                        measurementType === opt.id
                          ? 'border-[#9e7938] bg-[#fdf8ee] dark:bg-[#9e7938]/15 text-[#161514] dark:text-white'
                          : 'border-[#eae7e0] dark:border-[#2e2b26] bg-[#faf9f5] dark:bg-[#121110] text-[#7d7a73] dark:text-[#a39f96]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* WHEN "MY MEASUREMENTS" IS SELECTED: SHOW INPUT FIELD TO PROVIDE MEASUREMENTS */}
                {measurementType === 'MY MEASUREMENTS' && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1f1d19] border border-[#9e7938]/40 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-[#9e7938]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                        Provide Your Custom Measurements <span className="text-red-500">*</span>
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={customMeasurements}
                      onChange={(e) => setCustomMeasurements(e.target.value)}
                      placeholder="e.g. Chest: 40 in, Waist: 34 in, Hip: 41 in, Shoulder: 18.5 in, Sleeve: 25 in, Shirt Length: 30 in (or your standard sizing details)"
                      className="w-full px-3 py-2 rounded-lg bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs font-mono text-[#161514] dark:text-[#f7f5f0] placeholder-[#a6a29a] focus:outline-none focus:border-[#9e7938]"
                    />
                    <p className="text-[10px] text-[#7d7a73] dark:text-[#a39f96]">
                      Enter exact numbers in inches/cm or describe a garment that fits you well.
                    </p>
                  </div>
                )}
              </div>

              {/* 6. Customer Contact Details */}
              <div className="pt-2 border-t border-[#eae7e0] dark:border-[#2e2b26] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9e7938] block">
                  Customer Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Sourav Das"
                      className="w-full px-3 py-2 rounded-lg bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9830012345"
                      className="w-full px-3 py-2 rounded-lg bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs font-mono text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                    Address (For Home Measurement & Delivery)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat, Street name, Landmark, Howrah / Kolkata"
                    className="w-full px-3 py-2 rounded-lg bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#9e7938] hover:bg-[#88672e] text-white text-xs font-bold tracking-[0.16em] uppercase transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Placing Order..." : "Place Bespoke Order"}
                </button>
                <p className="text-[10px] text-center text-[#7d7a73] dark:text-[#a39f96] mt-2">
                  Direct database submission. Sultan Baig personally contacts you to confirm.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
