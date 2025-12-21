import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

const ITEMS_PER_PAGE = 10;

export function AttendanceTable({ records }: AttendanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, endIndex);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return '—';
    return time;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Attendance Details</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {startIndex + 1}-{Math.min(endIndex, records.length)} of {records.length} records
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Employee</TableHead>
              <TableHead className="font-semibold">In-Time</TableHead>
              <TableHead className="font-semibold">Out-Time</TableHead>
              <TableHead className="font-semibold text-right">Worked Hours</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record, index) => (
              <motion.tr
                key={record.date.toISOString()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {formatDate(record.date)}
                </TableCell>
                <TableCell>{record.employeeName}</TableCell>
                <TableCell className="font-mono text-sm">
                  {formatTime(record.inTime)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatTime(record.outTime)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {record.workedHours.toFixed(1)}h
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={record.status} />
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
