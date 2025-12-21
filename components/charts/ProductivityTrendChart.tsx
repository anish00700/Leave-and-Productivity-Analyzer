import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DailyProductivity } from '@/types/attendance';

interface ProductivityTrendChartProps {
  data: DailyProductivity[];
}

export function ProductivityTrendChart({ data }: ProductivityTrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-6">Productivity Trend</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(239 84% 67%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: '1px solid hsl(220 13% 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px hsl(220 14% 10% / 0.1)',
              }}
              formatter={(value: number) => [`${value}%`, 'Productivity']}
              labelStyle={{ color: 'hsl(224 71% 4%)' }}
            />
            <ReferenceLine 
              y={100} 
              stroke="hsl(142 76% 36%)" 
              strokeDasharray="5 5" 
              strokeOpacity={0.5}
            />
            <ReferenceLine 
              y={80} 
              stroke="hsl(45 93% 47%)" 
              strokeDasharray="5 5" 
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="productivity"
              stroke="hsl(239 84% 67%)"
              strokeWidth={2}
              fill="url(#productivityGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-success" />
          <span>100% Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-warning" />
          <span>80% Minimum</span>
        </div>
      </div>
    </motion.div>
  );
}
