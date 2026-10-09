import { router } from 'expo-router';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { Calculator } from '@/components/Calculator';
import { HelpSheet } from '@/components/HelpSheet';
import { deviceStorage } from '@/lib/storage';

const DECOY_KEY = 'quick_exit_active';

type PanicValue = {
  /** Instantly replaces the whole app with the calculator. */
  quickExit: () => void;
  /** Opens the helpline sheet. */
  openHelp: () => void;
};

const PanicContext = createContext<PanicValue | null>(null);

export function usePanic() {
  const value = use(PanicContext);
  if (!value) throw new Error('usePanic must be used inside PanicProvider');
  return value;
}

/**
 * Wraps the whole app. While the decoy is showing, nothing of the app is
 * rendered at all: the screens are unmounted, so there is no history to go
 * back to. If the app is closed and reopened, it is still a calculator.
 */
export function PanicProvider({ children }: { children: ReactNode }) {
  const [decoy, setDecoy] = useState<boolean | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    deviceStorage
      .get(DECOY_KEY)
      .catch(() => null)
      .then((stored) => setDecoy(stored === '1'));
  }, []);

  if (decoy === null) return null;

  if (decoy) {
    return (
      <Calculator
        onUnlock={() => {
          setDecoy(false);
          deviceStorage.remove(DECOY_KEY).catch(() => {});
        }}
      />
    );
  }

  const value: PanicValue = {
    quickExit() {
      // Switch first, save afterwards: nothing may delay the exit.
      setHelpOpen(false);
      setDecoy(true);
      // Forget where they were, so coming back always starts at Home.
      router.replace('/');
      deviceStorage.set(DECOY_KEY, '1').catch(() => {});
    },
    openHelp: () => setHelpOpen(true),
  };

  return (
    <PanicContext value={value}>
      {children}
      <HelpSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </PanicContext>
  );
}
