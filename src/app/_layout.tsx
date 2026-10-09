import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useSchemeName, useTheme } from '@/hooks/useTheme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { PanicProvider } from '@/lib/panic';
import { hideFromAppSwitcher } from '@/lib/privacy';
import { SettingsProvider } from '@/lib/settings';

SplashScreen.preventAutoHideAsync();
hideFromAppSwitcher();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  if (!fontsLoaded && fontError == null) return null;

  // PanicProvider sits outside everything else: after a quick exit it renders
  // only the calculator and none of the screens below exist at all.
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <PanicProvider>
            <RootNavigator />
          </PanicProvider>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const scheme = useSchemeName();
  const theme = useTheme();
  const { stage } = useAuth();
  const ready = stage !== 'loading';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  // Each group of screens is only reachable in its own stage, so nobody can
  // skip the recovery code or the consent screen, or reach the app signed out.
  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={stage === 'onboarding'}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={stage === 'recovery'}>
          <Stack.Screen name="recovery-code" />
        </Stack.Protected>
        <Stack.Protected guard={stage === 'consent'}>
          <Stack.Screen name="consent" />
        </Stack.Protected>
        <Stack.Protected guard={stage === 'app'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="post/[id]" />
          <Stack.Screen name="compose" />
          <Stack.Screen name="scenario/[id]" />
          <Stack.Screen name="space/[id]" />
          <Stack.Screen name="question/[id]" />
          <Stack.Screen name="help/[type]" />
          <Stack.Screen name="help/professional/[id]" />
          <Stack.Screen name="help/request/[id]" />
          <Stack.Screen name="help/requests/index" />
          <Stack.Screen name="help/requests/[id]" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/privacy" />
          <Stack.Screen name="settings/account" />
          <Stack.Screen name="settings/appearance" />
          <Stack.Screen name="about/[page]" />
          <Stack.Screen name="mod/index" />
        </Stack.Protected>
        <Stack.Screen name="policy" />
        <Stack.Screen name="helplines" />
      </Stack>
      {/* Signed-in screens sit under the violet header, so their status bar icons stay light. */}
      <StatusBar style={stage === 'app' ? 'light' : 'auto'} />
    </ThemeProvider>
  );
}
