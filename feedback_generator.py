"""
Feedback Generator - Creates formatted feedback reports
"""
from typing import List
from resume_analyzer import Issue
from colorama import Fore, Style, init

# Initialize colorama for Windows
init(autoreset=True)


class FeedbackGenerator:
    """Generates formatted feedback reports from analysis issues"""
    
    def __init__(self):
        self.severity_colors = {
            'critical': Fore.RED,
            'warning': Fore.YELLOW,
            'suggestion': Fore.CYAN
        }
    
    def generate_report(self, issues: List[Issue], resume_text: str = None) -> str:
        """
        Generate a formatted feedback report
        
        Args:
            issues: List of Issue objects from analysis
            resume_text: Optional resume text for statistics
            
        Returns:
            Formatted report string
        """
        if not issues:
            return self._generate_success_report()
        
        # Group issues by severity
        critical_issues = [i for i in issues if i.severity == 'critical']
        warning_issues = [i for i in issues if i.severity == 'warning']
        suggestion_issues = [i for i in issues if i.severity == 'suggestion']
        
        report = []
        report.append("\n" + "=" * 70)
        report.append("RESUME ANALYSIS REPORT")
        report.append("=" * 70 + "\n")
        
        # Summary statistics
        if resume_text:
            word_count = len(resume_text.split())
            char_count = len(resume_text)
            report.append(f"Resume Statistics:")
            report.append(f"  • Word count: {word_count}")
            report.append(f"  • Character count: {char_count}")
            report.append("")
        
        # Issue summary
        report.append("Issue Summary:")
        report.append(f"  {Fore.RED}• Critical issues: {len(critical_issues)}")
        report.append(f"  {Fore.YELLOW}• Warnings: {len(warning_issues)}")
        report.append(f"  {Fore.CYAN}• Suggestions: {len(suggestion_issues)}")
        report.append("")
        
        # Critical issues
        if critical_issues:
            report.append(self._format_issue_section("CRITICAL ISSUES", critical_issues, 'critical'))
        
        # Warnings
        if warning_issues:
            report.append(self._format_issue_section("WARNINGS", warning_issues, 'warning'))
        
        # Suggestions
        if suggestion_issues:
            report.append(self._format_issue_section("SUGGESTIONS", suggestion_issues, 'suggestion'))
        
        # Group by category
        report.append("\n" + "-" * 70)
        report.append("ISSUES BY CATEGORY")
        report.append("-" * 70 + "\n")
        
        categories = {}
        for issue in issues:
            if issue.category not in categories:
                categories[issue.category] = []
            categories[issue.category].append(issue)
        
        for category, category_issues in categories.items():
            report.append(f"\n{category.upper()}:")
            for issue in category_issues:
                color = self.severity_colors.get(issue.severity, '')
                report.append(f"  {color}[{issue.severity.upper()}]{Style.RESET_ALL} {issue.message}")
                report.append(f"    → {issue.suggestion}")
        
        # Overall score
        report.append("\n" + "=" * 70)
        score = self._calculate_score(issues)
        report.append(f"OVERALL SCORE: {score}/100")
        report.append("=" * 70 + "\n")
        
        return "\n".join(report)
    
    def _format_issue_section(self, title: str, issues: List[Issue], severity: str) -> str:
        """Format a section of issues"""
        section = []
        color = self.severity_colors.get(severity, '')
        section.append(f"\n{color}{title}{Style.RESET_ALL}")
        section.append("-" * 70)
        
        for idx, issue in enumerate(issues, 1):
            section.append(f"\n{idx}. {issue.message}")
            section.append(f"   Category: {issue.category}")
            section.append(f"   Suggestion: {issue.suggestion}")
        
        return "\n".join(section)
    
    def _calculate_score(self, issues: List[Issue]) -> int:
        """Calculate an overall score out of 100"""
        base_score = 100
        
        # Deduct points based on severity
        for issue in issues:
            if issue.severity == 'critical':
                base_score -= 10
            elif issue.severity == 'warning':
                base_score -= 5
            elif issue.severity == 'suggestion':
                base_score -= 2
        
        # Ensure score doesn't go below 0
        return max(0, base_score)
    
    def _generate_success_report(self) -> str:
        """Generate a report when no issues are found"""
        report = []
        report.append("\n" + "=" * 70)
        report.append("RESUME ANALYSIS REPORT")
        report.append("=" * 70 + "\n")
        report.append(f"{Fore.GREEN}✓ Excellent! No major issues found.{Style.RESET_ALL}\n")
        report.append("Your resume looks good! Keep up the great work.")
        report.append("=" * 70 + "\n")
        return "\n".join(report)
    
    def generate_summary(self, issues: List[Issue]) -> str:
        """Generate a brief summary of issues"""
        if not issues:
            return "No issues found. Resume looks good!"
        
        critical = len([i for i in issues if i.severity == 'critical'])
        warnings = len([i for i in issues if i.severity == 'warning'])
        suggestions = len([i for i in issues if i.severity == 'suggestion'])
        
        summary = f"Found {len(issues)} issue(s): "
        parts = []
        if critical > 0:
            parts.append(f"{critical} critical")
        if warnings > 0:
            parts.append(f"{warnings} warning(s)")
        if suggestions > 0:
            parts.append(f"{suggestions} suggestion(s)")
        
        return summary + ", ".join(parts)
