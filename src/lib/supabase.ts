import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

/** False until the keys are added to .env (see README). */
export const isSupabaseConfigured = Boolean(url && key);

/**
 * Keeps the session in the phone's encrypted keystore. A session is larger
 * than the keystore's per-item limit, so it is stored in pieces.
 */
const CHUNK_SIZE = 1800;
const secureStorage = {
  async getItem(name: string) {
    const count = Number(await SecureStore.getItemAsync(`${name}.count`));
    if (!count) return null;
    const parts = await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(`${name}.${i}`)),
    );
    return parts.some((part) => part == null) ? null : parts.join('');
  },
  async setItem(name: string, value: string) {
    await this.removeItem(name);
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${name}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${name}.count`, String(count));
  },
  async removeItem(name: string) {
    const count = Number(await SecureStore.getItemAsync(`${name}.count`));
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${name}.${i}`);
    }
    await SecureStore.deleteItemAsync(`${name}.count`);
  },
};

// The keystore only exists on phones. The browser preview uses its own storage.
const storage = Platform.OS === 'web' ? undefined : secureStorage;

export const supabase = createClient(url ?? 'http://localhost', key ?? 'not-configured', {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
