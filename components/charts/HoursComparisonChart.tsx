import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailyProductivity } from '@/types/attendance';

interface HoursComparisonChartProps {
  data: DailyProductivity[];
}

export function HoursComparisonChart({ data }: HoursComparisonChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-6">Hours Comparison</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: '1px solid hsl(220 13% 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px hsl(220 14% 10% / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                `${value}h`,
                name === 'expectedHours' ? 'Expected' : 'Actual'
              ]}
              labelStyle={{ color: 'hsl(224 71% 4%)' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">
                  {value === 'expectedHours' ? 'Expected' : 'Actual'}
                </span>
              )}
            />
            <Bar 
              dataKey="expectedHours" 
              fill="hsl(220 13% 91%)" 
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
            <Bar 
              dataKey="actualHours" 
              fill="hsl(239 84% 67%)" 
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
              animationBegin={300}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
