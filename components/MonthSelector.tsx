'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MonthOption {
  month: string
  year: number
  label: string
}

interface MonthSelectorProps {
  employeeId: string
  currentMonth: string
  currentYear: string
}

export function MonthSelector({ employeeId, currentMonth, currentYear }: MonthSelectorProps) {
  const router = useRouter()
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const response = await fetch('/api/employees')
        if (!response.ok) throw new Error('Failed to fetch employees')
        
        const data = await response.json()
        const employee = data.employees.find((e: any) => e.id === employeeId)
        
        if (employee) {
          setAvailableMonths(employee.availableMonths || [])
        }
      } catch (error) {
        console.error('Error fetching months:', error)
      } finally {
        setLoading(false)
      }
    }

    if (employeeId) {
      fetchMonths()
    }
  }, [employeeId])

  const handleMonthChange = (value: string) => {
    const [month, year] = value.split('-')
    router.push(`/analyze?employeeId=${employeeId}&month=${month}&year=${year}`)
  }

  const currentValue = `${currentMonth}-${currentYear}`

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
        <Calendar className="w-4 h-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading months...</span>
      </div>
    )
  }

  if (availableMonths.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Select value={currentValue} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((option) => (
            <SelectItem key={`${option.month}-${option.year}`} value={`${option.month}-${option.year}`}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

