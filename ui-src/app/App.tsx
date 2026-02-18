import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { PalmTree } from './components/PalmTree';

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);

  // API faculty values must match backend: sciences, engineering, arts, business
  const degrees = [
    { id: 'sciences', label: 'Sciences', skinColor: '#FFCC99', shirtColor: '#3B82F6' },
    { id: 'business', label: 'Business', skinColor: '#FFB3C1', shirtColor: '#EF4444' },
    { id: 'engineering', label: 'Engineering', skinColor: '#FFE066', shirtColor: '#22C55E' },
    { id: 'arts', label: 'Arts', skinColor: '#D8B4FE', shirtColor: '#EAB308' },
  ];

  const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) || 'http://localhost:5000';

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
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setAnalysisComplete(false);
    }
  };

  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    faculty: string | null;
    faculty_adjustment: number;
    word_count: number;
    summary: { critical: number; warnings: number; suggestions: number };
    issues: Array<{ severity: string; category: string; message: string; suggestion: string }>;
    issues_by_category: Record<string, Array<{ severity: string; message: string; suggestion: string }>>;
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisComplete(false);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedDegree) formData.append('faculty', selectedDegree);
    try {
      const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data.error || 'Analysis failed');
        return;
      }
      setAnalysisResult({
        score: data.statistics.score,
        faculty: data.faculty || null,
        faculty_adjustment: data.statistics.faculty_adjustment ?? 0,
        word_count: data.statistics.word_count,
        summary: data.summary,
        issues: data.issues || [],
        issues_by_category: data.issues_by_category || {},
      });
      setAnalysisComplete(true);
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : 'Network error. Is the backend running at ' + API_BASE + '?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #E8F4F8 100%)' }}>
      {/* ==================== BACKGROUND SCENE ==================== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sun - responsive positioning & size */}
        <motion.div
          className="absolute top-6 right-6 w-12 h-12 sm:top-8 sm:right-12 sm:w-16 sm:h-16 md:top-10 md:right-20 md:w-20 md:h-20 rounded-full"
          style={{ backgroundColor: '#FFE999', boxShadow: '0 0 40px rgba(255, 233, 153, 0.5)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Cloud 1 - responsive */}
        <motion.div
          className="absolute top-14 left-4 w-20 h-7 sm:top-16 sm:left-6 sm:w-24 sm:h-9 md:top-20 md:left-10 md:w-32 md:h-12 rounded-full bg-white/70"
          style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Cloud 2 - responsive, avoids right overflow */}
        <motion.div
          className="absolute top-24 right-10 w-16 h-6 sm:top-28 sm:right-16 sm:w-20 sm:h-8 md:top-32 md:right-40 md:w-24 md:h-10 rounded-full bg-white/60"
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* ===== Beach Scene Container - responsive height ===== */}
        <div className="absolute bottom-0 left-0 right-0 h-56 sm:h-64 md:h-72 lg:h-80">
          {/* Ocean */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[60%] overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #4A9ED8 0%, #3B8BC4 50%, #2E7AB0 100%)' }}
          >
            {/* Wave 1 */}
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
            
            {/* Wave 2 */}
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
          
          {/* Palm Tree Left - responsive size via width class, anchored bottom-left */}
          <PalmTree 
            className="absolute bottom-[18%] left-[2%] sm:left-[4%] md:left-[6%] lg:left-[8%] w-[55px] sm:w-[75px] md:w-[95px] lg:w-[120px]" 
            animate={true}
            delay={0}
          />
          
          {/* Palm Tree Right - responsive size, anchored bottom-right */}
          <PalmTree 
            className="absolute bottom-[18%] right-[2%] sm:right-[4%] md:right-[6%] lg:right-[8%] w-[55px] sm:w-[75px] md:w-[95px] lg:w-[120px]" 
            animate={true}
            delay={0.5}
          />
          
          {/* Volleyball Net - responsive, centered */}
          <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 z-20 w-[100px] sm:w-[140px] md:w-[170px] lg:w-[200px]">
            <svg className="w-full h-auto" viewBox="0 0 200 90" fill="none">
              {/* Left post */}
              <rect x="2" y="0" width="6" height="85" rx="2" fill="#8B6914" />
              <rect x="0" y="82" width="10" height="8" rx="2" fill="#6B4F10" />
              {/* Right post */}
              <rect x="192" y="0" width="6" height="85" rx="2" fill="#8B6914" />
              <rect x="190" y="82" width="10" height="8" rx="2" fill="#6B4F10" />
              {/* Top rope */}
              <rect x="8" y="2" width="184" height="3" rx="1" fill="#E8E0D0" />
              {/* Net grid - horizontal lines */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line
                  key={`h-${i}`}
                  x1="10"
                  y1={8 + i * 9}
                  x2="190"
                  y2={8 + i * 9}
                  stroke="#D4CFC4"
                  strokeWidth="1.2"
                />
              ))}
              {/* Net grid - vertical lines */}
              {Array.from({ length: 19 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={10 + (i + 1) * 9.47}
                  y1="5"
                  x2={10 + (i + 1) * 9.47}
                  y2="75"
                  stroke="#D4CFC4"
                  strokeWidth="1"
                />
              ))}
              {/* Bottom rope */}
              <rect x="8" y="74" width="184" height="2" rx="1" fill="#E8E0D0" />
            </svg>
          </div>
        </div>
      </div>

      {/* ==================== DEGREE SELECTION OVERLAY ==================== */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none h-56 sm:h-64 md:h-72 lg:h-80" style={{ zIndex: 25 }}>
        {/* "Choose Your Degree" heading - responsive positioning */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute w-full text-center pointer-events-none top-[2%] sm:top-[4%] md:top-[6%] px-4"
          style={{
            color: '#2A2A2A',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 'clamp(0.875rem, 2vw, 1.375rem)',
            fontWeight: 500,
            letterSpacing: '-0.01em',
          }}
        >
          Choose Your Degree
        </motion.h2>

        {/* Character Buttons Row - responsive spacing, wraps on very small screens */}
        <div
          className="absolute left-[3%] right-[3%] sm:left-[6%] sm:right-[6%] md:left-[10%] md:right-[10%] flex flex-wrap justify-center gap-1 sm:gap-0 sm:flex-nowrap sm:justify-evenly items-end pointer-events-auto bottom-[6%] sm:bottom-[7%] md:bottom-[8%]"
        >
          {degrees.map((degree) => (
            <motion.button
              key={degree.id}
              onClick={() => setSelectedDegree(degree.id)}
              className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl border-2 border-transparent outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
              style={{
                background: selectedDegree === degree.id ? 'rgba(255, 255, 255, 0.35)' : 'transparent',
                borderColor: selectedDegree === degree.id ? 'rgba(42, 42, 42, 0.25)' : 'transparent',
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {/* Degree Label */}
              <span
                style={{
                  color: '#2A2A2A',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: 'clamp(0.55rem, 1.2vw, 0.8rem)',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                {degree.label}
              </span>

              {/* Character Illustration - scales via CSS transform */}
              <div
                className="relative origin-bottom scale-[0.55] sm:scale-[0.7] md:scale-[0.85] lg:scale-100"
                style={{ width: '36px', height: '56px' }}
              >
                {/* Head */}
                <div
                  className="w-6 h-6 rounded-full mx-auto"
                  style={{ backgroundColor: degree.skinColor }}
                />
                {/* Body */}
                <div
                  className="w-8 h-10 rounded-lg mt-1 mx-auto"
                  style={{ backgroundColor: degree.shirtColor }}
                />
                {/* Arms */}
                <div
                  className="absolute w-2.5 h-7 rounded"
                  style={{ backgroundColor: degree.skinColor, top: '22px', left: '-2px' }}
                />
                <div
                  className="absolute w-2.5 h-7 rounded"
                  style={{ backgroundColor: degree.skinColor, top: '22px', right: '-2px' }}
                />
                {/* Legs */}
                <div className="flex gap-1 justify-center">
                  <div
                    className="w-2 h-7 rounded"
                    style={{ backgroundColor: degree.skinColor }}
                  />
                  <div
                    className="w-2 h-7 rounded"
                    style={{ backgroundColor: degree.skinColor }}
                  />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6 md:px-8 md:pt-8 md:pb-8">
        {/* Wrapper to vertically center header+ball on mobile */}
        <div className="flex-1 flex flex-col items-center justify-center sm:flex-initial sm:justify-start">
        {/* Header - responsive typography, centered on full width */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-4 sm:mt-6 md:mt-8 w-full"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileText className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-gray-700" strokeWidth={1.5} />
            </motion.div>
            <h1
              className="tracking-tight"
              style={{ color: '#2A2A2A', fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
            >
              Resume Checker
            </h1>
          </div>
          <p
            className="text-gray-600"
            style={{ fontSize: 'clamp(0.8rem, 2vw, 1.125rem)' }}
          >
            Upload your resume and get instant tropical vibes & feedback
          </p>
        </motion.div>

        {/* Beach Ball Upload Area - responsive size */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center w-full mt-8 sm:mt-10 md:mt-14 lg:mt-[60px]"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative cursor-pointer w-[140px] h-[140px] sm:w-[165px] sm:h-[165px] md:w-[185px] md:h-[185px] lg:w-[200px] lg:h-[200px]"
            style={{
              transition: 'transform 0.3s ease',
              transform: isDragging ? 'scale(1.08) translateY(-6px)' : 'scale(1) translateY(0)',
            }}
          >
            {/* Flat 2D Beach Ball SVG - vibrant colors */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 200 200"
            >
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

            {/* Upload controls centered inside ball */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <AnimatePresence mode="wait">
                {!selectedFile ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4"
                  >
                    <motion.div
                      animate={{ y: isDragging ? -6 : [0, -5, 0] }}
                      transition={{
                        y: isDragging ? { duration: 0.3 } : {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <Upload
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-700"
                        strokeWidth={1.5}
                      />
                    </motion.div>

                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileSelect}
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-3 py-1.5 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 text-[10px] sm:text-[11px] md:text-xs"
                      style={{ backgroundColor: '#2A2A2A', color: '#FFE999' }}
                    >
                      Choose File
                    </label>
                  </motion.div>
                ) : (
                  <motion.div
                    key="selected"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-2.5 text-center px-3 sm:px-4 md:px-5"
                  >
                    <motion.div
                      initial={{ rotate: -10, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle2
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-600"
                        strokeWidth={1.5}
                      />
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
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
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
                          setAnalysisResult(null);
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
        </div>

        {/* Analysis error */}
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

        {/* Analysis Results - real data from backend */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <AnimatePresence>
            {analysisComplete && analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8"
                style={{
                  backgroundColor: 'white',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div 
                    className="p-2 sm:p-3 rounded-full"
                    style={{ backgroundColor: '#FFF9E6' }}
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl text-gray-800">Analysis Complete!</h2>
                </div>

                {/* Score & faculty */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="px-4 py-2 rounded-xl text-lg sm:text-xl font-bold"
                    style={{ backgroundColor: analysisResult.score >= 80 ? '#dcfce7' : analysisResult.score >= 60 ? '#fef9c3' : '#fee2e2', color: '#1f2937' }}
                  >
                    Score: {analysisResult.score}/100
                  </div>
                  {analysisResult.faculty && (
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      Rated for: {analysisResult.faculty.charAt(0).toUpperCase() + analysisResult.faculty.slice(1)}
                      {analysisResult.faculty_adjustment !== 0 && (
                        <span className="ml-1">{analysisResult.faculty_adjustment > 0 ? '+' : ''}{analysisResult.faculty_adjustment} to score</span>
                      )}
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">{analysisResult.word_count} words</span>
                </div>

                {/* Summary counts */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                  {analysisResult.summary.critical > 0 && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">{analysisResult.summary.critical} critical</span>
                  )}
                  {analysisResult.summary.warnings > 0 && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">{analysisResult.summary.warnings} warnings</span>
                  )}
                  {analysisResult.summary.suggestions > 0 && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-sky-100 text-sky-800">{analysisResult.summary.suggestions} suggestions</span>
                  )}
                  {analysisResult.issues.length === 0 && (
                    <p className="text-green-700 text-sm font-medium">No issues found — great job!</p>
                  )}
                </div>
                
                {/* Issues list */}
                <div className="space-y-3 sm:space-y-4">
                  {analysisResult.issues.slice(0, 12).map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 sm:mt-2 shrink-0"
                        style={{
                          backgroundColor:
                            issue.severity === 'critical' ? '#ef4444' :
                            issue.severity === 'warning' ? '#f59e0b' : '#0ea5e9'
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base capitalize">{issue.category}</h4>
                        <p className="text-gray-700 text-xs sm:text-sm md:text-base">{issue.message}</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 italic">→ {issue.suggestion}</p>
                      </div>
                    </div>
                  ))}
                  {analysisResult.issues.length > 12 && (
                    <p className="text-gray-500 text-sm">+ {analysisResult.issues.length - 12} more in the full report</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}