import {
  BriefcaseBusiness,
  Heart,
  HeartHandshake,
  House,
  MessageCircle,
  Rainbow,
  Scale,
  Smartphone,
  Stethoscope,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';

import type { ProfessionalType } from '@/lib/help';
import type { Domain } from '@/lib/scenarios';

export const DOMAIN_ICONS: Record<Domain, LucideIcon> = {
  family: House,
  friends: UsersRound,
  relationships: Heart,
  digital: Smartphone,
  college_work: BriefcaseBusiness,
};

/** Keyed by a space's slug. Anything new falls back to FALLBACK_SPACE_ICON. */
export const SPACE_ICONS: Record<string, LucideIcon> = {
  relationships: Heart,
  'digital-boundaries': Smartphone,
  'family-pressure': House,
  'college-workplace': BriefcaseBusiness,
  lgbtq: Rainbow,
  'just-talk': MessageCircle,
};
export const FALLBACK_SPACE_ICON = UsersRound;

export const TYPE_ICONS: Record<ProfessionalType, LucideIcon> = {
  therapist: Stethoscope,
  intimacy_coach: HeartHandshake,
  legal_advisor: Scale,
};
