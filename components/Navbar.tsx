'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();

  const handleNewUpload = () => {
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold tracking-tight">Leave & Productivity</span>
              <span className="gradient-text font-bold ml-1">Analyzer</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewUpload}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload New File</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
