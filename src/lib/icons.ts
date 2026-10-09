import {
  BriefcaseBusiness,
  Heart,
  HeartHandshake,
  House,
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

export const TYPE_ICONS: Record<ProfessionalType, LucideIcon> = {
  therapist: Stethoscope,
  intimacy_coach: HeartHandshake,
  legal_advisor: Scale,
};
