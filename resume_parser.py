"""
Resume Parser - Extracts text from various resume formats
"""
import os
from typing import Optional


class ResumeParser:
    """Handles parsing of resumes from different file formats"""
    
    def __init__(self):
        self.supported_formats = ['.pdf', '.docx', '.doc', '.txt']
    
    def parse(self, file_path: str) -> Optional[str]:
        """
        Parse a resume file and extract text content
        
        Args:
            file_path: Path to the resume file
            
        Returns:
            Extracted text content or None if parsing fails
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Resume file not found: {file_path}")
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self._parse_pdf(file_path)
        elif file_ext in ['.docx', '.doc']:
            return self._parse_docx(file_path)
        elif file_ext == '.txt':
            return self._parse_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}. Supported formats: {self.supported_formats}")
    
    def _parse_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            import PyPDF2
            text_content = []
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text_content.append(page.extract_text())
            return '\n'.join(text_content)
        except ImportError:
            raise ImportError("PyPDF2 is required for PDF parsing. Install it with: pip install PyPDF2")
        except Exception as e:
            raise Exception(f"Error parsing PDF: {str(e)}")
    
    def _parse_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            from docx import Document
            doc = Document(file_path)
            text_content = []
            for paragraph in doc.paragraphs:
                text_content.append(paragraph.text)
            return '\n'.join(text_content)
        except ImportError:
            raise ImportError("python-docx is required for DOCX parsing. Install it with: pip install python-docx")
        except Exception as e:
            raise Exception(f"Error parsing DOCX: {str(e)}")
    
    def _parse_txt(self, file_path: str) -> str:
        """Extract text from plain text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            raise Exception(f"Error parsing TXT file: {str(e)}")
