
import { Machine, Booking, IssueReport } from '../types';

const STORAGE_KEYS = {
  MACHINES: 'iwash_machines',
  BOOKINGS: 'iwash_bookings',
  ISSUES: 'iwash_issues'
};

export const getStoredData = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const setStoredData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const saveMachines = (machines: Machine[]) => setStoredData(STORAGE_KEYS.MACHINES, machines);
export const saveBookings = (bookings: Booking[]) => setStoredData(STORAGE_KEYS.BOOKINGS, bookings);
export const saveIssues = (issues: IssueReport[]) => setStoredData(STORAGE_KEYS.ISSUES, issues);

export const getMachines = (initial: Machine[]) => getStoredData(STORAGE_KEYS.MACHINES, initial);
export const getBookings = () => getStoredData(STORAGE_KEYS.BOOKINGS, [] as Booking[]);
export const getIssues = () => getStoredData(STORAGE_KEYS.ISSUES, [] as IssueReport[]);
