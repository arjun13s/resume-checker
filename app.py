"""
Resume Checker Web Application - Flask backend
"""
import os
import tempfile
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename
from resume_parser import ResumeParser
from resume_analyzer import ResumeAnalyzer
from feedback_generator import FeedbackGenerator

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze uploaded resume file"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Parse resume
            parser = ResumeParser()
            resume_text = parser.parse(filepath)
            
            if not resume_text or len(resume_text.strip()) < 50:
                return jsonify({
                    'error': 'Could not extract meaningful content from resume file. Please ensure the file is readable.'
                }), 400
            
            # Analyze resume
            analyzer = ResumeAnalyzer()
            issues = analyzer.analyze(resume_text)
            
            # Generate feedback
            generator = FeedbackGenerator()
            report = generator.generate_report(issues, resume_text)
            
            # Prepare response data
            word_count = len(resume_text.split())
            char_count = len(resume_text)
            
            critical_issues = [i for i in issues if i.severity == 'critical']
            warning_issues = [i for i in issues if i.severity == 'warning']
            suggestion_issues = [i for i in issues if i.severity == 'suggestion']
            
            # Calculate score
            base_score = 100
            for issue in issues:
                if issue.severity == 'critical':
                    base_score -= 10
                elif issue.severity == 'warning':
                    base_score -= 5
                elif issue.severity == 'suggestion':
                    base_score -= 2
            score = max(0, base_score)
            
            # Convert issues to dictionaries for JSON
            issues_data = []
            for issue in issues:
                issues_data.append({
                    'severity': issue.severity,
                    'category': issue.category,
                    'message': issue.message,
                    'suggestion': issue.suggestion
                })
            
            # Group by category
            issues_by_category = {}
            for issue in issues:
                if issue.category not in issues_by_category:
                    issues_by_category[issue.category] = []
                issues_by_category[issue.category].append({
                    'severity': issue.severity,
                    'message': issue.message,
                    'suggestion': issue.suggestion
                })
            
            response_data = {
                'success': True,
                'statistics': {
                    'word_count': word_count,
                    'char_count': char_count,
                    'score': score
                },
                'summary': {
                    'total_issues': len(issues),
                    'critical': len(critical_issues),
                    'warnings': len(warning_issues),
                    'suggestions': len(suggestion_issues)
                },
                'issues': issues_data,
                'issues_by_category': issues_by_category,
                'report': report
            }
            
            return jsonify(response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
