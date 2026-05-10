import {
  LayoutDashboard, Users, Activity,
  Calendar, FlaskConical, Settings, Pill, MessageSquare,
} from 'lucide-react'

export const DOCTOR_NAV = [
  { href: '/doctor/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={18} />, end: true },
  { href: '/doctor/patients',     label: 'My Patients',  icon: <Users size={18} /> },
  { href: '/doctor/glucose',      label: 'Glucose Log',  icon: <Activity size={18} /> },
  { href: '/doctor/appointments', label: 'Appointments', icon: <Calendar size={18} /> },
  { href: '/doctor/patient-care', label: 'Patient Care', icon: <Pill size={18} /> },
  { href: '/doctor/lab',          label: 'Lab Results',  icon: <FlaskConical size={18} /> },
  { href: '/doctor/chat',         label: 'Chat',         icon: <MessageSquare size={18} /> },
  { href: '/doctor/settings',     label: 'Settings',     icon: <Settings size={18} /> },
]

export const DOCTOR_PAGE_TITLES = {
  '/doctor/dashboard':    'Dashboard',
  '/doctor/patients':     'My Patients',
  '/doctor/glucose':      'Glucose Log',
  '/doctor/appointments': 'Appointments',
  '/doctor/patient-care': 'Patient Care',
  '/doctor/lab':          'Lab Results',
  '/doctor/chat':         'Chat',
  '/doctor/settings':     'Settings',
}
