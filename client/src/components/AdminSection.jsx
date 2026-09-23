import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
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
  Sparkles, 
  Ruler, 
  ArrowLeft, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Image as ImageIcon,
  CloudUpload,
  CheckCircle,
  Bell
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

const WORK_CATEGORIES = [
  'Suiting',
  'Shirting',
  'Ethnic Wear',
  'Sherwani',
  'Blazer',
  'Kurta',
  'Trouser',
  'Alteration',
  'Custom'
];

export default function AdminSection({
  isAdmin,
  onAdminLogin,
  onLogout,
  onReturnToStorefront,
  onWorkUpdated
}) {
  // Authentication form state (for protected section view)
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Admin section state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'work'
  const [orders, setOrders] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWork, setLoadingWork] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Server health info
  const [serverHealth, setServerHealth] = useState(null);

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
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublishingWork, setIsPublishingWork] = useState(false);
  const [workFeedback, setWorkFeedback] = useState({ text: '', type: '' });

  // Handle protected password unlock
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!passwordInput.trim()) {
      setAuthError('Please enter the admin password.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/admin/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("zuna_admin_auth", "true");
        localStorage.setItem("adminpass", "zustang");
        onAdminLogin();
        setPasswordInput('');
      } else {
        setAuthError(data.message || 'Incorrect password. Access denied.');
      }
    } catch (err) {
      // Offline fallback: check client-side for "zustang"
      if (passwordInput.trim() === 'zustang') {
        localStorage.setItem("zuna_admin_auth", "true");
        localStorage.setItem("adminpass", "zustang");
        onAdminLogin();
        setPasswordInput('');
      } else {
        setAuthError('Incorrect password. Access denied.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch Server Health
  const checkHealth = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/health");
      const data = await res.json();
      setServerHealth(data);
    } catch (e) {
      console.warn('Health check failed:', e);
    }
  };

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

  const [isSendingTestPush, setIsSendingTestPush] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      checkHealth();
      fetchOrders();
      fetchWork();

      // Deep link to specific order from push notification click (?tab=admin&orderId=...)
      const params = new URLSearchParams(window.location.search);
      const targetOrderId = params.get('orderId');
      if (targetOrderId) {
        setSearchQuery(targetOrderId);
      }
    }
  }, [isAdmin]);

  const handleSendTestPush = async () => {
    setIsSendingTestPush(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/push/test", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAdmin: true,
          title: 'ZUNA TAILORS — Live Admin Alert',
          body: 'Web push is active! You will receive instant notifications for every newly placed order.'
        })
      });
      const data = await res.json();
      if (data.sentCount > 0) {
        alert('Test notification dispatched! Check your phone notification bar.');
      } else {
        alert('Push notification requested. Please ensure notification permissions are allowed on this device.');
      }
    } catch (e) {
      alert('Error sending test push: ' + e.message);
    } finally {
      setIsSendingTestPush(false);
    }
  };

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
      alert('Failed to update status in MongoDB');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Delete an order from MongoDB
  const handleDeleteOrder = async (orderId) => {
    if (!confirm(`Delete order ${orderId} permanently from MongoDB? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        alert('Failed to delete order from MongoDB');
      }
    } catch (err) {
      console.error('Delete order error:', err);
      alert('Network error deleting order');
    }
  };

  // Handle local image file selection for Cloudinary upload
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setWorkFeedback({ text: 'Please select a valid image file.', type: 'error' });
        return;
      }
      setSelectedImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
      setWorkFeedback({ text: '', type: '' });
    }
  };

  // Upload image to Cloudinary via server /api/upload
  const handleUploadImageToCloudinary = async () => {
    if (!selectedImageFile) {
      setWorkFeedback({ text: 'Please pick an image file from your device first.', type: 'error' });
      return null;
    }

    setIsUploadingImage(true);
    setWorkFeedback({ text: 'Uploading image to Cloudinary...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('image', selectedImageFile);

      const res = await fetch(import.meta.env.VITE_API_URL + "/api/upload", {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload image to Cloudinary');
      }

      setWorkFeedback({ text: 'Image uploaded to Cloudinary successfully!', type: 'success' });
      setNewWork(prev => ({ ...prev, imageUrl: data.url }));
      return data.url;
    } catch (err) {
      setWorkFeedback({ text: err.message || 'Error uploading to Cloudinary', type: 'error' });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Publish new work item to MongoDB
  const handlePublishWork = async (e) => {
    e.preventDefault();
    if (!newWork.title.trim()) {
      setWorkFeedback({ text: 'Please enter a title for this bespoke piece.', type: 'error' });
      return;
    }

    setIsPublishingWork(true);
    setWorkFeedback({ text: '', type: '' });

    try {
      let finalImageUrl = newWork.imageUrl.trim();

      // If user selected a file but hasn't uploaded it separately yet
      if (selectedImageFile && !finalImageUrl) {
        setWorkFeedback({ text: 'Uploading image to Cloudinary...', type: 'info' });
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        formData.append('title', newWork.title.trim());
        formData.append('category', newWork.category);
        formData.append('description', newWork.description);
        formData.append('details', newWork.details);
        formData.append('aspectRatio', newWork.aspectRatio);

        const res = await fetch(import.meta.env.VITE_API_URL + "/api/work", {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to publish work piece');
        }

        setWorkFeedback({ text: 'Work piece uploaded to Cloudinary & saved to MongoDB!', type: 'success' });
        resetWorkForm();
        fetchWork();
        if (onWorkUpdated) onWorkUpdated();
        return;
      }

      if (!finalImageUrl) {
        setWorkFeedback({ text: 'Please provide an image: select an image file to upload to Cloudinary or paste an image URL.', type: 'error' });
        setIsPublishingWork(false);
        return;
      }

      // If we already have a URL (either from Cloudinary upload or pasted URL)
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/work", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWork,
          imageUrl: finalImageUrl
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish work piece');
      }

      setWorkFeedback({ text: 'Piece published to MongoDB portfolio successfully!', type: 'success' });
      resetWorkForm();
      fetchWork();
      if (onWorkUpdated) onWorkUpdated();
    } catch (err) {
      setWorkFeedback({ text: err.message || 'Server error saving work piece', type: 'error' });
    } finally {
      setIsPublishingWork(false);
    }
  };

  const resetWorkForm = () => {
    setNewWork({
      title: '',
      category: 'Suiting',
      description: '',
      details: '',
      imageUrl: '',
      aspectRatio: 'portrait'
    });
    setSelectedImageFile(null);
    setImagePreviewUrl('');
  };

  // Delete work item from MongoDB
  const handleDeleteWork = async (id, title) => {
    if (!confirm(`Are you sure you want to permanently remove "${title || 'this piece'}" from the portfolio in MongoDB?`)) return;
    try {
      const res = await fetch(`/api/work/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setWorkItems(prev => prev.filter(w => w.id !== id));
        if (onWorkUpdated) onWorkUpdated();
      } else {
        alert(data.message || 'Failed to delete piece from MongoDB');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error connecting to server to delete piece');
    }
  };

  // Copy order ID helper
  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      (o.clothCategory && o.clothCategory.toLowerCase().includes(query)) ||
      (o.customMeasurements && o.customMeasurements.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => !o.status || o.status === 'RECEIVED').length;
  const activeOrdersCount = orders.filter(o => ['CONFIRMED', 'MEASURING', 'CRAFTING'].includes(o.status)).length;
  const readyOrdersCount = orders.filter(o => ['READY', 'DELIVERED'].includes(o.status)).length;

  // -------------------------------------------------------------
  // VIEW 1: PROTECTED PASSWORD SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-xl mx-auto animate-fadeIn">
        <button
          onClick={onReturnToStorefront}
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-[#7d7a73] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>

        <div className="rounded-3xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] p-7 sm:p-10 shadow-float space-y-7 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#9e7938]/15 border border-[#9e7938]/30 flex items-center justify-center text-[#9e7938] mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
              Atelier Security
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#161514] dark:text-[#f7f5f0]">
              Master Tailor Portal
            </h2>
            <p className="text-xs text-[#7d7a73] dark:text-[#a39f96] max-w-sm mx-auto leading-relaxed">
              Enter the master access password to manage bespoke commissions, review customer measurements, and publish portfolio works.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm mx-auto text-left">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-[#7d7a73] dark:text-[#a39f96] mb-1.5">
                Master Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (zustang)"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-stone-700 text-[#161514] dark:text-[#f7f5f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] font-bold text-xs uppercase tracking-widest hover:bg-[#9e7938] dark:hover:bg-[#9e7938] dark:hover:text-white transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying Access..." : "Unlock Atelier Controls"}
            </button>
          </form>

          <div className="pt-4 border-t border-[#f0ede6] dark:border-[#262422] text-[11px] text-[#7d7a73] dark:text-[#a39f96]">
            <span>Master Tailor: </span>
            <span className="font-semibold text-[#161514] dark:text-stone-300">Sultan Baig</span>
            <span className="mx-2">•</span>
            <span>Howrah Workshop</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: FULL-PAGE DEDICATED ADMIN DASHBOARD (Authenticated)
  // -------------------------------------------------------------
  return (
    <div className="py-6 sm:py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* 1. TOP NAVIGATION & SYSTEM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae7e0] dark:border-[#2e2b26]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToStorefront}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#524f48] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white text-xs font-semibold transition-all"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atelier Storefront</span>
            </button>
            <span className="text-[#9e7938] text-xs">•</span>
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#9e7938] uppercase">
              Management Suite
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#161514] dark:text-[#f7f5f0] pt-1">
            Atelier Control Center
          </h1>
          <p className="text-xs text-[#7d7a73] dark:text-[#a39f96]">
            Sultan Baig • Pure MongoDB Atlas Database & Cloudinary Asset Engine
          </p>
        </div>

        {/* Status Pills & Logout */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* MongoDB Atlas Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Atlas MongoDB</span>
          </div>

          {/* Cloudinary Status Indicator */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
            serverHealth?.cloudinaryConfigured 
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}>
            <CloudUpload className="w-3.5 h-3.5" />
            <span>{serverHealth?.cloudinaryConfigured ? 'Cloudinary Ready' : 'Cloudinary via .env'}</span>
          </div>

          {/* Web Push Notification Test Button */}
          <button
            onClick={handleSendTestPush}
            disabled={isSendingTestPush}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9e7938]/10 hover:bg-[#9e7938]/20 text-[#9e7938] border border-[#9e7938]/30 text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Send live test notification to verify your device receives push alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isSendingTestPush ? 'Sending...' : 'Test Push'}</span>
          </button>

          {/* Logout button */}
          <button
            onClick={() => {
              if (confirm('Log out from Admin on this device?')) {
                onLogout();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer"
            title="Log out and protect admin panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* 2. TAB SWITCHER: ORDERS vs OUR WORK */}
      <div className="flex items-center gap-3 border-b border-[#eae7e0] dark:border-[#2e2b26] pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all select-none cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#161514] dark:bg-white text-white dark:text-[#161514] shadow-sm'
              : 'bg-stone-100 dark:bg-[#1c1b18] text-[#7d7a73] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Bespoke Orders</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'orders' ? 'bg-[#9e7938] text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
          }`}>
            {totalOrdersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('work')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all select-none cursor-pointer ${
            activeTab === 'work'
              ? 'bg-[#161514] dark:bg-white text-white dark:text-[#161514] shadow-sm'
              : 'bg-stone-100 dark:bg-[#1c1b18] text-[#7d7a73] dark:text-[#a39f96] hover:text-[#161514] dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Our Work & Cloudinary</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'work' ? 'bg-[#9e7938] text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
          }`}>
            {workItems.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB A: BESPOKE ORDERS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-7">
          {/* KPI Stat Cards with Ample Breathing Room */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96]">
                Total Commissions
              </span>
              <p className="font-editorial text-3xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                {totalOrdersCount}
              </p>
              <p className="text-[11px] text-[#9e7938]">Stored in MongoDB</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#181716] border border-amber-500/20 shadow-subtle space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pending Verification
              </span>
              <p className="font-editorial text-3xl font-bold text-amber-600 dark:text-amber-400">
                {pendingOrdersCount}
              </p>
              <p className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">Awaiting call / confirmation</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#181716] border border-indigo-500/20 shadow-subtle space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                In Tailoring
              </span>
              <p className="font-editorial text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {activeOrdersCount}
              </p>
              <p className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">Cutting & stitching in Howrah</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#181716] border border-emerald-500/20 shadow-subtle space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Ready / Delivered
              </span>
              <p className="font-editorial text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {readyOrdersCount}
              </p>
              <p className="text-[11px] text-[#7d7a73] dark:text-[#a39f96]">Trial ready or completed</p>
            </div>
          </div>

          {/* Search, Filter Toolbar & Refresh Button */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d7a73]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer name, phone, order ID, or garment..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-stone-700 text-xs text-[#161514] dark:text-[#f7f5f0] placeholder-[#a39f96] focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7d7a73] hover:text-[#161514] dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchOrders}
                disabled={loadingOrders}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#161514] dark:text-white text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                <span>Sync Orders</span>
              </button>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] uppercase font-bold text-[#7d7a73] dark:text-[#a39f96] mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {['ALL', ...ALL_STATUSES].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                    selectedStatusFilter === status
                      ? 'bg-[#9e7938] text-white shadow-xs'
                      : 'bg-[#faf9f5] dark:bg-[#121110] text-[#524f48] dark:text-[#a39f96] border border-[#eae7e0] dark:border-stone-800 hover:border-[#9e7938]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List Container */}
          <div className="space-y-4">
            {loadingOrders && orders.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-[#dedbd2] border-t-[#9e7938] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#7d7a73] font-mono">Fetching orders from MongoDB Atlas...</p>
              </div>
            )}

            {!loadingOrders && filteredOrders.length === 0 && (
              <div className="py-16 px-6 rounded-2xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] text-center space-y-3 shadow-subtle">
                <Package className="w-10 h-10 text-[#9e7938] mx-auto opacity-70" />
                <h3 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                  No Orders Found
                </h3>
                <p className="text-xs text-[#7d7a73] dark:text-[#a39f96] max-w-sm mx-auto">
                  {searchQuery || selectedStatusFilter !== 'ALL' 
                    ? "No orders match your filter criteria. Try clearing search or selecting 'ALL'." 
                    : "No bespoke commissions in MongoDB yet. Client orders will appear here automatically."}
                </p>
              </div>
            )}

            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['RECEIVED'];
              const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Recently';

              return (
                <div 
                  key={order.id}
                  className="rounded-3xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] p-6 sm:p-7 shadow-subtle hover:shadow-premium transition-all space-y-5"
                >
                  {/* Card Header: Order ID, Date, and Status Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ede6] dark:border-[#262422]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-[#dedbd2] dark:border-stone-800">
                        <span className="font-mono text-xs font-bold text-[#161514] dark:text-[#f7f5f0]">
                          {order.id}
                        </span>
                        <button
                          onClick={() => handleCopyId(order.id)}
                          className="text-[#7d7a73] hover:text-[#9e7938] transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="text-[11px] text-[#7d7a73] dark:text-[#a39f96] flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96]">
                        Status:
                      </span>
                      <select
                        value={order.status || 'RECEIVED'}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={statusUpdatingId === order.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border appearance-none focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40 cursor-pointer ${statusCfg.color}`}
                      >
                        {ALL_STATUSES.map(st => (
                          <option key={st} value={st} className="bg-white dark:bg-[#181716] text-[#161514] dark:text-white">
                            {st} ({STATUS_CONFIG[st]?.label})
                          </option>
                        ))}
                      </select>
                      {statusUpdatingId === order.id && (
                        <div className="w-3.5 h-3.5 border-2 border-[#9e7938] border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Customer & Garment Core Grid with Generous Spacing */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column: Customer Profile & Contact Details */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9e7938]">
                          Client Information
                        </span>
                        <h4 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                          {order.customerName}
                        </h4>
                      </div>

                      {/* Phone & Instant Contact Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <a
                          href={`tel:${order.phone}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#161514] dark:text-white text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#9e7938]" />
                          <span>Call: {order.phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.customerName)},%20this%20is%20Master%20Sultan%20Baig%20from%20ZUNA%20Tailors%20regarding%20your%20order%20${order.id}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {order.altPhone && (
                        <p className="text-xs text-[#7d7a73] dark:text-[#a39f96]">
                          Alt Phone: <span className="font-mono text-[#161514] dark:text-white">{order.altPhone}</span>
                        </p>
                      )}

                      {/* Address & Slot */}
                      {order.address && (
                        <div className="flex items-start gap-2 pt-1 text-xs text-[#524f48] dark:text-[#c4c0b6]">
                          <MapPin className="w-4 h-4 text-[#9e7938] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{order.address}</span>
                        </div>
                      )}

                      {order.preferredDate && (
                        <div className="flex items-center gap-2 text-xs text-[#7d7a73] dark:text-[#a39f96]">
                          <Clock className="w-3.5 h-3.5 text-[#9e7938]" />
                          <span>Appointment: {order.preferredDate} ({order.preferredTimeSlot || 'Standard'})</span>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Garment Specifications & Customizations */}
                    <div className="space-y-3.5 bg-[#faf9f5] dark:bg-[#121110] p-4 sm:p-5 rounded-2xl border border-[#eae7e0] dark:border-stone-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9e7938]">
                          Garment Specifications
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#161514] text-white dark:bg-white dark:text-[#161514]">
                          Qty: {order.quantity || 1}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-editorial text-xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                          {order.clothCategory}
                        </p>
                        <p className="text-xs text-[#524f48] dark:text-[#a39f96]">
                          Material: <span className="font-semibold text-[#161514] dark:text-white">{order.materialProvision || 'Customer Provided'}</span>
                          {order.materialType && ` (${order.materialType})`}
                        </p>
                      </div>

                      {/* Customization Notes */}
                      {order.customizationNote && (
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-[#eae7e0] dark:border-stone-800 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase text-[#7d7a73] dark:text-[#a39f96]">
                            Customization & Styling Note:
                          </span>
                          <p className="text-[#161514] dark:text-stone-200 italic leading-relaxed">
                            "{order.customizationNote}"
                          </p>
                        </div>
                      )}

                      {/* Custom Measurements Breakdown (if customer entered manual measurements) */}
                      {order.customMeasurements && (
                        <div className="p-3.5 rounded-xl bg-[#9e7938]/10 border border-[#9e7938]/30 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#9e7938]">
                            <Ruler className="w-3.5 h-3.5" />
                            <span className="uppercase tracking-wider text-[10px]">Customer Provided Measurements:</span>
                          </div>
                          <pre className="font-mono text-xs whitespace-pre-wrap text-[#161514] dark:text-stone-200 bg-white/60 dark:bg-black/30 p-2.5 rounded-lg border border-[#9e7938]/20">
                            {order.customMeasurements}
                          </pre>
                        </div>
                      )}

                      <div className="text-[11px] text-[#7d7a73] dark:text-[#a39f96] flex items-center justify-between pt-1">
                        <span>Measurement Method:</span>
                        <span className="font-semibold text-[#161514] dark:text-stone-300">
                          {order.measurementType || 'HOME SERVICE'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Card Footer: Danger Zone Delete */}
                  <div className="pt-3 border-t border-[#f0ede6] dark:border-[#262422] flex items-center justify-between">
                    <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] font-mono">
                      User ID: {order.userId || 'Guest Checkout'}
                    </span>

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB B: OUR WORK & PORTFOLIO MANAGEMENT (CLOUDINARY + MONGODB) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'work' && (
        <div className="space-y-10">
          
          {/* 1. Upload Form Card with Generous Layout */}
          <div className="rounded-3xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] p-6 sm:p-8 shadow-subtle space-y-6">
            <div className="space-y-1 border-b border-[#f0ede6] dark:border-[#262422] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.24em] font-bold text-[#9e7938] uppercase">
                  Cloudinary Asset Upload
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Secure HTTPS
                </span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                Publish New Piece to Portfolio
              </h2>
              <p className="text-xs text-[#7d7a73] dark:text-[#a39f96]">
                Upload high-resolution photography of bespoke garments. Images are stored securely on Cloudinary, and strictly their HTTPS URL is recorded in MongoDB.
              </p>
            </div>

            <form onSubmit={handlePublishWork} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Garment Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96]">
                    Garment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWork.title}
                    onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                    placeholder="e.g. Bespoke Royal Navy Tuxedo"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-stone-700 text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96]">
                    Category *
                  </label>
                  <select
                    value={newWork.category}
                    onChange={(e) => setNewWork({ ...newWork, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-stone-700 text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40"
                  >
                    {WORK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description & Craftsmanship Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96]">
                    Craftsmanship Description
                  </label>
                  <textarea
                    rows={3}
                    value={newWork.description}
                    onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                    placeholder="e.g. Double-breasted tailored with pure Italian Merino wool with horn buttons..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#faf9f5] dark:bg-[#121110] border border-[#dedbd2] dark:border-stone-700 text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7d7a73] dark:text-[#a39f96]">
                    Aspect Ratio Display
                  </label>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'portrait', label: 'Portrait (3:4)' },
                      { id: 'square', label: 'Square (1:1)' },
                      { id: 'landscape', label: 'Landscape (4:3)' }
                    ].map(aspect => (
                      <button
                        key={aspect.id}
                        type="button"
                        onClick={() => setNewWork({ ...newWork, aspectRatio: aspect.id })}
                        className={`py-2 px-2 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                          newWork.aspectRatio === aspect.id
                            ? 'bg-[#161514] dark:bg-white text-white dark:text-[#161514] border-[#161514] dark:border-white shadow-xs'
                            : 'bg-[#faf9f5] dark:bg-[#121110] text-[#7d7a73] dark:text-[#a39f96] border-[#eae7e0] dark:border-stone-800 hover:border-[#9e7938]'
                        }`}
                      >
                        {aspect.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* IMAGE SELECTION & CLOUDINARY UPLOAD ZONE */}
              <div className="space-y-3 bg-[#faf9f5] dark:bg-[#121110] p-5 rounded-2xl border border-[#eae7e0] dark:border-stone-800">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#9e7938]">
                  Garment Photo (Cloudinary Engine)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  
                  {/* Option 1: File Picker to Cloudinary */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#524f48] dark:text-[#c4c0b6]">
                      1. Choose Image from Device:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-[#7d7a73] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#161514] file:text-white dark:file:bg-white dark:file:text-[#161514] hover:file:bg-[#9e7938] cursor-pointer"
                    />

                    {selectedImageFile && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleUploadImageToCloudinary}
                          disabled={isUploadingImage}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          <CloudUpload className="w-3.5 h-3.5" />
                          <span>{isUploadingImage ? 'Uploading to Cloudinary...' : 'Upload Now to Cloudinary'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Direct Image URL */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#524f48] dark:text-[#c4c0b6]">
                      2. Or Paste Direct Image URL:
                    </label>
                    <input
                      type="url"
                      value={newWork.imageUrl}
                      onChange={(e) => setNewWork({ ...newWork, imageUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/... or web URL"
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#181716] border border-[#dedbd2] dark:border-stone-700 text-xs text-[#161514] dark:text-[#f7f5f0] focus:outline-none focus:ring-2 focus:ring-[#9e7938]/40"
                    />
                  </div>
                </div>

                {/* Preview Image if selected or URL entered */}
                {(imagePreviewUrl || newWork.imageUrl) && (
                  <div className="pt-3 flex items-center gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-[#dedbd2] dark:border-stone-700">
                      <img
                        src={imagePreviewUrl || newWork.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'; }}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Image Ready for Portfolio
                      </span>
                      <p className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] font-mono break-all max-w-sm">
                        {newWork.imageUrl ? newWork.imageUrl : 'Selected from local device'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback messages */}
              {workFeedback.text && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  workFeedback.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400'
                    : workFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400'
                }`}>
                  {workFeedback.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{workFeedback.text}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetWorkForm}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#7d7a73] dark:text-[#a39f96] text-xs font-semibold hover:text-[#161514] dark:hover:text-white transition-colors"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={isPublishingWork || isUploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-[#161514] dark:bg-white text-white dark:text-[#161514] font-bold text-xs uppercase tracking-widest hover:bg-[#9e7938] dark:hover:bg-[#9e7938] dark:hover:text-white transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isPublishingWork ? 'Publishing to MongoDB...' : 'Publish Piece to Portfolio'}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Existing Published Pieces (with Delete Option) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eae7e0] dark:border-[#2e2b26]">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-[#161514] dark:text-[#f7f5f0]">
                  Published Portfolio Works ({workItems.length})
                </h3>
                <p className="text-xs text-[#7d7a73] dark:text-[#a39f96]">
                  Live bespoke pieces active in MongoDB Atlas portfolio.
                </p>
              </div>

              <button
                onClick={fetchWork}
                disabled={loadingWork}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-[#161514] dark:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingWork ? 'animate-spin' : ''}`} />
                <span>Refresh Works</span>
              </button>
            </div>

            {loadingWork && workItems.length === 0 && (
              <div className="py-12 text-center text-xs text-[#7d7a73]">
                Loading portfolio pieces...
              </div>
            )}

            {!loadingWork && workItems.length === 0 && (
              <div className="py-12 text-center text-xs text-[#7d7a73] dark:text-[#a39f96]">
                No portfolio items in MongoDB yet. Use the form above to publish your first bespoke work!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-[#181716] border border-[#eae7e0] dark:border-[#2e2b26] overflow-hidden shadow-subtle flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-stone-100 dark:bg-stone-900 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-editorial text-lg font-bold text-[#161514] dark:text-[#f7f5f0] leading-snug">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-[#7d7a73] dark:text-[#a39f96] line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#f0ede6] dark:border-[#262422] flex items-center justify-between">
                      <span className="text-[10px] text-[#7d7a73] dark:text-[#a39f96] font-mono truncate max-w-[120px]">
                        {item.id}
                      </span>

                      {/* Delete Post Option */}
                      <button
                        onClick={() => handleDeleteWork(item.id, item.title)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete Post from MongoDB"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
