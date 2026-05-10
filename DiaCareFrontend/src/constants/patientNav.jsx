import { LayoutDashboard, Activity, Calendar, Pill, Utensils, FlaskConical, Settings, MessageSquare } from 'lucide-react'

export const PATIENT_NAV = [
  { href: '/patient/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={18} />, end: true },
  { href: '/patient/glucose',      label: 'Glucose Log',  icon: <Activity size={18} /> },
  { href: '/patient/appointments', label: 'Appointments', icon: <Calendar size={18} /> },
  { href: '/patient/prescriptions',label: 'Prescriptions',icon: <Pill size={18} /> },
  { href: '/patient/meal-plans',   label: 'Meal Plans',   icon: <Utensils size={18} /> },
  { href: '/patient/lab',          label: 'Lab Results',  icon: <FlaskConical size={18} /> },
  { href: '/patient/chat',         label: 'Chat',         icon: <MessageSquare size={18} /> },
  { href: '/patient/settings',     label: 'Settings',     icon: <Settings size={18} /> },
]

export const PATIENT_PAGE_TITLES = {
  '/patient/dashboard':     'Dashboard',
  '/patient/glucose':       'Glucose Log',
  '/patient/appointments':  'Appointments',
  '/patient/prescriptions': 'Prescriptions',
  '/patient/meal-plans':    'Meal Plans',
  '/patient/lab':           'Lab Results',
  '/patient/chat':          'Chat',
  '/patient/settings':      'Settings',
}
