# Resume Checker Engine

A Python-based resume analysis tool that evaluates resumes and provides actionable feedback to help improve them.

## Features

- **Multi-format Support**: Handles PDF, DOCX, and plain text resumes
- **Comprehensive Analysis**: Checks for formatting, content quality, keywords, and best practices
- **Actionable Feedback**: Provides specific, prioritized recommendations
- **Easy to Use**: Both web interface and CLI available
- **Modern Web UI**: Beautiful, responsive web application for easy resume analysis

## Installation

1. Make sure you have Python 3.7+ installed
2. Install dependencies:

```bash
pip install -r requirements.txt
```

Or if you encounter permission issues:

```bash
python -m pip install --user -r requirements.txt
```

## Usage

### Web Application (Recommended)

**Option A – New UI (beach theme, degree buttons) at localhost:5000**

1. Build the React frontend once (requires Node.js):
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
2. Start the backend:
   ```bash
   python app.py
   ```
3. Open **http://localhost:5000** – you’ll see the new UI. Upload a resume, pick a degree (Sciences / Engineering / Arts / Business), and click Analyze.

**Option B – Old UI (purple theme) at localhost:5000**

If you don’t build the frontend, the same command still works:
```bash
python app.py
```
Open **http://localhost:5000** – you’ll see the original HTML upload page.

### Command Line Interface

```bash
python main.py <resume_file_path>
```

Example:
```bash
python main.py resume.pdf
```

Save report to file:
```bash
python main.py resume.pdf -o report.txt
```

## How It Works

1. **Parsing**: Extracts text from resume files (PDF, DOCX, or TXT)
2. **Analysis**: Evaluates the resume across multiple dimensions:
   - Formatting and structure
   - Content completeness
   - Keyword optimization
   - Best practices
3. **Feedback**: Generates prioritized recommendations with specific fixes

## Project Structure

```
.
├── app.py                  # Flask web application
├── main.py                 # CLI entry point
├── resume_parser.py        # Handles file parsing
├── resume_analyzer.py      # Core analysis logic
├── feedback_generator.py   # Generates feedback reports
├── templates/
│   └── index.html         # Web UI template
├── static/
│   ├── style.css          # Web UI styles
│   └── script.js          # Web UI JavaScript
└── requirements.txt        # Python dependencies
```