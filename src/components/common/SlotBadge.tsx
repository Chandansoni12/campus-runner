import React from 'react';
import { SlotWindow } from '../../types';
import { Sun, CloudSun, Sunset, Moon } from 'lucide-react';
import { SLOT_TIMINGS } from '../../business-logic';

interface Props {
  slot: SlotWindow;
  size?: 'sm' | 'md';
}

export const SlotBadge: React.FC<Props> = ({ slot, size = 'sm' }) => {
  const info = SLOT_TIMINGS[slot];
  const icon = {
    [SlotWindow.MORNING]: Sun,
    [SlotWindow.LUNCH]: CloudSun,
    [SlotWindow.EVENING]: Sunset,
    [SlotWindow.NIGHT]: Moon,
  }[slot];

  const Icon = icon;

  return (
    <span
      id={`slot-badge-${slot.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-200 font-semibold tracking-wide shadow-[0_0_10px_rgba(253,105,49,0.1)] ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <Icon className="w-3.5 h-3.5 text-[#FD6931]" />
      <span>{info.label}</span>
    </span>
  );
};
