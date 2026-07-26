import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Droplets, 
  Zap, 
  Award, 
  Trophy, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Info,
  ChevronRight,
  Medal,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useLaundryStore } from '../store';

const EcoScoreCard: React.FC = () => {
  const { ecoProfile, badges, leaderboard, currentUser } = useLaundryStore();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BADGES' | 'LEADERBOARD'>('OVERVIEW');
  const [showRewardModal, setShowRewardModal] = useState(false);

  // Level milestones
  const getLevelProgress = (points: number) => {
    if (points >= 1500) return { title: 'Planet Savior', nextPoints: 2000, percentage: 100 };
    if (points >= 1200) return { title: 'Eco Champion', nextPoints: 1500, percentage: Math.round(((points - 1200) / 300) * 100) };
    if (points >= 800) return { title: 'Green Washer', nextPoints: 1200, percentage: Math.round(((points - 800) / 400) * 100) };
    if (points >= 400) return { title: 'Eco Apprentice', nextPoints: 800, percentage: Math.round(((points - 400) / 400) * 100) };
    return { title: 'Eco Novice', nextPoints: 400, percentage: Math.round((points / 400) * 100) };
  };

  const levelInfo = getLevelProgress(ecoProfile.ecoPoints);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Background Gradient Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Gamified Eco-Score
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Live Track
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Earn Eco-Points by booking off-peak slots & optimizing laundry loads
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-stretch md:self-auto">
          {(['OVERVIEW', 'BADGES', 'LEADERBOARD'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'OVERVIEW' && 'Overview'}
              {tab === 'BADGES' && 'Badges'}
              {tab === 'LEADERBOARD' && 'Leaderboard'}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Main Score Hero Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
            {/* Left Score Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-slate-700/60 pb-6 lg:pb-0 lg:pr-6">
              <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-slate-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="text-emerald-400"
                    strokeWidth="10"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * levelInfo.percentage) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * levelInfo.percentage) / 100 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{ecoProfile.ecoPoints}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Eco-Points</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">{levelInfo.title}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {levelInfo.nextPoints - ecoProfile.ecoPoints} pts to next level
              </p>
            </div>

            {/* Right Metrics Cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Water Saved */}
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center hover:border-cyan-500/40 transition-colors">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold text-cyan-300 block">{ecoProfile.waterSavedLiters} L</span>
                  <span className="text-[10px] text-slate-400">Water Saved</span>
                </div>

                {/* Energy Saved */}
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center hover:border-amber-500/40 transition-colors">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold text-amber-300 block">{ecoProfile.energySavedKwh} kWh</span>
                  <span className="text-[10px] text-slate-400">Energy Saved</span>
                </div>

                {/* Eco Streak */}
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center hover:border-orange-500/40 transition-colors">
                  <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <Flame className="w-4 h-4 animate-bounce" />
                  </div>
                  <span className="text-lg font-bold text-orange-300 block">{ecoProfile.currentStreak} Wks</span>
                  <span className="text-[10px] text-slate-400">Green Streak</span>
                </div>
              </div>

              {/* Eco Bonus Banner */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    🌱
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-300">Off-Peak Eco-Slot Bonus Active</h4>
                    <p className="text-[11px] text-slate-400">Book morning (6-9 AM) or afternoon (1-4 PM) for +50 pts</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRewardModal(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-md"
                >
                  Rewards Info
                </button>
              </div>
            </div>
          </div>

          {/* Quick Badges Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Recent Achievements
              </h3>
              <button
                onClick={() => setActiveTab('BADGES')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                View All ({badges.length}) <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {badges.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                    b.unlocked
                      ? 'bg-slate-800/60 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-700/60 flex items-center justify-center">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      {b.title}
                      {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BADGES TAB */}
      {activeTab === 'BADGES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border flex items-start gap-4 relative overflow-hidden transition-all ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}
              >
                <div className="text-3xl p-3 bg-slate-950/80 rounded-xl border border-slate-700/60 shrink-0">
                  {badge.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {badge.title}
                      {badge.unlocked ? (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-semibold border border-slate-700 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">{badge.description}</p>

                  {/* Progress Bar for Locked Badges */}
                  {!badge.unlocked && (
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'LEADERBOARD' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">Hostel Sustainability Leaderboard</h3>
            </div>
            <span className="text-xs text-slate-400">Monthly Reset</span>
          </div>

          <div className="divide-y divide-slate-800/80 bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            {leaderboard.map((student) => {
              const isSelf = currentUser && student.usn === currentUser.usn;
              return (
                <div
                  key={student.usn}
                  className={`p-3.5 flex items-center justify-between gap-4 transition-colors ${
                    isSelf ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      student.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20' :
                      student.rank === 2 ? 'bg-slate-300 text-slate-950' :
                      student.rank === 3 ? 'bg-amber-700 text-amber-100' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      #{student.rank}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {student.name}
                        {isSelf && (
                          <span className="text-[10px] px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-500/30">
                            You
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{student.usn}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          {student.levelTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400 block">{student.points} pts</span>
                    <span className="text-[10px] text-slate-400">{student.badgeCount} Badges</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rewards Info Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 text-white relative shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Eco Rewards Program</h3>
                </div>
                <button 
                  onClick={() => setShowRewardModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 py-4 text-xs text-slate-300">
                <p>
                  By participating in sustainable laundry habits, you unlock hostel perks and exclusive benefits:
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-emerald-400 font-bold">🥇 Top 3 Rank:</span>
                    <span>Free priority booking window (10-min pre-booking) & monthly Green Certificate.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-teal-400 font-bold">🌱 Eco-Slot Bonus:</span>
                    <span>Earn +50 points instantly whenever you select off-peak morning or afternoon slots.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-amber-400 font-bold">⚡ Planet Savior (1500+ pts):</span>
                    <span>Featured status on hostel bulletin & bonus laundry credit voucher!</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowRewardModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-slate-950 rounded-xl text-xs shadow-lg hover:brightness-110 transition-all"
              >
                Got It, Keep Washing Green!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EcoScoreCard;
