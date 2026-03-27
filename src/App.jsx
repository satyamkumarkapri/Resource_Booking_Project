import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ResourceList from './pages/ResourceList';
import BookingHistory from './pages/BookingHistory';
import Login from './pages/Login';
import { Sun, Moon, ChevronDown, LogOut, BookOpen, Home } from 'lucide-react';

export default function App() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Functional Sign Out: Clears temporary local address data
  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAccountOpen(false);
    navigate('/login'); 
    window.location.reload(); 
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Guest', role: 'user' };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans transition-colors">
      {/* Header Section */}
      <header className="border-b border-slate-100 dark:border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-50 transition-colors animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter italic hover:scale-110 transition-transform duration-300">BOOKit</Link>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Home Button */}
          <Link 
            to="/" 
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
              location.pathname === '/' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home size={18} /> Home
          </Link>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300 hover:scale-110"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-slate-400" />
            )}
          </button>
          
          {/* My Account Toggle */}
          {isAuthenticated && (
            <button 
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 shadow-lg shadow-blue-100 transition-all active:scale-95 duration-300"
            >
              My Account <ChevronDown size={16} className={`transition-transform duration-300 ${isAccountOpen ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Account Dropdown */}
          {isAccountOpen && isAuthenticated && (
            <div className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-800 shadow-2xl rounded-[1.5rem] border border-slate-100 dark:border-slate-700 py-3 z-[60] animate-in fade-in slide-in-from-top-2 duration-300 origin-top">
              <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-700 mb-2">
                <p className="font-black text-slate-800 dark:text-white tracking-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{user.role === 'admin' ? 'System Administrator' : 'Authorized User'}</p>
              </div>
              
              <Link 
                to="/history" 
                onClick={() => setIsAccountOpen(false)} 
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <BookOpen size={16} className="text-blue-500" /> {user.role === 'admin' ? 'All Bookings' : 'My Reservations'}
              </Link>
              
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold text-red-500 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/" element={isAuthenticated ? <ResourceList /> : <Navigate to="/login" replace />} />
          <Route path="/home" element={isAuthenticated ? <ResourceList /> : <Navigate to="/login" replace />} />
          <Route path="/history" element={isAuthenticated ? <BookingHistory /> : <Navigate to="/login" replace />} />
          {/* Automatically redirect any unknown path to the home grid */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Section */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 px-8 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
            <h2 className="text-2xl font-black text-blue-600 italic mb-4">BOOKit</h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed">
              Simplifying resource management for students and faculty through a structured digital interface.
            </p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-4">Contact Support</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">📧2500031975@kluniversity.in</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">📞 +91 70611 71017</p>
          </div>
          <div className="md:text-right animate-in fade-in slide-in-from-right-4 duration-500 delay-500">
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-4">Developed By</h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-black hover:scale-105 transition-transform duration-300">Satyam Kumar Kapri</p>
            <p className="text-blue-950 dark:text-red-400 text-sm font-bold hover:scale-105 transition-transform duration-300">Rishika Athchara</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold hover:scale-105 transition-transform duration-300">Uzair Ahmed</p>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-500 delay-600">
          ©️ 2026 BOOKit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}