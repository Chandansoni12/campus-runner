/**
 * Campus Runner — Pure Business Logic Functions
 * Section 6: Pure, testable functions, not scattered in components
 */

import { SlotWindow } from './types';

/**
 * Table-driven delivery fee calculator based on distance tier
 * e.g., Same food court / same zone: ₹15; Cross-campus: ₹25
 */
export function calculateDeliveryFee(hostelBlock: string, vendorLocation: string): number {
  // Distance matrix table
  // If hostel is near food court zone (Aryabhatta Hall is nearby Food Court A / Main), tier is ₹15.
  // Bhaskara Hall or cross-campus deliveries: ₹25.
  const isNearby = 
    (hostelBlock.includes('Aryabhatta') || hostelBlock.includes('Block A')) && 
    (vendorLocation.includes('Food Court A') || vendorLocation.includes('Main'));
    
  return isNearby ? 15 : 25;
}

/**
 * Runner payout formula:
 * Base ₹18/delivery + ₹25 batch bonus if batch size >= 6
 * Encoded as pure function
 */
export function calculateRunnerPayout(deliveriesInBatch: number, distanceTier?: string): number {
  const baseRatePerDelivery = 18;
  const batchBonusThreshold = 6;
  const batchBonusAmount = 25;

  const baseTotal = deliveriesInBatch * baseRatePerDelivery;
  const bonus = deliveriesInBatch >= batchBonusThreshold ? batchBonusAmount : 0;
  
  // Optional small distance increment if cross campus
  const tierAdjustment = distanceTier === 'CROSS_CAMPUS' ? deliveriesInBatch * 2 : 0;

  return Math.round(baseTotal + bonus + tierAdjustment);
}

/**
 * Vendor commission calculation
 * Stored and computed as whole integer (rupees)
 */
export function calculateCommission(orderTotal: number, commissionPct: number): number {
  if (orderTotal <= 0 || commissionPct <= 0) return 0;
  return Math.round((orderTotal * commissionPct) / 100);
}

/**
 * Slot timing configuration
 */
export const SLOT_TIMINGS: Record<SlotWindow, { label: string; deliveryTime: string; orderCloseTime: string }> = {
  [SlotWindow.MORNING]: {
    label: 'Breakfast (8:30 AM)',
    deliveryTime: '08:30',
    orderCloseTime: '08:00',
  },
  [SlotWindow.LUNCH]: {
    label: 'Lunch (12:45 PM)',
    deliveryTime: '12:45',
    orderCloseTime: '12:15',
  },
  [SlotWindow.EVENING]: {
    label: 'Evening Snacks (5:30 PM)',
    deliveryTime: '17:30',
    orderCloseTime: '17:00',
  },
  [SlotWindow.NIGHT]: {
    label: 'Night Dinner (8:30 PM)',
    deliveryTime: '20:30',
    orderCloseTime: '23:59', // Final night cutoff
  },
};

/**
 * Single source of truth for the cutoff and slot-window logic
 * Called by both the UI (to hide/show slots) and checkout action (to reject late orders)
 */
export function isOrderingOpen(
  slot?: SlotWindow,
  currentTime: Date = new Date(),
  cutoffTime: string = '23:59'
): { isOpen: boolean; reason?: string } {
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const [cutoffH, cutoffM] = cutoffTime.split(':').map(Number);
  const cutoffTotalMinutes = cutoffH * 60 + cutoffM;

  // Global campus cutoff check: after 9:15 PM, campus kitchen order windows close
  if (currentTotalMinutes >= cutoffTotalMinutes) {
    return {
      isOpen: false,
      reason: `Ordering is closed for today. Night cutoff was ${cutoffTime}. Kitchens re-open tomorrow at 07:30 AM.`,
    };
  }

  // Early morning gate: before 7:00 AM
  if (currentTotalMinutes < 7 * 60) {
    return {
      isOpen: false,
      reason: 'Ordering opens at 07:00 AM for the morning delivery slot.',
    };
  }

  // If a specific slot is queried:
  if (slot) {
    const slotInfo = SLOT_TIMINGS[slot];
    const [closeH, closeM] = slotInfo.orderCloseTime.split(':').map(Number);
    const closeTotalMinutes = closeH * 60 + closeM;

    if (currentTotalMinutes > closeTotalMinutes) {
      return {
        isOpen: false,
        reason: `Orders for ${slotInfo.label} closed at ${slotInfo.orderCloseTime}. Please select the next upcoming slot.`,
      };
    }
  }

  return { isOpen: true };
}

/**
 * Formats an amount as Indian Rupees without decimal fractions (integer rupees)
 */
export function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Generates UPI Deep Link for checkout
 * Spec: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&tn=<order_id>
 */
export function generateUpiLink(params: {
  vpa: string;
  name: string;
  amount: number;
  orderId: string;
}): string {
  const encodedName = encodeURIComponent(params.name);
  const encodedTn = encodeURIComponent(`Order_${params.orderId}`);
  return `upi://pay?pa=${params.vpa}&pn=${encodedName}&am=${Math.round(params.amount)}&tn=${encodedTn}&cu=INR`;
}

/**
 * Generates a random 4-digit numeric handover OTP
 */
export function generateHandoverOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
