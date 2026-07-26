import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Machine, Booking, IssueReport, MachineStatus, UserRole, EcoProfile, AchievementBadge, LeaderboardEntry } from './types';
import { api } from './services/api';
import { INITIAL_ACHIEVEMENTS, MOCK_LEADERBOARD, isEcoSlot } from './constants';

interface UserState {
  name: string;
  role: UserRole;
  usn: string;
  phone?: string;
  token?: string;
}

interface LaundryState {
  currentUser: UserState | null;
  machines: Machine[];
  bookings: Booking[];
  issues: IssueReport[];
  ecoProfile: EcoProfile;
  badges: AchievementBadge[];
  leaderboard: LeaderboardEntry[];
  
  // Actions
  login: (user: UserState) => void;
  logout: () => void;
  bookSlot: (machineId: string, slot: string) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  checkIn: (bookingId: string) => Promise<boolean>;
  reportIssue: (machineId: string, description: string, type: IssueReport['type']) => Promise<boolean>;
  deleteIssue: (issueId: string) => Promise<boolean>;
  approveIssue: (issueId: string) => Promise<boolean>;
  resolveIssue: (issueId: string) => Promise<boolean>;
  updateMachineStatus: (machineId: string, status: MachineStatus) => Promise<boolean>;
  earnEcoPoints: (points: number, reason: string) => void;
  syncState: () => Promise<void>;
}


export const useLaundryStore = create<LaundryState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      machines: [],
      bookings: [],
      issues: [],
      ecoProfile: {
        ecoPoints: 850,
        ecoLevel: 'Green Washer',
        waterSavedLiters: 125,
        energySavedKwh: 18.5,
        co2ReducedKg: 12.4,
        currentStreak: 4
      },
      badges: INITIAL_ACHIEVEMENTS,
      leaderboard: MOCK_LEADERBOARD,

      login: (user) => {
        if (user.token) {
          localStorage.setItem('token', user.token);
        }
        set({ currentUser: user });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ currentUser: null, machines: [], bookings: [], issues: [] });
      },

      earnEcoPoints: (points, reason) => {
        set(state => {
          const newPoints = state.ecoProfile.ecoPoints + points;
          let newLevel = state.ecoProfile.ecoLevel;
          if (newPoints >= 1500) newLevel = 'Planet Savior';
          else if (newPoints >= 1200) newLevel = 'Eco Champion';
          else if (newPoints >= 800) newLevel = 'Green Washer';
          else if (newPoints >= 400) newLevel = 'Eco Apprentice';

          const updatedProfile = {
            ...state.ecoProfile,
            ecoPoints: newPoints,
            ecoLevel: newLevel,
            waterSavedLiters: state.ecoProfile.waterSavedLiters + Math.round(points * 0.4),
            energySavedKwh: Number((state.ecoProfile.energySavedKwh + points * 0.05).toFixed(1)),
            co2ReducedKg: Number((state.ecoProfile.co2ReducedKg + points * 0.03).toFixed(1))
          };

          // Update user entry in leaderboard if logged in
          const currentUser = state.currentUser;
          const updatedLeaderboard = state.leaderboard.map(entry => {
            if (currentUser && entry.usn === currentUser.usn) {
              return { ...entry, points: newPoints, levelTitle: newLevel };
            }
            return entry;
          });

          return {
            ecoProfile: updatedProfile,
            leaderboard: updatedLeaderboard
          };
        });
      },

      bookSlot: async (machineId, slot) => {
        const today = new Date().toISOString().split('T')[0];
        try {
          const response = await api.post('/bookings', {
            machineId,
            date: today,
            slot
          });
          const newBooking = response.data.data.booking;
          
          // Check if eco slot was booked
          if (isEcoSlot(slot)) {
            get().earnEcoPoints(50, 'Booked an Eco-Slot (Off-peak hours)');
          } else {
            get().earnEcoPoints(15, 'Booked a wash slot');
          }

          set(state => ({ bookings: [newBooking, ...state.bookings] }));
          return newBooking;
        } catch (err: any) {
          console.error('Failed to reserve slot:', err);
          const message = err.response?.data?.message || 'Failed to book slot.';
          alert(message);
          return null;
        }
      },

      cancelBooking: async (bookingId) => {
        try {
          await api.delete(`/bookings/${bookingId}/cancel`);
          set(state => ({
            bookings: state.bookings.map(b => 
              b.id === bookingId ? { ...b, status: b.status === 'CHECKED_IN' ? 'COMPLETED' : 'CANCELLED' } : b
            ),
            machines: state.machines.map(m => {
              const booking = state.bookings.find(b => b.id === bookingId);
              return (booking && m.id === booking.machineId && booking.status === 'CHECKED_IN') 
                ? { ...m, status: MachineStatus.FREE } 
                : m;
            })
          }));
          return true;
        } catch (err: any) {
          console.error('Failed to cancel booking:', err);
          const message = err.response?.data?.message || 'Failed to cancel booking.';
          alert(message);
          return false;
        }
      },

      checkIn: async (bookingId) => {
        try {
          await api.post(`/bookings/${bookingId}/check-in`);
          set(state => ({
            bookings: state.bookings.map(b => 
              b.id === bookingId ? { ...b, status: 'CHECKED_IN' as const } : b
            ),
            machines: state.machines.map(m => {
              const booking = state.bookings.find(b => b.id === bookingId);
              return booking && m.id === booking.machineId ? { ...m, status: MachineStatus.IN_USE } : m;
            })
          }));
          return true;
        } catch (err: any) {
          console.error('Failed to check in:', err);
          const message = err.response?.data?.message || 'Failed to check in.';
          alert(message);
          return false;
        }
      },

      reportIssue: async (machineId, description, type) => {
        try {
          const response = await api.post('/issues', {
            machineId,
            description,
            type
          });
          const newIssue = response.data.data.issue;
          set(state => ({
            issues: [newIssue, ...state.issues],
            machines: ['POWER', 'WATER', 'MECHANICAL'].includes(type)
              ? state.machines.map(m => m.id === machineId ? { ...m, status: MachineStatus.OUT_OF_SERVICE } : m)
              : state.machines
          }));
          return true;
        } catch (err: any) {
          console.error('Failed to report issue:', err);
          const message = err.response?.data?.message || 'Failed to report issue.';
          alert(message);
          return false;
        }
      },
      deleteIssue: async (issueId) => {
        try {
          await api.delete(`/issues/${issueId}`);
          set(state => ({
            issues: state.issues.filter(i => i.id !== issueId)
          }));
          return true;
        } catch (error) {
          console.error('Failed to delete issue:', error);
          return false;
        }
      },
      approveIssue: async (issueId) => {
        try {
          const response = await api.post(`/issues/${issueId}/approve`);
          set(state => ({
            issues: state.issues.map(i => i.id === issueId ? response.data.data.issue : i)
          }));
          return true;
        } catch (error) {
          console.error('Failed to approve issue:', error);
          return false;
        }
      },
      resolveIssue: async (issueId) => {
        try {
          await api.post(`/issues/${issueId}/resolve`);
          set(state => ({
            issues: state.issues.map(i => 
              i.id === issueId ? { ...i, status: 'RESOLVED' as const } : i
            )
          }));
          return true;
        } catch (err: any) {
          console.error('Failed to resolve issue:', err);
          const message = err.response?.data?.message || 'Failed to resolve issue.';
          alert(message);
          return false;
        }
      },

      updateMachineStatus: async (machineId, status) => {
        try {
          await api.patch(`/machines/${machineId}/status`, { status });
          set(state => ({
            machines: state.machines.map(m => 
              m.id === machineId ? { ...m, status } : m
            )
          }));
          return true;
        } catch (err: any) {
          console.error('Failed to update machine status:', err);
          const message = err.response?.data?.message || 'Failed to update machine status.';
          alert(message);
          return false;
        }
      },

      syncState: async () => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          const [machinesRes, bookingsRes, issuesRes] = await Promise.all([
            api.get('/machines'),
            api.get('/bookings'),
            api.get('/issues')
          ]);

          set({
            machines: machinesRes.data.data.machines,
            bookings: bookingsRes.data.data.bookings,
            issues: issuesRes.data.data.issues
          });
        } catch (err) {
          console.error('Failed to synchronize status:', err);
        }
      }
    }),
    {
      name: 'laundry-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser
      }),
    }
  )
);
