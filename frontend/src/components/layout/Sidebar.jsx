import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileEdit,
  Users,
  ClipboardList,
  PenLine,
  BarChart3,
  FileText,
  Settings,
  GraduationCap,
  ClipboardCheck,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/draft-builder', label: 'Student Draft Builder', icon: FileEdit },
  { path: '/students', label: 'Student Management', icon: Users },
  { path: '/tests', label: 'Test Creation', icon: ClipboardList },
  { path: '/marks', label: 'Marks Entry', icon: PenLine },
  { path: '/analysis', label: 'Analysis', icon: BarChart3 },
  { path: '/reports', label: 'Report Generation', icon: FileText },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarOpen } = useSelector((s) => s.ui);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 dark:border-gray-700">
        <GraduationCap className="text-primary-600 shrink-0" size={28} />
        {sidebarOpen && (
          <span className="font-bold text-gray-900 dark:text-white truncate">School ERP</span>
        )}
      </div>
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon size={20} className="shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
