
import { User, Machine, MachineStatus } from './types';

export const ADMIN_CREDENTIALS = {
  id: 'js200004',
  password: 'admin'
};

export const ALLOWED_STUDENTS: User[] = [
  { name: 'Shreyansh Raj', usn: '1JS25IS119', phone: '9876543210' },
  { name: 'Srujan Rao R', usn: '1JS25IS124', phone: '9876543211' },
  { name: 'Tanmay Anand', usn: '1JS25IS130', phone: '9876543212' },
  { name: 'Uday E', usn: '1JS25IS133', phone: '9876543213' },
  { name: 'Alok', usn: '1JS25IS139', phone: '7741820976' },
  { name: 'Utkarsh Singh Samant', usn: '1JS25CI096', phone: '8448379007' },
  { name: 'Vishveshwargouda Patil', usn: '1JS25IS138', phone: '6362137450' },
  { name: 'Vishrutha GM', usn: '1JS25IS137', phone: '9380374944' },
  { name: 'Yamunaprathap P', usn: '1JS25IS140', phone: '9353832520' },
  { name: 'Uttam Thapa', usn: '1JS25CI097', phone: '8147755968' }
];

export const INITIAL_MACHINES: Machine[] = [
  { id: 'm1', name: 'A1', status: MachineStatus.FREE },
  { id: 'm2', name: 'A2', status: MachineStatus.FREE },
  { id: 'm3', name: 'A3', status: MachineStatus.FREE },
  { id: 'm4', name: 'B1', status: MachineStatus.FREE },
  { id: 'm5', name: 'B2', status: MachineStatus.FREE },
  { id: 'm6', name: 'B3', status: MachineStatus.FREE },
];

export const format12Hour = (h: number, m: number) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH.toString().padStart(2, '0')}:${displayM} ${period}`;
};

export const GENERATE_TIME_SLOTS = () => {
  const slots = [];
  for (let hour = 6; hour < 24; hour++) {
    const start1 = format12Hour(hour, 0);
    const end1 = format12Hour(hour, 30);
    slots.push(`${start1} - ${end1}`);
    
    const start2 = format12Hour(hour, 30);
    const endHour2 = hour === 23 ? 23 : hour + 1;
    const endMin2 = hour === 23 ? 59 : 0;
    const end2 = format12Hour(endHour2, endMin2);
    slots.push(`${start2} - ${end2}`);
  }
  return slots;
};

export const parseTimeStringToTotalMinutes = (timeStr: string) => {
  timeStr = timeStr.trim();
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, period] = timeStr.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  } else {
    // legacy format e.g. "06:00"
    let [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
};

export const TIME_SLOTS = GENERATE_TIME_SLOTS();

// Check if a time slot is an Eco-Slot (Off-peak hours: 06:00 AM - 09:00 AM, 01:00 PM - 04:00 PM)
export const isEcoSlot = (slotStr: string): boolean => {
  const parts = slotStr.includes(' - ') ? slotStr.split(' - ') : slotStr.split('-');
  const startMin = parseTimeStringToTotalMinutes(parts[0]);
  // 6:00 AM = 360, 9:00 AM = 540
  // 1:00 PM = 780, 4:00 PM = 960
  return (startMin >= 360 && startMin < 540) || (startMin >= 780 && startMin < 960);
};

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'eco_starter',
    title: 'Eco Pioneer',
    description: 'Booked your first off-peak 🌱 Eco-Slot',
    icon: '🌱',
    unlocked: true,
    progress: 100,
    category: 'SLOT' as const
  },
  {
    id: 'water_saver_1',
    title: 'Water Guardian',
    description: 'Saved over 50 Liters of water by optimizing wash loads',
    icon: '💧',
    unlocked: true,
    progress: 100,
    category: 'WASH' as const
  },
  {
    id: 'off_peak_master',
    title: 'Off-Peak Master',
    description: 'Complete 5 Eco-Slot bookings in off-peak grid hours',
    icon: '⚡',
    unlocked: false,
    progress: 60,
    category: 'SLOT' as const
  },
  {
    id: 'eco_streak',
    title: 'Green Streak',
    description: 'Maintain a 3-week continuous sustainable booking streak',
    icon: '🔥',
    unlocked: false,
    progress: 40,
    category: 'STREAK' as const
  },
  {
    id: 'community_hero',
    title: 'Hostel Eco Leader',
    description: 'Rank in the Top 3 of the Hostel Sustainability Leaderboard',
    icon: '🏆',
    unlocked: false,
    progress: 20,
    category: 'COMMUNITY' as const
  }
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Srujan Rao R', usn: '1JS25IS124', points: 1420, badgeCount: 5, levelTitle: 'Planet Savior' },
  { rank: 2, name: 'Uttam Thapa', usn: '1JS25CI097', points: 1250, badgeCount: 4, levelTitle: 'Eco Champion' },
  { rank: 3, name: 'Alok', usn: '1JS25IS139', points: 980, badgeCount: 3, levelTitle: 'Green Washer' },
  { rank: 4, name: 'Shreyansh Raj', usn: '1JS25IS119', points: 810, badgeCount: 3, levelTitle: 'Green Washer' },
  { rank: 5, name: 'Tanmay Anand', usn: '1JS25IS130', points: 650, badgeCount: 2, levelTitle: 'Eco Apprentice' },
  { rank: 6, name: 'Uday E', usn: '1JS25IS133', points: 490, badgeCount: 2, levelTitle: 'Eco Apprentice' }
];

