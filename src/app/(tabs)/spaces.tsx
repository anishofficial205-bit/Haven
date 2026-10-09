import { UsersRound } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { strings } from '@/i18n/en';

export default function SpacesScreen() {
  return (
    <Screen>
      <EmptyState
        icon={UsersRound}
        title={strings.spaces.title}
        body={strings.spaces.placeholder}
        note={strings.common.comingSoon}
      />
    </Screen>
  );
}
