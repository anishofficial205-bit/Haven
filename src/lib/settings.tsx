import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { deviceStorage } from '@/lib/storage';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type TextSize = 'medium' | 'large' | 'xlarge';

export type Appearance = {
  theme: ThemeChoice;
  textSize: TextSize;
  highContrast: boolean;
};

// The look is designed dark-first; people can switch in Settings > Appearance.
const DEFAULTS: Appearance = { theme: 'dark', textSize: 'medium', highContrast: false };
const STORAGE_KEY = 'appearance';

/** Body text starts at 16 and only ever gets bigger. */
export const TEXT_SCALE: Record<TextSize, number> = { medium: 1, large: 1.15, xlarge: 1.3 };

type SettingsValue = Appearance & { update: (change: Partial<Appearance>) => void };

const SettingsContext = createContext<SettingsValue>({ ...DEFAULTS, update: () => {} });

export function useSettings() {
  return use(SettingsContext);
}

/** Appearance choices, remembered on this phone only. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance | null>(null);

  useEffect(() => {
    deviceStorage
      .get(STORAGE_KEY)
      .catch(() => null)
      .then((stored) => {
        try {
          setAppearance({ ...DEFAULTS, ...(stored ? JSON.parse(stored) : {}) });
        } catch {
          setAppearance(DEFAULTS);
        }
      });
  }, []);

  if (!appearance) return null;

  const value: SettingsValue = {
    ...appearance,
    update(change) {
      const next = { ...appearance, ...change };
      setAppearance(next);
      deviceStorage.set(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    },
  };
  return <SettingsContext value={value}>{children}</SettingsContext>;
}
