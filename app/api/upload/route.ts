import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseExcelFile } from '@/lib/excelParser'

/**
 * API Route: POST /api/upload
 * 
 * Handles Excel file uploads, parses attendance data, and stores it in the database.
 * 
 * @param request - Next.js request object containing FormData with 'file' field
 * @returns JSON response with success status, employeeId, month, year, and message
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a .xlsx file' },
        { status: 400 }
      )
    }

    // Parse Excel file
    const buffer = await file.arrayBuffer()
    const parsedData = await parseExcelFile(buffer)

    // Find or create employee
    let employee = await prisma.employee.findFirst({
      where: { name: parsedData.employeeName }
    })

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          name: parsedData.employeeName,
        }
      })
    }

    // Get month and year from first record
    const firstRecord = parsedData.records[0]
    const month = firstRecord.date.toISOString().slice(0, 7) // YYYY-MM
    const year = firstRecord.date.getFullYear()

    // Delete existing records for this month (to allow re-upload)
    await prisma.attendanceRecord.deleteMany({
      where: {
        employeeId: employee.id,
        month,
        year
      }
    })

    // Create attendance records
    const records = await Promise.all(
      parsedData.records.map(record =>
        prisma.attendanceRecord.create({
          data: {
            employeeId: employee.id,
            date: record.date,
            inTime: record.inTime,
            outTime: record.outTime,
            workedHours: record.workedHours,
            expectedHours: record.expectedHours,
            status: record.status,
            productivity: record.productivity,
            month,
            year,
          }
        })
      )
    )

    // Create or update monthly summary
    await prisma.monthlySummary.upsert({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month,
          year,
        }
      },
      update: {
        totalExpectedHours: parsedData.stats.totalExpectedHours,
        totalActualHours: parsedData.stats.totalActualHours,
        leavesUsed: parsedData.stats.leavesUsed,
        productivityScore: parsedData.stats.productivityScore,
        presentDays: parsedData.stats.presentDays,
        leaveDays: parsedData.stats.leaveDays,
        weekendDays: parsedData.stats.weekendDays,
        halfDays: parsedData.stats.halfDays,
      },
      create: {
        employeeId: employee.id,
        month,
        year,
        totalExpectedHours: parsedData.stats.totalExpectedHours,
        totalActualHours: parsedData.stats.totalActualHours,
        leavesUsed: parsedData.stats.leavesUsed,
        leaveLimit: 2,
        productivityScore: parsedData.stats.productivityScore,
        presentDays: parsedData.stats.presentDays,
        leaveDays: parsedData.stats.leaveDays,
        weekendDays: parsedData.stats.weekendDays,
        halfDays: parsedData.stats.halfDays,
      }
    })

    return NextResponse.json({
      success: true,
      employeeId: employee.id,
      month,
      year,
      message: `Successfully processed ${records.length} attendance records`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    )
  }
}

