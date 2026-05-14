import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  FlaskConical,
  Calendar,
  Settings,
  UsersRound,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

export const ADMIN_NAV = [
  { href: '/dashboard',     label: 'Dashboard',     icon: <LayoutDashboard size={18} />, end: true },
  { href: '/patients',      label: 'Patients',      icon: <Users size={18} /> },
  { href: '/staff',         label: 'Staff',         icon: <UsersRound size={18} /> },
  { href: '/doctors',       label: 'Doctors',       icon: <Stethoscope size={18} /> },
  { href: '/glucose',       label: 'Glucose Log',   icon: <Activity size={18} /> },
  { href: '/reports',       label: 'Reports',       icon: <FileText size={18} /> },
  { href: '/lab',           label: 'Lab Results',   icon: <FlaskConical size={18} /> },
  { href: '/appointments',  label: 'Appointments',  icon: <Calendar size={18} /> },
  { href: '/chat',          label: 'Chat',          icon: <MessageSquare size={18} /> },
  { href: '/activity-logs', label: 'Activity Logs', icon: <ShieldCheck size={18} /> },
  { href: '/settings',      label: 'Settings',      icon: <Settings size={18} /> },
]

export const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/patients':      'Patients',
  '/staff':         'Staff',
  '/doctors':       'Doctors',
  '/glucose':       'Glucose Log',
  '/reports':       'Reports',
  '/lab':           'Lab Results',
  '/appointments':  'Appointments',
  '/chat':          'Chat',
  '/activity-logs': 'Activity Logs',
  '/settings':      'Settings',
}
