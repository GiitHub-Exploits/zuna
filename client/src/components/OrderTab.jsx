import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Scissors, 
  Phone, 
  MessageCircle, 
  Ruler, 
  Copy, 
  Check, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import CreateOrderDialog from './CreateOrderDialog';
import { CONTACT_INFO } from '../data/constants';
import { getOrCreateUserId } from '../utils/user';

export default function OrderTab({ initialPrefill, onResetPrefill }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState('');
  const [placedOrders, setPlacedOrders] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders for this specific userId from MongoDB on load & reload
  const fetchUserOrders = async () => {
    const userId = getOrCreateUserId();
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setPlacedOrders(data.orders || []);
      }
    } catch (e) {
      console.warn('Error fetching user orders from MongoDB:', e);
    } finally {
      setIsLoadingOrders(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  // Handle prefill from Home tab service cards
  useEffect(() => {
    if (initialPrefill) {
      setInitialCategory(initialPrefill.garment || '');
      setIsDialogOpen(true);
      if (onResetPrefill) onResetPrefill();
    }
  }, [initialPrefill]);

  // When a new order is successfully created in MongoDB
  const handleOrderPlaced = (newOrder) => {
    setPlacedOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
  };

  // Refresh status of placed orders from MongoDB backend
  const refreshOrdersStatus = async () => {
    setIsRefreshing(true);
    await fetchUserOrders();
  };

  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 animate-fadeIn">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
              Bespoke Commission
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#161514] dark:text-[#f7f5f0]">
              Custom Tailoring
            </h1>
            <p className="text-xs text-[#524f48] dark:text-[#a39f96] max-w-md leading-relaxed">
              Order any custom suiting, shirting, ethnic wear, or precision alteration directly with Master Sultan Baig.
            </p>
          </div>

          {/* Primary Create Order Button */}
          <button
            onClick={() => {
              setInitialCategory('');
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] hover:bg-stone-800 dark:hover:bg-stone-100 text-xs font-semibold tracking-[0.16em] uppercase shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-[#9e7938]" />
            <span>Create Order</span>
          </button>
        </div>

        {/* Placed Order Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#eae7e0] dark:border-[#2e2b26] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                Active Orders
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[#7d7a73] dark:text-[#a39f96]">
                {placedOrders.length}
              </span>
            </div>

            {placedOrders.length > 0 && (
              <button
                onClick={refreshOrdersStatus}
                className="inline-flex items-center gap-1 text-[11px] text-[#9e7938] hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Check Live Status</span>
              </button>
            )}
          </div>

          {placedOrders.length === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] text-center space-y-3.5 shadow-subtle">
              <div className="w-12 h-12 rounded-full bg-[#fdf8ee] dark:bg-[#9e7938]/15 border border-[#e5d4b5] dark:border-[#9e7938]/30 flex items-center justify-center mx-auto text-[#9e7938]">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                No Orders Placed Yet
              </h3>
              <p className="text-xs text-[#524f48] dark:text-[#a39f96] max-w-sm mx-auto leading-relaxed">
                Click <strong>"Create Order"</strong> above to enter your cloth category, quantity, material provision, and custom tailoring notes.
              </p>
              <button
                onClick={() => {
                  setInitialCategory('');
                  setIsDialogOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9e7938] hover:bg-[#88672e] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Bespoke Order</span>
              </button>
            </div>
          ) : (
            /* Render Placed Order Cards */
            <div className="space-y-4">
              {placedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle space-y-3.5 transition-all hover:border-[#cfcac0] dark:hover:border-[#3d3a34]"
                >
                  {/* Top Bar: Order ID, Status, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f2f0ea] dark:border-[#262422] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-bold text-[#161514] dark:text-[#f7f5f0]">
                        {ord.id}
                      </span>
                      <button
                        onClick={() => copyOrderId(ord.id)}
                        className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-[#7d7a73] hover:text-[#161514] dark:hover:text-white transition-colors"
                        title="Copy Order ID"
                      >
                        {copiedId === ord.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#fdf8ee] dark:bg-[#9e7938]/15 text-[#9e7938] border border-[#e5d4b5] dark:border-[#9e7938]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9e7938] animate-pulse" />
                      <span>{ord.status || 'RECEIVED'}</span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider block">
                        Cloth Category
                      </span>
                      <span className="font-bold text-[#161514] dark:text-[#f7f5f0]">
                        {ord.clothCategory || ord.garment}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider block">
                        Quantity
                      </span>
                      <span className="font-semibold text-[#161514] dark:text-[#f7f5f0]">
                        {ord.quantity || 1} piece(s)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider block">
                        Material Arrangement
                      </span>
                      <span className="font-medium text-[#161514] dark:text-[#f7f5f0]">
                        {ord.materialProvision || "Customer Provided"}
                        {ord.materialType ? ` • ${ord.materialType}` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider block">
                        Measurement
                      </span>
                      <span className="font-medium text-[#161514] dark:text-[#f7f5f0]">
                        {ord.measurementType || 'HOME SERVICE'}
                      </span>
                    </div>

                    {ord.customMeasurements && (
                      <div className="col-span-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900 border border-[#eae7e0] dark:border-stone-800 text-xs">
                        <span className="font-bold text-[10px] uppercase text-[#9e7938] block mb-0.5">
                          Provided Measurements:
                        </span>
                        <span className="font-mono text-[#161514] dark:text-[#f7f5f0]">{ord.customMeasurements}</span>
                      </div>
                    )}

                    {ord.address && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider block">
                          Service Address
                        </span>
                        <span className="text-[#524f48] dark:text-[#c4c0b6]">{ord.address}</span>
                      </div>
                    )}

                    {ord.customizationNote && (
                      <div className="col-span-2 p-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#161514] border border-[#eae7e0] dark:border-[#262422] text-[11px] text-[#2c2a27] dark:text-[#d1ccc4]">
                        <span className="font-semibold block uppercase text-[9px] text-[#7d7a73] dark:text-[#a39f96] mb-0.5">
                          Customization Note:
                        </span>
                        {ord.customizationNote}
                      </div>
                    )}
                  </div>

                  {/* Actions & Follow up */}
                  <div className="pt-2 border-t border-[#f2f0ea] dark:border-[#262422] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">
                      Order stored in database. Contact tailor for adjustments:
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${CONTACT_INFO.primaryPhone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold text-[#161514] dark:text-[#f7f5f0]"
                      >
                        <Phone className="w-3 h-3 text-[#9e7938]" />
                        <span>Call</span>
                      </a>

                      <a
                        href={`https://wa.me/${CONTACT_INFO.whatsappNumber}?text=Hello%20Master%20Sultan%20Baig,%20inquiry%20regarding%20my%20order%20%23${ord.id}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dialog Window */}
        <CreateOrderDialog
          isOpen={isDialogOpen}
          initialCategory={initialCategory}
          onClose={() => setIsDialogOpen(false)}
          onOrderPlaced={handleOrderPlaced}
        />
      </div>
    </div>
  );
}
