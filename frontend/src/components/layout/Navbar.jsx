import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import { toggleSidebar, setTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { setActiveSession } from '../../store/slices/sessionSlice';
import { getImageUrl } from '../../utils/helpers';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { sessions, activeSessionId, activeSessionName } = useSelector((s) => s.session);
  const { theme } = useSelector((s) => s.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>

        <div className="relative">
          <select
            value={activeSessionId || ''}
            onChange={(e) => {
              const session = sessions.find((s) => s._id === e.target.value);
              if (session) dispatch(setActiveSession({ id: session._id, name: session.name }));
            }}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>

        {activeSessionName && (
          <span className="hidden md:inline text-xs px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 rounded-full">
            {activeSessionName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2">
          {user?.profilePhoto ? (
            <img src={getImageUrl(user.profilePhoto)} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]}
            </div>
          )}
          <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
