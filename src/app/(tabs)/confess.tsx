import { MessageCircleHeart } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { strings } from '@/i18n/en';

export default function ConfessScreen() {
  return (
    <Screen>
      <EmptyState
        icon={MessageCircleHeart}
        title={strings.confess.title}
        body={strings.confess.placeholder}
        note={strings.common.comingSoon}
      />
    </Screen>
  );
}
