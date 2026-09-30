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
      
      {/* ─── 1. MODERN SLEEK HEADER (ZOMATO / BLINKIT / SWIGGY STYLE) ─── */}
      <header className="modern-header">
        {/* Top Row: Speed Badge, Delivery Room/Hostel, Pure Veg Toggle, Profile */}
        <div className="modern-header-top">
          {/* Location Chip */}
          <div
            className="location-chip-btn"
            onClick={() => setIsEditingProfile(true)}
            title="Change Hostel / Room"
          >
            <span className="delivery-speed-badge">
              <Zap size={11} fill="#34D399" color="#34D399" />
              <span>15 MINS</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span className="location-text">
                {currentUser.hostelBlock?.split(' ')[0] || 'Aryabhatta'}, {currentUser.roomNumber || 'A-204'}
              </span>
              <ChevronDown size={13} color="#9CA3AF" />
            </div>
          </div>

          {/* Quick Veg Mode Toggle & Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setPureVegOnlyFilter(!pureVegOnlyFilter)}
              className={`veg-toggle-btn ${pureVegOnlyFilter || isHostelStrictVeg ? 'active' : ''}`}
              title="Toggle Pure Veg Only"
            >
              <Leaf size={12} color={pureVegOnlyFilter || isHostelStrictVeg ? '#34D399' : '#9CA3AF'} />
              <span>VEG</span>
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(253,105,49,0.3), rgba(255,120,60,0.15))',
                border: '1.5px solid rgba(253,105,49,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 800,
                color: '#FD6931',
                cursor: 'pointer',
              }}
              title="Student Profile & Room"
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
            </button>
          </div>
        </div>

        {/* Search Row */}
        <div className="modern-search-row">
          <div className="modern-search-bar">
            <Search size={17} color="#9CA3AF" />
            <input
              id="campus-search-input"
              type="text"
              className="modern-search-input"
              placeholder="Search samosa, maggi, chai, rolls, thali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            )}
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
        <main className="home-content hide-scrollbar" style={{ paddingBottom: '110px' }}>
          
          {/* DELIVERY SLOT PICKER */}
          <div className="slot-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: 'var(--font-12)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--primary)" />
                <span>Select Delivery Slot</span>
              </span>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                Cutoff: {settings.cutoffTime}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
                      padding: '8px 4px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'var(--primary)' : slotStatus.isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                      color: isSelected ? '#FFFFFF' : slotStatus.isOpen ? 'var(--text-primary)' : 'rgba(255,255,255,0.3)',
                      cursor: slotStatus.isOpen ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{iconMap[slotKey]}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'capitalize', marginTop: '2px' }}>
                      {slotKey.toLowerCase()}
                    </span>
                    <span style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>
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
        <div className="checkout-screen" style={{ flex: 1, paddingBottom: '90px' }}>
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
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '12px 16px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(253, 105, 49, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    🍳
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{cart[0]?.vendorName}</div>
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
                        <div className="item-price">₹{item.menuItem.price}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                    Payment Summary
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Items Subtotal</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Hostel Runner Fee</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>₹{deliveryFee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Platform Commission</span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                    <span>To Pay</span>
                    <span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="button"
                  disabled={isBlocked}
                  onClick={() => setShowUpiModal(true)}
                  className="btn btn-primary"
                  style={{ marginTop: '8px' }}
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
        <div style={{ flex: 1, padding: '20px', paddingBottom: '110px', overflowY: 'auto' }} className="hide-scrollbar">
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
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📦</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>No Active Orders</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Your placed orders and live delivery runner will show up right here.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '0 24px', height: '44px' }}
                onClick={() => setActiveTab('browse')}
              >
                Start Ordering
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Order Status Hero Card */}
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order #{trackedOrder.id.slice(-6)}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                      {trackedOrder.status === OrderStatus.DELIVERED ? 'Order Delivered!' : 'Delivery in Progress'}
                    </h3>
                  </div>
                  <OrderStatusBadge status={trackedOrder.status} />
                </div>

                {/* OTP Verification Pill */}
                {trackedOrder.status !== OrderStatus.DELIVERED && (
                  <div style={{ background: 'rgba(253, 105, 49, 0.15)', border: '1px solid rgba(253, 105, 49, 0.4)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={20} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Share with Runner on Delivery</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>Delivery OTP: <span style={{ color: 'var(--primary)' }}>{trackedOrder.otpCode || '4421'}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', paddingLeft: '8px' }}>
                  {[
                    { label: 'Order Placed & Confirmed', done: true },
                    { label: 'Kitchen Preparing Your Food', done: trackedOrder.status !== OrderStatus.PLACED },
                    { label: 'Student Runner Picked Up', done: trackedOrder.status === OrderStatus.OUT_FOR_DELIVERY || trackedOrder.status === OrderStatus.DELIVERED },
                    { label: 'Delivered to Your Hostel Room', done: trackedOrder.status === OrderStatus.DELIVERED },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: step.done ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          color: '#fff',
                          fontWeight: 700,
                        }}
                      >
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontSize: '13px', color: step.done ? '#FFFFFF' : 'var(--text-muted)', fontWeight: step.done ? 600 : 400 }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items Details */}
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>Order Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {trackedOrder.items.map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#FFFFFF' }}>{it.quantity}x {it.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>₹{it.priceEach * it.quantity}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>
                    <span>Total Amount</span>
                    <span>₹{trackedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────── TAB 4: ORDER HISTORY ──────── */}
      {activeTab === 'history' && (
        <div style={{ flex: 1, padding: '20px', paddingBottom: '110px', overflowY: 'auto' }} className="hide-scrollbar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>Past Campus Orders</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{studentOrders.length} orders total</span>
          </div>

          {studentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📜</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>No Past Orders Found</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Your completed orders will be archived here for easy reordering.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {studentOrders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(ord.createdAt).toLocaleDateString()} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </h4>
                    </div>
                    <OrderStatusBadge status={ord.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>₹{ord.totalAmount}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStudentOrderId(ord.id);
                        setActiveTab('track');
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: 'rgba(253, 105, 49, 0.15)',
                        border: '1px solid rgba(253, 105, 49, 0.3)',
                        color: 'var(--primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: '#141414', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Student Profile & Room</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="form-control"
                  style={{ height: '46px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="form-control"
                  style={{ height: '46px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hostel Residence</label>
                <select
                  value={profileForm.hostelBlock}
                  onChange={(e) => setProfileForm({ ...profileForm, hostelBlock: e.target.value })}
                  className="form-control"
                  style={{ height: '46px' }}
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.name} style={{ background: '#1A1A1A' }}>
                      {h.name} {h.vegOnlyEnforced ? '🥗 (Strict Veg)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Room Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.roomNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, roomNumber: e.target.value })}
                  className="form-control"
                  style={{ height: '46px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  style={{ flex: 1, height: '44px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, height: '44px', fontSize: '13px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
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
