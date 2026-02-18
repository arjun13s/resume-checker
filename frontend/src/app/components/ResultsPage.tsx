import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles } from 'lucide-react';
import { Starfish, Shell, ConchShell, PebbleCluster, Rock } from './BeachDecorations';
import type { LucideIcon } from 'lucide-react';

// ---- Types ----
export interface ReviewSection {
  icon: LucideIcon;
  title: string;
  color: string;
  score?: number;
  content?: string;
  items?: string[];
}

interface ResultsPageProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
  fileName?: string;
  reviewSections: ReviewSection[];
  onUploadAnother: () => void;
}

// ---- Component ----
export function ResultsPage({
  isAnalyzing,
  analysisComplete,
  fileName,
  reviewSections,
  onUploadAnother,
}: ResultsPageProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results when analyzing starts
  useEffect(() => {
    if ((isAnalyzing || analysisComplete) && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [isAnalyzing, analysisComplete]);

  if (!isAnalyzing && !analysisComplete) return null;

  return (
    <div
      ref={resultsRef}
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #E8D4A0 0%, #F4E4C1 8%, #EDD9AB 40%, #E8D4A0 70%, #DEC892 100%)' }}
    >
      {/* Wave transition at top */}
      <div className="absolute top-0 left-0 right-0 -translate-y-[1px]">
        <svg className="w-full h-auto" viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none">
          <path d="M0,60 Q360,0 720,30 T1440,10 L1440,60 Z" fill="#E8D4A0" />
        </svg>
      </div>

      {/* ---- Scattered Beach Decorations ---- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Starfish */}
        <Starfish className="absolute top-[8%] left-[5%] rotate-[15deg]" size={35} color="#E8845C" />
        <Starfish className="absolute top-[35%] right-[7%] rotate-[-22deg]" size={28} color="#D4764E" />
        <Starfish className="absolute top-[62%] left-[8%] rotate-[40deg]" size={22} color="#E89870" />
        <Starfish className="absolute top-[85%] right-[12%] rotate-[10deg]" size={30} color="#E8845C" />

        {/* Shells */}
        <Shell className="absolute top-[12%] right-[15%] rotate-[30deg]" size={28} color="#F5E6D3" />
        <Shell className="absolute top-[45%] left-[3%] rotate-[-15deg]" size={24} color="#F0DCC4" />
        <Shell className="absolute top-[70%] right-[5%] rotate-[50deg]" size={20} color="#F5E6D3" />
        <Shell className="absolute top-[28%] left-[18%] rotate-[-40deg]" size={22} color="#ECD4B8" />

        {/* Conch Shells */}
        <ConchShell className="absolute top-[20%] right-[3%] rotate-[25deg]" size={32} />
        <ConchShell className="absolute top-[55%] left-[12%] rotate-[-10deg]" size={26} />
        <ConchShell className="absolute top-[80%] left-[3%] rotate-[35deg]" size={30} />

        {/* Pebble Clusters */}
        <PebbleCluster className="absolute top-[15%] left-[40%]" size={50} />
        <PebbleCluster className="absolute top-[50%] right-[20%]" size={40} />
        <PebbleCluster className="absolute top-[75%] left-[25%]" size={55} />
        <PebbleCluster className="absolute top-[92%] right-[35%]" size={45} />

        {/* Single Rocks */}
        <Rock className="absolute top-[10%] left-[28%] rotate-[10deg]" size={18} />
        <Rock className="absolute top-[38%] right-[30%] rotate-[-20deg]" size={22} color="#9C8E80" />
        <Rock className="absolute top-[58%] left-[35%] rotate-[5deg]" size={16} />
        <Rock className="absolute top-[72%] right-[40%] rotate-[15deg]" size={20} color="#B0A090" />
        <Rock className="absolute top-[90%] left-[50%] rotate-[-8deg]" size={24} />

        {/* Subtle sand texture dots */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              top: `${5 + Math.random() * 90}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: 'rgba(160, 130, 100, 0.15)',
            }}
          />
        ))}
      </div>

      {/* ---- Results Content ---- */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 md:pb-24 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            /* Loading State */
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-24 sm:py-32"
            >
              {/* Spinning beach ball loader */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <svg width="60" height="60" viewBox="0 0 200 200">
                  <defs>
                    <clipPath id="loaderClip">
                      <circle cx="100" cy="100" r="95" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#loaderClip)">
                    <path d="M100,100 L195,100 A95,95 0 0,1 129.36,190.35 Z" fill="#E04040" />
                    <path d="M100,100 L129.36,190.35 A95,95 0 0,1 23.15,155.83 Z" fill="#3B8ED6" />
                    <path d="M100,100 L23.15,155.83 A95,95 0 0,1 23.15,44.17 Z" fill="#F2CC2E" />
                    <path d="M100,100 L23.15,44.17 A95,95 0 0,1 129.36,9.65 Z" fill="#4AB85C" />
                    <path d="M100,100 L129.36,9.65 A95,95 0 0,1 195,100 Z" fill="#FFFFFF" />
                  </g>
                  <circle cx="100" cy="100" r="95" fill="none" stroke="#D0C8BC" strokeWidth="2" />
                  <circle cx="100" cy="100" r="14" fill="#FFFFFF" />
                </svg>
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-gray-700"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1.125rem)' }}
              >
                Analyzing your resume...
              </motion.p>
              <p className="text-gray-500 mt-2" style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.875rem)' }}>
                Checking formatting, keywords & more
              </p>
            </motion.div>
          ) : (
            /* Results */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 sm:mb-10 md:mb-12"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <div className="p-2 sm:p-2.5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: '#8B6914' }} />
                  </div>
                  <h2 style={{ color: '#2A2A2A', fontSize: 'clamp(1.25rem, 3vw, 1.875rem)' }}>
                    Resume Review
                  </h2>
                </div>
                {fileName && (
                  <p className="text-gray-600" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)' }}>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {fileName}
                    </span>
                  </p>
                )}
              </motion.div>

              {/* Review Cards */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {reviewSections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {/* Card Header */}
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                      <div
                        className="p-2 sm:p-2.5 rounded-xl"
                        style={{ backgroundColor: `${section.color}18` }}
                      >
                        <section.icon
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{ color: section.color }}
                          strokeWidth={1.8}
                        />
                      </div>
                      <h3 style={{ color: '#2A2A2A', fontSize: 'clamp(0.9rem, 2vw, 1.125rem)' }}>
                        {section.title}
                      </h3>
                      {section.score !== undefined && (
                        <div className="ml-auto flex items-center gap-1.5">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-white"
                            style={{
                              backgroundColor: section.color,
                              fontSize: 'clamp(0.7rem, 1.5vw, 0.875rem)',
                              fontWeight: 600,
                            }}
                          >
                            {section.score}/100
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    {section.content && (
                      <p className="text-gray-600" style={{ fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', lineHeight: 1.7 }}>
                        {section.content}
                      </p>
                    )}

                    {section.items && (
                      <ul className="space-y-2 sm:space-y-2.5">
                        {section.items.map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + i * 0.05 + 0.3 }}
                            className="flex items-start gap-2 sm:gap-2.5"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                              style={{ backgroundColor: section.color }}
                            />
                            <span className="text-gray-600" style={{ fontSize: 'clamp(0.78rem, 1.5vw, 0.9rem)', lineHeight: 1.6 }}>
                              {item}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    {/* Score bar for score sections */}
                    {section.score !== undefined && (
                      <div className="mt-3 sm:mt-4">
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: section.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${section.score}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.4, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Bottom action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 sm:mt-10 text-center"
              >
                <button
                  onClick={onUploadAnother}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: '#2A2A2A',
                    color: '#FFE999',
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                  }}
                >
                  Upload Another Resume
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
