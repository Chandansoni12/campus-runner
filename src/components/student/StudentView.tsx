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
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
  KeyRound,
  Utensils,
  History,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  Phone,
  Bike,
  Flame,
  Coffee,
  Compass,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CookingPot,
  Sparkle,
  LogOut,
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
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'track' | 'history'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pureVegOnlyFilter, setPureVegOnlyFilter] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [browsePage, setBrowsePage] = useState(0); // 0: Home, 1: Popular Dishes, 2+: Stalls
  const [cartPage, setCartPage] = useState(0); // 0: Items, 1: Bill & Checkout
  const [historyPage, setHistoryPage] = useState(0);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [cookingInstruction, setCookingInstruction] = useState('');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || 'Aarav Sharma',
    phone: currentUser.phone || '9876543210',
    hostelBlock: currentUser.hostelBlock || 'Aryabhatta Hall (Block A)',
    roomNumber: currentUser.roomNumber || 'A-204',
  });

  // Identify student's hostel
  const studentHostel = hostels.find(
    (h) => h.name === currentUser.hostelBlock || h.code === currentUser.hostelBlock
  );
  const isHostelStrictVeg = studentHostel?.vegOnlyEnforced ?? false;

  // Selected vendor
  const activeVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // Cart financial summary
  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartVendor = cart.length > 0 ? vendors.find((v) => v.id === cart[0].vendorId) : null;
  const deliveryFee = cartVendor
    ? calculateDeliveryFee(currentUser.hostelBlock || 'Block A', cartVendor.location)
    : 15;
  const grandTotal = subtotal + deliveryFee;

  // Tracked order (either active order or newest placed by this student)
  const studentOrders = orders.filter((o) => o.studentId === currentUser.id);
  const trackedOrder =
    studentOrders.find((o) => o.id === activeStudentOrderId) || studentOrders[0];

  // Dedicated real-time order tracking store with Supabase subscription
  const {
    trackOrder,
    currentStatus,
    connectionStatus,
    statusHistory,
    syncWithOrder,
  } = useOrderTrackingStore();

  useEffect(() => {
    if (trackedOrder?.id) {
      trackOrder(trackedOrder.id, trackedOrder);
    }
  }, [trackedOrder?.id]);

  useEffect(() => {
    if (trackedOrder) {
      syncWithOrder(trackedOrder);
    }
  }, [trackedOrder?.status, trackedOrder?.runnerName, trackedOrder?.otpCode]);

  // Check ordering availability
  const orderingStatus = isOrderingOpen(selectedSlot, new Date(), settings.cutoffTime);
  const isHostelPaused = settings.pausedHostelBlocks.includes(currentUser.hostelBlock || '');
  const isBlocked = settings.globalOrderingPaused || isHostelPaused || !orderingStatus.isOpen;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleStartCheckout = () => {
    setOrderError(null);
    if (cart.length === 0) return;
    if (isBlocked) {
      setOrderError(
        settings.globalOrderingPaused
          ? 'Ordering is paused campus-wide by administration.'
          : isHostelPaused
          ? `Deliveries to ${currentUser.hostelBlock} are temporarily suspended.`
          : orderingStatus.reason || 'Ordering is closed.'
      );
      return;
    }
    setShowUpiModal(true);
  };

  const handleConfirmUpi = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = createOrder({
        slot: selectedSlot,
        hostelBlock: currentUser.hostelBlock || 'Aryabhatta Hall (Block A)',
        roomNumber: currentUser.roomNumber || 'A-204',
      });
      setIsSubmitting(false);
      setShowUpiModal(false);
      if (res.success && res.orderId) {
        setActiveStudentOrderId(res.orderId);
        setActiveTab('track');
      } else {
        setOrderError(res.error || 'Failed to place order.');
      }
    }, 600);
  };

  // Swiggy/Zomato Quick Category Chips
  const categoryChips = [
    { id: 'all', label: 'All Dishes', icon: '🍽️' },
    { id: 'meal', label: 'Thali & Meals', icon: '🍛' },
    { id: 'breakfast', label: 'Dosa & Tiffin', icon: '🥞' },
    { id: 'snacks', label: 'Maggi & Rolls', icon: '🍜' },
    { id: 'beverage', label: 'Chai & Shakes', icon: '🧋' },
    { id: 'bakery', label: 'Puffs & Cafe', icon: '🥐' },
  ];

  // Filtered stalls
  const filteredVendors = vendors.filter((vendor) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = vendor.name.toLowerCase().includes(q);
      const matchCuisine = vendor.cuisineTag.toLowerCase().includes(q);
      const matchItems = vendor.menuItems.some((i) => i.name.toLowerCase().includes(q));
      if (!matchName && !matchCuisine && !matchItems) return false;
    }
    return true;
  });

  // Calculate stall pagination
  const STALLS_PER_PAGE = 2;
  const maxStallPages = Math.ceil(filteredVendors.length / STALLS_PER_PAGE);
  const totalBrowsePages = 2 + maxStallPages; // 0: Home, 1: Popular, 2+: Stalls

  return (
    <div className="w-full h-full bg-[#FAFAFA] text-[#1A1A1A] flex flex-col relative overflow-hidden">
      {/* 1. TOP HEADER */}
      <div className="sticky top-0 z-30 clean-header">
        {/* Top Row: Search / Location / Cart */}
        <div className="flex items-center justify-between gap-3">
          {/* Search Icon */}
          <button
            onClick={() => document.getElementById('mobile-search-input')?.focus()}
            className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:bg-[#F2F2F2] transition-colors"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Location Picker */}
          <button
            id="mobile-address-switcher-btn"
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E5E5] hover:bg-[#F2F2F2] transition-colors group"
          >
            <MapPin className="w-4 h-4 text-[#6B6B6B]" />
            <span className="text-sm font-semibold text-[#1A1A1A] truncate max-w-[180px]">
              {currentUser.hostelBlock?.split(' ')[0] || 'Campus'}, Rm {currentUser.roomNumber || 'A-204'}
            </span>
            <ChevronDown className="w-4 h-4 text-[#ACACAC] group-hover:text-[#6B6B6B] transition-colors" />
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setActiveTab('cart')}
            className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:bg-[#F2F2F2] transition-colors relative"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {totalCartQty > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#34A853] text-white text-[10px] font-bold flex items-center justify-center">
                {totalCartQty}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-[#ACACAC] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 'Butter Maggi', 'Masala Dosa', 'Cold Coffee'..."
            className="w-full bg-[#F2F2F2] border-none rounded-full pl-11 pr-10 py-3 text-sm text-[#1A1A1A] placeholder:text-[#ACACAC] outline-none focus:ring-2 focus:ring-[#2D2D2D]/20 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ACACAC] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. WARNING BANNERS */}
      <div className="px-4 pt-3 space-y-2">
        {isHostelStrictVeg && (
          <div
            id="veg-policy-pill"
            className="alert-success p-3 flex items-center gap-2.5 text-sm"
          >
            <Leaf className="w-5 h-5 text-[#34A853] shrink-0" />
            <span className="leading-tight font-medium">
              <strong className="font-bold">Bhaskara Hall policy:</strong> Only vegetarian dishes available.
            </span>
          </div>
        )}

        {isBlocked && (
          <div
            id="student-ordering-blocked-banner"
            className="alert-warning p-3.5 flex items-start gap-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="block font-bold mb-0.5">Ordering Temporarily Paused</strong>
              <span className="font-medium text-red-700/80">
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

      {/* TAB A: BROWSE DISHES & STALLS */}
      {activeTab === 'browse' && (
        <div className="flex-1 flex flex-col px-4 pt-5 pb-32 overflow-y-auto no-scrollbar space-y-7">
          {/* HERO HEADING */}
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1A1A1A] leading-tight tracking-tight">
              Craving some<br />delicious today?
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-2 font-medium">
              Campus food delivered to your hostel room
            </p>
          </div>

          {/* DELIVERY SLOT PICKER */}
          <div className="card-elevated-static p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2D2D2D]" />
                <span>Delivery Slot</span>
              </span>
              <span className="text-xs text-[#ACACAC] font-semibold">
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
                    id={`mobile-slot-${slotKey.toLowerCase()}`}
                    disabled={!slotStatus.isOpen}
                    onClick={() => setSelectedSlot(slotKey)}
                    className={`py-2.5 px-1.5 rounded-2xl text-center flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#2D2D2D] text-white shadow-md'
                        : slotStatus.isOpen
                        ? 'bg-[#F2F2F2] text-[#1A1A1A] hover:bg-[#E8E8E8]'
                        : 'bg-[#F8F8F8] text-[#CACACA] cursor-not-allowed'
                    }`}
                  >
                    <span className="text-lg">{iconMap[slotKey]}</span>
                    <span className="text-[11px] font-bold mt-1 capitalize">{slotKey.toLowerCase()}</span>
                    <span className="text-[9px] font-medium opacity-70 mt-0.5">
                      {slotStatus.isOpen ? slotConfig.label.split('(')[1].replace(')', '') : 'Closed'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CATEGORY CHIPS */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {/* Veg filter chip */}
            <button
              id="quick-veg-filter-btn"
              onClick={() => setPureVegOnlyFilter(!pureVegOnlyFilter)}
              className={pureVegOnlyFilter || isHostelStrictVeg ? 'chip-active' : 'chip-default'}
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
                  className={isSelected ? 'chip-active' : 'chip-default'}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* POPULAR DISH CARDS */}
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
              Popular Near You
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {vendors
                .flatMap((v) =>
                  v.menuItems.map((item) => ({ ...item, vendorName: v.name, vendorLocation: v.location }))
                )
                .filter((item) => {
                  if (isHostelStrictVeg && !item.isVeg) return false;
                  if (pureVegOnlyFilter && !item.isVeg) return false;
                  if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    if (!item.name.toLowerCase().includes(q)) return false;
                  }
                  return true;
                })
                .slice(0, 10)
                .map((item) => {
                  const cartItem = cart.find((c) => c.menuItem.id === item.id);
                  const qty = cartItem?.quantity || 0;

                  return (
                    <div
                      key={item.id}
                      className="card-elevated flex flex-col justify-between group"
                    >
                      {/* Food Image */}
                      <div className="h-36 w-full bg-[#F2F2F2] relative overflow-hidden">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Price Badge */}
                        <div className="absolute bottom-2 left-2 price-badge">
                          ₹{item.price}
                        </div>
                        {/* Veg / Non-Veg indicator */}
                        <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.isVeg ? 'border-[#34A853]' : 'border-red-500'
                        }`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            item.isVeg ? 'bg-[#34A853]' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>

                      {/* Item Info */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#1A1A1A] leading-snug line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-[#ACACAC] font-medium mt-0.5 line-clamp-1">
                            {item.vendorName}
                          </p>
                        </div>

                        <div className="flex items-center justify-end pt-2">
                          {qty > 0 ? (
                            <div className="qty-stepper">
                              <button onClick={() => updateCartQuantity(item.id, qty - 1)}>
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="qty-value">{qty}</span>
                              <button onClick={() => updateCartQuantity(item.id, qty + 1)}>
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                const vendorObj = vendors.find((v) => v.id === item.vendorId) || vendors[0];
                                const res = addToCart(item, vendorObj);
                                if (!res.success && res.message) alert(res.message);
                              }}
                              className="btn-add"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* FOOD COURT STALL CARDS */}
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
              Campus Food Court Stalls
            </h2>

            <div className="space-y-4">
              {filteredVendors
                .map((vendor) => {
                const availableItems = vendor.menuItems.filter((i) => {
                  if (isHostelStrictVeg && !i.isVeg) return false;
                  if (pureVegOnlyFilter && !i.isVeg) return false;
                  return true;
                });

                return (
                  <div
                    key={vendor.id}
                    id={`mobile-vendor-card-${vendor.id}`}
                    onClick={() => setSelectedVendorId(vendor.id)}
                    className="card-elevated cursor-pointer group"
                  >
                    {/* Cover Banner */}
                    <div className="h-32 w-full bg-[#F2F2F2] relative overflow-hidden">
                      <img
                        src={vendor.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'}
                        alt={vendor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#34A853] text-white text-xs font-bold shadow flex items-center gap-1">
                        <span>{vendor.rating}</span>
                        <Star className="w-3 h-3 fill-white" />
                      </div>
                    </div>

                    {/* Stall Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-base text-[#1A1A1A]">{vendor.name}</h3>
                      <p className="text-xs text-[#ACACAC] font-medium mt-0.5">{vendor.cuisineTag}</p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-[#6B6B6B] font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>15-20 min</span>
                        </div>
                        <div>
                          Fee: ₹{calculateDeliveryFee(currentUser.hostelBlock || '', vendor.location)}
                        </div>
                        <span className="text-[#34A853] font-bold ml-auto">
                          {availableItems.length} items
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: CART & CHECKOUT */}
      {activeTab === 'cart' && (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-28">
          {/* Cart Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('browse')} className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:bg-[#F2F2F2] transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Cart</h2>
            </div>
            {cart.length > 0 && (
              <button
                id="clear-cart-btn"
                onClick={clearCart}
                className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#ACACAC] hover:text-red-500 hover:border-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#F2F2F2] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#ACACAC]" />
              </div>
              <h3 className="font-bold text-[#1A1A1A] text-base">Your cart is empty</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xs">
                Explore campus stalls and add your favorite dishes.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-6 py-2.5 rounded-full bg-[#2D2D2D] text-white text-sm font-bold hover:bg-[#1A1A1A] transition-colors"
              >
                Browse Stalls
              </button>
            </div>
          ) : (
            <div className="px-4 space-y-4 flex-1 flex flex-col">
              {/* Cart Items */}
              <div className="space-y-1">
                {cart.map((c) => (
                  <div key={c.menuItem.id} className="flex items-center gap-4 py-4 border-b border-[#F2F2F2] last:border-b-0">
                    {/* Circular Food Image */}
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F2F2F2] shrink-0 shadow-sm">
                      <img
                        src={c.menuItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                        alt={c.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#1A1A1A] text-sm">{c.menuItem.name}</h4>
                      <p className="text-xs text-[#ACACAC] font-medium mt-0.5 line-clamp-1">
                        {c.vendorName} · {formatRupees(c.menuItem.price)} each
                      </p>

                      {/* Quantity Stepper */}
                      <div className="mt-2.5">
                        <div className="qty-stepper">
                          <button onClick={() => updateCartQuantity(c.menuItem.id, c.quantity - 1)}>
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="qty-value">{c.quantity}</span>
                          <button onClick={() => updateCartQuantity(c.menuItem.id, c.quantity + 1)}>
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cooking Instructions */}
              <input
                type="text"
                placeholder="Add cooking instructions (e.g. less spicy)..."
                value={cookingInstruction}
                onChange={(e) => setCookingInstruction(e.target.value)}
                className="w-full bg-[#F2F2F2] rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#ACACAC] outline-none focus:ring-2 focus:ring-[#2D2D2D]/15 transition-all"
              />

              {/* Bill Summary */}
              <div className="card-elevated-static p-4 space-y-2.5 text-sm mt-auto">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatRupees(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">{formatRupees(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Platform Fee</span>
                  <span className="font-bold text-[#34A853]">Free</span>
                </div>
                <div className="pt-2.5 mt-1 border-t border-[#E5E5E5] flex justify-between text-base font-bold text-[#1A1A1A]">
                  <span>Total</span>
                  <span>{formatRupees(grandTotal)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="flex items-center justify-between text-sm px-1">
                <div className="flex items-center gap-2 text-[#6B6B6B]">
                  <MapPin className="w-4 h-4 text-[#2D2D2D]" />
                  <span>
                    <strong className="text-[#1A1A1A]">{currentUser.hostelBlock?.split(' ')[0]}</strong>, Rm {currentUser.roomNumber}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-[#2D2D2D] font-bold text-sm hover:underline"
                >
                  Change
                </button>
              </div>

              {orderError && (
                <div className="alert-warning p-3 text-sm">{orderError}</div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center gap-3 pt-2 pb-4">
                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#E5E5E5] text-[#6B6B6B] text-sm font-semibold hover:bg-[#F2F2F2] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
                <button
                  id="proceed-upi-checkout-btn"
                  disabled={isBlocked}
                  onClick={handleStartCheckout}
                  className="flex-1 py-3.5 rounded-2xl bg-[#2D2D2D] hover:bg-[#1A1A1A] disabled:bg-[#E5E5E5] disabled:text-[#ACACAC] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB C: LIVE ORDER TRACKER */}
      {activeTab === 'track' && (
        <div className="flex-1 flex flex-col px-4 pt-4 pb-28 overflow-y-auto no-scrollbar">
          {!trackedOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F2F2F2] flex items-center justify-center">
                <Clock className="w-7 h-7 text-[#ACACAC]" />
              </div>
              <h3 className="font-bold text-[#1A1A1A]">No active orders</h3>
              <p className="text-sm text-[#6B6B6B]">Place an order to track your delivery here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card-elevated-static p-5 space-y-4">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F2F2F2]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1A1A1A] text-sm">{trackedOrder.id}</span>
                      <OrderStatusBadge status={trackedOrder.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#ACACAC] mt-0.5">
                      {trackedOrder.vendorName} • {new Date(trackedOrder.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <SlotBadge slot={trackedOrder.slot} size="sm" />
                </div>

                {trackedOrder.status === OrderStatus.OUT_FOR_DELIVERY ? (
                  <div id="student-handover-otp-box" className="bg-[#FFF8F0] border-2 border-[#FF9500] rounded-2xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#FF9500] uppercase">
                      <KeyRound className="w-4 h-4" />
                      <span>Share with runner at door</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 my-2">
                      {trackedOrder.otpCode.split('').map((digit, idx) => (
                        <div key={idx} className="w-11 h-14 rounded-xl bg-white border-2 border-[#FF9500]/40 flex items-center justify-center text-2xl font-mono font-black text-[#1A1A1A] shadow-sm">
                          {digit}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#6B6B6B]">
                      Runner <strong className="text-[#1A1A1A]">{trackedOrder.runnerName}</strong> will verify this OTP.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#F2F2F2] rounded-xl p-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#6B6B6B]">
                      <KeyRound className="w-4 h-4 text-[#2D2D2D]" />
                      <span>Handover OTP</span>
                    </div>
                    <span className="font-mono font-bold text-[#ACACAC]">
                      {trackedOrder.status === OrderStatus.DELIVERED ? '✓ Verified' : '••••'}
                    </span>
                  </div>
                )}

                {trackedOrder.runnerName && (() => {
                  const assignedRunner = users.find((u) => u.id === trackedOrder.runnerId || u.name === trackedOrder.runnerName);
                  const phoneNum = trackedOrder.runnerPhone || assignedRunner?.phone || '9876543210';
                  return (
                    <div className="bg-[#F8F8F8] rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center">
                          <Bike className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                            <span>{trackedOrder.runnerName}</span>
                            <span className="text-[10px] text-[#34A853] font-semibold">✓ Student</span>
                          </div>
                          <div className="text-xs text-[#ACACAC]">Campus Runner</div>
                        </div>
                      </div>
                      <a href={`tel:${phoneNum}`} className="w-10 h-10 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center hover:bg-[#1A1A1A] transition-colors" title="Call Runner">
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })()}

                <div className="space-y-4 pt-2">
                  <div className="text-xs font-bold text-[#ACACAC] uppercase tracking-wider">Live Progress</div>
                  <div className="space-y-3.5">
                    {[
                      { statusKey: OrderStatus.PLACED, title: 'Order Placed & Confirmed', subtitle: 'Sent to stall via UPI' },
                      { statusKey: OrderStatus.PREPARING, title: 'Kitchen Cooking & Packing', subtitle: 'Freshly prepared' },
                      { statusKey: OrderStatus.READY, title: 'Food Packed & Ready', subtitle: 'Waiting for runner pickup' },
                      { statusKey: OrderStatus.OUT_FOR_DELIVERY, title: 'Out for Delivery', subtitle: `Heading to ${trackedOrder.hostelBlock.split(' ')[0]}` },
                      { statusKey: OrderStatus.DELIVERED, title: 'Delivered & Completed', subtitle: 'OTP verified' },
                    ].map((step, idx) => {
                      const statusSeq = [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED];
                      const currentIdx = statusSeq.indexOf(trackedOrder.status);
                      const stepIdx = statusSeq.indexOf(step.statusKey);
                      const isComplete = currentIdx >= stepIdx;
                      const isCurrent = currentIdx === stepIdx;
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${isComplete ? 'bg-[#34A853] text-white' : 'bg-[#F2F2F2] text-[#ACACAC]'} ${isCurrent ? 'ring-4 ring-[#34A853]/20' : ''}`}>
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${isComplete ? 'text-[#1A1A1A]' : 'text-[#ACACAC]'}`}>{step.title}</div>
                            <div className="text-xs text-[#ACACAC]">{step.subtitle}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2F2F2] flex items-center justify-between text-xs text-[#ACACAC]">
                  <span>Sync engine:</span>
                  <span className="flex items-center gap-1.5 text-[#34A853] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                    <span>Realtime Live</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB D: ORDER HISTORY */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col px-4 pt-4 pb-28 overflow-y-auto no-scrollbar">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            Past Deliveries ({studentOrders.length})
          </h2>

          {studentOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F2F2F2] flex items-center justify-center">
                <History className="w-7 h-7 text-[#ACACAC]" />
              </div>
              <p className="text-sm text-[#6B6B6B]">No previous orders found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentOrders.map((ord) => (
                <div key={ord.id} className="card-elevated-static p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1A1A1A] text-sm">{ord.id}</span>
                      <OrderStatusBadge status={ord.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#ACACAC] mt-0.5">
                      {ord.vendorName} • {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-[#CACACA] mt-1 line-clamp-1">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-[#1A1A1A] text-sm">{formatRupees(ord.totalAmount)}</div>
                    <button
                      onClick={() => { setActiveStudentOrderId(ord.id); setActiveTab('track'); }}
                      className="text-[#2D2D2D] hover:underline text-xs font-bold mt-1 inline-block"
                    >
                      View Status →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FLOATING CART PILL */}
      {activeTab === 'browse' && cart.length > 0 && (
        <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto z-40 animate-bounce-in">
          <button
            id="mobile-floating-cart-pill"
            onClick={() => setActiveTab('cart')}
            className="cart-pill w-full p-3.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-white text-sm">
                {totalCartQty}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-wider">
                  {totalCartQty} ITEM{totalCartQty > 1 ? 'S' : ''}
                </div>
                <div className="text-xs font-bold text-white/70">{formatRupees(grandTotal)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold bg-white text-[#2D2D2D] px-4 py-2 rounded-xl">
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 clean-bottom-nav">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center px-4">
          <button id="mobile-nav-explore" onClick={() => setActiveTab('browse')} className={`py-2 flex flex-col items-center justify-center transition-all ${activeTab === 'browse' ? 'text-[#1A1A1A]' : 'text-[#ACACAC] hover:text-[#6B6B6B]'}`}>
            <Utensils className="w-5 h-5" />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'browse' ? 'font-bold' : 'font-medium'}`}>Discover</span>
          </button>
          <button id="mobile-nav-cart" onClick={() => setActiveTab('cart')} className={`py-2 flex flex-col items-center justify-center relative transition-all ${activeTab === 'cart' ? 'text-[#1A1A1A]' : 'text-[#ACACAC] hover:text-[#6B6B6B]'}`}>
            <ShoppingBag className="w-5 h-5" />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'cart' ? 'font-bold' : 'font-medium'}`}>Cart</span>
            {totalCartQty > 0 && (
              <span className="absolute top-0.5 right-5 w-4 h-4 rounded-full bg-[#34A853] text-white text-[9px] font-bold flex items-center justify-center">{totalCartQty}</span>
            )}
          </button>
          <button id="mobile-nav-track" onClick={() => setActiveTab('track')} className={`py-2 flex flex-col items-center justify-center relative transition-all ${activeTab === 'track' ? 'text-[#1A1A1A]' : 'text-[#ACACAC] hover:text-[#6B6B6B]'}`}>
            <Bike className="w-5 h-5" />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'track' ? 'font-bold' : 'font-medium'}`}>Live Order</span>
            {trackedOrder && trackedOrder.status !== OrderStatus.DELIVERED && (
              <span className="absolute top-1 right-4 w-2.5 h-2.5 rounded-full bg-[#34A853] animate-ping" />
            )}
          </button>
          <button id="mobile-nav-history" onClick={() => setActiveTab('history')} className={`py-2 flex flex-col items-center justify-center transition-all ${activeTab === 'history' ? 'text-[#1A1A1A]' : 'text-[#ACACAC] hover:text-[#6B6B6B]'}`}>
            <History className="w-5 h-5" />
            <span className={`text-[10px] mt-0.5 ${activeTab === 'history' ? 'font-bold' : 'font-medium'}`}>History</span>
          </button>
        </div>
      </nav>

      {/* PROFILE / ROOM SWITCHER MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-bounce-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F2]">
              <h3 className="font-bold text-[#1A1A1A] text-base">Delivery Address</h3>
              <button onClick={() => setIsEditingProfile(false)} className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#6B6B6B] hover:bg-[#E5E5E5] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4 text-sm">
              <div>
                <label className="text-[#6B6B6B] font-semibold block mb-1.5">Student Name</label>
                <input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-[#F2F2F2] rounded-xl px-4 py-2.5 text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#2D2D2D]/20 transition-all" />
              </div>
              <div>
                <label className="text-[#6B6B6B] font-semibold block mb-1.5">Phone Number</label>
                <input type="tel" required value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full bg-[#F2F2F2] rounded-xl px-4 py-2.5 text-[#1A1A1A] font-mono outline-none focus:ring-2 focus:ring-[#2D2D2D]/20 transition-all" />
              </div>
              <div>
                <label className="text-[#6B6B6B] font-semibold block mb-1.5">Hostel Block</label>
                <select value={profileForm.hostelBlock} onChange={(e) => setProfileForm({ ...profileForm, hostelBlock: e.target.value })} className="w-full bg-[#F2F2F2] rounded-xl px-4 py-2.5 text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#2D2D2D]/20 transition-all">
                  {hostels.map((h) => (
                    <option key={h.id} value={h.name}>{h.name} {h.vegOnlyEnforced ? '🥗 (Strict Veg)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#6B6B6B] font-semibold block mb-1.5">Room Number</label>
                <input type="text" required value={profileForm.roomNumber} onChange={(e) => setProfileForm({ ...profileForm, roomNumber: e.target.value })} className="w-full bg-[#F2F2F2] rounded-xl px-4 py-2.5 text-[#1A1A1A] font-mono outline-none focus:ring-2 focus:ring-[#2D2D2D]/20 transition-all" />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2.5 rounded-xl text-[#6B6B6B] font-semibold hover:bg-[#F2F2F2] transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#2D2D2D] text-white font-bold hover:bg-[#1A1A1A] transition-colors">Update Profile</button>
              </div>
            </form>

            <div className="pt-3 border-t border-[#F2F2F2]">
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm hover:bg-rose-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
