/**
 * Campus Runner — Core Data Models & Types
 */

export enum Role {
  STUDENT = 'STUDENT',
  VENDOR = 'VENDOR',
  RUNNER = 'RUNNER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PLACED = 'PLACED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum SlotWindow {
  MORNING = 'MORNING',   // 8:30 AM
  LUNCH = 'LUNCH',       // 12:45 PM
  EVENING = 'EVENING',   // 5:30 PM
  NIGHT = 'NIGHT',       // 8:30 PM
}

export interface HostelBlock {
  id: string;
  name: string;
  code: string;
  vegOnlyEnforced: boolean;
  distanceTier: 'SAME_ZONE' | 'CROSS_CAMPUS';
  roomsCount?: number;
}

export interface User {
  id: string;
  role: Role;
  phone?: string;
  email?: string;
  name: string;
  hostelBlock?: string;
  roomNumber?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  price: number; // Integer (Rupees)
  isVeg: boolean;
  isAvailable: boolean;
  category: 'meal' | 'snacks' | 'beverage' | 'bakery' | 'breakfast';
  description?: string;
  image?: string;
  rating?: number;
  prepTime?: string;
  tags?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  ownerPhone: string;
  commissionPct: number; // e.g. 10 (%)
  isActive: boolean;
  fssaiNumber?: string;
  cuisineTag: string;
  rating: number;
  reviewCount: number;
  bannerColor: string;
  prepTimeMinutes: number;
  coverImage?: string;
  menuItems: MenuItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  priceEach: number; // Integer
  quantity: number;
  isVeg: boolean;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  slot: SlotWindow;
  hostelBlock: string;
  roomNumber: string;
  subtotalAmount: number; // Integer
  deliveryFee: number;    // Integer
  totalAmount: number;    // Integer
  commissionAmt: number;  // Integer
  status: OrderStatus;
  isVegOnly: boolean;
  otpCode: string;        // 4-digit code generated for OUT_FOR_DELIVERY
  createdAt: string;
  runnerId?: string;
  runnerName?: string;
  runnerPhone?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  rejectionReason?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  runnerId: string;
  runnerName: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  payoutAmt: number; // computed at delivery: base + batch bonus
  batchId?: string;
}

export interface Settlement {
  id: string;
  vendorId: string;
  vendorName: string;
  periodStart: string;
  periodEnd: string;
  grossAmt: number;      // Integer
  commissionAmt: number; // Integer
  netPayable: number;    // Integer
  paidAt?: string;
  ordersCount: number;
}

export interface CampusSettings {
  globalOrderingPaused: boolean;
  cutoffTime: string; // e.g. "21:15" (9:15 PM)
  upiVpa: string;
  upiName: string;
  pausedHostelBlocks: string[]; // List of hostel codes where ordering is paused
  mockCurrentTime?: string; // Optional time override for testing cutoff
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  vendorId: string;
  vendorName: string;
}
