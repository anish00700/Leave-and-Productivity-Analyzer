export interface AttendanceRecord {
  date: Date;
  employeeName: string;
  inTime: string | null;
  outTime: string | null;
  workedHours: number;
  expectedHours: number;
  status: 'Present' | 'Leave' | 'Half-Day' | 'Weekend';
  productivity: number;
}

export interface DashboardStats {
  totalExpectedHours: number;
  totalActualHours: number;
  leavesUsed: number;
  leaveLimit: number;
  productivityScore: number;
  presentDays: number;
  leaveDays: number;
  weekendDays: number;
  halfDays: number;
}

export interface DailyProductivity {
  date: string;
  productivity: number;
  expectedHours: number;
  actualHours: number;
}

export interface ParsedData {
  records: AttendanceRecord[];
  stats: DashboardStats;
  dailyProductivity: DailyProductivity[];
  employeeName: string;
  month: string;
}

