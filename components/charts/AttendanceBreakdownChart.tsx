import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DashboardStats } from '@/types/attendance';

interface AttendanceBreakdownChartProps {
  stats: DashboardStats;
}

const COLORS = [
  'hsl(142 76% 36%)',  // Present - success
  'hsl(0 84% 60%)',    // Leave - destructive
  'hsl(199 89% 48%)',  // Half-Day - info
  'hsl(220 9% 46%)',   // Weekend - muted
];

export function AttendanceBreakdownChart({ stats }: AttendanceBreakdownChartProps) {
  const data = [
    { name: 'Present', value: stats.presentDays },
    { name: 'Leave', value: stats.leaveDays },
    { name: 'Half-Day', value: stats.halfDays },
    { name: 'Weekend', value: stats.weekendDays },
  ].filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-6">Attendance Breakdown</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: '1px solid hsl(220 13% 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px hsl(220 14% 10% / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                `${value} days (${Math.round((value / total) * 100)}%)`,
                name
              ]}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground ml-1">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
