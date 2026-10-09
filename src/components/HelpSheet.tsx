import { AppText } from '@/components/AppText';
import { BottomSheet } from '@/components/BottomSheet';
import { HelplineList } from '@/components/HelplineList';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Opens when the shield is held down: helplines, one tap to call. */
export function HelpSheet({ visible, onClose }: Props) {
  const theme = useTheme();
  return (
    <BottomSheet visible={visible} title={strings.helplines.title} onClose={onClose}>
      <AppText color={theme.textSecondary}>{strings.helplines.intro}</AppText>
      <HelplineList />
    </BottomSheet>
  );
}
