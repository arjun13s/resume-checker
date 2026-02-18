"""
Resume Checker Web Application - Flask backend
"""
import os
import tempfile
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from werkzeug.utils import secure_filename
from resume_parser import ResumeParser
from resume_analyzer import ResumeAnalyzer
from feedback_generator import FeedbackGenerator

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Path to the new React UI build (beach theme). If present, it's served at /.
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'dist')


# CORS so the React/Vite frontend (e.g. localhost:5173) can call this API
@app.after_request
def add_cors_headers(response):
    origin = request.environ.get('HTTP_ORIGIN', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.route('/analyze', methods=['OPTIONS'])
def analyze_options():
    return '', 204

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Serve the new React UI if built, otherwise the old HTML UI."""
    index_path = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.isfile(index_path):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return render_template('index.html')


@app.route('/assets/<path:filename>')
def frontend_assets(filename):
    """Serve React build assets (JS, CSS) so the new UI works."""
    assets_dir = os.path.join(FRONTEND_DIST, 'assets')
    if os.path.isdir(assets_dir):
        return send_from_directory(assets_dir, filename)
    return '', 404


@app.route('/<path:filename>')
def frontend_static(filename):
    """Serve other static files from the frontend dist (images, etc.)."""
    filepath = os.path.join(FRONTEND_DIST, filename)
    if os.path.isfile(filepath):
        return send_from_directory(FRONTEND_DIST, filename)
    return '', 404


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
        
        # Faculty selection (sciences, engineering, arts, business) - optional
        faculty = (request.form.get('faculty') or '').strip().lower()
        if faculty and faculty not in ('sciences', 'engineering', 'arts', 'business'):
            faculty = None
        
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
            
            # Analyze resume (with optional faculty for degree-based rating)
            analyzer = ResumeAnalyzer()
            issues = analyzer.analyze(resume_text, faculty=faculty)
            faculty_adjustment = analyzer.get_faculty_score_adjustment(resume_text, faculty)
            
            # Generate feedback
            generator = FeedbackGenerator()
            report = generator.generate_report(issues, resume_text)
            
            # Prepare response data
            word_count = len(resume_text.split())
            char_count = len(resume_text)
            
            critical_issues = [i for i in issues if i.severity == 'critical']
            warning_issues = [i for i in issues if i.severity == 'warning']
            suggestion_issues = [i for i in issues if i.severity == 'suggestion']
            
            # Calculate score (base minus issues, then faculty adjustment for degree field)
            base_score = 100
            for issue in issues:
                if issue.severity == 'critical':
                    base_score -= 10
                elif issue.severity == 'warning':
                    base_score -= 5
                elif issue.severity == 'suggestion':
                    base_score -= 2
            score = max(0, min(100, base_score + faculty_adjustment))
            
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
                'faculty': faculty or None,
                'statistics': {
                    'word_count': word_count,
                    'char_count': char_count,
                    'score': score,
                    'faculty_adjustment': faculty_adjustment
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
