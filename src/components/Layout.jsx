import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { Brain, FileText, Quote, LayoutDashboard, LogOut, Sun, Moon } from 'lucide-react';
import AIAssistant from './AIAssistant';

export default function Layout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  useNotifications();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/quotes', icon: Quote, label: 'Quotes' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link to="/" className="flex items-center gap-2">
                <Brain className="h-7 w-7 sm:h-8 sm:w-8 text-primary-500" />
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 hidden sm:inline">
                  Memory Intelligence
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-slate-100 sm:hidden">
                  MI
                </span>
              </Link>
              
              <div className="flex gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>

      {/* AI Assistant - Available on all pages */}
      <AIAssistant />
    </div>
  );
}
