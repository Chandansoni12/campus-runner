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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 font-medium ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <Icon className="w-3.5 h-3.5 text-orange-400" />
      <span>{info.label}</span>
    </span>
  );
};
