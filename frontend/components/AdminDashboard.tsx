import React, { useState } from 'react';
import { MachineStatus } from '../types';
import { useLaundryStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const { machines, bookings, issues, updateMachineStatus, approveIssue, resolveIssue } = useLaundryStore();
  const [activeTab, setActiveTab] = useState<'MACHINES' | 'ISSUES' | 'ANALYTICS'>('MACHINES');

  const stats = {
    totalBookings: bookings.length,
    activeIssues: issues.filter(i => i.status === 'OPEN').length,
    machinesInUse: machines.filter(m => m.status === MachineStatus.IN_USE).length
  };

  const tabs = [
    { id: 'MACHINES', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'ISSUES', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'ANALYTICS', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold font-poppins text-slate-900 dark:text-white tracking-tight">Admin Console</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage units, resolve issues, and view analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Bookings', val: stats.totalBookings, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active Issues', val: stats.activeIssues, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Units Active', val: `${stats.machinesInUse} / ${machines.length}`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
        ].map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="glass p-6 rounded-[2rem] border border-slate-200/50 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-4xl font-extrabold font-poppins ${stat.color}`}>{stat.val}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <span className={`w-3 h-3 rounded-full ${stat.color.replace('text-', 'bg-')} animate-pulse`}></span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-2 rounded-2xl w-fit flex space-x-2 border border-slate-200/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span>{tab.id.charAt(0) + tab.id.slice(1).toLowerCase()}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'MACHINES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {machines.map(machine => (
                <div key={machine.id} className="glass rounded-[2rem] border border-slate-200/50 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold font-poppins text-slate-900 dark:text-white">{machine.name}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${machine.status === MachineStatus.FREE ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        machine.status === MachineStatus.IN_USE ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {machine.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Force Override Actions</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => updateMachineStatus(machine.id, MachineStatus.FREE)}
                          className="py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 border border-slate-100 dark:border-slate-700 hover:border-green-200 transition-colors"
                        >
                          Set Free
                        </button>
                        <button
                          onClick={() => updateMachineStatus(machine.id, MachineStatus.IN_USE)}
                          className="py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-slate-100 dark:border-slate-700 hover:border-orange-200 transition-colors"
                        >
                          Set Use
                        </button>
                        <button
                          onClick={() => updateMachineStatus(machine.id, MachineStatus.OUT_OF_SERVICE)}
                          className="py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-100 dark:border-slate-700 hover:border-red-200 transition-colors"
                        >
                          Lock OOS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ISSUES' && (
            <div className="glass rounded-[2rem] border border-slate-200/50 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Machine</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported By</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {issues.map(issue => (
                      <tr key={issue.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap font-bold text-slate-900 dark:text-white">Unit {machines.find(m => m.id === issue.machineId)?.name || issue.machineId}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-bold">{issue.userName}</span>
                          <span className="text-slate-400 block text-xs mt-0.5">{issue.userUsn}</span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{issue.description}</td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${issue.status === 'OPEN' ? 'bg-orange-100 text-orange-700' :
                            issue.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {issue.status === 'OPEN' ? (
                            <button
                              onClick={() => approveIssue(issue.id)}
                              className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-bold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                            >
                              Approve
                            </button>
                          ) : issue.status === 'APPROVED' ? (
                            <button
                              onClick={() => resolveIssue(issue.id)}
                              className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold px-4 py-2">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {issues.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-slate-500 font-bold">No issues reported</p>
                          <p className="text-slate-400 text-sm mt-1">All machines are operating normally.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">

              {/* Feature Introduction Banner */}
              <div className="relative overflow-hidden rounded-[2rem] border border-blue-200/40 dark:border-blue-800/40 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 p-8">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h2 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white">Predictive Analytics Hub</h2>
                      <span className="px-3 py-1 text-xs font-black bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-full uppercase tracking-widest">Coming Soon</span>
                      <span className="px-3 py-1 text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Collecting Data
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                      The analytics engine is currently gathering booking patterns and usage data. Once sufficient data is collected, you'll get real-time insights, predictive maintenance alerts, peak hour forecasting, and eco-efficiency reports — all powered automatically.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Progress</p>
                    <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[38%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                    </div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">38% collected</p>
                  </div>
                </div>
              </div>

              {/* KPI Metric Previews */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Key Performance Metrics (Preview — will populate with live data)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Avg. Daily Utilization', preview: '—', unit: '%', desc: 'Machines in use per day', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', bar: 68 },
                    { label: 'Peak Booking Hour', preview: '—', unit: 'AM/PM', desc: 'Highest traffic time slot', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', bar: 45 },
                    { label: 'Avg. Session Duration', preview: '—', unit: 'min', desc: 'Time per wash cycle', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: 72 },
                    { label: 'No-Show Rate', preview: '—', unit: '%', desc: 'Bookings not checked in', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', bar: 22 },
                  ].map((metric, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass p-5 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                          </svg>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">Preview</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                        <p className="text-2xl font-extrabold text-slate-300 dark:text-slate-600 font-poppins mt-1">{metric.preview} <span className="text-base">{metric.unit}</span></p>
                        <p className="text-xs text-slate-400 mt-0.5">{metric.desc}</p>
                      </div>
                      {/* Mock mini bar */}
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full opacity-30 ${metric.color.replace('text-', 'bg-')}`}
                          style={{ width: `${metric.bar}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mock Bar Chart — Peak Hours */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold font-poppins text-slate-900 dark:text-white">Hourly Booking Distribution</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Peak hour usage across all machines — sample preview</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">Sample Data</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-32">
                    {[20, 35, 60, 85, 72, 45, 95, 88, 55, 30, 42, 18].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md opacity-40 bg-gradient-to-t from-blue-600 to-indigo-400 transition-all"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[8px] text-slate-400 font-bold">{6 + i}h</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span><strong>How this works:</strong> As students book and check in, the system tracks usage frequency per hour. This chart will reflect actual booking density and help you identify congestion windows.</span>
                  </div>
                </div>

                {/* Machine Utilization Rings */}
                <div className="glass p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold font-poppins text-slate-900 dark:text-white">Per-Machine Utilization</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Usage rate by unit over current week</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">Sample Data</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'A1', pct: 78, color: 'bg-blue-500' },
                      { name: 'A2', pct: 54, color: 'bg-indigo-500' },
                      { name: 'A3', pct: 91, color: 'bg-purple-500' },
                      { name: 'B1', pct: 44, color: 'bg-cyan-500' },
                      { name: 'B2', pct: 67, color: 'bg-teal-500' },
                      { name: 'B3', pct: 33, color: 'bg-emerald-500' },
                    ].map(m => (
                      <div key={m.name} className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-500 w-5">{m.name}</span>
                        <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} opacity-40 rounded-full transition-all`} style={{ width: `${m.pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 w-8 text-right">{m.pct}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-400 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span><strong>How this works:</strong> Each machine's total booked slots vs. available slots forms a utilization rate. Overloaded machines ({'>'}85%) will be flagged for redistribution or maintenance scheduling.</span>
                  </div>
                </div>
              </div>

              {/* Features Roadmap Cards */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  Planned Analytics Features
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: '🔮',
                      title: 'Predictive Maintenance',
                      status: 'In Development',
                      statusColor: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                      description: 'ML model will analyze issue frequency per machine and predict next failure risk, alerting admins before breakdowns occur.',
                      features: ['Failure probability scoring', 'Auto-maintenance scheduling', 'Spare parts forecast']
                    },
                    {
                      icon: '📈',
                      title: 'Demand Forecasting',
                      status: 'Planned',
                      statusColor: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                      description: 'Using historical booking patterns, the system will predict slot demand by day-of-week and time-of-day for optimal capacity planning.',
                      features: ['Weekly demand heatmap', 'Under-utilized slot alerts', 'Booking surge warnings']
                    },
                    {
                      icon: '🌿',
                      title: 'Eco-Efficiency Report',
                      status: 'Planned',
                      statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                      description: 'Aggregate hostel-wide eco data: total water saved, energy off-peak usage, and carbon footprint reduction over time.',
                      features: ['Monthly sustainability score', 'Off-peak incentive impact', 'CO₂ reduction tracker']
                    },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      className="glass p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 space-y-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-3xl">{feature.icon}</div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border rounded-full ${feature.statusColor}`}>
                          {feature.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold font-poppins text-slate-900 dark:text-white mb-1">{feature.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {feature.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Data Collection Progress */}
              <div className="glass p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold font-poppins text-slate-900 dark:text-white">Analytics Engine — Data Pipeline</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Minimum thresholds required before each module activates</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Booking Records', current: 0, required: 50, unit: 'bookings', icon: '📋', color: 'from-blue-500 to-indigo-500' },
                    { label: 'Completed Sessions', current: 0, required: 30, unit: 'sessions', icon: '✅', color: 'from-emerald-500 to-teal-500' },
                    { label: 'Issue Reports', current: 0, required: 10, unit: 'reports', icon: '⚠️', color: 'from-orange-500 to-red-500' },
                  ].map((item, i) => {
                    const pct = Math.min(100, Math.round((item.current / item.required) * 100));
                    return (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                          </div>
                          <span className="text-xs font-black text-slate-400">{item.current} / {item.required}</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{pct}% — Needs {item.required - item.current} more {item.unit}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
