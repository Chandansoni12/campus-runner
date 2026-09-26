/**
 * Campus Runner — Lightweight Real-Time Order Tracking Store (Zustand)
 * Manages live order status, status history, runner details, and Supabase Postgres subscriptions.
 */

import { create } from 'zustand';
import { Order, OrderStatus } from './types';
import { getSupabaseClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderTrackingState {
  activeOrderId: string | null;
  order: Order | null;
  currentStatus: OrderStatus | null;
  otpCode: string | null;
  runnerInfo: { name: string; phone?: string; id?: string } | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'local_fallback';
  lastUpdatedAt: string | null;
  statusHistory: StatusHistoryEntry[];
  error: string | null;

  // Active Supabase Realtime channel instance
  channel: RealtimeChannel | null;

  // Actions
  trackOrder: (orderId: string, initialOrder?: Order) => void;
  subscribeToSupabase: (orderId: string) => void;
  unsubscribe: () => void;
  syncWithOrder: (order: Order) => void;
  resetTracking: () => void;
}

export const useOrderTrackingStore = create<OrderTrackingState>((set, get) => ({
  activeOrderId: null,
  order: null,
  currentStatus: null,
  otpCode: null,
  runnerInfo: null,
  connectionStatus: 'disconnected',
  lastUpdatedAt: null,
  statusHistory: [],
  error: null,
  channel: null,

  /**
   * Initialize tracking for a specific order and trigger Supabase realtime subscription
   */
  trackOrder: (orderId: string, initialOrder?: Order) => {
    // Clean up any existing channel before switching
    get().unsubscribe();

    const now = new Date().toISOString();
    const initialStatus = initialOrder?.status || OrderStatus.PLACED;

    set({
      activeOrderId: orderId,
      order: initialOrder || null,
      currentStatus: initialStatus,
      otpCode: initialOrder?.otpCode || null,
      runnerInfo: initialOrder?.runnerName
        ? {
            name: initialOrder.runnerName,
            id: initialOrder.runnerId,
          }
        : null,
      lastUpdatedAt: now,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: initialOrder?.createdAt || now,
          note: `Order ${orderId} placed into tracking queue`,
        },
      ],
      error: null,
    });

    // Start listening for Postgres changes
    get().subscribeToSupabase(orderId);
  },

  /**
   * Subscribes to Supabase Postgres changes on the user's active order
   */
  subscribeToSupabase: (orderId: string) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Graceful fallback to local reactive bus if Supabase keys aren't added yet
      set({ connectionStatus: 'local_fallback' });
      return;
    }

    set({ connectionStatus: 'connecting', error: null });

    try {
      // Create channel for the specific order
      const channel = supabase
        .channel(`order-realtime-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'Order',
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            const newRecord = payload.new as any;
            if (!newRecord) return;

            const nextStatus = newRecord.status as OrderStatus;
            const now = new Date().toISOString();

            set((state) => {
              const prevHistory = state.statusHistory;
              const hasStatus = prevHistory.some((h) => h.status === nextStatus);
              const nextHistory = hasStatus
                ? prevHistory
                : [...prevHistory, { status: nextStatus, timestamp: now }];

              return {
                currentStatus: nextStatus,
                otpCode: newRecord.otpCode || state.otpCode,
                runnerInfo: newRecord.runnerName
                  ? {
                      name: newRecord.runnerName,
                      id: newRecord.runnerId,
                    }
                  : state.runnerInfo,
                lastUpdatedAt: now,
                statusHistory: nextHistory,
                order: state.order ? { ...state.order, ...newRecord } : null,
              };
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            set({ connectionStatus: 'connected' });
          } else if (status === 'CHANNEL_ERROR') {
            set({
              connectionStatus: 'local_fallback',
              error: 'Realtime channel error, using in-app local reactive sync.',
            });
          }
        });

      set({ channel });
    } catch (err: any) {
      set({
        connectionStatus: 'local_fallback',
        error: err?.message || 'Failed to initialize Supabase channel.',
      });
    }
  },

  /**
   * Remove active Supabase channel
   */
  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      const supabase = getSupabaseClient();
      supabase?.removeChannel(channel);
      set({ channel: null, connectionStatus: 'disconnected' });
    }
  },

  /**
   * Synchronizes with in-memory / localStorage orders so local actions
   * (Vendor accept, Runner pick-up, OTP delivery) update tracking instantly
   */
  syncWithOrder: (order: Order) => {
    if (order.id !== get().activeOrderId) return;

    const now = new Date().toISOString();
    const currentStatus = get().currentStatus;

    if (currentStatus !== order.status) {
      set((state) => ({
        order,
        currentStatus: order.status,
        otpCode: order.otpCode,
        runnerInfo: order.runnerName
          ? {
              name: order.runnerName,
              id: order.runnerId,
            }
          : state.runnerInfo,
        lastUpdatedAt: now,
        statusHistory: [
          ...state.statusHistory,
          {
            status: order.status,
            timestamp: now,
            note: `Status updated to ${order.status}`,
          },
        ],
      }));
    } else {
      set({ order, otpCode: order.otpCode });
    }
  },

  resetTracking: () => {
    get().unsubscribe();
    set({
      activeOrderId: null,
      order: null,
      currentStatus: null,
      otpCode: null,
      runnerInfo: null,
      connectionStatus: 'disconnected',
      lastUpdatedAt: null,
      statusHistory: [],
      error: null,
      channel: null,
    });
  },
}));
