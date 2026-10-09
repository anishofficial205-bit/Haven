import { X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { HelplineList } from '@/components/HelplineList';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { minTapSize, radii, spacing } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Opens when the shield is held down: helplines, one tap to call. */
export function HelpSheet({ visible, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.fill}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={strings.common.close}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { backgroundColor: theme.background, paddingBottom: insets.bottom + spacing.lg },
          ]}>
          <View style={styles.titleRow}>
            <AppText variant="heading" accessibilityRole="header" style={styles.title}>
              {strings.helplines.title}
            </AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={strings.common.close}
              style={styles.close}>
              <X size={24} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <AppText color={theme.textSecondary}>{strings.helplines.intro}</AppText>
            <HelplineList />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(18, 14, 31, 0.5)',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  title: {
    flex: 1,
  },
  close: {
    width: minTapSize,
    height: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
});
