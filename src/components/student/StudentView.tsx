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
  User,
  Zap,
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

  const isHostelPaused = settings.pausedHostelBlocks.includes(currentUser.hostelBlock || '');
  const orderingStatus = isOrderingOpen(selectedSlot, new Date(), settings.cutoffTime || '22:00');
  const isBlocked = settings.globalOrderingPaused || isHostelPaused || !orderingStatus.isOpen;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleConfirmUpi = () => {
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
        useOrderTrackingStore.getState().trackOrder(res.orderId);
        setActiveTab('track');
      }
    }, 1200);
  };

  const activeVendor = vendors.find((v) => v.id === cart[0]?.vendorId) || vendors[0];
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(currentUser.hostelBlock || 'Aryabhatta Hall', activeVendor?.location || 'Stall A');
  const grandTotal = subtotal + (cart.length > 0 ? deliveryFee : 0);
  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const studentOrders = orders.filter((o) => o.studentId === currentUser.id);
  const trackedOrder = orders.find((o) => o.id === activeStudentOrderId) || studentOrders[0];

  const categoryChips = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'snacks', label: 'Maggi & Rolls', icon: '🍜' },
    { id: 'meals', label: 'Meals & Thali', icon: '🍱' },
    { id: 'beverages', label: 'Chai & Shakes', icon: '☕' },
    { id: 'desserts', label: 'Desserts & Snacks', icon: '🍪' },
  ];

  const allMenuItems = vendors.flatMap((v) =>
    v.menuItems.map((item) => ({
      ...item,
      vendorName: v.name,
      vendorLocation: v.location,
    }))
  );

  const filteredDishes = allMenuItems.filter((dish) => {
    if (pureVegOnlyFilter || isHostelStrictVeg) {
      if (!dish.isVeg) return false;
    }
    if (selectedCategory !== 'all') {
      if (dish.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = dish.name.toLowerCase().includes(q);
      const matchDesc = dish.description ? dish.description.toLowerCase().includes(q) : false;
      const matchVendor = dish.vendorName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchVendor) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* ─── 1. SIGNATURE DELIVO COMPACT ORANGE HEADER (FROM ui_design) ─── */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-top">
            {/* User Profile Avatar */}
            <div className="profile-section" onClick={() => setIsEditingProfile(true)} title="Profile & Room">
              <div className="profile-avatar-circle">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
              </div>
            </div>

            {/* Delivery Location Selector */}
            <div className="location-section" onClick={() => setIsEditingProfile(true)} title="Select Hostel / Room">
              <div className="location-label">
                <span>Delivery Location</span>
                <ChevronDown size={12} color="rgba(255,255,255,0.9)" />
              </div>
              <div className="location-address">
                <MapPin size={15} color="#FFFFFF" />
                <span>
                  {currentUser.hostelBlock?.split(' ')[0] || 'Aryabhatta'}, Rm {currentUser.roomNumber || 'A-204'}
                </span>
              </div>
            </div>

            {/* Notification / Cart / Veg Toggle */}
            <div className="notification-section">
              <button
                type="button"
                onClick={() => setPureVegOnlyFilter(!pureVegOnlyFilter)}
                style={{
                  background: pureVegOnlyFilter || isHostelStrictVeg ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                  color: pureVegOnlyFilter || isHostelStrictVeg ? '#10B981' : '#FFFFFF',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title="Toggle Veg Only"
              >
                <Leaf size={12} color={pureVegOnlyFilter || isHostelStrictVeg ? '#10B981' : '#FFFFFF'} />
                <span>VEG</span>
              </button>

              <div
                className="notification-icon-wrapper"
                onClick={() => setActiveTab('cart')}
                title="View Cart"
              >
                <ShoppingBag size={20} color="#FFFFFF" />
                {totalCartQty > 0 && <span className="notification-badge">{totalCartQty}</span>}
              </div>
            </div>
          </div>

          {/* Compact Delivo Headline */}
          <h1 className="header-title-compact">What would you prefer to eat today?</h1>

          {/* Search Bar (Signature White Pill from ui_design) */}
          <div className="search-section">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                id="delivo-search-input"
                type="text"
                className="search-input"
                placeholder="Search canteen dishes, snacks, rolls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: 0 }}
                >
                  <X size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPureVegOnlyFilter(!pureVegOnlyFilter)}
                  className="filter-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  title="Toggle Veg Only Filter"
                >
                  <SlidersHorizontal size={18} color={pureVegOnlyFilter ? '#FD6931' : '#787878'} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. SYSTEM POLICY WARNINGS (Hostel Veg & Cutoff) ─── */}
      <div style={{ padding: '0 20px', paddingTop: '8px' }}>
        {isHostelStrictVeg && (
          <div
            style={{
              backgroundColor: 'rgba(6, 78, 59, 0.4)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6EE7B7',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              marginBottom: '8px',
            }}
          >
            <Leaf size={16} color="#34D399" />
            <span><strong>Bhaskara Hall:</strong> Strict Vegetarian Policy Enforced. Non-veg items hidden.</span>
          </div>
        )}

        {isBlocked && (
          <div
            style={{
              backgroundColor: 'rgba(136, 19, 55, 0.4)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FDA4AF',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <AlertCircle size={16} color="#FB7185" style={{ marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block' }}>Ordering Suspended</strong>
              <span>
                {settings.globalOrderingPaused
                  ? 'University administration has temporarily paused campus deliveries.'
                  : isHostelPaused
                  ? `Deliveries to ${currentUser.hostelBlock} are currently paused by warden.`
                  : orderingStatus.reason}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. TAB CONTENT ─── */}

      {/* ──────── TAB 1: BROWSE / DISCOVER ──────── */}
      {activeTab === 'browse' && (
        <main className="home-content page-transition hide-scrollbar" style={{ paddingBottom: '110px' }}>
          
          {/* DELIVERY SLOT PICKER */}
          <div className="slot-card" style={{ marginBottom: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: 'var(--font-12)', fontWeight: 800, color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="#FD6931" />
                <span>Select Delivery Slot</span>
              </span>
              <span style={{ fontSize: '11px', color: '#FD6931', fontWeight: 800, background: 'rgba(253, 105, 49, 0.12)', border: '1px solid rgba(253, 105, 49, 0.25)', padding: '2px 8px', borderRadius: '8px' }}>
                Cutoff: {settings.cutoffTime}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
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
                    type="button"
                    disabled={!slotStatus.isOpen}
                    onClick={() => setSelectedSlot(slotKey)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: '18px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      border: isSelected ? '1.5px solid #FD6931' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(253, 105, 49, 0.3) 0%, rgba(253, 105, 49, 0.12) 100%)'
                        : slotStatus.isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                      color: isSelected ? '#FFFFFF' : slotStatus.isOpen ? 'var(--text-primary)' : 'rgba(255,255,255,0.25)',
                      boxShadow: isSelected ? '0 0 18px rgba(253, 105, 49, 0.35)' : 'none',
                      cursor: slotStatus.isOpen ? 'pointer' : 'not-allowed',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{iconMap[slotKey]}</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'capitalize', marginTop: '4px', letterSpacing: '0.02em' }}>
                      {slotKey.toLowerCase()}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 600, opacity: 0.85, marginTop: '2px', color: isSelected ? '#FD6931' : 'inherit' }}>
                      {slotStatus.isOpen ? slotConfig.label.split('(')[1]?.replace(')', '') : 'Closed'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CATEGORIES SECTION */}
          <div className="categories-section">
            <h2 className="section-title">Categories</h2>
            <div className="categories-scroll hide-scrollbar">
              <button
                type="button"
                onClick={() => setPureVegOnlyFilter(!pureVegOnlyFilter)}
                className={`category-btn ${pureVegOnlyFilter || isHostelStrictVeg ? 'active' : ''}`}
              >
                <span>🥗</span>
                <span>Veg Only</span>
              </button>

              {categoryChips.map((chip) => {
                const isSelected = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`category-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUPER DEALS 🔥 (HORIZONTAL SCROLL RAIL) */}
          <div className="deals-section">
            <div className="section-header">
              <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Super Deals <span style={{ color: 'var(--primary)' }}>🔥</span>
              </h2>
              <span className="see-all-link" onClick={() => setSelectedCategory('all')}>
                See All
              </span>
            </div>

            <div className="food-cards-scroll hide-scrollbar">
              {filteredDishes.slice(0, 6).map((item) => {
                const isFav = favorites.includes(item.id);
                const cartItem = cart.find((c) => c.menuItem.id === item.id);
                const qty = cartItem?.quantity || 0;
                const vendorObj = vendors.find((v) => v.id === item.vendorId);

                return (
                  <div key={item.id} className="food-card">
                    {/* Food Card Image */}
                    <div className="food-card-image">
                      <img
                        src={item.image || '/assets/img/onboarding-bg.jpg'}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                      <span className="discount-badge">10% OFF</span>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(item.id)}
                        className="favorite-btn"
                        title="Add to favorites"
                      >
                        <Heart
                          size={16}
                          fill={isFav ? 'var(--primary)' : 'none'}
                          color={isFav ? 'var(--primary)' : '#FFFFFF'}
                        />
                      </button>
                    </div>

                    {/* Food Card Content */}
                    <div className="food-card-content">
                      <div className="food-name-price">
                        <h3 className="food-name" title={item.name}>{item.name}</h3>
                        <span className="food-price">₹{item.price}</span>
                      </div>

                      <div className="food-delivery-info">
                        <Clock size={13} color="var(--primary)" />
                        <span>15-20 min • {item.vendorName}</span>
                      </div>

                      <div className="food-rating">
                        <Star size={14} fill="#FFC107" color="#FFC107" />
                        <span className="rating-value">4.8</span>
                        <span className="rating-count">(32 Reviews)</span>
                      </div>

                      {qty > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, qty - 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{qty} in cart</span>
                          <button
                            type="button"
                            onClick={() => vendorObj && addToCart(item, vendorObj)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="buy-now-btn"
                          onClick={() => vendorObj && addToCart(item, vendorObj)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DELIVO AD BANNER */}
          <div className="ad-banner">
            <div className="ad-content">
              <div className="ad-text">
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    background: 'rgba(0,0,0,0.25)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    width: 'fit-content',
                  }}
                >
                  Campus Special
                </span>
                <h3 className="ad-title">Special offers for you! Up to 30% off your first order</h3>
              </div>
              <button
                type="button"
                className="ad-cta"
                onClick={() => setSelectedCategory('all')}
              >
                Order Now
              </button>
            </div>
          </div>

          {/* HOT DEALS 🔥 (VERTICAL LIST) */}
          <div className="hot-deals-section">
            <div className="section-header">
              <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Hot Deals <span style={{ color: 'var(--primary)' }}>🔥</span>
              </h2>
              <span style={{ fontSize: 'var(--font-12)', color: 'var(--text-muted)' }}>
                {filteredDishes.length} Items Available
              </span>
            </div>

            <div className="hot-deals-list">
              {filteredDishes.map((item) => {
                const cartItem = cart.find((c) => c.menuItem.id === item.id);
                const qty = cartItem?.quantity || 0;
                const vendorObj = vendors.find((v) => v.id === item.vendorId);

                return (
                  <div key={item.id} className="hot-deal-card">
                    {/* Image */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={item.image || '/assets/img/onboarding-bg.jpg'}
                        alt={item.name}
                        className="hot-deal-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: item.isVeg ? '#10B981' : '#EF4444',
                          border: '1.5px solid #FFFFFF',
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="hot-deal-info">
                      <h3 className="hot-deal-title">{item.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-12)', color: 'var(--text-muted)' }}>
                        <Clock size={12} color="var(--primary)" />
                        <span>15-25 min</span>
                        <span>•</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.vendorName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: 'var(--font-16)', fontWeight: 700, color: 'var(--primary)' }}>
                          ₹{item.price}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#FFC107', fontWeight: 600 }}>
                          <Star size={12} fill="#FFC107" color="#FFC107" />
                          <span>4.7</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div>
                      {qty > 0 ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'var(--bg-input)',
                            padding: '4px 8px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, qty - 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{qty}</span>
                          <button
                            type="button"
                            onClick={() => vendorObj && addToCart(item, vendorObj)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="hot-deal-add"
                          onClick={() => vendorObj && addToCart(item, vendorObj)}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ──────── TAB 2: CART / CHECKOUT ──────── */}
      {activeTab === 'cart' && (
        <div className="checkout-screen page-transition" style={{ flex: 1, paddingBottom: '90px' }}>
          <div className="checkout-header">
            <button
              type="button"
              className="btn-back"
              onClick={() => setActiveTab('browse')}
            >
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <h2 className="checkout-page-title">Your Order Cart</h2>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                style={{ background: 'none', border: 'none', color: '#FF3B30', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          <div className="checkout-content hide-scrollbar">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(253, 105, 49, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                  🛒
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>Your Cart is Empty</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px' }}>
                    Browse canteen dishes and add items to your cart to enjoy high-speed delivery!
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0 28px', height: '48px' }}
                  onClick={() => setActiveTab('browse')}
                >
                  Browse Campus Menu
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Stall Source Info */}
                <div className="delivo-card-glass" style={{ borderRadius: '20px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(253, 105, 49, 0.25) 0%, rgba(253, 105, 49, 0.1) 100%)', border: '1px solid rgba(253, 105, 49, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                    🍳
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>{cart[0]?.vendorName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fast campus stall preparation</div>
                  </div>
                </div>

                {/* Items List */}
                <div className="checkout-items">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="checkout-item">
                      <img
                        src={item.menuItem.image || '/assets/img/onboarding-bg.jpg'}
                        alt={item.menuItem.name}
                        className="item-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                      <div className="item-details">
                        <h4 className="item-name">{item.menuItem.name}</h4>
                        <div className="item-price" style={{ color: '#FD6931', fontWeight: 800 }}>₹{item.menuItem.price}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.45)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Minus size={15} />
                        </button>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', color: '#FD6931', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="delivo-card-glass" style={{ borderRadius: '22px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 800, color: '#FFFFFF', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '15px', letterSpacing: '-0.01em' }}>
                    Payment Summary
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Items Subtotal</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 700 }}>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Hostel Runner Fee</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 700 }}>₹{deliveryFee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Platform Commission</span>
                    <span style={{ color: '#10B981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                    <span>To Pay</span>
                    <span style={{ color: '#FD6931' }}>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="button"
                  disabled={isBlocked}
                  onClick={() => setShowUpiModal(true)}
                  className="delivo-btn-primary"
                  style={{ marginTop: '8px', height: '52px', fontSize: '15px' }}
                >
                  Pay ₹{grandTotal} via Campus UPI
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────── TAB 3: LIVE ORDER TRACKING ──────── */}
      {activeTab === 'track' && (
        <div style={{ flex: 1, padding: '20px', paddingBottom: '110px', overflowY: 'auto' }} className="page-transition hide-scrollbar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>Live Order Tracker</h2>
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Order More
            </button>
          </div>

          {!trackedOrder ? (
            <div className="delivo-card-glass" style={{ textAlign: 'center', padding: '60px 24px', borderRadius: '24px' }}>
              <div style={{ fontSize: '42px', marginBottom: '14px' }}>📦</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No Active Orders</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '300px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                Your placed orders and live student runner dispatch will track right here in real time.
              </p>
              <button
                type="button"
                className="delivo-btn-primary"
                style={{ width: 'auto', padding: '0 28px', height: '46px', display: 'inline-flex', margin: '0 auto' }}
                onClick={() => setActiveTab('browse')}
              >
                Start Ordering
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Order Status Hero Card */}
              <div className="delivo-card-glass" style={{ borderRadius: '24px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Order #{trackedOrder.id.slice(-6)}</span>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', letterSpacing: '-0.02em' }}>
                      {trackedOrder.status === OrderStatus.DELIVERED ? '🎉 Order Delivered!' : '⚡ Delivery in Progress'}
                    </h3>
                  </div>
                  <OrderStatusBadge status={trackedOrder.status} />
                </div>

                {/* OTP Verification Pill */}
                {trackedOrder.status !== OrderStatus.DELIVERED && (
                  <div style={{ background: 'linear-gradient(135deg, rgba(253, 105, 49, 0.2) 0%, rgba(253, 105, 49, 0.08) 100%)', border: '1px solid rgba(253, 105, 49, 0.45)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', boxShadow: '0 4px 20px rgba(253, 105, 49, 0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(253, 105, 49, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={22} color="#FD6931" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 600 }}>Share with Runner on Delivery</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em' }}>Delivery OTP: <span style={{ color: '#FD6931', fontSize: '18px' }}>{trackedOrder.otpCode || '4421'}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Runner Info Card if runner has taken order */}
                {trackedOrder.runnerName && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🚴</span>
                      <div>
                        <div style={{ fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 800, color: '#34D399' }}>
                          Assigned Courier
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF' }}>
                          {trackedOrder.runnerName}
                        </div>
                      </div>
                    </div>
                    {trackedOrder.runnerPhone && (
                      <a
                        href={`tel:${trackedOrder.runnerPhone}`}
                        className="delivo-btn-glass"
                        style={{ padding: '4px 12px', minHeight: '30px', fontSize: '11px', fontWeight: 800, textDecoration: 'none' }}
                      >
                        <Phone size={12} />
                        <span>Call Courier</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Timeline Steps with connected glowing bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '6px' }}>
                  {[
                    { label: 'Order Placed & Confirmed', done: true, sub: 'Kitchen received token' },
                    { label: 'Kitchen Preparing Your Food', done: trackedOrder.status !== OrderStatus.PLACED, sub: 'Fresh cooking on campus' },
                    { label: 'Student Runner Picked Up', done: trackedOrder.status === OrderStatus.OUT_FOR_DELIVERY || trackedOrder.status === OrderStatus.DELIVERED, sub: 'En route to your hostel' },
                    { label: 'Delivered to Your Hostel Room', done: trackedOrder.status === OrderStatus.DELIVERED, sub: 'Safe handover with OTP' },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: step.done ? '#FD6931' : 'rgba(255,255,255,0.08)',
                          border: step.done ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255,255,255,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#fff',
                          fontWeight: 800,
                          flexShrink: 0,
                          boxShadow: step.done ? '0 0 14px rgba(253, 105, 49, 0.6)' : 'none',
                          zIndex: 2,
                          marginTop: '2px',
                        }}
                      >
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', color: step.done ? '#FFFFFF' : 'var(--text-muted)', fontWeight: step.done ? 700 : 500, display: 'block' }}>
                          {step.label}
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px', display: 'block' }}>
                          {step.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items Details */}
              <div className="delivo-card-glass" style={{ borderRadius: '24px', padding: '18px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px', letterSpacing: '-0.01em' }}>Order Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {trackedOrder.items.map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{it.quantity}x {it.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>₹{it.priceEach * it.quantity}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 800, fontSize: '16px', color: '#FFFFFF' }}>
                    <span>Total Amount</span>
                    <span style={{ color: '#FD6931' }}>₹{trackedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────── TAB 4: ORDER HISTORY ──────── */}
      {activeTab === 'history' && (
        <div style={{ flex: 1, padding: '20px', paddingBottom: '110px', overflowY: 'auto' }} className="page-transition hide-scrollbar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>Past Campus Orders</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{studentOrders.length} orders total</span>
          </div>

          {studentOrders.length === 0 ? (
            <div className="delivo-card-glass" style={{ textAlign: 'center', padding: '60px 24px', borderRadius: '24px' }}>
              <div style={{ fontSize: '42px', marginBottom: '14px' }}>📜</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No Past Orders Found</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                Your completed orders will be archived here for one-tap repeat orders and receipts.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {studentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="delivo-card-glass"
                  style={{
                    borderRadius: '22px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {new Date(ord.createdAt).toLocaleDateString()} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px', letterSpacing: '-0.01em' }}>
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </h4>
                    </div>
                    <OrderStatusBadge status={ord.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#FD6931' }}>₹{ord.totalAmount}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStudentOrderId(ord.id);
                        setActiveTab('track');
                      }}
                      className="delivo-btn-glass"
                      style={{
                        padding: '6px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#FD6931',
                        border: '1px solid rgba(253, 105, 49, 0.4)',
                        background: 'rgba(253, 105, 49, 0.12)',
                      }}
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 4. QUICK COMMERCE FLOATING CART PILL (Blinkit / Swiggy Style) ─── */}
      {cart.length > 0 && activeTab !== 'cart' && (
        <div
          className="floating-cart-bar"
          onClick={() => setActiveTab('cart')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={18} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                {totalCartQty} {totalCartQty === 1 ? 'item' : 'items'} • ₹{grandTotal}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                From {cart[0]?.vendorName || 'Campus Stall'}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              color: '#FD6931',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <span>View Cart</span>
            <ArrowRight size={14} />
          </div>
        </div>
      )}

      {/* ─── 5. FLOATING ISLAND GLASS DOCK WITH ACTIVE CAPSULE ─── */}
      <nav className="floating-glass-dock">
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`dock-tab ${activeTab === 'browse' ? 'active' : ''}`}
        >
          <Utensils size={20} />
          <span className="dock-tab-label">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cart')}
          className={`dock-tab ${activeTab === 'cart' ? 'active' : ''}`}
        >
          <ShoppingBag size={20} />
          <span className="dock-tab-label">Cart</span>
          {totalCartQty > 0 && <span className="dock-badge-count">{totalCartQty}</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('track')}
          className={`dock-tab ${activeTab === 'track' ? 'active' : ''}`}
        >
          <Bike size={20} />
          <span className="dock-tab-label">Orders</span>
          {trackedOrder && trackedOrder.status !== OrderStatus.DELIVERED && (
            <span className="dock-live-dot" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`dock-tab ${activeTab === 'history' ? 'active' : ''}`}
        >
          <History size={20} />
          <span className="dock-tab-label">History</span>
        </button>

        <button
          type="button"
          onClick={() => setIsEditingProfile(true)}
          className="dock-tab"
        >
          <User size={20} />
          <span className="dock-tab-label">Profile</span>
        </button>
      </nav>

      {/* ─── 5. USER PROFILE & SETTINGS MODAL ─── */}
      {isEditingProfile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(16px)' }}>
          <div className="delivo-card-glass" style={{ borderRadius: '28px', padding: '24px', width: '100%', maxWidth: '390px', boxShadow: '0 24px 60px rgba(0,0,0,0.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>Student Profile & Room</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure your campus delivery drop</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)' }}>Student Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="form-control"
                  style={{ height: '48px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)' }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="form-control"
                  style={{ height: '48px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)' }}>Hostel Residence</label>
                <select
                  value={profileForm.hostelBlock}
                  onChange={(e) => setProfileForm({ ...profileForm, hostelBlock: e.target.value })}
                  className="form-control"
                  style={{ height: '48px', borderRadius: '14px', background: '#121218', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.name} style={{ background: '#1A1A1A' }}>
                      {h.name} {h.vegOnlyEnforced ? '🥗 (Strict Veg)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.75)' }}>Room Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.roomNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, roomNumber: e.target.value })}
                  className="form-control"
                  style={{ height: '48px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="delivo-btn-glass"
                  style={{ flex: 1, height: '48px', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="delivo-btn-primary"
                  style={{ flex: 1, height: '48px', fontSize: '14px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>

            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <LogOut size={16} />
                <span>Log Out of Student Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. UPI PAYMENT MODAL ─── */}
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
