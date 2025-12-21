import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API Route: GET /api/employees
 * 
 * Fetches all employees with their available months for attendance data.
 * 
 * @param request - Next.js request object
 * @returns JSON response with list of employees and their available months
 */
export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        monthlySummaries: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ],
          select: {
            month: true,
            year: true,
          }
        }
      }
    })

    // Format response
    const formattedEmployees = employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      availableMonths: employee.monthlySummaries.map(summary => ({
        month: summary.month,
        year: summary.year,
        label: new Date(`${summary.month}-01`).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        })
      }))
    }))

    return NextResponse.json({ employees: formattedEmployees })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

