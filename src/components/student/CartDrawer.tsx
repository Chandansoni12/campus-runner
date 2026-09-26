import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { calculateDeliveryFee } from '../../business-logic';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Tag,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Smartphone,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckoutSuccess }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, currentUser, createOrder, selectedSlot } = useAppStore();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI_DEEP_LINK' | 'UPI_QR' | 'CASH'>('UPI_DEEP_LINK');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Table-driven delivery fee
  const hostelName = currentUser.hostelBlock || 'Aryabhatta Hall (Block A)';
  const vendorLocation = cart.length > 0 ? cart[0].vendorName : 'Main';
  const baseDeliveryFee = calculateDeliveryFee(hostelName, vendorLocation);
  const discountAmount = promoApplied ? 20 : 0;
  const platformFee = subtotal > 0 ? 5 : 0;
  const finalTotal = Math.max(0, subtotal + baseDeliveryFee + platformFee - discountAmount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'CAMPUS50' || promoCode.trim().toUpperCase() === 'FREERUNNER') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try "CAMPUS50" for ₹20 off!');
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    // Simulate slight processing network delay for realistic experience
    setTimeout(() => {
      const order = createOrder({
        slot: selectedSlot,
        hostelBlock: currentUser.hostelBlock || 'Aryabhatta Hall (Block A)',
        roomNumber: currentUser.roomNumber || 'A-204',
      });
      setIsSubmitting(false);
      onClose();
      if (order) {
        onCheckoutSuccess();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop blur overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#12151C] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161920]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5E3A]/15 text-[#FF5E3A] flex items-center justify-center border border-[#FF5E3A]/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Your Food Tray</h2>
                <p className="text-xs text-slate-400 font-medium">{totalItemsCount} items selected</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Hostel Address Header */}
          <div className="px-5 py-3 bg-[#1A1E27] border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-[#FF5E3A] shrink-0" />
              <div>
                <span className="font-bold text-white block">{currentUser.hostelBlock || 'Aryabhatta Hall'}</span>
                <span className="text-slate-400 font-medium">Room {currentUser.roomNumber || 'A-204'}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              Gated Direct Delivery
            </span>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-300">Your Tray is Empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Explore campus food stalls and add your favorite dishes to get started.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="glass-card p-3.5 rounded-2xl flex items-center gap-3.5 border border-white/5 hover:border-white/15 transition-all"
                >
                  {/* Dish Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                    <img
                      src={item.menuItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                      alt={item.menuItem.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-full border border-black ${
                        item.menuItem.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  {/* Title & Price */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{item.menuItem.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{item.vendorName}</p>
                    <div className="text-sm font-extrabold text-[#FF5E3A] mt-1">₹{item.menuItem.price}</div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-[#1A1E27] p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-[#FF5E3A]/20 hover:bg-[#FF5E3A]/30 text-[#FF5E3A] flex items-center justify-center font-bold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Promo Code Card */}
            {cart.length > 0 && (
              <div className="glass-card p-3.5 rounded-2xl border border-dashed border-white/15">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[#FF9500]" />
                  <span className="text-xs font-bold text-slate-200">Campus Promo Coupon</span>
                </div>
                {promoApplied ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span>Code CAMPUS50 Applied! (₹20 OFF)</span>
                    <button onClick={() => setPromoApplied(false)} className="text-xs underline text-emerald-300">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try 'CAMPUS50'"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-[#1A1E27] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#FF5E3A]"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 rounded-xl bg-[#FF9500]/20 hover:bg-[#FF9500]/30 text-[#FF9500] border border-[#FF9500]/40 text-xs font-bold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selector */}
            {cart.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_DEEP_LINK')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'UPI_DEEP_LINK'
                        ? 'bg-[#FF5E3A]/15 border-[#FF5E3A] text-white'
                        : 'bg-[#1A1E27] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#FF5E3A]" />
                    <span className="text-[11px] font-bold">UPI App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('UPI_QR');
                      setShowQrModal(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'UPI_QR'
                        ? 'bg-[#FF5E3A]/15 border-[#FF5E3A] text-white'
                        : 'bg-[#1A1E27] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#FF9500]" />
                    <span className="text-[11px] font-bold">UPI QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-[#FF5E3A]/15 border-[#FF5E3A] text-white'
                        : 'bg-[#1A1E27] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-bold">Hostel Pay</span>
                  </button>
                </div>
              </div>
            )}

            {/* Handover OTP Notice */}
            {cart.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">4-Digit Handover OTP Security:</span>
                  <p className="text-amber-200/80 mt-0.5">
                    Upon order confirmation, a secret 4-digit code will be generated. Show it to your student runner at the hostel gate for packet release.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Billing Breakdown Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#161920] space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400 font-medium">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-slate-200 font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hostel Delivery Fee</span>
                  <span className="text-slate-200 font-bold">₹{baseDeliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform & Packaging Fee</span>
                  <span className="text-slate-200 font-bold">₹{platformFee}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Promo Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-[#FF5E3A] text-base">₹{finalTotal}</span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5E3A] to-[#E04B28] hover:from-[#FF6A47] hover:to-[#EB522E] text-white font-extrabold text-sm glow-orange shadow-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order • ₹{finalTotal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal Overlay if triggered */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161920] border border-white/15 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-base font-extrabold text-white">Scan UPI QR Code</h3>
            <p className="text-xs text-slate-400">Scan with GPay, PhonePe, Paytm, or Cred UPI app</p>
            
            <div className="w-48 h-48 bg-white rounded-2xl p-3 mx-auto flex items-center justify-center shadow-2xl">
              {/* Simulated QR Code Render */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=campusrunner@icici&pn=CampusRunnerPilot&am=${finalTotal}&cu=INR`}
                alt="UPI QR Code"
                className="w-full h-full rounded-lg"
              />
            </div>

            <div className="text-xs font-mono text-slate-300 bg-white/5 py-2 px-3 rounded-xl border border-white/10">
              VPA: campusrunner@icici
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#FF5E3A] text-white font-bold text-xs"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
