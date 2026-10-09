import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/i18n/en';

/**
 * The quick-exit decoy: a plain, working calculator with nothing of the app
 * in it. It deliberately uses none of the app's colours or fonts.
 * Holding "=" for two seconds brings the app back.
 */

type Operator = '+' | '-' | '×' | '÷';
type State = {
  display: string;
  stored: number | null;
  operator: Operator | null;
  /** The next digit starts a new number instead of extending the display */
  fresh: boolean;
};

const START: State = { display: '0', stored: null, operator: null, fresh: true };
const UNLOCK_HOLD_MS = 2000;

function compute(a: number, b: number, operator: Operator) {
  if (operator === '+') return a + b;
  if (operator === '-') return a - b;
  if (operator === '×') return a * b;
  return b === 0 ? NaN : a / b;
}

function format(value: number) {
  if (!Number.isFinite(value)) return 'Error';
  const text = String(Number(value.toPrecision(10)));
  return text.length > 12 ? value.toExponential(5) : text;
}

function press(state: State, key: string): State {
  const current = state.display === 'Error' ? 0 : Number(state.display);

  if (key === 'AC') return START;
  if (/^[0-9]$/.test(key)) {
    if (state.fresh || state.display === '0') return { ...state, display: key, fresh: false };
    if (state.display.replace(/[-.]/g, '').length >= 10) return state;
    return { ...state, display: state.display + key };
  }
  if (key === '.') {
    if (state.fresh) return { ...state, display: '0.', fresh: false };
    return state.display.includes('.') ? state : { ...state, display: state.display + '.' };
  }
  if (key === '±') return { ...state, display: format(-current) };
  if (key === '%') return { ...state, display: format(current / 100), fresh: true };
  if (key === '=') {
    if (state.operator == null || state.stored == null) return { ...state, fresh: true };
    return { display: format(compute(state.stored, current, state.operator)), stored: null, operator: null, fresh: true };
  }
  // An operator. Chain the pending one first, e.g. 2 + 3 × shows 5.
  const operator = key as Operator;
  if (state.operator != null && state.stored != null && !state.fresh) {
    const result = compute(state.stored, current, state.operator);
    return { display: format(result), stored: result, operator, fresh: true };
  }
  return { ...state, stored: current, operator, fresh: true };
}

const ROWS = [
  ['AC', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

type Props = {
  onUnlock: () => void;
};

export function Calculator({ onUnlock }: Props) {
  const [state, setState] = useState(START);
  const labels = strings.calculator.keys as Record<string, string>;

  // If the app was closed as a calculator, it opens as one.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar style="light" />
      <View style={styles.displayWrap}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit accessibilityLiveRegion="polite">
          {state.display}
        </Text>
      </View>
      <View style={styles.pad}>
        {ROWS.map((row) => (
          <View key={row.join('')} style={styles.row}>
            {row.map((key) => {
              const isOperator = '÷×-+='.includes(key);
              const isFunction = ['AC', '±', '%'].includes(key);
              return (
                <Pressable
                  key={key}
                  onPress={() => setState((previous) => press(previous, key))}
                  onLongPress={key === '=' ? onUnlock : undefined}
                  delayLongPress={UNLOCK_HOLD_MS}
                  accessibilityRole="button"
                  accessibilityLabel={labels[key] ?? key}
                  style={({ pressed }) => [
                    styles.key,
                    key === '0' && styles.wide,
                    isOperator && styles.operatorKey,
                    isFunction && styles.functionKey,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.keyText, isFunction && styles.functionText]}>{key}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const GAP = 12;
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#000000',
    padding: GAP,
  },
  displayWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: GAP,
    paddingBottom: GAP,
  },
  display: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '300',
  },
  pad: {
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  key: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wide: {
    flex: 2,
    aspectRatio: undefined,
    marginRight: GAP,
  },
  operatorKey: {
    backgroundColor: '#F09A36',
  },
  functionKey: {
    backgroundColor: '#A5A5A5',
  },
  pressed: {
    opacity: 0.7,
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 30,
  },
  functionText: {
    color: '#000000',
  },
});
