import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Package, 
  Upload, 
  Phone, 
  MessageCircle, 
  RefreshCw, 
  Trash2, 
  Search,
  Filter,
  CheckCircle2, 
  AlertCircle,
  Database,
  LogOut,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Eye,
  Ruler
} from 'lucide-react';
import { CONTACT_INFO } from '../data/constants';

const STATUS_CONFIG = {
  'RECEIVED': { label: 'Received', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  'CONFIRMED': { label: 'Confirmed', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  'MEASURING': { label: 'Measuring', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  'CRAFTING': { label: 'Crafting', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  'READY': { label: 'Ready', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  'DELIVERED': { label: 'Delivered', color: 'bg-stone-500/15 text-stone-600 dark:text-stone-300 border-stone-500/30' },
};

const ALL_STATUSES = ['RECEIVED', 'CONFIRMED', 'MEASURING', 'CRAFTING', 'READY', 'DELIVERED'];

export default function AdminPanelModal({ isOpen, onClose, onLogout, onWorkUpdated }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'upload'
  const [orders, setOrders] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWork, setLoadingWork] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  
  // Search & Filter state for orders
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Work upload state
  const [newWork, setNewWork] = useState({
    title: '',
    category: 'Suiting',
    description: '',
    details: '',
    imageUrl: '',
    aspectRatio: 'portrait'
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState({ text: '', type: '' });

  // Fetch orders directly from MongoDB
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch work directly from MongoDB
  const fetchWork = async () => {
    setLoadingWork(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/work");
      const data = await res.json();
      setWorkItems(data.items || []);
    } catch (err) {
      console.error('Error fetching admin work items:', err);
    } finally {
      setLoadingWork(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      fetchWork();
    }
  }, [isOpen]);

  // Update order status in MongoDB
  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Delete an order from MongoDB
  const handleDeleteOrder = async (orderId) => {
    if (!confirm(`Delete order ${orderId} permanently from MongoDB?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    } catch (err) {
      console.error('Delete order error:', err);
    }
  };

  // Publish new work item to MongoDB
  const handlePublishWork = async (e) => {
    e.preventDefault();
    if (!newWork.title.trim()) {
      setPublishMessage({ text: 'Please enter a garment title.', type: 'error' });
      return;
    }
    if (!newWork.imageUrl.trim()) {
      setPublishMessage({ text: 'Please enter an image URL.', type: 'error' });
      return;
    }

    setIsPublishing(true);
    setPublishMessage({ text: '', type: '' });

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/work", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWork)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish work');
      }

      setPublishMessage({ text: 'Piece published to MongoDB portfolio successfully!', type: 'success' });
      setNewWork({
        title: '',
        category: 'Suiting',
        description: '',
        details: '',
        imageUrl: '',
        aspectRatio: 'portrait'
      });
      fetchWork();
      if (onWorkUpdated) onWorkUpdated();
    } catch (err) {
      setPublishMessage({ text: err.message || 'Server error', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete work item from MongoDB
  const handleDeleteWork = async (id) => {
    if (!confirm('Are you sure you want to remove this piece from the portfolio?')) return;
    try {
      const res = await fetch(`/api/work/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkItems(prev => prev.filter(w => w.id !== id));
        if (onWorkUpdated) onWorkUpdated();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter orders by search & status
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatusFilter === 'ALL' || (o.status || 'RECEIVED') === selectedStatusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesSearch = 
      (o.id && o.id.toLowerCase().includes(query)) ||
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      (o.phone && o.phone.includes(query)) ||
      (o.clothCategory && o.clothCategory.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => !o.status || o.status === 'RECEIVED').length;
  const activeOrdersCount = orders.filter(o => ['CONFIRMED', 'MEASURING', 'CRAFTING'].includes(o.status)).length;
  const completedOrdersCount = orders.filter(o => ['READY', 'DELIVERED'].includes(o.status)).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[94vh] flex flex-col rounded-2xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] shadow-float overflow-hidden">
        
        {/* TOP BAR */}
        <div className="p-4 sm:p-5 border-b border-[#eae7e0] dark:border-[#262422] flex items-center justify-between bg-[#faf9f5] dark:bg-[#141312]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#9e7938]/15 border border-[#9e7938]/30 flex items-center justify-center text-[#9e7938]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#161514] dark:text-[#f7f5f0] leading-none">
                  Atelier Admin Panel
                </h2>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>MongoDB Atlas</span>
                </span>
              </div>
              <p className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase tracking-wider mt-1">
                ZUNA Tailors • Master Sultan Baig Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Log out from Admin on this device?')) {
                  localStorage.removeItem("zuna_admin_auth");
                  localStorage.removeItem("adminpass");
                  if (onLogout) onLogout();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200/80 dark:border-red-800 transition-all active:scale-95"
              title="Log out admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION PILLS */}
        <div className="flex items-center justify-between border-b border-[#eae7e0] dark:border-[#262422] bg-[#f5f4ef] dark:bg-[#1a1917] px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-[#262422] text-[#161514] dark:text-white shadow-xs border border-[#dedbd2] dark:border-[#383530]'
                  : 'text-[#7d7a73] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#9e7938]" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-[#262422] text-[#161514] dark:text-white shadow-xs border border-[#dedbd2] dark:border-[#383530]'
                  : 'text-[#7d7a73] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#9e7938]" />
              <span>Publish Work ({workItems.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'orders') fetchOrders();
              else fetchWork();
            }}
            className="p-1.5 rounded-lg text-[#7d7a73] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white transition-colors"
            title="Refresh current data"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingOrders || loadingWork) ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: ORDERS DASHBOARD */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {/* KPI Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#faf9f5] dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26]">
                  <span className="text-[10px] uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96] block font-semibold">Total Orders</span>
                  <span className="font-mono text-xl font-bold text-[#161514] dark:text-white">{totalOrdersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 block font-semibold">New / Pending</span>
                  <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400">{pendingOrdersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20">
                  <span className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 block font-semibold">In Progress</span>
                  <span className="font-mono text-xl font-bold text-purple-600 dark:text-purple-400">{activeOrdersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-semibold">Completed</span>
                  <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedOrdersCount}</span>
                </div>
              </div>

              {/* Search & Status Filter Controls */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, phone, order ID, or garment..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#faf9f5] dark:bg-[#1c1b18] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] placeholder-stone-400 focus:outline-none focus:border-[#9e7938]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {['ALL', ...ALL_STATUSES].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        selectedStatusFilter === status
                          ? 'bg-[#161514] dark:bg-white text-white dark:text-[#161514] shadow-xs'
                          : 'bg-[#faf9f5] dark:bg-[#1c1b18] text-[#7d7a73] dark:text-[#a39f96] border border-[#eae7e0] dark:border-[#2e2b26] hover:border-[#cfcac0]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {loadingOrders && orders.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#7d7a73]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9e7938] mb-2" />
                  <span>Loading orders from MongoDB...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-[#faf9f5] dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] p-6 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-stone-400" />
                  <p className="text-xs font-semibold text-[#161514] dark:text-white">
                    {orders.length === 0 ? "No orders placed yet in MongoDB" : "No orders matching your search / filter"}
                  </p>
                  <p className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">
                    Client orders submitted via the Order dialog appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredOrders.map((ord) => {
                    const statusInfo = STATUS_CONFIG[ord.status] || STATUS_CONFIG['RECEIVED'];

                    return (
                      <div
                        key={ord.id || ord._id}
                        className="p-4 sm:p-5 rounded-2xl bg-[#faf9f5] dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] shadow-xs space-y-3.5 hover:border-[#cfcac0] dark:hover:border-[#383530] transition-all"
                      >
                        {/* Top Line: ID, Date, Status Changer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eae7e0] dark:border-[#262422] pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#161514] dark:text-white">
                              {ord.id}
                            </span>
                            <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96]">
                              {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Live Status Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] uppercase font-semibold">
                              Status:
                            </span>
                            <select
                              value={ord.status || 'RECEIVED'}
                              disabled={statusUpdatingId === ord.id}
                              onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer transition-colors ${statusInfo.color}`}
                            >
                              {ALL_STATUSES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Customer & Garment Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Client Information */}
                          <div className="space-y-1 p-3 rounded-xl bg-white dark:bg-[#141312] border border-[#eae7e0] dark:border-[#262422]">
                            <span className="text-[10px] uppercase font-bold text-[#9e7938] tracking-wider block">
                              Client Information
                            </span>
                            <div className="text-xs font-bold text-[#161514] dark:text-white">
                              {ord.customerName}
                            </div>
                            <div className="font-mono text-xs text-[#524f48] dark:text-[#c4c0b6]">
                              {ord.phone} {ord.altPhone ? `• Alt: ${ord.altPhone}` : ''}
                            </div>
                            {ord.address && (
                              <div className="text-[11px] text-[#7d7a73] dark:text-[#a39f96] pt-1 border-t border-[#f2f0ea] dark:border-[#262422]">
                                {ord.address}
                              </div>
                            )}

                            {/* Direct Communication Buttons */}
                            <div className="flex items-center gap-2 pt-2">
                              <a
                                href={`tel:${ord.phone}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161514] dark:bg-white text-white dark:text-[#161514] text-[11px] font-semibold active:scale-95"
                              >
                                <Phone className="w-3 h-3 text-[#9e7938]" />
                                <span>Call</span>
                              </a>

                              <a
                                href={`https://wa.me/91${ord.phone.replace(/\D/g,'')}?text=Hello%20${encodeURIComponent(ord.customerName)},%20this%20is%20Master%20Sultan%20Baig%20from%20ZUNA%20TAILORS%20regarding%20your%20order%20%23${ord.id}%20(${encodeURIComponent(ord.clothCategory)}).%20Current%20status:%20${ord.status}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold active:scale-95"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          {/* Garment Specifications */}
                          <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-[#141312] border border-[#eae7e0] dark:border-[#262422]">
                            <span className="text-[10px] uppercase font-bold text-[#9e7938] tracking-wider block">
                              Garment & Cloth
                            </span>
                            <div className="text-xs font-bold text-[#161514] dark:text-white">
                              {ord.clothCategory || ord.garment} ({ord.quantity || 1} pcs)
                            </div>
                            <div className="text-[11px] text-[#524f48] dark:text-[#c4c0b6]">
                              <strong>Material:</strong> {ord.materialProvision || "Customer Provided"}
                              {ord.materialType ? ` (${ord.materialType})` : ''}
                            </div>
                            <div className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">
                              <strong>Service:</strong> {ord.measurementType || 'HOME SERVICE'}
                            </div>
                          </div>
                        </div>

                        {/* Custom Measurements (if provided) */}
                        {ord.customMeasurements && (
                          <div className="p-3 rounded-xl bg-white dark:bg-[#141312] border border-[#eae7e0] dark:border-[#262422] space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9e7938] tracking-wider">
                              <Ruler className="w-3.5 h-3.5" />
                              <span>Provided Measurements</span>
                            </div>
                            <p className="font-mono text-xs text-[#161514] dark:text-[#f7f5f0] whitespace-pre-wrap leading-relaxed">
                              {ord.customMeasurements}
                            </p>
                          </div>
                        )}

                        {/* Customization Notes (if provided) */}
                        {ord.customizationNote && (
                          <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-900 border border-[#eae7e0] dark:border-stone-800 space-y-0.5">
                            <span className="text-[9px] uppercase font-bold text-[#7d7a73] dark:text-[#a39f96] tracking-wider block">
                              Customization Notes:
                            </span>
                            <p className="text-xs text-[#2c2a27] dark:text-[#d1ccc4] leading-relaxed">
                              {ord.customizationNote}
                            </p>
                          </div>
                        )}

                        {/* Footer with Delete Action */}
                        <div className="pt-2 border-t border-[#eae7e0] dark:border-[#262422] flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 font-mono">
                            DB ID: {ord._id ? ord._id.slice(-6) : 'N/A'}
                          </span>

                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline"
                            title="Delete order from MongoDB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Order</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PUBLISH WORK TO OUR WORK */}
          {/* ======================================================== */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Upload Form */}
              <div className="p-5 rounded-2xl bg-[#faf9f5] dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] space-y-4">
                <div className="border-b border-[#eae7e0] dark:border-[#262422] pb-3">
                  <h3 className="font-editorial text-xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                    Upload Bespoke Piece
                  </h3>
                  <p className="text-xs text-[#7d7a73] dark:text-[#a39f96]">
                    Directly saves to MongoDB and updates the public "Our Work" portfolio.
                  </p>
                </div>

                {publishMessage.text && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    publishMessage.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                    {publishMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{publishMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handlePublishWork} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                        Garment Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newWork.title}
                        onChange={(e) => setNewWork(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. English Tweed 3-Piece Peak Lapel Suit"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#262422] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                        Category
                      </label>
                      <select
                        value={newWork.category}
                        onChange={(e) => setNewWork(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#262422] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                      >
                        <option value="Suiting">Suiting</option>
                        <option value="Shirting">Shirting</option>
                        <option value="Ethnic Wear">Ethnic Wear</option>
                        <option value="Alteration">Alteration</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  {/* Image URL & Instant Live Preview */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                        Image URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={newWork.imageUrl}
                        onChange={(e) => setNewWork(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://images.unsplash.com/... or hosted image URL"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#262422] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                      />
                    </div>

                    {/* Instant Live Photo Preview Box */}
                    {newWork.imageUrl && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#141312] border border-[#eae7e0] dark:border-[#262422] flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                          <img
                            src={newWork.imageUrl}
                            alt="Live Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div className="text-xs space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            <Eye className="w-3 h-3" />
                            <span>Live Photo Preview</span>
                          </div>
                          <p className="text-stone-500 truncate text-[11px]">{newWork.imageUrl}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={newWork.description}
                      onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g. Floating canvas construction, pick-stitched lapels, horn buttons."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#262422] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                        Craftsmanship Details (Optional)
                      </label>
                      <input
                        type="text"
                        value={newWork.details}
                        onChange={(e) => setNewWork(prev => ({ ...prev, details: e.target.value }))}
                        placeholder="e.g. 3 Fittings done by Sultan Baig"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#262422] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#161514] dark:text-[#f7f5f0]">
                        Display Aspect Ratio
                      </label>
                      <select
                        value={newWork.aspectRatio}
                        onChange={(e) => setNewWork(prev => ({ ...prev, aspectRatio: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#262422] border border-[#dedbd2] dark:border-[#383530] text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:border-[#9e7938]"
                      >
                        <option value="portrait">Portrait (3:4)</option>
                        <option value="square">Square (1:1)</option>
                        <option value="landscape">Landscape (4:3)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="w-full py-3 rounded-xl bg-[#9e7938] hover:bg-[#88672e] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-sm disabled:opacity-50 active:scale-95"
                  >
                    {isPublishing ? 'Publishing to MongoDB...' : 'Publish Piece To Public Gallery'}
                  </button>
                </form>
              </div>

              {/* Published Portfolio Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#161514] dark:text-white">
                    Published Portfolio Pieces ({workItems.length})
                  </span>
                  <button
                    onClick={fetchWork}
                    className="inline-flex items-center gap-1 text-[11px] text-[#9e7938] hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                {workItems.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#faf9f5] dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] text-xs text-[#7d7a73]">
                    No pieces published to MongoDB yet. Use the form above to add your first bespoke piece.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-[#faf9f5] dark:bg-[#1c1b18] border border-[#eae7e0] dark:border-[#2e2b26] flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#161514] dark:text-[#f7f5f0] truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-[#9e7938] uppercase font-semibold">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteWork(item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete piece from MongoDB"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
