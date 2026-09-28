import { CalendarCheck, Home, KanbanSquare, ListChecks, MessageSquareText, Star, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Tableau de bord', icon: Home },
  { to: '/weekly', label: 'Suivi hebdo', icon: CalendarCheck },
  { to: '/taskboard', label: 'Taskboard', icon: KanbanSquare },
  { to: '/sprints', label: 'Sprint Backlog', icon: ListChecks },
  { to: '/remarques', label: 'Remarques', icon: MessageSquareText },
  { to: '/performances', label: 'Performances', icon: Star },
];
