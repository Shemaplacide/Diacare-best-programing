import { LayoutDashboard, Users, Activity, FileText,
<<<<<<< HEAD
  FlaskConical, Calendar, Settings, UsersRound,
=======
  FlaskConical, Calendar, Settings, UsersRound, MessageSquare,
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
} from 'lucide-react'

export const ADMIN_NAV = [
  { href: '/dashboard',    label: 'Dashboard',     icon: <LayoutDashboard size={18} />, end: true },
  { href: '/patients',     label: 'Patients',       icon: <Users size={18} /> },
  { href: '/staff',        label: 'Staff',          icon: <UsersRound size={18} /> },
  { href: '/glucose',      label: 'Glucose Log',    icon: <Activity size={18} /> },
  { href: '/reports',      label: 'Reports',        icon: <FileText size={18} /> },
  { href: '/lab',          label: 'Lab Results',    icon: <FlaskConical size={18} /> },
  { href: '/appointments', label: 'Appointments',   icon: <Calendar size={18} /> },
<<<<<<< HEAD
=======
  { href: '/chat',         label: 'Chat',           icon: <MessageSquare size={18} /> },
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
  { href: '/settings',     label: 'Settings',       icon: <Settings size={18} /> },
]

export const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/patients':     'Patients',
  '/staff':        'Staff',
  '/glucose':      'Glucose Log',
  '/reports':      'Reports',
  '/lab':          'Lab Results',
  '/appointments': 'Appointments',
<<<<<<< HEAD
=======
  '/chat':         'Chat',
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
  '/settings':     'Settings',
  '/profile':      'My Profile',
}
