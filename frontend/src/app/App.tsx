import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Upload, Sparkles, CheckCircle2,
  TrendingUp, AlertCircle, Layout, Search, ListChecks, ArrowDown, HelpCircle, X,
} from 'lucide-react';
import { PalmTree } from './components/PalmTree';
import { ResultsPage } from './components/ResultsPage';
import type { ReviewSection } from './components/ResultsPage';

// Maps backend category names to icons and colors
const CATEGORY_META: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  sections:        { icon: ListChecks,   color: '#E04040', label: 'Missing Sections' },
  formatting:      { icon: Layout,       color: '#8B6914', label: 'Formatting & Structure' },
  content:         { icon: TrendingUp,   color: '#3B8ED6', label: 'Content Quality' },
  keywords:        { icon: Search,       color: '#7CB342', label: 'Keywords & ATS' },
  structure:       { icon: Layout,       color: '#8B6914', label: 'Resume Structure' },
  common_mistakes: { icon: AlertCircle,  color: '#E04040', label: 'Common Mistakes' },
  faculty_fit:     { icon: Sparkles,     color: '#F2CC2E', label: 'Faculty Fit' },
};

function buildReviewSections(data: {
  score: number;
  faculty: string | null;
  faculty_adjustment: number;
  word_count: number;
  summary: { critical: number; warnings: number; suggestions: number };
  issues: Array<{ severity: string; category: string; message: string; suggestion: string }>;
  issues_by_category: Record<string, Array<{ severity: string; message: string; suggestion: string }>>;
}): ReviewSection[] {
  const sections: ReviewSection[] = [];

  const scoreColor = data.score >= 80 ? '#4AB85C' : data.score >= 60 ? '#F2CC2E' : '#E04040';
  let summaryText = `Your resume scored ${data.score}/100.`;
  if (data.faculty) {
    const cap = data.faculty.charAt(0).toUpperCase() + data.faculty.slice(1);
    summaryText += ` Rated for ${cap}`;
    if (data.faculty_adjustment !== 0) {
      summaryText += ` (${data.faculty_adjustment > 0 ? '+' : ''}${data.faculty_adjustment} adjustment)`;
    }
    summaryText += '.';
  }
  summaryText += ` ${data.word_count} words analyzed.`;
  if (data.score >= 80) {
    summaryText += ' Great job — your resume is in excellent shape!';
  } else if (data.score >= 60) {
    summaryText += ' Solid foundation — a few improvements could push this higher.';
  } else {
    summaryText += ' There are some areas that need attention to strengthen your resume.';
  }

  sections.push({
    icon: TrendingUp,
    title: 'Overall Score',
    score: data.score,
    color: scoreColor,
    content: summaryText,
  });

  const criticalItems = data.issues
    .filter(i => i.severity === 'critical')
    .map(i => `${i.message} — ${i.suggestion}`);
  if (criticalItems.length > 0) {
    sections.push({
      icon: AlertCircle,
      title: 'Critical Issues',
      color: '#E04040',
      items: criticalItems,
    });
  }

  const warningItems = data.issues
    .filter(i => i.severity === 'warning')
    .map(i => `${i.message} — ${i.suggestion}`);
  if (warningItems.length > 0) {
    sections.push({
      icon: AlertCircle,
      title: 'Areas for Improvement',
      color: '#F59E0B',
      items: warningItems,
    });
  }

  const suggestionItems = data.issues
    .filter(i => i.severity === 'suggestion')
    .map(i => `${i.message} — ${i.suggestion}`);
  if (suggestionItems.length > 0) {
    sections.push({
      icon: ListChecks,
      title: 'Suggestions',
      color: '#3B8ED6',
      items: suggestionItems,
    });
  }

  const positives: string[] = [];
  if (data.score >= 60) positives.push('Resume meets the minimum quality threshold');
  if (!data.issues.some(i => i.category === 'formatting'))
    positives.push('Formatting looks consistent — no issues detected');
  if (!data.issues.some(i => i.category === 'sections'))
    positives.push('All essential sections are present');
  if (!data.issues.some(i => i.category === 'common_mistakes'))
    positives.push('No common mistakes found');
  if (data.word_count >= 200 && data.word_count <= 800)
    positives.push('Resume length is well-suited for a 1-page format');
  if (data.faculty && data.faculty_adjustment > 0)
    positives.push(`Strong alignment with ${data.faculty.charAt(0).toUpperCase() + data.faculty.slice(1)} faculty keywords`);

  if (positives.length > 0) {
    sections.push({
      icon: CheckCircle2,
      title: 'Strong Points',
      color: '#4AB85C',
      items: positives,
    });
  }

  return sections;
}

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);
  const [reviewSections, setReviewSections] = useState<ReviewSection[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  const degrees = [
    { id: 'sciences', label: 'Sciences', skinColor: '#FFCC99', shirtColor: '#3B82F6' },
    { id: 'business', label: 'Business', skinColor: '#FFB3C1', shirtColor: '#EF4444' },
    { id: 'engineering', label: 'Engineering', skinColor: '#FFE066', shirtColor: '#22C55E' },
    { id: 'arts', label: 'Arts', skinColor: '#D8B4FE', shirtColor: '#EAB308' },
  ];

  const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setAnalysisComplete(false);
      setReviewSections([]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setAnalysisComplete(false);
      setReviewSections([]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisComplete(false);
    setReviewSections([]);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedDegree) formData.append('faculty', selectedDegree);

    try {
      const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data.error || 'Analysis failed');
        setIsAnalyzing(false);
        return;
      }

      const result = {
        score: data.statistics.score,
        faculty: data.faculty || null,
        faculty_adjustment: data.statistics.faculty_adjustment ?? 0,
        word_count: data.statistics.word_count,
        summary: data.summary,
        issues: data.issues || [],
        issues_by_category: data.issues_by_category || {},
      };

      setReviewSections(buildReviewSections(result));
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    } catch (e) {
      setAnalysisError(
        e instanceof Error ? e.message : 'Network error. Is the backend running at ' + API_BASE + '?'
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-w-[320px] overflow-x-hidden">
      {/* ==================== PAGE 1: HERO ==================== */}
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #E8F4F8 100%)' }}>
        {/* ==================== BACKGROUND SCENE ==================== */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Sun */}
          <motion.div
            className="absolute top-6 right-6 w-12 h-12 sm:top-8 sm:right-12 sm:w-16 sm:h-16 md:top-10 md:right-20 md:w-20 md:h-20 rounded-full"
            style={{ backgroundColor: '#FFE999', boxShadow: '0 0 40px rgba(255, 233, 153, 0.5)' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Cloud 1 */}
          <motion.div
            className="absolute top-14 left-4 w-20 h-7 sm:top-16 sm:left-6 sm:w-24 sm:h-9 md:top-20 md:left-10 md:w-32 md:h-12 rounded-full bg-white/70"
            style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Cloud 2 */}
          <motion.div
            className="absolute top-24 right-10 w-16 h-6 sm:top-28 sm:right-16 sm:w-20 sm:h-8 md:top-32 md:right-40 md:w-24 md:h-10 rounded-full bg-white/60"
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Beach Scene — min-h prevents collapse */}
          <div className="absolute bottom-0 left-0 right-0 min-h-[220px] h-56 sm:h-64 md:h-72 lg:h-80">
            {/* Ocean */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[60%] overflow-hidden"
              style={{ background: 'linear-gradient(to bottom, #4A9ED8 0%, #3B8BC4 50%, #2E7AB0 100%)' }}
            >
              <motion.div
                className="absolute top-0 w-[200%] h-8 -left-[50%]"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}
                animate={{ x: ['0%', '25%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-full h-full" viewBox="0 0 2400 20" preserveAspectRatio="none">
                  <path d="M0,10 Q150,0 300,10 T600,10 T900,10 T1200,10 T1500,10 T1800,10 T2100,10 T2400,10 L2400,20 L0,20 Z" fill="rgba(255,255,255,0.2)" />
                </svg>
              </motion.div>
              <motion.div
                className="absolute top-4 w-[200%] h-6 -left-[50%]"
                animate={{ x: ['25%', '0%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-full h-full" viewBox="0 0 2400 20" preserveAspectRatio="none">
                  <path d="M0,10 Q200,5 400,10 T800,10 T1200,10 T1600,10 T2000,10 T2400,10 L2400,20 L0,20 Z" fill="rgba(255,255,255,0.15)" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Sand */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[40%]"
              style={{ background: 'linear-gradient(to bottom, #F4E4C1 0%, #E8D4A0 100%)' }}
            />

            {/* Palm Trees */}
            <PalmTree
              className="absolute bottom-[18%] left-[2%] sm:left-[4%] md:left-[6%] lg:left-[8%] w-[55px] sm:w-[75px] md:w-[95px] lg:w-[120px]"
              animate={true}
              delay={0}
            />
            <PalmTree
              className="absolute bottom-[18%] right-[2%] sm:right-[4%] md:right-[6%] lg:right-[8%] w-[55px] sm:w-[75px] md:w-[95px] lg:w-[120px]"
              animate={true}
              delay={0.5}
            />

            {/* Volleyball Net — z-[5] keeps it BELOW main content (z-10) */}
            <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 z-[5] w-[80px] sm:w-[140px] md:w-[170px] lg:w-[200px]">
              <svg className="w-full h-auto" viewBox="0 0 200 90" fill="none">
                <rect x="2" y="0" width="6" height="85" rx="2" fill="#8B6914" />
                <rect x="0" y="82" width="10" height="8" rx="2" fill="#6B4F10" />
                <rect x="192" y="0" width="6" height="85" rx="2" fill="#8B6914" />
                <rect x="190" y="82" width="10" height="8" rx="2" fill="#6B4F10" />
                <rect x="8" y="2" width="184" height="3" rx="1" fill="#E8E0D0" />
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <line key={`h-${i}`} x1="10" y1={8 + i * 9} x2="190" y2={8 + i * 9} stroke="#D4CFC4" strokeWidth="1.2" />
                ))}
                {Array.from({ length: 19 }, (_, i) => (
                  <line key={`v-${i}`} x1={10 + (i + 1) * 9.47} y1="5" x2={10 + (i + 1) * 9.47} y2="75" stroke="#D4CFC4" strokeWidth="1" />
                ))}
                <rect x="8" y="74" width="184" height="2" rx="1" fill="#E8E0D0" />
              </svg>
            </div>
          </div>
        </div>

        {/* ==================== DEGREE SELECTION OVERLAY (z-20) ==================== */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none min-h-[220px] h-56 sm:h-64 md:h-72 lg:h-80" style={{ zIndex: 20 }}>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute w-full text-center pointer-events-none px-4"
            style={{
              top: 'clamp(36px, 12%, 64px)',
              color: '#2A2A2A',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 'clamp(0.75rem, 1.8vw, 1.375rem)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            Choose Your Degree
          </motion.h2>

          <div
            className="absolute left-[2%] right-[2%] sm:left-[6%] sm:right-[6%] md:left-[10%] md:right-[10%] flex flex-wrap justify-center gap-0.5 sm:gap-0 sm:flex-nowrap sm:justify-evenly items-end pointer-events-auto bottom-[4%] sm:bottom-[6%] md:bottom-[8%]"
            style={{ minHeight: '60px' }}
          >
            {degrees.map((degree) => (
              <motion.button
                key={degree.id}
                onClick={() => setSelectedDegree(degree.id)}
                className="flex flex-col items-center gap-0.5 sm:gap-1.5 md:gap-2 p-1 sm:p-2 md:p-3 rounded-lg sm:rounded-2xl border-2 border-transparent outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                style={{
                  background: selectedDegree === degree.id ? 'rgba(255, 255, 255, 0.35)' : 'transparent',
                  borderColor: selectedDegree === degree.id ? 'rgba(42, 42, 42, 0.25)' : 'transparent',
                  minWidth: '60px',
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span style={{ color: '#2A2A2A', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 'clamp(0.5rem, 1.1vw, 0.8rem)', fontWeight: 500, letterSpacing: '0.01em' }}>
                  {degree.label}
                </span>
                <div className="relative origin-bottom scale-[0.45] sm:scale-[0.7] md:scale-[0.85] lg:scale-100" style={{ width: '36px', height: '56px' }}>
                  <div className="w-6 h-6 rounded-full mx-auto" style={{ backgroundColor: degree.skinColor }} />
                  <div className="w-8 h-10 rounded-lg mt-1 mx-auto" style={{ backgroundColor: degree.shirtColor }} />
                  <div className="absolute w-2.5 h-7 rounded" style={{ backgroundColor: degree.skinColor, top: '22px', left: '-2px' }} />
                  <div className="absolute w-2.5 h-7 rounded" style={{ backgroundColor: degree.skinColor, top: '22px', right: '-2px' }} />
                  <div className="flex gap-1 justify-center">
                    <div className="w-2 h-7 rounded" style={{ backgroundColor: degree.skinColor }} />
                    <div className="w-2 h-7 rounded" style={{ backgroundColor: degree.skinColor }} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ==================== MAIN CONTENT (z-10) ==================== */}
        <div className="relative z-10 flex flex-col items-center min-h-screen px-3 pt-3 pb-48 sm:px-6 sm:pt-6 sm:pb-56 md:px-8 md:pt-8 md:pb-64">
          <div className="flex flex-col items-center w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mt-3 sm:mt-6 md:mt-8 w-full"
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-3 md:mb-4">
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                  <FileText className="w-6 h-6 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-gray-700" strokeWidth={1.5} />
                </motion.div>
                <h1 className="tracking-tight" style={{ color: '#2A2A2A', fontSize: 'clamp(1.25rem, 4.5vw, 3rem)' }}>
                  Resume Checker
                </h1>
              </div>
              <p className="text-gray-600 px-2" style={{ fontSize: 'clamp(0.7rem, 1.8vw, 1.125rem)' }}>
                Upload your resume and get instant tropical vibes & feedback
              </p>
            </motion.div>

            {/* Beach Ball Upload Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center w-full mt-6 sm:mt-10 md:mt-14 lg:mt-[60px]"
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative cursor-pointer w-[120px] h-[120px] min-w-[120px] min-h-[120px] sm:w-[165px] sm:h-[165px] md:w-[185px] md:h-[185px] lg:w-[200px] lg:h-[200px]"
                style={{
                  transition: 'transform 0.3s ease',
                  transform: isDragging ? 'scale(1.08) translateY(-6px)' : 'scale(1) translateY(0)',
                }}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                  <defs>
                    <clipPath id="ballClip">
                      <circle cx="100" cy="100" r="95" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#ballClip)">
                    <path d="M100,100 L195,100 A95,95 0 0,1 129.36,190.35 Z" fill="#E04040" />
                    <path d="M100,100 L129.36,190.35 A95,95 0 0,1 23.15,155.83 Z" fill="#3B8ED6" />
                    <path d="M100,100 L23.15,155.83 A95,95 0 0,1 23.15,44.17 Z" fill="#F2CC2E" />
                    <path d="M100,100 L23.15,44.17 A95,95 0 0,1 129.36,9.65 Z" fill="#4AB85C" />
                    <path d="M100,100 L129.36,9.65 A95,95 0 0,1 195,100 Z" fill="#FFFFFF" />
                  </g>
                  <circle cx="100" cy="100" r="95" fill="none" stroke="#D0C8BC" strokeWidth="1.5" />
                  <circle cx="100" cy="100" r="14" fill="#FFFFFF" />
                  <circle cx="100" cy="100" r="14" fill="none" stroke="#D0C8BC" strokeWidth="1" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <AnimatePresence mode="wait">
                    {!selectedFile ? (
                      <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4">
                        <motion.div
                          animate={{ y: isDragging ? -6 : [0, -5, 0] }}
                          transition={{ y: isDragging ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                        >
                          <Upload className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-700" strokeWidth={1.5} />
                        </motion.div>
                        <input type="file" id="file-upload" onChange={handleFileSelect} accept=".pdf,.docx,.doc,.txt" className="hidden" />
                        <label
                          htmlFor="file-upload"
                          className="px-3 py-1.5 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 text-[10px] sm:text-[11px] md:text-xs"
                          style={{ backgroundColor: '#2A2A2A', color: '#FFE999' }}
                        >
                          Choose File
                        </label>
                      </motion.div>
                    ) : (
                      <motion.div key="selected" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-2.5 text-center px-3 sm:px-4 md:px-5">
                        <motion.div initial={{ rotate: -10, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-600" strokeWidth={1.5} />
                        </motion.div>
                        <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-600 flex items-center gap-1 justify-center max-w-[90px] sm:max-w-[110px] md:max-w-[130px] truncate">
                          <FileText className="w-3 h-3 shrink-0" />
                          {selectedFile.name}
                        </p>
                        <div className="flex gap-1 sm:gap-1.5 md:gap-2">
                          <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-3.5 md:py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-[9px] sm:text-[10px] md:text-[11px]"
                            style={{ backgroundColor: '#2A2A2A', color: '#FFE999' }}
                          >
                            {isAnalyzing ? (
                              <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </motion.div>
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Analyze
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setAnalysisComplete(false);
                              setReviewSections([]);
                              setAnalysisError(null);
                            }}
                            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 text-[9px] sm:text-[10px] md:text-[11px]"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', color: '#666' }}
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Error display */}
            {analysisError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 w-full max-w-sm sm:max-w-md rounded-2xl p-4 sm:p-6 border-2 border-red-200 bg-red-50"
              >
                <p className="text-red-800 text-sm sm:text-base">{analysisError}</p>
                <p className="text-gray-600 text-xs mt-2">Run the backend: <code className="bg-white px-1 rounded">python app.py</code></p>
              </motion.div>
            )}
          </div>

          {/* Scroll hint when analyzing */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ y: { duration: 1.5, repeat: Infinity }, opacity: { duration: 0.5 } }}
              className="mt-6"
            >
              <ArrowDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          )}
        </div>
      </div>

      {/* ==================== PAGE 2: RESULTS ==================== */}
      <ResultsPage
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        fileName={selectedFile?.name}
        reviewSections={reviewSections}
        onUploadAnother={() => {
          setSelectedFile(null);
          setAnalysisComplete(false);
          setReviewSections([]);
          setAnalysisError(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* ==================== ABOUT BUTTON (fixed bottom-right) ==================== */}
      <motion.button
        onClick={() => setShowAbout(true)}
        className="fixed bottom-5 right-5 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: '#2A2A2A' }}
        whileHover={{ boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}
        aria-label="About the author"
      >
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
      </motion.button>

      {/* About popup */}
      <AnimatePresence>
        {showAbout && (
          <>
            <motion.div
              key="about-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowAbout(false)}
            />
            <motion.div
              key="about-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-20 right-5 z-50 w-[280px] sm:w-[320px] rounded-2xl p-5 sm:p-6 shadow-xl"
              style={{ backgroundColor: '#FFFDF7', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <button
                onClick={() => setShowAbout(false)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              <img src="/waterloo-logo.png" alt="University of Waterloo" className="w-full max-w-[200px] mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">About the Author</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Hi! I'm Arjun Singh. I go to the University of Waterloo, and I am a Math/CS major!
              </p>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="font-medium text-gray-700 mb-1">How to use:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs sm:text-sm">
                  <li>Upload your resume file</li>
                  <li>Select your degree</li>
                  <li>Click Analyze</li>
                  <li>Wait for the analysis to complete</li>
                  <li>View the results!</li>
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
