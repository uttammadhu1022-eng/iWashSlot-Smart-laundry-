import React, { useState, useEffect, useMemo } from 'react';
import { MachineStatus, IssueReport } from '../types';
import { ALLOWED_STUDENTS, TIME_SLOTS, parseTimeStringToTotalMinutes, isEcoSlot } from '../constants';
import { useLaundryStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import EcoScoreCard from './EcoScoreCard';


const StudentDashboard: React.FC = () => {
  const { currentUser, machines, bookings, issues, bookSlot, checkIn, reportIssue, cancelBooking, deleteIssue } = useLaundryStore();
  const [currentTimeStr, setCurrentTimeStr] = useState(new Date().toLocaleTimeString());
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueDesc, setIssueDesc] = useState('');
  const [issueType, setIssueType] = useState<IssueReport['type']>('MECHANICAL');
  const [confirmedBookings, setConfirmedBookings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeStr(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const stats = useMemo(() => ({
    available: machines.filter(m => m.status === MachineStatus.FREE).length,
    inUse: machines.filter(m => m.status === MachineStatus.IN_USE).length,
    maintenance: machines.filter(m => m.status === MachineStatus.OUT_OF_SERVICE).length,
    utilization: machines.length > 0 ? Math.round((machines.filter(m => m.status === MachineStatus.IN_USE).length / machines.length) * 100) : 0
  }), [machines]);

  const myActiveBookings = bookings.filter(b => 
    b.userUsn === currentUser?.usn && 
    b.date === today && 
    (b.status === 'PENDING' || b.status === 'CHECKED_IN')
  );

  const [showBellDropdown, setShowBellDropdown] = useState(false);

  // Auto-cancel logic for 5-minute unconfirmed pending bookings
  useEffect(() => {
    const interval = setInterval(() => {
      const nowTime = new Date().getTime();
      
      myActiveBookings.forEach(b => {
        if (b.status === 'PENDING' && !localStorage.getItem(`confirmed_book_${b.id}`)) {
          const createdAtTime = b.createdAt || nowTime;
          const timeSinceCreation = nowTime - createdAtTime;
          // If 5 minutes have passed, auto-cancel
          if (timeSinceCreation >= 5 * 60 * 1000) {
            cancelBooking(b.id);
          }
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [myActiveBookings, cancelBooking]);

  const unconfirmedBookings = myActiveBookings.filter(b => b.status === 'PENDING' && !localStorage.getItem(`confirmed_book_${b.id}`));
  const pendingBooking = myActiveBookings.find(b => b.status === 'PENDING');
  let showPreCheckInPrompt = false;
  
  if (pendingBooking) {
    const parts = pendingBooking.slot.includes(' - ') ? pendingBooking.slot.split(' - ') : pendingBooking.slot.split('-');
    const startTotal = parseTimeStringToTotalMinutes(parts[0]);
    const now = new Date();
    const nowTotal = now.getHours() * 60 + now.getMinutes();
    
    // Show prompt between 10 mins before start and the exact start time
    if (nowTotal >= startTotal - 10 && nowTotal < startTotal) {
      if (!confirmedBookings[pendingBooking.id] && !localStorage.getItem(`confirmed_${pendingBooking.id}`)) {
         showPreCheckInPrompt = true;
      }
    }
  }

  const handleConfirmSlot = (id: string) => {
    localStorage.setItem(`confirmed_book_${id}`, 'true');
    setConfirmedBookings(prev => ({...prev, [id]: true}));
    setShowBellDropdown(false);
  };

  const getMachineLiveInfo = (machineId: string) => {
    const now = new Date();
    const nowTotal = now.getHours() * 60 + now.getMinutes();

    const isCurrentTimeInSlot = (slot: string) => {
      const parts = slot.includes(' - ') ? slot.split(' - ') : slot.split('-');
      const startTotal = parseTimeStringToTotalMinutes(parts[0]);
      const endTotal = parseTimeStringToTotalMinutes(parts[1]);
      return nowTotal >= startTotal && nowTotal < endTotal;
    };

    const currentOccupant = bookings.find(b => 
      b.machineId === machineId && 
      b.date === today && 
      (b.status === 'PENDING' || b.status === 'CHECKED_IN') && 
      isCurrentTimeInSlot(b.slot)
    );
    
    const lastSession = bookings
      .filter(b => b.machineId === machineId && b.status === 'COMPLETED')
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    return { currentOccupant, lastSession };
  };

  const handleBook = async (slot: string) => {
    if (!selectedMachine) return;
    const result = await bookSlot(selectedMachine, slot);
    if (!result) {
      // Alert is already fired inside store.ts, so we just return
      return;
    }
    setShowBookingModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold font-poppins text-slate-900 dark:text-white tracking-tight">Welcome, {ALLOWED_STUDENTS.find(s => s.usn.toUpperCase() === currentUser?.usn?.toUpperCase())?.name?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'Student'}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time occupancy of hostel laundry units</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowBellDropdown(!showBellDropdown)}
              className="relative p-3 bg-white dark:bg-slate-800 rounded-full border border-slate-200/50 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unconfirmedBookings.length > 0 && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
              )}
            </button>

            {/* Bell Dropdown */}
            <AnimatePresence>
              {showBellDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50"
                >
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3">Notifications</h3>
                  {unconfirmedBookings.length > 0 ? (
                    <div className="space-y-3">
                      {unconfirmedBookings.map(b => (
                        <div key={b.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                            Please confirm your booking for <strong>Machine {machines.find(m => m.id === b.machineId)?.name}</strong> within 5 minutes or it will reset!
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => cancelBooking(b.id)} className="flex-1 text-xs font-bold py-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={() => handleConfirmSlot(b.id)} className="flex-1 text-xs font-bold py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors">Yes, Confirm</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No new notifications</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* System Clock */}
          <div className="text-right glass px-5 py-3 rounded-2xl border border-slate-200/50 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Clock</p>
            <p className="text-xl font-bold font-poppins text-blue-600 dark:text-blue-400 tabular-nums">{currentTimeStr}</p>
          </div>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Units Free', val: stats.available, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10', icon: 'M5 13l4 4L19 7' },
          { label: 'Active Wash', val: stats.inUse, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Maintenance', val: stats.maintenance, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
          { label: 'Load Factor', val: `${stats.utilization}%`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
        ].map((card, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="glass p-6 rounded-3xl border border-slate-200/50 shadow-sm flex items-center space-x-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{card.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gamified Eco Score Section */}
      <EcoScoreCard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Machine View */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-slate-800 dark:text-white mb-8 flex items-center space-x-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              <span>Live Machine Status</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {machines.map((m, idx) => {
                  const { currentOccupant, lastSession } = getMachineLiveInfo(m.id);
                  const isCurrentlyActive = !!currentOccupant;
                  
                  return (
                    <motion.div 
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-6 rounded-[2rem] border-2 transition-all space-y-4 ${
                      isCurrentlyActive ? 'bg-orange-50/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Unit {m.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${
                            m.status === MachineStatus.FREE ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse' :
                            m.status === MachineStatus.IN_USE ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]' : 'bg-red-500'
                          }`}></span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            {isCurrentlyActive ? 'OCCUPIED' : m.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 min-h-[120px] flex flex-col justify-center">
                        {isCurrentlyActive ? (
                          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/50 shadow-sm">
                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Current Occupant</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{ALLOWED_STUDENTS.find(s => s.usn.toUpperCase() === currentOccupant.userUsn?.toUpperCase())?.name || currentOccupant.userName}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400 font-medium">{currentOccupant.slot}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentOccupant.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {currentOccupant.status}
                              </span>
                            </div>
                          </div>
                        ) : m.status === MachineStatus.FREE ? (
                          <div className="space-y-4">
                            <p className="text-sm text-slate-400 font-medium italic">
                              {lastSession ? `Available since ${new Date(lastSession.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Unit is ready for use'}
                            </p>
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { setSelectedMachine(m.id); setShowBookingModal(true); }}
                              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                            >
                              Reserve Unit
                            </motion.button>
                          </div>
                        ) : (
                          <div className="text-center bg-red-50/80 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/50">
                            <p className="text-sm text-red-600 dark:text-red-400 font-bold">Maintenance Locked</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Available soon</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action Panel Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* User's Reserved Slot Card */}
          <AnimatePresence>
            {myActiveBookings.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-300 dark:shadow-none space-y-6 text-white border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-poppins">My Slot</h3>
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_#3b82f6]"></span>
                </div>
                
                <div className="bg-white/10 rounded-3xl p-6 border border-white/10 space-y-4 backdrop-blur-md">
                  <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Unit</span>
                      <span className="font-bold text-lg">Machine {machines.find(m => m.id === myActiveBookings[0].machineId)?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Time</span>
                      <span className="text-2xl font-bold tracking-tight">{myActiveBookings[0].slot}</span>
                  </div>
                </div>
                
                {myActiveBookings[0].status === 'PENDING' ? (
                  <div className="space-y-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => checkIn(myActiveBookings[0].id)}
                      className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    >
                      Check-In Now
                    </motion.button>
                    <div className="flex justify-between items-center px-2">
                      <p className="text-[10px] text-orange-300 font-bold uppercase tracking-widest">Must Check-In within 5 mins</p>
                      <button 
                        onClick={() => { cancelBooking(myActiveBookings[0].id); }}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-full py-4 bg-green-500/20 text-green-400 font-bold rounded-2xl text-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                      Active Washing Session
                    </div>
                    <div className="text-right px-2">
                      <button 
                        onClick={() => { cancelBooking(myActiveBookings[0].id); }}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors"
                      >
                        End Session
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Issue Reporting CTA */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm space-y-6 cursor-pointer group"
            onClick={() => setShowIssueModal(true)}
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold font-poppins text-slate-800 dark:text-white">Report an Issue</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Experiencing issues with water, power, or mechanical parts? Let us know.</p>
            </div>
          </motion.div>

          {/* My Reports */}
          {issues.filter(i => i.userUsn === currentUser?.usn).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm space-y-4"
            >
              <h3 className="text-lg font-bold font-poppins text-slate-800 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Reports
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {issues.filter(i => i.userUsn === currentUser?.usn).map(issue => (
                  <div key={issue.id} className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit {machines.find(m => m.id === issue.machineId)?.name || issue.machineId}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          issue.status === 'OPEN' ? 'bg-orange-100 text-orange-700' :
                          issue.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {issue.status}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteIssue(issue.id);
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Delete Report"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{issue.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 space-y-8 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                <div>
                  <h2 className="text-3xl font-bold font-poppins text-slate-900 dark:text-white">Choose Slot</h2>
                  <p className="text-sm text-slate-500 font-medium">Machine {machines.find(m => m.id === selectedMachine)?.name}</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {TIME_SLOTS.map(slot => {
                  const takenBooking = bookings.find(b => 
                    b.machineId === selectedMachine && 
                    b.slot === slot && 
                    b.date === today && 
                    (b.status === 'PENDING' || b.status === 'CHECKED_IN')
                  );
                  const isTaken = !!takenBooking;

                  const parts = slot.includes(' - ') ? slot.split(' - ') : slot.split('-');
                  const nowTotal = new Date().getHours() * 60 + new Date().getMinutes();
                  const startTotal = parseTimeStringToTotalMinutes(parts[0]);
                  const endTotal = parseTimeStringToTotalMinutes(parts[1]);
                  const isPast = nowTotal >= endTotal;
                  const isDisabled = isTaken || isPast;

                  const isEco = isEcoSlot(slot);

                  return (
                    <motion.button
                      whileHover={!isDisabled ? { scale: 1.05 } : {}}
                      whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      key={slot}
                      disabled={isDisabled}
                      onClick={() => handleBook(slot)}
                      className={`py-5 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center justify-center relative ${
                        isDisabled 
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                          : isEco
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500 hover:bg-emerald-100/50 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-blue-50 dark:border-blue-900 text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 shadow-sm'
                      }`}
                    >
                      <span>{slot}</span>
                      {isEco && !isDisabled && (
                        <span className="mt-1 px-2 py-0.5 text-[9px] font-black bg-emerald-500 text-slate-950 rounded-full flex items-center gap-1 shadow-sm">
                          🌱 +50 Eco Pts
                        </span>
                      )}
                      {isTaken && <span className="block text-[8px] font-black opacity-40 tracking-tighter mt-1 uppercase text-orange-600 dark:text-orange-400">TAKEN BY {ALLOWED_STUDENTS.find(s => s.usn.toUpperCase() === takenBooking?.userUsn?.toUpperCase())?.name?.split(' ')[0] || takenBooking?.userName?.split(' ')[0] || 'STUDENT'}</span>}
                      {isPast && !isTaken && <span className="block text-[8px] font-black opacity-40 tracking-tighter mt-1">PASSED</span>}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Issue Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-6 border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white">Report Unit Problem</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Affected Machine</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-600" 
                    value={selectedMachine || (machines.length > 0 ? machines[0].id : '')} 
                    onChange={(e) => setSelectedMachine(e.target.value)}
                  >
                    {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue Description</label>
                  <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 h-32 outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-900 dark:text-white resize-none" 
                    placeholder="Describe the malfunction..." 
                    value={issueDesc} 
                    onChange={(e) => setIssueDesc(e.target.value)} 
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowIssueModal(false)} 
                    className="flex-1 py-4 font-bold text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { 
                      if(!issueDesc.trim()) return alert("Please provide details.");
                      reportIssue(selectedMachine || machines[0]?.id, issueDesc, 'MECHANICAL'); 
                      setShowIssueModal(false); 
                      setIssueDesc(''); 
                    }} 
                    className="flex-1 bg-red-500 py-4 font-bold text-white rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-[0.98]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pre-Check-In Reminder Modal */}
      <AnimatePresence>
        {showPreCheckInPrompt && pendingBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-10 space-y-6 border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold font-poppins text-slate-900 dark:text-white">Upcoming Slot!</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                Your laundry slot for <strong className="text-blue-600 dark:text-blue-400">{pendingBooking.slot}</strong> on <strong className="text-slate-800 dark:text-white">Machine {machines.find(m => m.id === pendingBooking.machineId)?.name}</strong> starts in less than 10 minutes. 
                <br/><br/>
                Are you still planning to use this slot?
              </p>
              
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => {
                     cancelBooking(pendingBooking.id);
                  }}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                >
                  No, Cancel It
                </button>
                <button 
                  onClick={() => handleConfirmSlot(pendingBooking.id)}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  Yes, I'm Coming
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
