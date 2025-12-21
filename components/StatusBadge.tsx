import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/types/attendance';

interface StatusBadgeProps {
  status: AttendanceRecord['status'];
}

const statusStyles: Record<AttendanceRecord['status'], string> = {
  Present: 'bg-success/10 text-success border-success/20',
  Leave: 'bg-destructive/10 text-destructive border-destructive/20',
  'Half-Day': 'bg-info/10 text-info border-info/20',
  Weekend: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      statusStyles[status]
    )}>
      {status}
    </span>
  );
}
