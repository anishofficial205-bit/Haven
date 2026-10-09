import { Split } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { strings } from '@/i18n/en';

export default function ScenariosScreen() {
  return (
    <Screen>
      <EmptyState
        icon={Split}
        title={strings.scenarios.title}
        body={strings.scenarios.placeholder}
        note={strings.common.comingSoon}
      />
    </Screen>
  );
}
