import data from '../../content/helplines.json';

import { strings } from '@/i18n/en';

export type Helpline = { id: string; number: string; name: string; description: string };

type NameKey = keyof typeof strings.helplines.items;

/** Numbers come from content/helplines.json; names and descriptions from the strings file. */
export const helplines: Helpline[] = data.helplines.map((line) => ({
  id: line.id,
  number: line.number,
  ...strings.helplines.items[line.nameKey as NameKey],
}));
