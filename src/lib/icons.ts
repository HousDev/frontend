import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Users,
  Video,
  MoreHorizontal,
  Calendar,
  Clock,
  Bell,
  Send,
  FileText,
  Megaphone,
  User,
  Building2,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Users,
  Video,
  MoreHorizontal,
  Calendar,
  Clock,
  Bell,
  Send,
  FileText,
  Megaphone,
  User,
  Building2,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Zap,
};

const codeToIconNameMap: Record<string, string> = {
  CALL: 'Phone',
  PHONE: 'Phone',
  PHONE_CALL: 'Phone',
  WHATSAPP: 'MessageCircle',
  WA: 'MessageCircle',
  EMAIL: 'Mail',
  MAIL: 'Mail',
  SITE_VISIT: 'MapPin',
  VISIT: 'MapPin',
  MEETING: 'Users',
  MEET: 'Users',
  VIDEO_CALL: 'Video',
  VIDEO: 'Video',
  OTHER: 'MoreHorizontal',
  OTHERS: 'MoreHorizontal',
  PROPOSAL: 'FileText',
  SMS: 'Smartphone',
};

export const availableIconNames = Object.keys(iconMap).sort();

export function getIcon(iconName?: string | null, fallbackCode?: string | null): LucideIcon {
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  const cleanIcon = (iconName || '').toUpperCase();
  if (cleanIcon && codeToIconNameMap[cleanIcon] && iconMap[codeToIconNameMap[cleanIcon]]) {
    return iconMap[codeToIconNameMap[cleanIcon]];
  }
  const cleanCode = (fallbackCode || '').toUpperCase();
  if (cleanCode && codeToIconNameMap[cleanCode] && iconMap[codeToIconNameMap[cleanCode]]) {
    return iconMap[codeToIconNameMap[cleanCode]];
  }
  return Phone;
}
