import React from 'react';
import { motion } from 'framer-motion';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <section className="py-20 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[80vh]">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 space-y-8 text-left z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full font-bold text-sm border border-blue-100 dark:border-blue-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span>V2.0 Now Live - Smart Queueing Added</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-extrabold font-poppins leading-tight text-slate-900 dark:text-white tracking-tight">
            Next-Gen <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Hostel Laundry
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
            Eliminate waiting times and conflicts. Book washing machine slots in advance and get real-time availability right on your phone.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] transition-all flex items-center space-x-2"
            >
              <span>Access Portal</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 font-bold rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              How it works
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="flex-1 relative w-full z-10"
        >
          <div className="relative glass rounded-[2.5rem] p-4 lg:p-8 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-700">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=2070" 
              alt="Modern Laundry" 
              className="relative rounded-2xl shadow-2xl w-full object-cover h-[400px]"
            />
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute top-12 -left-6 glass px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/40"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                 <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status</p>
                <p className="text-sm font-bold text-slate-800">4 Machines Free</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-12 -right-6 glass px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/40"
            >
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                 ✓
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Upcoming</p>
                <p className="text-sm font-bold text-slate-800">Your Slot: 14:00</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 space-y-16 relative z-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-slate-900 dark:text-white">Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Scale</span></h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            A complete suite of tools to manage hostel laundry with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              title: 'QR Code Check-in',
              desc: 'Simply scan the QR code on the physical machine to claim your booked slot instantly.',
              icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
              color: 'from-blue-500 to-blue-600'
            },
            {
              title: 'Smart Waitlist',
              desc: 'Slots full? Join the waitlist and get instantly notified if someone cancels their booking.',
              icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              color: 'from-cyan-500 to-cyan-600'
            },
            {
              title: 'Gamified Eco-Score',
              desc: 'Earn points for washing during off-peak hours and compete on the hostel leaderboard.',
              icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              color: 'from-green-500 to-green-600'
            },
            {
              title: 'Auto-Release',
              desc: 'Strict 5-minute grace period. If you don\'t check in, your slot is released to the waitlist.',
              icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              color: 'from-orange-500 to-orange-600'
            },
            {
              title: 'Predictive Analytics',
              desc: 'Admin dashboard with ML-driven insights on peak usage times and machine health.',
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              color: 'from-purple-500 to-purple-600'
            },
            {
              title: 'Instant Support',
              desc: 'Report mechanical or water issues directly. Machines automatically go offline until fixed.',
              icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
              color: 'from-pink-500 to-pink-600'
            }
          ].map((feature, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-poppins text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
