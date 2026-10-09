import { Ban, Bookmark, BookmarkCheck, Flag, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import {
  REPORT_REASONS,
  useBlockAuthor,
  useReport,
  useToggleSave,
  type ReportReason,
  type TargetType,
} from '@/lib/posts';
import { minTapSize, radii, spacing } from '@/theme';

export type MenuTarget = {
  targetType: TargetType;
  id: string;
  isMine: boolean;
  /** Only posts can be saved. Leave undefined for replies. */
  isSaved?: boolean;
};

type Props = {
  target: MenuTarget | null;
  onClose: () => void;
  /** Called after a block, so a detail screen can step back to the feed */
  onBlocked?: () => void;
};

type Step = 'menu' | 'report' | 'reported' | 'block' | 'blocked';

/** The "..." menu on any post or reply: Save, Report, Block. */
export function PostMenu({ target, onClose, onBlocked }: Props) {
  const theme = useTheme();
  const [step, setStep] = useState<Step>('menu');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [failed, setFailed] = useState(false);
  const save = useToggleSave();
  const report = useReport();
  const block = useBlockAuthor();

  const close = () => {
    const wasBlocked = step === 'blocked';
    setStep('menu');
    setReason(null);
    setFailed(false);
    onClose();
    if (wasBlocked) onBlocked?.();
  };

  if (!target) return null;
  const { targetType, id, isMine, isSaved } = target;

  const title = {
    menu: strings.menu.title,
    report: strings.report.title,
    reported: strings.report.doneTitle,
    block: strings.block.title,
    blocked: strings.block.title,
  }[step];

  const row = (Icon: LucideIcon, label: string, onPress: () => void, color = theme.text) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.surfaceAlt : theme.surface }]}>
      <Icon size={22} color={color} />
      <AppText variant="bodyStrong" color={color}>
        {label}
      </AppText>
    </Pressable>
  );

  const error = failed ? (
    <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
      {strings.common.genericError}
    </AppText>
  ) : null;

  return (
    <BottomSheet visible title={title} onClose={close}>
      {step === 'menu' ? (
        <View style={styles.list}>
          {isSaved !== undefined
            ? row(isSaved ? BookmarkCheck : Bookmark, isSaved ? strings.menu.unsave : strings.menu.save, () => {
                save.mutate({ postId: id, saved: isSaved });
                close();
              })
            : null}
          {isMine ? null : row(Flag, strings.menu.report, () => setStep('report'))}
          {isMine ? null : row(Ban, strings.menu.block, () => setStep('block'), theme.danger)}
        </View>
      ) : null}

      {step === 'report' ? (
        <>
          <AppText color={theme.textSecondary}>{strings.report.body}</AppText>
          <View accessibilityRole="radiogroup" style={styles.list}>
            {REPORT_REASONS.map((option) => {
              const selected = option === reason;
              return (
                <Pressable
                  key={option}
                  onPress={() => setReason(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[
                    styles.row,
                    {
                      backgroundColor: selected ? theme.surfaceAlt : theme.surface,
                      borderColor: selected ? theme.primary : 'transparent',
                    },
                  ]}>
                  <AppText variant="bodyStrong" style={styles.flex}>
                    {strings.report.reasons[option]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {error}
          <Button
            label={strings.report.submit}
            disabled={!reason}
            loading={report.isPending}
            onPress={() =>
              report.mutate(
                { targetType, id, reason: reason! },
                { onSuccess: () => setStep('reported'), onError: () => setFailed(true) },
              )
            }
          />
        </>
      ) : null}

      {step === 'reported' ? (
        <>
          <AppText color={theme.textSecondary}>{strings.report.doneBody}</AppText>
          <Button label={strings.report.close} onPress={close} />
        </>
      ) : null}

      {step === 'block' ? (
        <>
          <AppText color={theme.textSecondary}>{strings.block.body}</AppText>
          {error}
          <Button
            label={strings.block.confirm}
            loading={block.isPending}
            onPress={() =>
              block.mutate(
                { targetType, id },
                { onSuccess: () => setStep('blocked'), onError: () => setFailed(true) },
              )
            }
          />
          <Button variant="text" label={strings.block.cancel} onPress={close} />
        </>
      ) : null}

      {step === 'blocked' ? (
        <>
          <AppText color={theme.textSecondary}>{strings.block.done}</AppText>
          <Button label={strings.report.close} onPress={close} />
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    minHeight: minTapSize + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.chip + 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
});
