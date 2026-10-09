import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

import { ANDROID_HIDE_IN_RECENTS } from '@/config';

/** Call once at startup: keeps app content out of the recent-apps switcher. */
export function hideFromAppSwitcher() {
  if (Platform.OS === 'ios') {
    ScreenCapture.enableAppSwitcherProtectionAsync(1).catch(() => {});
  } else if (Platform.OS === 'android' && ANDROID_HIDE_IN_RECENTS) {
    ScreenCapture.preventScreenCaptureAsync('app').catch(() => {});
  }
}

/**
 * Blocks screenshots while a sensitive screen is open (confession detail,
 * help requests). Android blocks them outright; iOS blanks the capture.
 */
export const useBlockScreenshots = ScreenCapture.usePreventScreenCapture;
