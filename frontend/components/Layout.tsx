import React from 'react';
import { useLaundryStore } from '../store';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: 'LANDING' | 'DASHBOARD') => void;
  currentView: 'LANDING' | 'DASHBOARD';
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView }) => {
  const currentUser = useLaundryStore(state => state.currentUser);
  const logout = useLaundryStore(state => state.logout);

  const handleLogout = () => {
    logout();
    onNavigate('LANDING');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter'] dark:bg-slate-950 dark:text-slate-50">
      <header className="glass sticky top-0 z-50 px-4 md:px-8 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center cursor-pointer" 
              onClick={() => onNavigate('LANDING')}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-600/20">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-poppins tracking-tight">iWashSlot</span>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-8 text-slate-500 dark:text-slate-400 font-medium">
              <button onClick={() => onNavigate('LANDING')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</button>
              {!currentUser && <button onClick={() => onNavigate('DASHBOARD')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</button>}
              <button 
                onClick={() => onNavigate('DASHBOARD')} 
                className={`px-5 py-2 rounded-xl transition-all font-semibold ${currentView === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Dashboard
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">{currentUser.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-500 font-bold transition-colors flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('DASHBOARD')}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
