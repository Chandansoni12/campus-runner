/**
 * Campus Runner — Central Zustand Store
 * Manages full lifecycle across Student, Vendor, Runner, and Admin roles
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Role,
  OrderStatus,
  SlotWindow,
  HostelBlock,
  Vendor,
  User,
  Order,
  OrderItem,
  CampusSettings,
  Settlement,
  CartItem,
  MenuItem,
} from './types';
import {
  SEED_HOSTELS,
  SEED_VENDORS,
  SEED_USERS,
  INITIAL_ORDERS,
  INITIAL_SETTLEMENTS,
  INITIAL_SETTINGS,
} from './seed-data';
import {
  calculateDeliveryFee,
  calculateCommission,
  calculateRunnerPayout,
  isOrderingOpen,
  generateHandoverOtp,
} from './business-logic';

interface AppState {
  // Current session
  currentRole: Role;
  currentUser: User;
  activeVendorId: string;
  activeRunnerId: string;

  // Master collections
  hostels: HostelBlock[];
  vendors: Vendor[];
  users: User[];
  orders: Order[];
  settings: CampusSettings;
  settlements: Settlement[];

  // Ephemeral Cart State (Student)
  cart: CartItem[];
  selectedSlot: SlotWindow;
  activeStudentOrderId: string | null;

  // Feedback Notification
  toastMessage: { message: string; type: 'success' | 'info' | 'error' } | null;

  // Session / Role actions
  isAuthenticated: boolean;
  loginAsRole: (role: Role) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  setCurrentUser: (user: User) => void;
  setActiveVendorId: (id: string) => void;
  setActiveRunnerId: (id: string) => void;
  setToast: (toast: { message: string; type: 'success' | 'info' | 'error' } | null) => void;

  // Student Profile Actions
  updateStudentProfile: (params: { name: string; phone: string; hostelBlock: string; roomNumber: string }) => void;

  // Cart Actions
  addToCart: (item: MenuItem, vendor: Vendor) => { success: boolean; message?: string };
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedSlot: (slot: SlotWindow) => void;
  setActiveStudentOrderId: (orderId: string | null) => void;

  // Order Placement
  createOrder: (params: {
    slot: SlotWindow;
    hostelBlock: string;
    roomNumber: string;
  }) => { success: boolean; orderId?: string; error?: string };

  // Vendor Actions
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  markOrderReady: (orderId: string) => void;
  toggleMenuItemStock: (vendorId: string, menuItemId: string) => void;
  updateVendorCommission: (vendorId: string, commissionPct: number) => void;

  // Runner & Dispatch Actions
  assignOrderToRunner: (orderId: string, runnerId: string) => void;
  batchAssignOrders: (orderIds: string[], runnerId: string) => void;
  runnerPickUpOrder: (orderId: string) => void;
  runnerDeliverOrder: (orderId: string, enteredOtp: string) => { success: boolean; error?: string };

  // Admin Controls
  toggleGlobalKillSwitch: (isPaused: boolean) => void;
  toggleHostelKillSwitch: (hostelCode: string, isPaused: boolean) => void;
  updateCutoffTime: (time: string) => void;
  onboardVendor: (vendor: Omit<Vendor, 'id' | 'rating' | 'reviewCount' | 'isActive'>) => void;
  onboardRunner: (runner: { name: string; phone: string; hostelBlock: string }) => void;
  toggleRunnerVerification: (runnerId: string) => void;
  resetDemoData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentRole: Role.STUDENT,
      currentUser: SEED_USERS[0], // Aarav Sharma by default
      activeVendorId: SEED_VENDORS[0].id,
      activeRunnerId: SEED_USERS[3].id, // Vikram Singh
      isAuthenticated: false,

      hostels: SEED_HOSTELS,
      vendors: SEED_VENDORS,
      users: SEED_USERS,
      orders: INITIAL_ORDERS,
      settings: INITIAL_SETTINGS,
      settlements: INITIAL_SETTLEMENTS,

      cart: [],
      selectedSlot: SlotWindow.NIGHT,
      activeStudentOrderId: INITIAL_ORDERS[0].id,
      toastMessage: null,

      setRole: (role) => {
        const state = get();
        let targetUser = state.currentUser;

        // Auto-switch default user when role tab changes
        if (role === Role.STUDENT) {
          targetUser = state.users.find((u) => u.role === Role.STUDENT) || state.users[0];
        } else if (role === Role.RUNNER) {
          targetUser = state.users.find((u) => u.id === state.activeRunnerId) || state.users.find((u) => u.role === Role.RUNNER) || state.users[3];
        } else if (role === Role.ADMIN) {
          targetUser = state.users.find((u) => u.role === Role.ADMIN) || state.users[5];
        }

        set({ currentRole: role, currentUser: targetUser });
      },

      loginAsRole: (role) => {
        const state = get();
        let targetUser = state.currentUser;

        if (role === Role.STUDENT) {
          targetUser = state.users.find((u) => u.role === Role.STUDENT) || state.users[0];
        } else if (role === Role.VENDOR) {
          targetUser = state.users.find((u) => u.role === Role.VENDOR) || state.users[1];
        } else if (role === Role.RUNNER) {
          targetUser = state.users.find((u) => u.role === Role.RUNNER) || state.users[3];
        } else if (role === Role.ADMIN) {
          targetUser = state.users.find((u) => u.role === Role.ADMIN) || state.users[5];
        }

        set({ currentRole: role, currentUser: targetUser, isAuthenticated: true });
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      setCurrentUser: (user) => set({ currentUser: user, currentRole: user.role }),
      setActiveVendorId: (id) => set({ activeVendorId: id }),
      setActiveRunnerId: (id) => {
        const runner = get().users.find((u) => u.id === id);
        set({ activeRunnerId: id, ...(runner && get().currentRole === Role.RUNNER ? { currentUser: runner } : {}) });
      },
      setToast: (toast) => set({ toastMessage: toast }),

      updateStudentProfile: ({ name, phone, hostelBlock, roomNumber }) => {
        const { currentUser, users } = get();
        const updatedUser: User = {
          ...currentUser,
          name,
          phone,
          hostelBlock,
          roomNumber,
        };
        const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
        set({ currentUser: updatedUser, users: updatedUsers });
      },

      addToCart: (item, vendor) => {
        const { cart, currentUser, hostels } = get();

        // Check if student belongs to a veg-only enforced hostel
        const studentHostel = hostels.find((h) => h.name === currentUser.hostelBlock || h.code === currentUser.hostelBlock);
        if (studentHostel?.vegOnlyEnforced && !item.isVeg) {
          return {
            success: false,
            message: 'Non-veg items cannot be ordered to Bhaskara Hall (Strict Veg Enforced).',
          };
        }

        // Single vendor cart constraint: if cart has items from another vendor, warn or reset
        const existingOtherVendor = cart.find((c) => c.vendorId !== vendor.id);
        let newCart = [...cart];

        if (existingOtherVendor) {
          // Replace cart with item from new vendor
          newCart = [{ menuItem: item, quantity: 1, vendorId: vendor.id, vendorName: vendor.name }];
          set({ cart: newCart });
          return {
            success: true,
            message: `Cart updated: Switched to ${vendor.name}.`,
          };
        }

        const existingIndex = newCart.findIndex((c) => c.menuItem.id === item.id);
        if (existingIndex >= 0) {
          newCart[existingIndex].quantity += 1;
        } else {
          newCart.push({ menuItem: item, quantity: 1, vendorId: vendor.id, vendorName: vendor.name });
        }

        set({ cart: newCart });
        return { success: true };
      },

      removeFromCart: (menuItemId) => {
        set({ cart: get().cart.filter((c) => c.menuItem.id !== menuItemId) });
      },

      updateCartQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(menuItemId);
          return;
        }
        set({
          cart: get().cart.map((c) => (c.menuItem.id === menuItemId ? { ...c, quantity } : c)),
        });
      },

      clearCart: () => set({ cart: [] }),
      setSelectedSlot: (slot) => set({ selectedSlot: slot }),
      setActiveStudentOrderId: (orderId) => set({ activeStudentOrderId: orderId }),

      createOrder: ({ slot, hostelBlock, roomNumber }) => {
        const { cart, currentUser, settings, vendors, orders } = get();

        if (cart.length === 0) {
          return { success: false, error: 'Cart is empty.' };
        }

        // 1. Global Kill-Switch Check (Hard Requirement)
        if (settings.globalOrderingPaused) {
          return {
            success: false,
            error: 'Campus ordering is temporarily suspended by University Administration.',
          };
        }

        // 2. Hostel Block Kill-Switch Check (Hard Requirement)
        if (settings.pausedHostelBlocks.includes(hostelBlock)) {
          return {
            success: false,
            error: `Ordering is temporarily paused for ${hostelBlock} by Admin.`,
          };
        }

        // 3. Cutoff & Slot Timing Check (Hard Requirement)
        const timingCheck = isOrderingOpen(slot, new Date(), settings.cutoffTime);
        if (!timingCheck.isOpen) {
          return {
            success: false,
            error: timingCheck.reason || 'Ordering is closed for this time window.',
          };
        }

        const vendorId = cart[0].vendorId;
        const vendor = vendors.find((v) => v.id === vendorId);
        if (!vendor) {
          return { success: false, error: 'Vendor not found.' };
        }

        // Compute subtotal (Integer rupees)
        const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

        // Compute table-driven delivery fee
        const deliveryFee = calculateDeliveryFee(hostelBlock, vendor.location);

        const totalAmount = subtotal + deliveryFee;
        const commissionAmt = calculateCommission(totalAmount, vendor.commissionPct);

        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const otpCode = generateHandoverOtp(); // 4-digit code generated for OUT_FOR_DELIVERY

        const orderItems: OrderItem[] = cart.map((c) => ({
          id: `oi-${Math.random().toString(36).substring(2, 9)}`,
          orderId,
          menuItemId: c.menuItem.id,
          name: c.menuItem.name,
          priceEach: c.menuItem.price,
          quantity: c.quantity,
          isVeg: c.menuItem.isVeg,
        }));

        const isVegOnlyOrder = orderItems.every((item) => item.isVeg);

        const newOrder: Order = {
          id: orderId,
          studentId: currentUser.id,
          studentName: currentUser.name,
          studentPhone: currentUser.phone || '9876543210',
          vendorId: vendor.id,
          vendorName: vendor.name,
          items: orderItems,
          slot,
          hostelBlock,
          roomNumber,
          subtotalAmount: subtotal,
          deliveryFee,
          totalAmount,
          commissionAmt,
          status: OrderStatus.PLACED,
          isVegOnly: isVegOnlyOrder,
          otpCode,
          createdAt: new Date().toISOString(),
        };

        set({
          orders: [newOrder, ...orders],
          cart: [],
          activeStudentOrderId: orderId,
          toastMessage: {
            message: `Order ${orderId} placed successfully! Sent to ${vendor.name}.`,
            type: 'success',
          },
        });

        return { success: true, orderId };
      },

      acceptOrder: (orderId) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: OrderStatus.PREPARING,
                }
              : o
          ),
          toastMessage: { message: `Order ${orderId} accepted and preparing in kitchen!`, type: 'info' },
        });
      },

      rejectOrder: (orderId, reason = 'Kitchen capacity reached / items sold out') => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: OrderStatus.CANCELLED,
                  rejectionReason: reason,
                }
              : o
          ),
          toastMessage: { message: `Order ${orderId} rejected: ${reason}`, type: 'error' },
        });
      },

      markOrderReady: (orderId) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: OrderStatus.READY,
                }
              : o
          ),
          toastMessage: { message: `Order ${orderId} marked ready for runner pickup!`, type: 'success' },
        });
      },

      toggleMenuItemStock: (vendorId, menuItemId) => {
        const { vendors } = get();
        const updatedVendors = vendors.map((v) => {
          if (v.id !== vendorId) return v;
          return {
            ...v,
            menuItems: v.menuItems.map((item) =>
              item.id === menuItemId ? { ...item, isAvailable: !item.isAvailable } : item
            ),
          };
        });

        // Also remove from active cart if it became out of stock
        const targetVendor = updatedVendors.find((v) => v.id === vendorId);
        const item = targetVendor?.menuItems.find((i) => i.id === menuItemId);

        let updatedCart = get().cart;
        if (item && !item.isAvailable) {
          updatedCart = updatedCart.filter((c) => c.menuItem.id !== menuItemId);
        }

        set({
          vendors: updatedVendors,
          cart: updatedCart,
          toastMessage: {
            message: `"${item?.name}" marked ${item?.isAvailable ? 'In Stock' : 'Out of Stock (Removed from student menus)'}.`,
            type: 'info',
          },
        });
      },

      updateVendorCommission: (vendorId, commissionPct) => {
        set({
          vendors: get().vendors.map((v) => (v.id === vendorId ? { ...v, commissionPct } : v)),
        });
      },

      assignOrderToRunner: (orderId, runnerId) => {
        const { orders, users } = get();
        const runner = users.find((u) => u.id === runnerId);
        if (!runner) return;

        set({
          orders: orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  runnerId,
                  runnerName: runner.name,
                  status: OrderStatus.OUT_FOR_DELIVERY,
                }
              : o
          ),
          toastMessage: {
            message: `Order ${orderId} assigned to runner ${runner.name}.`,
            type: 'success',
          },
        });
      },

      batchAssignOrders: (orderIds, runnerId) => {
        const { orders, users } = get();
        const runner = users.find((u) => u.id === runnerId);
        if (!runner) return;

        set({
          orders: orders.map((o) =>
            orderIds.includes(o.id)
              ? {
                  ...o,
                  runnerId,
                  runnerName: runner.name,
                  status: o.status === OrderStatus.PLACED || o.status === OrderStatus.ACCEPTED ? OrderStatus.PREPARING : o.status,
                }
              : o
          ),
          toastMessage: {
            message: `Batch of ${orderIds.length} orders dispatched to ${runner.name}!`,
            type: 'success',
          },
        });
      },

      runnerPickUpOrder: (orderId) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: OrderStatus.OUT_FOR_DELIVERY,
                  pickedUpAt: new Date().toISOString(),
                }
              : o
          ),
          toastMessage: { message: `Order ${orderId} picked up from vendor stall!`, type: 'info' },
        });
      },

      // HARD QA RULE: Order cannot reach DELIVERED without a correct OTP entry!
      runnerDeliverOrder: (orderId, enteredOtp) => {
        const { orders } = get();
        const order = orders.find((o) => o.id === orderId);

        if (!order) {
          return { success: false, error: 'Order not found.' };
        }

        if (order.otpCode.trim() !== enteredOtp.trim()) {
          return {
            success: false,
            error: 'Invalid 4-digit handover OTP. Please verify with the student!',
          };
        }

        const now = new Date().toISOString();
        const updatedOrders = orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: OrderStatus.DELIVERED,
                deliveredAt: now,
              }
            : o
        );

        set({
          orders: updatedOrders,
          toastMessage: {
            message: `Order ${orderId} verified with OTP and marked DELIVERED!`,
            type: 'success',
          },
        });

        return { success: true };
      },

      toggleGlobalKillSwitch: (isPaused) => {
        set({
          settings: {
            ...get().settings,
            globalOrderingPaused: isPaused,
          },
          toastMessage: {
            message: isPaused
              ? 'EMERGENCY: Campus-wide ordering has been PAUSED.'
              : 'Campus-wide ordering resumed.',
            type: isPaused ? 'error' : 'success',
          },
        });
      },

      toggleHostelKillSwitch: (hostelCode, isPaused) => {
        const { settings } = get();
        const currentPaused = [...settings.pausedHostelBlocks];
        let nextPaused: string[];

        if (isPaused) {
          nextPaused = Array.from(new Set([...currentPaused, hostelCode]));
        } else {
          nextPaused = currentPaused.filter((c) => c !== hostelCode);
        }

        set({
          settings: {
            ...settings,
            pausedHostelBlocks: nextPaused,
          },
          toastMessage: {
            message: `${hostelCode} ordering is now ${isPaused ? 'PAUSED' : 'ACTIVE'}.`,
            type: isPaused ? 'error' : 'success',
          },
        });
      },

      updateCutoffTime: (time) => {
        set({
          settings: {
            ...get().settings,
            cutoffTime: time,
          },
          toastMessage: { message: `Kitchen cutoff time updated to ${time}.`, type: 'info' },
        });
      },

      onboardVendor: (vendorData) => {
        const vendorId = `vendor-${Date.now()}`;
        const newVendor: Vendor = {
          ...vendorData,
          id: vendorId,
          rating: 5.0,
          reviewCount: 1,
          isActive: true,
          menuItems: vendorData.menuItems.map((m, idx) => ({
            ...m,
            id: `m-${Date.now()}-${idx}`,
            vendorId: vendorId,
          })),
        };

        set({
          vendors: [...get().vendors, newVendor],
          toastMessage: { message: `Vendor "${newVendor.name}" successfully onboarded!`, type: 'success' },
        });
      },

      onboardRunner: ({ name, phone, hostelBlock }) => {
        const newRunner: User = {
          id: `runner-${Date.now()}`,
          role: Role.RUNNER,
          name,
          phone,
          hostelBlock,
          isVerified: true,
          createdAt: new Date().toISOString(),
        };

        set({
          users: [...get().users, newRunner],
          toastMessage: { message: `Student runner ${name} added to roster!`, type: 'success' },
        });
      },

      toggleRunnerVerification: (runnerId) => {
        set({
          users: get().users.map((u) => (u.id === runnerId ? { ...u, isVerified: !u.isVerified } : u)),
        });
      },

      resetDemoData: () => {
        set({
          hostels: SEED_HOSTELS,
          vendors: SEED_VENDORS,
          users: SEED_USERS,
          orders: INITIAL_ORDERS,
          settings: INITIAL_SETTINGS,
          settlements: INITIAL_SETTLEMENTS,
          cart: [],
          toastMessage: { message: 'Demo data and active orders reset to clean pilot state.', type: 'info' },
        });
      },
    }),
    {
      name: 'campus-runner-storage',
      partialize: (state) => ({
        currentRole: state.currentRole,
        currentUser: state.currentUser,
        activeVendorId: state.activeVendorId,
        activeRunnerId: state.activeRunnerId,
        hostels: state.hostels,
        vendors: state.vendors,
        users: state.users,
        orders: state.orders,
        settings: state.settings,
        settlements: state.settlements,
        cart: state.cart,
        selectedSlot: state.selectedSlot,
        activeStudentOrderId: state.activeStudentOrderId,
      }),
    }
  )
);
