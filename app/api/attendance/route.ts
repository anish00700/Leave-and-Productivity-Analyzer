import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API Route: GET /api/attendance
 * 
 * Fetches attendance data for a specific employee and month.
 * 
 * Query Parameters:
 * - employeeId: Employee ID
 * - month: Month in YYYY-MM format
 * - year: Year as integer
 * 
 * @param request - Next.js request object with query parameters
 * @returns JSON response with attendance records, stats, and daily productivity data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!employeeId || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: employeeId, month, year' },
        { status: 400 }
      )
    }

    // Get attendance records
    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        month,
        year: parseInt(year),
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get monthly summary
    const summary = await prisma.monthlySummary.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year: parseInt(year),
        }
      },
      include: {
        employee: true
      }
    })

    if (!summary) {
      return NextResponse.json(
        { error: 'No data found for the specified month' },
        { status: 404 }
      )
    }

    // Format data for frontend
    const formattedRecords = records.map(record => ({
      date: record.date.toISOString(),
      employeeName: summary.employee.name,
      inTime: record.inTime,
      outTime: record.outTime,
      workedHours: record.workedHours,
      expectedHours: record.expectedHours,
      status: record.status,
      productivity: record.productivity,
    }))

    const dailyProductivity = records
      .filter(r => r.expectedHours > 0)
      .map(r => ({
        date: r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        productivity: Math.round(r.productivity),
        expectedHours: r.expectedHours,
        actualHours: r.workedHours,
      }))

    return NextResponse.json({
      records: formattedRecords,
      stats: {
        totalExpectedHours: summary.totalExpectedHours,
        totalActualHours: summary.totalActualHours,
        leavesUsed: summary.leavesUsed,
        leaveLimit: summary.leaveLimit,
        productivityScore: summary.productivityScore,
        presentDays: summary.presentDays,
        leaveDays: summary.leaveDays,
        weekendDays: summary.weekendDays,
        halfDays: summary.halfDays,
      },
      dailyProductivity,
      employeeName: summary.employee.name,
      month: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}

