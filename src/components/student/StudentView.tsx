import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { useOrderTrackingStore } from '../../orderTrackingStore';
import { Vendor, MenuItem, SlotWindow, OrderStatus } from '../../types';
import {
  calculateDeliveryFee,
  formatRupees,
  isOrderingOpen,
  SLOT_TIMINGS,
} from '../../business-logic';
import { OrderStatusBadge } from '../common/OrderStatusBadge';
import { SlotBadge } from '../common/SlotBadge';
import { UpiPaymentModal } from '../common/UpiPaymentModal';
import {
  Search,
  ShoppingBag,
  Sparkles,
  MapPin,
  Clock,
  Star,
  Plus,
  Minus,
  Trash2,
  Leaf,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Utensils,
  History,
  X,
  ChevronDown,
  Phone,
  Bike,
  Flame,
  LogOut,
  Bell,
  SlidersHorizontal,
  Heart,
  ChevronRight,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const StudentView: React.FC = () => {
  const {
    currentUser,
    users,
    updateStudentProfile,
    vendors,
    hostels,
    orders,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    selectedSlot,
    setSelectedSlot,
    createOrder,
    activeStudentOrderId,
    setActiveStudentOrderId,
    settings,
    logout,
  } = useAppStore();

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pureVegOnlyFilter, setPureVegOnlyFilter] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'track' | 'history'>('browse');

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  // Profile modal state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    hostelBlock: currentUser.hostelBlock || 'Aryabhatta Hall',
    roomNumber: currentUser.roomNumber || 'A-204',
  });

  // Checkout submission states
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync profile form when currentUser changes
  useEffect(() => {
    setProfileForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      hostelBlock: currentUser.hostelBlock || 'Aryabhatta Hall',
      roomNumber: currentUser.roomNumber || 'A-204',
    });
  }, [currentUser]);

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const studentHostel = hostels.find(
    (h) => h.name === currentUser.hostelBlock || h.code === currentUser.hostelBlock
  );
  const isHostelStrictVeg = studentHostel?.vegOnlyEnforced || false;

  const isHostelPaused = settings.pausedHostelBlocks.includes(currentUser.hostelBlock);
  const orderingStatus = isOrderingOpen(selectedSlot, new Date(), settings.cutoffTime);
  const isBlocked = settings.globalOrderingPaused || isHostelPaused || !orderingStatus.isOpen;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleConfirmUpi = (enteredUpiId: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = createOrder({
        slot: selectedSlot,
        hostelBlock: profileForm.hostelBlock,
        roomNumber: profileForm.roomNumber,
      });

      setIsSubmitting(false);
      setShowUpiModal(false);

      if (res.success && res.orderId) {
        useOrderTrackingStore.getState().initOrderTracking(res.orderId);
        setActiveTab('track');
      }
    }, 1200);
  };

  const activeVendor = vendors.find((v) => v.id === cart[0]?.vendorId) || vendors[0];
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(currentUser.hostelBlock, activeVendor?.location || 'Stall A');
  const grandTotal = subtotal + (cart.length > 0 ? deliveryFee : 0);
  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const studentOrders = orders.filter((o) => o.studentId === currentUser.id);
  const trackedOrder = orders.find((o) => o.id === activeStudentOrderId) || studentOrders[0];

  const categoryChips = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'snacks', label: 'Burgers & Maggi', icon: '🍔' },
    { id: 'meals', label: 'Pizza & Thali', icon: '🍕' },
    { id: 'beverages', label: 'Cold Coffee & Chai', icon: '☕' },
    { id: 'desserts', label: 'Cookies & Desserts', icon: '🍪' },
  ];

  const allMenuItems = vendors.flatMap((v) =>
    v.menuItems.map((item) => ({
      ...item,
      vendorName: v.name,
      vendorLocation: v.location,
    }))
  );

  const filteredDishes = allMenuItems.filter((item) => {
    if (isHostelStrictVeg && !item.isVeg) return false;
    if (pureVegOnlyFilter && !item.isVeg) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.vendorName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="w-full h-full bg-[#0D0D0D] text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* 1. DELIVO TOP HEADER */}
      <div className="sticky top-0 z-30 bg-[#000000]/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between gap-3 mb-3">
          
          {/* Profile Section */}
          <div
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#FD6931]/20 border border-[#FD6931]/40 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/assets/img/profile.png"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-sm font-bold text-[#FD6931]">
                {currentUser.name ? currentUser.name[0] : 'A'}
              </span>
            </div>

            {/* Location Section */}
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#697586] flex items-center gap-1">
                <span>Delivery location</span>
                <ChevronDown className="w-3 h-3 text-[#FD6931]" />
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-1 truncate max-w-[170px]">
                <MapPin className="w-3.5 h-3.5 text-[#FD6931] shrink-0" />
                <span className="truncate">
                  {currentUser.hostelBlock?.split(' ')[0] || 'Aryabhatta'}, Rm {currentUser.roomNumber || 'A-204'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions (Notification & Cart) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors relative"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FD6931]" />
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className="w-9 h-9 rounded-full bg-[#FD6931]/15 border border-[#FD6931]/40 flex items-center justify-center text-[#FD6931] hover:bg-[#FD6931] hover:text-white transition-all relative"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#FD6931] text-white text-[9px] font-bold flex items-center justify-center border border-[#0D0D0D]">
                  {totalCartQty}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Header Title */}
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
          What would you prefer to eat today?
        </h1>

        {/* Search Bar & Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#697586] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu, canteen dishes..."
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-full pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-[#697586] outline-none focus:border-[#FD6931] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#697586] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setPureVegOnlyFilter(!pureVegOnlyFilter)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              pureVegOnlyFilter
                ? 'bg-[#FD6931] border-[#FD6931] text-white shadow-lg shadow-[#FD6931]/30'
                : 'bg-[#1A1A1A] border-white/10 text-[#697586] hover:text-white'
            }`}
            title="Toggle Veg Only filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SYSTEM WARNING BANNERS */}
      <div className="px-5 pt-3 space-y-2">
        {isHostelStrictVeg && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-2xl p-3 flex items-center gap-2.5 text-xs">
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Bhaskara Hall:</strong> Strict Vegetarian Policy Enforced.</span>
          </div>
        )}

        {isBlocked && (
          <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-2xl p-3 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Ordering Suspended</strong>
              <span>
                {settings.globalOrderingPaused
                  ? 'University administration has temporarily paused campus deliveries.'
                  : isHostelPaused
                  ? `Deliveries to ${currentUser.hostelBlock} are paused by warden.`
                  : orderingStatus.reason}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. TAB CONTENT */}

      {/* BROWSE TAB */}
      {activeTab === 'browse' && (
        <div className="flex-1 flex flex-col px-5 pt-4 pb-28 overflow-y-auto hide-scrollbar space-y-6">

          {/* DELIVERY SLOT PICKER */}
          <div className="delivo-card-static p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#697586] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FD6931]" />
                <span>Select Delivery Slot</span>
              </span>
              <span className="text-[11px] text-[#FD6931] font-bold">
                Cutoff: {settings.cutoffTime}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Object.values(SlotWindow).map((slotKey) => {
                const isSelected = selectedSlot === slotKey;
                const slotConfig = SLOT_TIMINGS[slotKey];
                const slotStatus = isOrderingOpen(slotKey, new Date(), settings.cutoffTime);

                const iconMap: Record<SlotWindow, string> = {
                  [SlotWindow.MORNING]: '🌅',
                  [SlotWindow.LUNCH]: '🍱',
                  [SlotWindow.EVENING]: '☕',
                  [SlotWindow.NIGHT]: '🌙',
                };

                return (
                  <button
                    key={slotKey}
                    disabled={!slotStatus.isOpen}
                    onClick={() => setSelectedSlot(slotKey)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#FD6931] text-white shadow-md shadow-[#FD6931]/30 font-bold'
                        : slotStatus.isOpen
                        ? 'bg-white/5 text-white/90 hover:bg-white/10'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-base">{iconMap[slotKey]}</span>
                    <span className="text-[10px] font-bold mt-0.5 capitalize">{slotKey.toLowerCase()}</span>
                    <span className="text-[8px] opacity-70 mt-0.5">
                      {slotStatus.isOpen ? slotConfig.label.split('(')[1]?.replace(')', '') : 'Closed'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CATEGORIES SCROLL */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">Categories</h2>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 hide-scrollbar">
              {/* Veg filter pill */}
              <button
                onClick={() => setPureVegOnlyFilter(!pureVegOnlyFilter)}
                className={`delivo-chip ${pureVegOnlyFilter || isHostelStrictVeg ? 'active' : ''}`}
              >
                <span>🥗</span>
                <span>Veg Only</span>
              </button>

              {categoryChips.map((chip) => {
                const isSelected = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`delivo-chip ${isSelected ? 'active' : ''}`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUPER DEALS 🔥 (HORIZONTAL RAIL) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>Super Deals</span>
                <span className="text-[#FD6931]">🔥</span>
              </h2>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold text-[#FD6931] hover:underline"
              >
                See All
              </button>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {filteredDishes.slice(0, 5).map((item) => {
                const isFav = favorites.includes(item.id);
                const cartItem = cart.find((c) => c.menuItem.id === item.id);
                const qty = cartItem?.quantity || 0;
                const vendorObj = vendors.find((v) => v.id === item.vendorId);

                return (
                  <div
                    key={item.id}
                    className="delivo-card w-64 shrink-0 flex flex-col justify-between group"
                  >
                    {/* Image Container */}
                    <div className="h-36 w-full relative overflow-hidden bg-neutral-900">
                      <img
                        src={item.image || '/assets/img/onboarding-bg.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />

                      {/* Discount Badge */}
                      <span className="absolute top-2.5 left-2.5 badge-discount shadow-md">
                        10% OFF
                      </span>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-[#FD6931] text-[#FD6931]' : 'text-white'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className="font-bold text-sm text-white truncate max-w-[150px]">
                            {item.name}
                          </h3>
                          <span className="font-extrabold text-sm text-[#FD6931]">
                            ₹{item.price}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#697586] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FD6931]" />
                          <span>15-20 min</span>
                          <span>•</span>
                          <span className="truncate">{item.vendorName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>4.8</span>
                          <span className="text-[10px] text-[#697586] font-medium">(32)</span>
                        </div>

                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-[#1F1F1F] rounded-lg border border-[#FD6931]/30 p-1">
                            <button
                              onClick={() => updateCartQuantity(item.id, qty - 1)}
                              className="w-5 h-5 rounded bg-[#2D2D2D] text-white flex items-center justify-center font-bold text-xs hover:bg-[#FD6931]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-xs text-white px-1">{qty}</span>
                            <button
                              onClick={() => vendorObj && addToCart(item, vendorObj)}
                              className="w-5 h-5 rounded bg-[#FD6931] text-white flex items-center justify-center font-bold text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => vendorObj && addToCart(item, vendorObj)}
                            className="px-3.5 py-1.5 rounded-full bg-[#FD6931] text-white font-bold text-xs hover:bg-[#e55a24] active:scale-95 transition-all shadow-md shadow-[#FD6931]/20 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROMO AD BANNER */}
          <div className="rounded-3xl bg-gradient-to-r from-[#FD6931] to-amber-600 p-5 relative overflow-hidden shadow-xl shadow-[#FD6931]/15">
            <div className="relative z-10 max-w-[65%] space-y-2">
              <span className="bg-black/30 backdrop-blur-md text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block">
                Campus Special Offer
              </span>
              <h3 className="text-lg font-black text-white leading-tight">
                Up To 30% Off On First Hostel Order
              </h3>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 rounded-full bg-white text-[#FD6931] font-extrabold text-xs hover:bg-neutral-100 transition-colors shadow-md"
              >
                Order Now
              </button>
            </div>

            {/* Decorative background graphics */}
            <div className="absolute -right-4 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-md pointer-events-none" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-5xl opacity-80 pointer-events-none">
              🍕
            </div>
          </div>

          {/* HOT DEALS 🔥 (VERTICAL LIST) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>Hot Deals</span>
                <span className="text-[#FD6931]">🔥</span>
              </h2>
              <span className="text-xs text-[#697586] font-medium">
                {filteredDishes.length} Items Available
              </span>
            </div>

            <div className="space-y-3">
              {filteredDishes.map((item) => {
                const cartItem = cart.find((c) => c.menuItem.id === item.id);
                const qty = cartItem?.quantity || 0;
                const vendorObj = vendors.find((v) => v.id === item.vendorId);

                return (
                  <div
                    key={item.id}
                    className="delivo-card p-3 flex items-center gap-3.5 group"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-20 h-20 rounded-2xl bg-neutral-900 relative overflow-hidden shrink-0">
                      <img
                        src={item.image || '/assets/img/onboarding-bg.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                      <div className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full border border-white/40 ${
                        item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                    </div>

                    {/* Item Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-bold text-sm text-white truncate">
                        {item.name}
                      </h3>
                      <div className="text-[11px] text-[#697586] flex items-center gap-1.5">
                        <span>15-25 min</span>
                        <span>•</span>
                        <span className="truncate">{item.vendorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#FD6931]">
                          ₹{item.price}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>4.7</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-xl border border-[#FD6931]/30 p-1">
                          <button
                            onClick={() => updateCartQuantity(item.id, qty - 1)}
                            className="w-6 h-6 rounded-lg bg-[#2D2D2D] text-white flex items-center justify-center font-bold text-xs hover:bg-[#FD6931]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs text-white px-1.5">{qty}</span>
                          <button
                            onClick={() => vendorObj && addToCart(item, vendorObj)}
                            className="w-6 h-6 rounded-lg bg-[#FD6931] text-white flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => vendorObj && addToCart(item, vendorObj)}
                          className="px-4 py-2 rounded-full bg-[#FD6931] text-white font-bold text-xs hover:bg-[#e55a24] active:scale-95 transition-all shadow-md shadow-[#FD6931]/20"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CART TAB */}
      {activeTab === 'cart' && (
        <div className="flex-1 flex flex-col px-5 pt-4 pb-28 overflow-y-auto hide-scrollbar space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('browse')}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <h2 className="text-lg font-black text-white">Your Cart</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#FD6931]/10 border border-[#FD6931]/20 flex items-center justify-center text-4xl">
                🛒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Your Cart is Empty</h3>
                <p className="text-xs text-[#697586] max-w-xs">
                  Add some delicious Maggi, Dosa, or Beverages to start your hostel order!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-6 py-2.5 rounded-full bg-[#FD6931] text-white font-bold text-xs shadow-lg shadow-[#FD6931]/30"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vendor Info */}
              <div className="bg-[#1A1A1A] rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FD6931]/20 flex items-center justify-center text-[#FD6931] font-bold text-lg">
                  🍳
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{cart[0]?.vendorName}</div>
                  <div className="text-[10px] text-[#697586]">Ordering from campus stall</div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="delivo-card p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-neutral-900 overflow-hidden shrink-0">
                        <img
                          src={item.menuItem.image || '/assets/img/onboarding-bg.jpg'}
                          alt={item.menuItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.menuItem.name}</div>
                        <div className="text-xs text-[#FD6931] font-semibold">₹{item.menuItem.price} each</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-xl border border-white/10 p-1">
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-[#2D2D2D] text-white flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-white px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-[#FD6931] text-white flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Summary Table */}
              <div className="delivo-card p-4 space-y-2.5 text-xs">
                <div className="font-bold text-white border-b border-white/10 pb-2">Bill Summary</div>
                <div className="flex justify-between text-[#697586]">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#697586]">
                  <span>Hostel Delivery Fee</span>
                  <span className="font-semibold text-white">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-[#697586]">
                  <span>Platform Service Fee</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-black text-sm text-white">
                  <span>Grand Total</span>
                  <span className="text-[#FD6931]">₹{grandTotal}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                disabled={isBlocked}
                onClick={() => setShowUpiModal(true)}
                className="w-full py-3.5 rounded-full bg-[#FD6931] text-white font-extrabold text-sm hover:bg-[#e55a24] active:scale-[0.98] transition-all shadow-xl shadow-[#FD6931]/30 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout (₹{grandTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TRACK TAB */}
      {activeTab === 'track' && (
        <div className="flex-1 flex flex-col px-5 pt-4 pb-28 overflow-y-auto hide-scrollbar space-y-5">
          <h2 className="text-lg font-black text-white border-b border-white/10 pb-2">Live Order Status</h2>

          {trackedOrder ? (
            <div className="delivo-card p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-xs text-[#697586]">Order ID</div>
                  <div className="font-mono font-bold text-sm text-white">{trackedOrder.id}</div>
                </div>
                <OrderStatusBadge status={trackedOrder.status} />
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[#697586] block text-[10px]">Destination</span>
                  <span className="font-bold text-white">{trackedOrder.hostelBlock}, Rm {trackedOrder.roomNumber}</span>
                </div>
                <div>
                  <span className="text-[#697586] block text-[10px]">OTP Handover Code</span>
                  <span className="font-mono font-black text-sm text-[#FD6931]">{trackedOrder.otpCode}</span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-white">Order Items ({trackedOrder.items.length})</div>
                {trackedOrder.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-[#697586]">
                    <span>{i.quantity}x {i.name}</span>
                    <span className="font-semibold text-white">₹{i.priceEach * i.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#697586] text-xs">No active order tracked right now.</div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col px-5 pt-4 pb-28 overflow-y-auto hide-scrollbar space-y-4">
          <h2 className="text-lg font-black text-white border-b border-white/10 pb-2">Order History</h2>

          {studentOrders.length === 0 ? (
            <div className="text-center py-12 text-[#697586] text-xs">No past orders found.</div>
          ) : (
            <div className="space-y-3">
              {studentOrders.map((ord) => (
                <div key={ord.id} className="delivo-card p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-mono font-bold text-white text-sm">{ord.id}</div>
                    <div className="text-[#697586] mt-0.5">{ord.vendorName} • ₹{ord.totalAmount}</div>
                  </div>
                  <OrderStatusBadge status={ord.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. FLOATING CART PILL (WHEN ITEMS ADDED IN BROWSE TAB) */}
      {activeTab === 'browse' && cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-delivo-fade">
          <button
            onClick={() => setActiveTab('cart')}
            className="delivo-cart-pill w-full p-3.5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FD6931] flex items-center justify-center font-bold text-white text-sm">
                {totalCartQty}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-white">
                  {totalCartQty} ITEM{totalCartQty > 1 ? 'S' : ''}
                </div>
                <div className="text-xs font-bold text-[#FD6931]">₹{grandTotal}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-[#FD6931] text-white px-4 py-2 rounded-full shadow-md">
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* 5. DELIVO BOTTOM NAVIGATION DOCK */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 delivo-bottom-nav py-2.5">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center px-4">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === 'browse' ? 'text-[#FD6931]' : 'text-[#697586] hover:text-white'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className={`text-[10px] mt-1 ${activeTab === 'browse' ? 'font-bold' : 'font-medium'}`}>
              Discover
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center justify-center relative transition-all ${
              activeTab === 'cart' ? 'text-[#FD6931]' : 'text-[#697586] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className={`text-[10px] mt-1 ${activeTab === 'cart' ? 'font-bold' : 'font-medium'}`}>
              Cart
            </span>
            {totalCartQty > 0 && (
              <span className="absolute top-0 right-5 w-4 h-4 rounded-full bg-[#FD6931] text-white text-[9px] font-bold flex items-center justify-center">
                {totalCartQty}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex flex-col items-center justify-center relative transition-all ${
              activeTab === 'track' ? 'text-[#FD6931]' : 'text-[#697586] hover:text-white'
            }`}
          >
            <Bike className="w-5 h-5" />
            <span className={`text-[10px] mt-1 ${activeTab === 'track' ? 'font-bold' : 'font-medium'}`}>
              Live Order
            </span>
            {trackedOrder && trackedOrder.status !== OrderStatus.DELIVERED && (
              <span className="absolute top-1 right-4 w-2 h-2 rounded-full bg-[#FD6931] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === 'history' ? 'text-[#FD6931]' : 'text-[#697586] hover:text-white'
            }`}
          >
            <History className="w-5 h-5" />
            <span className={`text-[10px] mt-1 ${activeTab === 'history' ? 'font-bold' : 'font-medium'}`}>
              History
            </span>
          </button>
        </div>
      </nav>

      {/* PROFILE / ROOM SWITCHER MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#161616] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-delivo-fade text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Student Profile & Address</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label className="text-[#697586] font-semibold block mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FD6931]"
                />
              </div>

              <div>
                <label className="text-[#697586] font-semibold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono outline-none focus:border-[#FD6931]"
                />
              </div>

              <div>
                <label className="text-[#697586] font-semibold block mb-1">Hostel Block</label>
                <select
                  value={profileForm.hostelBlock}
                  onChange={(e) => setProfileForm({ ...profileForm, hostelBlock: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FD6931]"
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.name} className="bg-[#0D0D0D] text-white">
                      {h.name} {h.vegOnlyEnforced ? '🥗 (Strict Veg)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#697586] font-semibold block mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.roomNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, roomNumber: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono outline-none focus:border-[#FD6931]"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl text-[#697586] font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FD6931] text-white font-bold hover:bg-[#e55a24]"
                >
                  Update Profile
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Student Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI PAYMENT MODAL */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        onConfirmPayment={handleConfirmUpi}
        amount={grandTotal}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        vpa={settings.upiVpa}
        upiName={settings.upiName}
        hostelBlock={currentUser.hostelBlock || 'Aryabhatta Hall'}
        roomNumber={currentUser.roomNumber || 'A-204'}
        slotLabel={SLOT_TIMINGS[selectedSlot].label}
        vendorName={cart.length > 0 ? cart[0].vendorName : 'Campus Stall'}
        isProcessing={isSubmitting}
      />
    </div>
  );
};
