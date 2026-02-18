"""
Resume Analyzer - Core analysis logic for evaluating resumes
"""
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

# Faculty options for degree-based rating
VALID_FACULTIES = ('sciences', 'engineering', 'arts', 'business')


@dataclass
class Issue:
    """Represents an issue found in the resume"""
    severity: str  # 'critical', 'warning', 'suggestion'
    category: str  # 'formatting', 'content', 'keywords', 'structure'
    message: str
    suggestion: str


class ResumeAnalyzer:
    """Analyzes resume content and identifies issues"""
    
    def __init__(self):
        self.essential_sections = [
            'contact', 'email', 'phone', 'experience', 'education',
            'skills', 'summary', 'objective'
        ]
        
        self.action_verbs = [
            'achieved', 'managed', 'developed', 'implemented', 'created',
            'designed', 'led', 'improved', 'increased', 'reduced',
            'optimized', 'collaborated', 'executed', 'delivered', 'built'
        ]
        
        self.weak_words = [
            'assisted', 'helped', 'tried', 'attempted', 'hopefully',
            'maybe', 'somewhat', 'kind of', 'sort of'
        ]
        
        # Faculty-specific keywords that strengthen the resume for that field
        self.faculty_keywords = {
            'sciences': ['research', 'publication', 'lab', 'methodology', 'data analysis', 'experiment', 'journal', 'hypothesis', 'peer-reviewed'],
            'engineering': ['project', 'technical', 'design', 'implementation', 'software', 'system', 'tool', 'programming', 'development', 'build'],
            'arts': ['portfolio', 'creative', 'exhibition', 'design', 'curation', 'visual', 'installation', 'commission', 'collaboration'],
            'business': ['revenue', 'growth', 'strategy', 'management', 'leadership', 'budget', 'client', 'sales', 'marketing', 'analytics', 'roi', 'kpi'],
        }
    
    def analyze(self, resume_text: str, faculty: Optional[str] = None) -> List[Issue]:
        """
        Analyze resume text and return list of issues.
        
        Args:
            resume_text: The extracted text from the resume
            faculty: Optional field of degree - 'sciences', 'engineering', 'arts', or 'business'
                     Used to tailor checks and rating.
        Returns:
            List of Issue objects
        """
        issues = []
        
        if not resume_text or len(resume_text.strip()) < 100:
            issues.append(Issue(
                severity='critical',
                category='content',
                message='Resume appears to be too short or empty',
                suggestion='Ensure your resume contains substantial content (at least 100 words)'
            ))
            return issues
        
        # Check for essential sections
        issues.extend(self._check_essential_sections(resume_text))
        
        # Check formatting
        issues.extend(self._check_formatting(resume_text))
        
        # Check content quality
        issues.extend(self._check_content_quality(resume_text))
        
        # Check for keywords and action verbs
        issues.extend(self._check_keywords(resume_text))
        
        # Check structure
        issues.extend(self._check_structure(resume_text))
        
        # Check for common mistakes
        issues.extend(self._check_common_mistakes(resume_text))
        
        # Faculty-specific checks (adds issues if resume doesn't match field)
        if faculty and faculty in VALID_FACULTIES:
            issues.extend(self._check_faculty_fit(resume_text, faculty))
        
        return issues
    
    def _check_faculty_fit(self, text: str, faculty: str) -> List[Issue]:
        """Add suggestions when resume is missing faculty-relevant content."""
        issues = []
        text_lower = text.lower()
        keywords = self.faculty_keywords.get(faculty, [])
        found = sum(1 for k in keywords if k in text_lower)
        
        if faculty == 'sciences' and found < 2:
            issues.append(Issue(
                severity='suggestion',
                category='keywords',
                message='Few science-specific terms for a Sciences profile',
                suggestion='Highlight research, publications, lab work, methodology, or data analysis to strengthen your resume for science roles.'
            ))
        elif faculty == 'engineering' and found < 2:
            issues.append(Issue(
                severity='suggestion',
                category='keywords',
                message='Few engineering-specific terms for an Engineering profile',
                suggestion='Highlight technical skills, projects, tools, and concrete outcomes to better match engineering expectations.'
            ))
        elif faculty == 'arts' and found < 2:
            issues.append(Issue(
                severity='suggestion',
                category='keywords',
                message='Few arts/creative terms for an Arts profile',
                suggestion='Include portfolio work, exhibitions, creative projects, or collaborative work to align with arts and design roles.'
            ))
        elif faculty == 'business' and found < 2:
            issues.append(Issue(
                severity='suggestion',
                category='keywords',
                message='Few business-specific terms for a Business profile',
                suggestion='Highlight leadership, strategy, revenue, growth, client work, or metrics (e.g. ROI, KPIs) to strengthen your resume for business roles.'
            ))
        
        return issues
    
    def get_faculty_score_adjustment(self, resume_text: str, faculty: Optional[str]) -> int:
        """
        Returns a score adjustment (-2 to +5) based on how well the resume
        matches the selected faculty. Used to factor degree field into the rating.
        """
        if not resume_text or not faculty or faculty not in VALID_FACULTIES:
            return 0
        text_lower = resume_text.lower()
        keywords = self.faculty_keywords.get(faculty, [])
        found = sum(1 for k in keywords if k in text_lower)
        if found >= 4:
            return 5
        if found >= 3:
            return 3
        if found >= 2:
            return 1
        if found >= 1:
            return 0
        return -2
    
    def _check_essential_sections(self, text: str) -> List[Issue]:
        """Check if essential sections are present"""
        issues = []
        text_lower = text.lower()
        
        # Check for contact information
        has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
        has_phone = bool(re.search(r'[\d\s\-\(\)\+]{10,}', text))
        
        if not has_email:
            issues.append(Issue(
                severity='critical',
                category='content',
                message='Email address not found',
                suggestion='Add a professional email address in your contact section'
            ))
        
        if not has_phone:
            issues.append(Issue(
                severity='warning',
                category='content',
                message='Phone number not found',
                suggestion='Consider adding a phone number for better contact options'
            ))
        
        # Check for experience section
        if not re.search(r'\b(experience|work\s+history|employment|professional\s+experience)\b', text_lower):
            issues.append(Issue(
                severity='critical',
                category='structure',
                message='Experience section not clearly identified',
                suggestion='Add a clear "Experience" or "Work History" section'
            ))
        
        # Check for education section
        if not re.search(r'\b(education|academic|qualifications|degree)\b', text_lower):
            issues.append(Issue(
                severity='warning',
                category='structure',
                message='Education section not clearly identified',
                suggestion='Add a clear "Education" section listing your degrees and institutions'
            ))
        
        return issues
    
    def _check_formatting(self, text: str) -> List[Issue]:
        """Check formatting issues"""
        issues = []
        
        # Check for consistent spacing
        if re.search(r'\n{4,}', text):
            issues.append(Issue(
                severity='warning',
                category='formatting',
                message='Excessive blank lines detected',
                suggestion='Remove extra blank lines to improve readability'
            ))
        
        # Check for very long lines (potential formatting issues)
        lines = text.split('\n')
        long_lines = [line for line in lines if len(line) > 100]
        if len(long_lines) > len(lines) * 0.3:
            issues.append(Issue(
                severity='suggestion',
                category='formatting',
                message='Many lines are very long',
                suggestion='Consider breaking long lines for better readability'
            ))
        
        # Check for inconsistent bullet points
        bullet_patterns = [r'^[\-\•\*]\s', r'^\d+[\.\)]\s']
        has_bullets = any(re.search(pattern, text, re.MULTILINE) for pattern in bullet_patterns)
        if not has_bullets and len(text.split('\n')) > 10:
            issues.append(Issue(
                severity='suggestion',
                category='formatting',
                message='Consider using bullet points for better readability',
                suggestion='Use bullet points (•, -, or *) to organize your experience and skills'
            ))
        
        return issues
    
    def _check_content_quality(self, text: str) -> List[Issue]:
        """Check content quality issues"""
        issues = []
        text_lower = text.lower()
        
        # Check for action verbs
        action_verb_count = sum(1 for verb in self.action_verbs if verb in text_lower)
        if action_verb_count < 3:
            issues.append(Issue(
                severity='warning',
                category='content',
                message='Limited use of action verbs',
                suggestion=f'Use more action verbs (found {action_verb_count}). Examples: achieved, managed, developed, implemented, created'
            ))
        
        # Check for weak words
        weak_word_count = sum(1 for word in self.weak_words if word in text_lower)
        if weak_word_count > 0:
            issues.append(Issue(
                severity='suggestion',
                category='content',
                message='Weak or uncertain language detected',
                suggestion='Replace weak words like "assisted", "helped", "tried" with stronger action verbs'
            ))
        
        # Check for quantified achievements
        has_numbers = bool(re.search(r'\d+%|\d+\s*(years?|months?)|[$]\d+|\d+\+', text))
        if not has_numbers:
            issues.append(Issue(
                severity='warning',
                category='content',
                message='Limited quantified achievements',
                suggestion='Add specific numbers, percentages, or metrics to demonstrate impact (e.g., "increased sales by 25%", "managed team of 5")'
            ))
        
        # Check resume length
        word_count = len(text.split())
        if word_count < 200:
            issues.append(Issue(
                severity='warning',
                category='content',
                message='Resume may be too brief',
                suggestion=f'Consider expanding your resume (currently ~{word_count} words). Aim for 300-500 words for most positions'
            ))
        elif word_count > 800:
            issues.append(Issue(
                severity='suggestion',
                category='content',
                message='Resume may be too long',
                suggestion=f'Consider condensing your resume (currently ~{word_count} words). Most resumes should be 1-2 pages'
            ))
        
        return issues
    
    def _check_keywords(self, text: str) -> List[Issue]:
        """Check for keyword optimization"""
        issues = []
        text_lower = text.lower()
        
        # Check for skills section
        if not re.search(r'\b(skills?|technical\s+skills?|competencies?)\b', text_lower):
            issues.append(Issue(
                severity='warning',
                category='keywords',
                message='Skills section not clearly identified',
                suggestion='Add a dedicated "Skills" section listing relevant technical and soft skills'
            ))
        
        # Check for summary/objective
        has_summary = bool(re.search(r'\b(summary|profile|objective|about)\b', text_lower))
        if not has_summary:
            issues.append(Issue(
                severity='suggestion',
                category='structure',
                message='No summary or objective section found',
                suggestion='Consider adding a brief professional summary at the top of your resume'
            ))
        
        return issues
    
    def _check_structure(self, text: str) -> List[Issue]:
        """Check structural issues"""
        issues = []
        
        # Check for proper section headers (all caps or title case)
        lines = text.split('\n')
        potential_headers = [line.strip() for line in lines if len(line.strip()) > 0 and len(line.strip()) < 50]
        
        # Check if resume has clear structure
        if len(potential_headers) < 3:
            issues.append(Issue(
                severity='warning',
                category='structure',
                message='Resume structure may be unclear',
                suggestion='Ensure your resume has clear section headers (e.g., EXPERIENCE, EDUCATION, SKILLS)'
            ))
        
        return issues
    
    def _check_common_mistakes(self, text: str) -> List[Issue]:
        """Check for common resume mistakes"""
        issues = []
        text_lower = text.lower()
        
        # Check for typos/common errors
        if 'resume' in text_lower and 'résumé' not in text_lower:
            # This is fine, just checking
            pass
        
        # Check for personal pronouns
        if re.search(r'\b(i|me|my|we|our)\b', text_lower):
            issues.append(Issue(
                severity='suggestion',
                category='content',
                message='Personal pronouns detected',
                suggestion='Avoid using "I", "me", "my" in resumes. Use action verbs instead (e.g., "Managed team" instead of "I managed a team")'
            ))
        
        # Check for references
        if 'references' in text_lower or 'references available' in text_lower:
            issues.append(Issue(
                severity='suggestion',
                category='content',
                message='References section found',
                suggestion='Remove "References available upon request" - it\'s assumed and takes up valuable space'
            ))
        
        return issues
