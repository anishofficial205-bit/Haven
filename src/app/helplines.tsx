import { FormScreen } from '@/components/FormScreen';
import { HelplineList } from '@/components/HelplineList';
import { strings } from '@/i18n/en';

/** Helplines for anyone, signed in or not. */
export default function HelplinesScreen() {
  return (
    <FormScreen title={strings.helplines.title} subtitle={strings.helplines.intro}>
      <HelplineList />
    </FormScreen>
  );
}
