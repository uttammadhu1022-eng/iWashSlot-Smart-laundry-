import React, { useState } from 'react';
import { useLaundryStore } from '../store';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const Login: React.FC = () => {
  const login = useLaundryStore(state => state.login);
  const [view, setView] = useState<'CHOICE' | 'ADMIN' | 'STUDENT'>('CHOICE');
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [usn, setUsn] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/admin/login', {
        id: adminId,
        password: adminPassword,
      });

      const { token, user } = response.data.data;
      login({ ...user, token });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid Admin credentials');
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!usn.trim()) {
      setError('Please enter your USN');
      return;
    }

    if (!studentPassword) {
      setError('Please enter your password');
      return;
    }

    try {
      const response = await api.post('/auth/student/login', {
        usn: usn.trim().toUpperCase(),
        password: studentPassword,
      });

      const { token, user } = response.data.data;
      login({ ...user, token });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid USN or password');
    }
  };

  if (view === 'CHOICE') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-5xl font-bold font-poppins text-slate-900 tracking-tight">Welcome to iWashSlot</h1>
          <p className="text-slate-500 text-lg">Select your portal to manage laundry bookings</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl w-full max-w-md p-10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white text-center space-y-8"
        >
          <div className="space-y-4">
             <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
             </div>
             <h2 className="text-2xl font-bold font-poppins text-slate-800">Login as:</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => { setError(''); setView('STUDENT'); }}
              className="group p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/10 transition-all flex items-center justify-center space-x-4"
            >
              <div className="w-10 h-10 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="font-bold text-slate-700 group-hover:text-slate-900">Student Login</span>
            </button>

            <button 
              onClick={() => { setError(''); setView('ADMIN'); }}
              className="group p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-800 hover:shadow-lg hover:shadow-slate-800/10 transition-all flex items-center justify-center space-x-4"
            >
              <div className="w-10 h-10 bg-slate-50 group-hover:bg-slate-800 group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-slate-700 group-hover:text-slate-900">Admin Login</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-xl w-full max-w-md p-10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white space-y-10"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold font-poppins text-slate-800 tracking-tight">{view === 'ADMIN' ? 'Admin Portal' : 'Student Portal'}</h2>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={view === 'ADMIN' ? handleAdminLogin : handleStudentLogin} className="space-y-6">
          {view === 'ADMIN' ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Admin ID</label>
                <input 
                  type="text" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. js200004"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">USN</label>
                  <input 
                    type="text" 
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    placeholder="e.g. 1JS25IS139"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between px-1 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors" />
                  <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-sm text-blue-600 font-bold hover:text-blue-700 transition-colors">Need help?</button>
              </div>
            </>
          )}

          <div className="space-y-4 pt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] transition-all"
            >
              {view === 'ADMIN' ? 'Secure Login' : 'Login'}
            </motion.button>
          </div>
        </form>
        
        <button onClick={() => setView('CHOICE')} className="w-full text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors">
          &larr; Back to selection
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
