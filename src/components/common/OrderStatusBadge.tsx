import React from 'react';
import { OrderStatus } from '../../types';
import { Clock, CheckCircle2, CookingPot, PackageCheck, Bike, XCircle, RotateCcw } from 'lucide-react';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const OrderStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = {
    [OrderStatus.PLACED]: {
      label: 'Order Placed',
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: Clock,
      dot: 'bg-amber-400',
    },
    [OrderStatus.ACCEPTED]: {
      label: 'Accepted',
      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      icon: CookingPot,
      dot: 'bg-blue-400',
    },
    [OrderStatus.PREPARING]: {
      label: 'Preparing in Kitchen',
      bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      icon: CookingPot,
      dot: 'bg-indigo-400',
    },
    [OrderStatus.READY]: {
      label: 'Ready for Pickup',
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      icon: PackageCheck,
      dot: 'bg-purple-400',
    },
    [OrderStatus.OUT_FOR_DELIVERY]: {
      label: 'Out for Delivery',
      bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      icon: Bike,
      dot: 'bg-orange-400',
    },
    [OrderStatus.DELIVERED]: {
      label: 'Delivered',
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      dot: 'bg-emerald-400',
    },
    [OrderStatus.CANCELLED]: {
      label: 'Cancelled',
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: XCircle,
      dot: 'bg-rose-400',
    },
    [OrderStatus.REFUNDED]: {
      label: 'Refunded',
      bg: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
      icon: RotateCcw,
      dot: 'bg-neutral-400',
    },
  }[status];

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span
      id={`status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center rounded-full border font-mono tracking-tight font-medium ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
