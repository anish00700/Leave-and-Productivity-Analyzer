'use client'

import { motion } from 'framer-motion';
import { FileQuestion, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card-elevated rounded-2xl p-12 text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6"
        >
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </motion.div>

        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-2xl font-bold tracking-tight mb-3"
        >
          No Data Found
        </motion.h2>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          It looks like you haven't uploaded an attendance file yet. 
          Head back to the home page to get started.
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button asChild size="lg" className="gap-2 gradient-primary border-0 shadow-lg hover:shadow-xl transition-shadow">
            <Link href="/">
              <Upload className="w-4 h-4" />
              Go to Upload
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
