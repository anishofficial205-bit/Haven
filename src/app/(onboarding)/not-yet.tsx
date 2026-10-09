import { FormScreen } from '@/components/FormScreen';
import { HelplineList } from '@/components/HelplineList';
import { strings } from '@/i18n/en';

/** Under 16: no account, a kind explanation, and helplines. */
export default function NotYetScreen() {
  return (
    <FormScreen title={strings.notYet.title} subtitle={strings.notYet.body}>
      <HelplineList />
    </FormScreen>
  );
}
