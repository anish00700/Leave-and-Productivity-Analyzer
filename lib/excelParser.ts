import * as XLSX from 'xlsx';
import { AttendanceRecord, DashboardStats, DailyProductivity, ParsedData } from '@/types/attendance';

/**
 * Parses a time string to a Date object
 * @param timeStr - Time string in various formats (HH:MM, HH:MM:SS, with AM/PM, or Excel serial number)
 * @param baseDate - Base date to attach the time to
 * @returns Date object or null if parsing fails
 */
function parseTimeToDate(timeStr: string | null, baseDate: Date): Date | null {
  if (!timeStr) return null;
  
  const timeParts = timeStr.toString().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!timeParts) {
    // Try parsing Excel time serial number
    const timeNum = parseFloat(timeStr);
    if (!isNaN(timeNum)) {
      const totalMinutes = Math.round(timeNum * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const result = new Date(baseDate);
      result.setHours(hours, minutes, 0, 0);
      return result;
    }
    return null;
  }
  
  let hours = parseInt(timeParts[1]);
  const minutes = parseInt(timeParts[2]);
  const ampm = timeParts[4];
  
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Calculates worked hours between in-time and out-time
 * @param inTime - In-time string
 * @param outTime - Out-time string
 * @param baseDate - Base date for time calculation
 * @returns Number of hours worked (rounded to 2 decimal places)
 */
function calculateWorkedHours(inTime: string | null, outTime: string | null, baseDate: Date): number {
  if (!inTime || !outTime) return 0;
  
  const inDate = parseTimeToDate(inTime, baseDate);
  const outDate = parseTimeToDate(outTime, baseDate);
  
  if (!inDate || !outDate) return 0;
  
  const diffMs = outDate.getTime() - inDate.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  
  return Math.max(0, Math.round(hours * 100) / 100);
}

/**
 * Gets expected working hours for a given date based on business rules
 * Business Rules:
 * - Monday to Friday: 8.5 hours
 * - Saturday: 4 hours (half day)
 * - Sunday: 0 hours (off)
 * 
 * @param date - Date to check
 * @returns Expected working hours for the day
 */
function getExpectedHours(date: Date): number {
  const day = date.getDay();
  
  // Sunday = 0
  if (day === 0) return 0;
  // Saturday = 6
  if (day === 6) return 4;
  // Mon-Fri
  return 8.5;
}

function getStatus(date: Date, inTime: string | null, outTime: string | null): AttendanceRecord['status'] {
  const day = date.getDay();
  
  // Sunday
  if (day === 0) return 'Weekend';
  
  // Saturday
  if (day === 6) {
    if (!inTime || !outTime) return 'Leave';
    return 'Half-Day';
  }
  
  // Mon-Fri
  if (!inTime || !outTime) return 'Leave';
  return 'Present';
}

function excelDateToJSDate(excelDate: number): Date {
  // Excel dates are number of days since Dec 30, 1899
  const utcDays = Math.floor(excelDate - 25569);
  const utcValue = utcDays * 86400 * 1000;
  return new Date(utcValue);
}

function parseDate(dateValue: string | number | Date): Date | null {
  if (dateValue instanceof Date) return dateValue;
  
  if (typeof dateValue === 'number') {
    return excelDateToJSDate(dateValue);
  }
  
  if (typeof dateValue === 'string') {
    // Try various date formats
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) return parsed;
    
    // Try DD/MM/YYYY format
    const parts = dateValue.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
  }
  
  return null;
}

/**
 * Parses an Excel file buffer and extracts attendance data
 * 
 * Expected Excel format:
 * - Columns: Employee Name, Date, In-Time, Out-Time
 * - Missing in-time/out-time is treated as leave
 * 
 * @param buffer - ArrayBuffer containing Excel file data
 * @returns ParsedData object with records, stats, and daily productivity
 * @throws Error if file is invalid or contains no data
 */
export async function parseExcelFile(buffer: ArrayBuffer): Promise<ParsedData> {
  try {
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });
    
    if (jsonData.length === 0) {
      throw new Error('No data found in the Excel file');
    }
    
    const records: AttendanceRecord[] = [];
    let employeeName = '';
    
    jsonData.forEach((row: Record<string, unknown>) => {
      // Try to find date column
      const dateKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('date') || k.toLowerCase() === 'day'
      );
      
      // Try to find employee name
      const nameKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('name') || k.toLowerCase().includes('employee')
      );
      
      // Try to find in-time
      const inTimeKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('in') && (k.toLowerCase().includes('time') || k.toLowerCase().includes('punch'))
      ) || Object.keys(row).find(k => k.toLowerCase() === 'in');
      
      // Try to find out-time
      const outTimeKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('out') && (k.toLowerCase().includes('time') || k.toLowerCase().includes('punch'))
      ) || Object.keys(row).find(k => k.toLowerCase() === 'out');
      
      if (!dateKey) return;
      
      const dateValue = row[dateKey];
      const date = parseDate(dateValue as string | number | Date);
      
      if (!date || isNaN(date.getTime())) return;
      
      if (nameKey && row[nameKey]) {
        employeeName = row[nameKey] as string;
      }
      
      const inTime = inTimeKey ? (row[inTimeKey] as string | null) : null;
      const outTime = outTimeKey ? (row[outTimeKey] as string | null) : null;
      
      const workedHours = calculateWorkedHours(inTime, outTime, date);
      const expectedHours = getExpectedHours(date);
      const status = getStatus(date, inTime, outTime);
      const productivity = expectedHours > 0 ? (workedHours / expectedHours) * 100 : 0;
      
      records.push({
        date,
        employeeName: employeeName || 'Employee',
        inTime: inTime?.toString() || null,
        outTime: outTime?.toString() || null,
        workedHours,
        expectedHours,
        status,
        productivity,
      });
    });
    
    if (records.length === 0) {
      throw new Error('Could not parse any valid attendance records');
    }
    
    // Sort records by date
    records.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate stats
    const stats = calculateStats(records);
    const dailyProductivity = calculateDailyProductivity(records);
    
    // Get month name
    const firstRecord = records[0];
    const month = firstRecord.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return {
      records,
      stats,
      dailyProductivity,
      employeeName: employeeName || 'Employee',
      month,
    };
  } catch (error) {
    throw error;
  }
}

function calculateStats(records: AttendanceRecord[]): DashboardStats {
  const totalExpectedHours = records.reduce((sum, r) => sum + r.expectedHours, 0);
  const totalActualHours = records.reduce((sum, r) => sum + r.workedHours, 0);
  const leavesUsed = records.filter(r => r.status === 'Leave').length;
  const presentDays = records.filter(r => r.status === 'Present').length;
  const weekendDays = records.filter(r => r.status === 'Weekend').length;
  const halfDays = records.filter(r => r.status === 'Half-Day').length;
  const productivityScore = totalExpectedHours > 0 
    ? Math.round((totalActualHours / totalExpectedHours) * 100) 
    : 0;
  
  return {
    totalExpectedHours: Math.round(totalExpectedHours * 10) / 10,
    totalActualHours: Math.round(totalActualHours * 10) / 10,
    leavesUsed,
    leaveLimit: 2,
    productivityScore,
    presentDays,
    leaveDays: leavesUsed,
    weekendDays,
    halfDays,
  };
}

function calculateDailyProductivity(records: AttendanceRecord[]): DailyProductivity[] {
  return records
    .filter(r => r.expectedHours > 0)
    .map(r => ({
      date: r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      productivity: Math.round(r.productivity),
      expectedHours: r.expectedHours,
      actualHours: r.workedHours,
    }));
}

