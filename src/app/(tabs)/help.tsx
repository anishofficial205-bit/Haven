import { LifeBuoy } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { strings } from '@/i18n/en';

export default function HelpScreen() {
  return (
    <Screen>
      <EmptyState
        icon={LifeBuoy}
        title={strings.help.title}
        body={strings.help.placeholder}
        note={strings.common.comingSoon}
      />
    </Screen>
  );
}
