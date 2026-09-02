'use client';

// =============================================================================
// Theme Store (Zustand) — Day Mode (Light) vs Night Ops Mode (Dark)
// =============================================================================
// Provides control room operators with:
// - Day Mode (Crisp high-visibility executive light theme for daytime shifts)
// - Night Ops Mode (Low-glare dark theme for overnight shift operations)
// =============================================================================

import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Default to clean, professional Day Mode to immediately eliminate AI dark-slop feel
  theme: 'light',

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    set({ theme: next });
  },

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ theme });
  },
}));
