'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, CalendarCheck, Target, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { SummaryCard } from '@/components/SummaryCard';
import { CircularProgress } from '@/components/CircularProgress';
import { ProductivityTrendChart } from '@/components/charts/ProductivityTrendChart';
import { HoursComparisonChart } from '@/components/charts/HoursComparisonChart';
import { AttendanceBreakdownChart } from '@/components/charts/AttendanceBreakdownChart';
import { AttendanceTable } from '@/components/AttendanceTable';
import { MonthSelector } from '@/components/MonthSelector';
import { cn } from '@/lib/utils';
import { ParsedData } from '@/types/attendance';

const Analyze = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = searchParams.get('employeeId');
  const monthParam = searchParams.get('month');
  const year = searchParams.get('year');

  useEffect(() => {
    if (!employeeId || !monthParam || !year) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/attendance?employeeId=${employeeId}&month=${monthParam}&year=${year}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }

        const result = await response.json();
        
        // Transform API response to match ParsedData format
        const transformedData: ParsedData = {
          records: result.records.map((r: any) => ({
            ...r,
            date: new Date(r.date),
          })),
          stats: result.stats,
          dailyProductivity: result.dailyProductivity,
          employeeName: result.employeeName,
          month: result.month,
        };

        setData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, monthParam, year]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <EmptyState />
      </>
    );
  }

  const { stats, records, dailyProductivity, employeeName, month } = data;

  const getProductivityColor = (score: number) => {
    if (score >= 100) return 'text-success';
    if (score >= 80) return 'text-warning';
    return 'text-destructive';
  };

  const getProductivityBg = (score: number) => {
    if (score >= 100) return 'bg-success/10';
    if (score >= 80) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex-1">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-medium text-primary mb-1"
                >
                  Analysis Report
                </motion.p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {employeeName}'s Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">{month}</p>
              </div>
              
              <div className="flex items-center gap-4">
                {employeeId && monthParam && year && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <MonthSelector 
                      employeeId={employeeId}
                      currentMonth={monthParam}
                      currentYear={year}
                    />
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50"
                >
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    {records.length} records analyzed
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              title="Expected Hours"
              value={`${stats.totalExpectedHours}h`}
              subtitle="Based on working days"
              icon={Clock}
              iconBgClass="bg-primary/10"
              iconClass="text-primary"
              delay={0.1}
            />
            
            <SummaryCard
              title="Actual Hours"
              value={`${stats.totalActualHours}h`}
              subtitle={`${stats.totalExpectedHours - stats.totalActualHours >= 0 ? '-' : '+'}${Math.abs(stats.totalExpectedHours - stats.totalActualHours).toFixed(1)}h difference`}
              icon={CalendarCheck}
              iconBgClass="bg-accent/10"
              iconClass="text-accent"
              delay={0.2}
            />
            
            <SummaryCard
              title="Leave Balance"
              value=""
              icon={Target}
              iconBgClass={stats.leavesUsed > stats.leaveLimit ? "bg-destructive/10" : "bg-info/10"}
              iconClass={stats.leavesUsed > stats.leaveLimit ? "text-destructive" : "text-info"}
              delay={0.3}
            >
              <div className="flex items-center gap-4 mt-2">
                <CircularProgress 
                  value={stats.leavesUsed} 
                  max={stats.leaveLimit}
                  size={56}
                  strokeWidth={5}
                />
                <div>
                  <p className={cn(
                    "text-2xl font-bold",
                    stats.leavesUsed > stats.leaveLimit && "text-destructive"
                  )}>
                    {stats.leavesUsed} used
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {stats.leaveLimit} allowed
                  </p>
                </div>
              </div>
            </SummaryCard>
            
            <SummaryCard
              title="Productivity Score"
              value=""
              icon={TrendingUp}
              iconBgClass={getProductivityBg(stats.productivityScore)}
              iconClass={getProductivityColor(stats.productivityScore)}
              delay={0.4}
            >
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4, type: "spring" }}
                className={cn(
                  "text-4xl font-bold mt-2",
                  getProductivityColor(stats.productivityScore)
                )}
              >
                {stats.productivityScore}%
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.productivityScore >= 100 ? 'Excellent!' : 
                 stats.productivityScore >= 80 ? 'On track' : 'Needs improvement'}
              </p>
            </SummaryCard>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProductivityTrendChart data={dailyProductivity} />
            <HoursComparisonChart data={dailyProductivity} />
          </div>

          {/* Table and Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AttendanceTable records={records} />
            </div>
            <AttendanceBreakdownChart stats={stats} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analyze;

