// File input handling
document.getElementById('fileInput').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'No file selected';
    document.getElementById('fileName').textContent = fileName;
});

// Form submission
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a file first');
        return;
    }
    
    // Show loading, hide other sections
    showLoading();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }
        
        // Show results
        showResults(data);
        
    } catch (error) {
        showError(error.message);
    }
});

function showLoading() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
}

function showError(message) {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

function showResults(data) {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    // Update summary
    document.getElementById('scoreValue').textContent = data.statistics.score;
    document.getElementById('wordCount').textContent = data.statistics.word_count.toLocaleString();
    document.getElementById('criticalCount').textContent = data.summary.critical;
    document.getElementById('warningCount').textContent = data.summary.warnings;
    document.getElementById('suggestionCount').textContent = data.summary.suggestions;
    
    // Update score circle color
    const scoreCircle = document.getElementById('scoreCircle');
    const score = data.statistics.score;
    if (score >= 80) {
        scoreCircle.style.borderColor = 'rgba(107, 207, 127, 0.5)';
    } else if (score >= 60) {
        scoreCircle.style.borderColor = 'rgba(255, 217, 61, 0.5)';
    } else {
        scoreCircle.style.borderColor = 'rgba(255, 107, 107, 0.5)';
    }
    
    // Display issues by category
    displayIssuesByCategory(data.issues_by_category);
    
    // Display all issues
    displayAllIssues(data.issues);
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayIssuesByCategory(issuesByCategory) {
    const container = document.getElementById('issuesContainer');
    container.innerHTML = '';
    
    if (Object.keys(issuesByCategory).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No issues found! Your resume looks great! 🎉</p>';
        return;
    }
    
    for (const [category, issues] of Object.entries(issuesByCategory)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-group';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryDiv.appendChild(categoryTitle);
        
        issues.forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.className = `issue-item ${issue.severity}`;
            
            const header = document.createElement('div');
            header.className = 'issue-header';
            
            const badge = document.createElement('span');
            badge.className = `severity-badge ${issue.severity}`;
            badge.textContent = issue.severity;
            header.appendChild(badge);
            
            const message = document.createElement('div');
            message.className = 'issue-message';
            message.textContent = issue.message;
            header.appendChild(message);
            
            issueDiv.appendChild(header);
            
            const suggestion = document.createElement('div');
            suggestion.className = 'issue-suggestion';
            suggestion.textContent = `💡 ${issue.suggestion}`;
            issueDiv.appendChild(suggestion);
            
            categoryDiv.appendChild(issueDiv);
        });
        
        container.appendChild(categoryDiv);
    }
}

function displayAllIssues(issues) {
    const container = document.getElementById('allIssuesContainer');
    container.innerHTML = '';
    
    if (issues.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No issues found! Your resume looks great! 🎉</p>';
        return;
    }
    
    // Sort issues by severity (critical first)
    const severityOrder = { 'critical': 0, 'warning': 1, 'suggestion': 2 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    issues.forEach((issue, index) => {
        const issueDiv = document.createElement('div');
        issueDiv.className = `issue-item ${issue.severity}`;
        
        const header = document.createElement('div');
        header.className = 'issue-header';
        
        const badge = document.createElement('span');
        badge.className = `severity-badge ${issue.severity}`;
        badge.textContent = `${issue.severity} • ${issue.category}`;
        header.appendChild(badge);
        
        const message = document.createElement('div');
        message.className = 'issue-message';
        message.textContent = `${index + 1}. ${issue.message}`;
        header.appendChild(message);
        
        issueDiv.appendChild(header);
        
        const suggestion = document.createElement('div');
        suggestion.className = 'issue-suggestion';
        suggestion.textContent = `💡 ${issue.suggestion}`;
        issueDiv.appendChild(suggestion);
        
        container.appendChild(issueDiv);
    });
}

function resetForm() {
    document.getElementById('uploadForm').reset();
    document.getElementById('fileName').textContent = 'No file selected';
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
