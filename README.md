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

1. Start the web server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Upload your resume file and get instant feedback!

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

## Deploy to the web

You can host the web app for free on [Render](https://render.com), [Railway](https://railway.app), or [PythonAnywhere](https://pythonanywhere.com). Push this repo to GitHub, then connect it to your chosen host—they run `pip install -r requirements.txt` and start the app. Users visit your URL and upload resumes in the browser; no install needed.
