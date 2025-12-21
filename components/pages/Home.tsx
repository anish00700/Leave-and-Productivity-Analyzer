'use client'

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, Loader2, BarChart3, Zap, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const features = [
  {
    icon: Zap,
    title: 'Instant Analysis',
    description: 'Get productivity insights in seconds',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All processing happens securely',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Automated attendance tracking',
  },
];

const Home = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleFileProcess = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      
      toast({
        title: "Data processed successfully!",
        description: data.message,
      });
      
      // Navigate to analyze page with query params
      setTimeout(() => {
        router.push(`/analyze?employeeId=${data.employeeId}&month=${data.month}&year=${data.year}`);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      handleFileProcess(file);
    } else {
      setError('Please upload a valid .xlsx file');
    }
  }, [handleFileProcess]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  }, [handleFileProcess]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <BarChart3 className="w-4 h-4" />
                Smart Analytics
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              >
                Leave & Productivity
                <br />
                <span className="gradient-text">Analyzer</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0"
              >
                Upload your Excel attendance data and get instant productivity analysis 
                with beautiful visualizations and actionable metrics.
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-wrap gap-6 justify-center lg:justify-start"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Upload */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={cn(
                  "glass-card-elevated rounded-2xl p-8 transition-all duration-300",
                  isDragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
                )}
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer",
                    isDragOver 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
                            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                          </div>
                          <p className="font-medium">Processing {fileName}...</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Analyzing your attendance data
                          </p>
                          <div className="mt-4 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full gradient-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1.5, ease: 'easeInOut' }}
                            />
                          </div>
                        </motion.div>
                      ) : error ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                          </div>
                          <p className="font-medium text-destructive">{error}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Click to try again with a valid Excel file
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="upload"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            animate={{ 
                              y: isDragOver ? -5 : 0,
                              scale: isDragOver ? 1.1 : 1 
                            }}
                            className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-lg"
                          >
                            <Upload className="w-8 h-8 text-primary-foreground" />
                          </motion.div>
                          <p className="font-medium mb-1">
                            Drop your Excel file here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse
                          </p>
                          <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Supports .xlsx files
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </label>
                </div>

                {/* Helper text */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Your data is processed securely and stored in the database
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built with precision for productivity tracking</p>
      </footer>
    </div>
  );
};

export default Home;

