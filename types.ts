
export type UserRole = 'ADMIN' | 'STUDENT' | null;

export interface User {
  name: string;
  usn: string;
  phone?: string;
}

export enum MachineStatus {
  FREE = 'FREE',
  IN_USE = 'IN_USE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
}

export interface Booking {
  id: string;
  machineId: string;
  date: string;
  slot: string;
  userName: string;
  userUsn: string;
  status: 'PENDING' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
}

export interface IssueReport {
  id: string;
  machineId: string;
  userUsn: string;
  userName: string;
  description: string;
  type: 'MECHANICAL' | 'WATER' | 'POWER' | 'OTHER';
  status: 'OPEN' | 'APPROVED' | 'RESOLVED';
  createdAt: number;
}

export interface EcoProfile {
  ecoPoints: number;
  ecoLevel: string;
  waterSavedLiters: number;
  energySavedKwh: number;
  co2ReducedKg: number;
  currentStreak: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  category: 'WASH' | 'SLOT' | 'COMMUNITY' | 'STREAK';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  usn: string;
  points: number;
  badgeCount: number;
  levelTitle: string;
  isCurrentUser?: boolean;
}

