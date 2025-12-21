import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  delay?: number;
  children?: React.ReactNode;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconClass,
  delay = 0,
  children,
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-xl p-6 hover-lift"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBgClass)}>
          <Icon className={cn("w-6 h-6", iconClass)} />
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {children}
      </div>
    </motion.div>
  );
}
