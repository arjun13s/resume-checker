"""
Resume Checker - Main CLI application
"""
import sys
import click
from resume_parser import ResumeParser
from resume_analyzer import ResumeAnalyzer
from feedback_generator import FeedbackGenerator


@click.command()
@click.argument('resume_file', type=click.Path(exists=True))
@click.option('--output', '-o', type=click.Path(), help='Save report to file')
def main(resume_file, output):
    """
    Analyze a resume file and provide feedback.
    
    RESUME_FILE: Path to the resume file (PDF, DOCX, or TXT)
    """
    try:
        # Parse resume
        click.echo(f"Parsing resume: {resume_file}")
        parser = ResumeParser()
        resume_text = parser.parse(resume_file)
        
        if not resume_text or len(resume_text.strip()) < 50:
            click.echo("Error: Could not extract meaningful content from resume file.", err=True)
            sys.exit(1)
        
        click.echo("✓ Resume parsed successfully")
        
        # Analyze resume
        click.echo("Analyzing resume...")
        analyzer = ResumeAnalyzer()
        issues = analyzer.analyze(resume_text)
        
        # Generate feedback
        click.echo("Generating feedback report...")
        generator = FeedbackGenerator()
        report = generator.generate_report(issues, resume_text)
        
        # Output report
        if output:
            with open(output, 'w', encoding='utf-8') as f:
                f.write(report)
            click.echo(f"\nReport saved to: {output}")
        else:
            click.echo(report)
        
        # Exit code based on critical issues
        critical_issues = [i for i in issues if i.severity == 'critical']
        if critical_issues:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except FileNotFoundError as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    except ValueError as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"Unexpected error: {e}", err=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
