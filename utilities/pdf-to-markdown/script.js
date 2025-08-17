class PDFToMarkdownConverter {
    constructor() {
        this.uploadArea = document.getElementById('upload-area');
        this.pdfInput = document.getElementById('pdf-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.conversionArea = document.getElementById('conversion-area');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.convertBtn = document.getElementById('convert-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.resultSection = document.getElementById('result-section');
        this.markdownOutput = document.getElementById('markdown-output');
        this.copyBtn = document.getElementById('copy-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.currentFile = null;
        this.markdownContent = '';
        
        this.initEventListeners();
        this.initPdfJs();
    }
    
    initPdfJs() {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }
    
    initEventListeners() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.pdfInput.click());
        this.browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.pdfInput.click();
        });
        
        this.pdfInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Conversion events
        this.convertBtn.addEventListener('click', () => this.convertPDF());
        
        // Result actions
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn.addEventListener('click', () => this.downloadMarkdown());
        
        // Restart button
        this.restartBtn.addEventListener('click', () => this.restart());
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        if (!this.uploadArea.contains(e.relatedTarget)) {
            this.uploadArea.classList.remove('dragover');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }
    
    handleFile(file) {
        if (file.type !== 'application/pdf') {
            this.showError('Please select a valid PDF file.');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showError('File size must be less than 50MB.');
            return;
        }
        
        this.currentFile = file;
        this.displayFileInfo(file);
        this.showConversionArea();
    }
    
    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showConversionArea() {
        this.uploadArea.style.display = 'none';
        this.conversionArea.style.display = 'block';
        this.conversionArea.style.animation = 'fadeInUp 0.5s ease-out';
    }
    
    async convertPDF() {
        if (!this.currentFile) return;
        
        this.showProgress();
        this.setConvertButtonLoading(true);
        
        try {
            this.updateProgress(10, 'Loading PDF...');
            
            const arrayBuffer = await this.readFileAsArrayBuffer(this.currentFile);
            this.updateProgress(20, 'Processing PDF...');
            
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const totalPages = pdf.numPages;
            
            let markdownContent = '';
            
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                this.updateProgress(20 + (pageNum / totalPages) * 70, `Processing page ${pageNum} of ${totalPages}...`);
                
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageMarkdown = this.convertTextToMarkdown(textContent, pageNum);
                markdownContent += pageMarkdown + '\n\n';
                
                // Small delay to allow UI updates
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            this.updateProgress(95, 'Finalizing...');
            this.markdownContent = this.cleanupMarkdown(markdownContent);
            
            this.updateProgress(100, 'Conversion complete!');
            this.showResult();
            
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Failed to convert PDF. Please try again with a different file.');
        } finally {
            this.setConvertButtonLoading(false);
            setTimeout(() => this.hideProgress(), 1000);
        }
    }
    
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }
    
    convertTextToMarkdown(textContent, pageNum) {
        let markdown = '';
        let currentLine = '';
        let lastY = null;
        let fontSize = null;
        let lastFontSize = null;
        
        // Add page break for pages after the first
        if (pageNum > 1) {
            markdown += `---\n\n# Page ${pageNum}\n\n`;
        }
        
        const items = textContent.items;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const text = item.str.trim();
            
            if (!text) continue;
            
            const y = Math.round(item.transform[5]);
            fontSize = item.height;
            
            // Detect line breaks
            if (lastY !== null && Math.abs(y - lastY) > fontSize * 0.3) {
                if (currentLine.trim()) {
                    markdown += this.formatLine(currentLine.trim(), lastFontSize) + '\n';
                    currentLine = '';
                }
            }
            
            // Add space between words if needed
            if (currentLine && !currentLine.endsWith(' ') && !text.startsWith(' ')) {
                currentLine += ' ';
            }
            
            currentLine += text;
            lastY = y;
            lastFontSize = fontSize;
        }
        
        // Add the last line
        if (currentLine.trim()) {
            markdown += this.formatLine(currentLine.trim(), lastFontSize) + '\n';
        }
        
        return markdown;
    }
    
    formatLine(line, fontSize) {
        // Simple heuristics for formatting
        if (fontSize > 16) {
            return `# ${line}`;
        } else if (fontSize > 14) {
            return `## ${line}`;
        } else if (fontSize > 12) {
            return `### ${line}`;
        }
        
        // Detect bullet points
        if (line.match(/^[\u2022\u25CF\u25E6\-\*]\s/)) {
            return `- ${line.substring(2)}`;
        }
        
        // Detect numbered lists
        if (line.match(/^\d+[\.\)]\s/)) {
            return line.replace(/^(\d+)[\.\)]\s/, '$1. ');
        }
        
        return line;
    }
    
    cleanupMarkdown(markdown) {
        return markdown
            // Remove excessive line breaks
            .replace(/\n{3,}/g, '\n\n')
            // Fix spacing around headers
            .replace(/^(#+\s)/gm, '\n$1')
            // Remove leading/trailing whitespace
            .trim();
    }
    
    showProgress() {
        this.progressBar.style.display = 'block';
        this.resultSection.style.display = 'none';
    }
    
    hideProgress() {
        this.progressBar.style.display = 'none';
    }
    
    updateProgress(percentage, text) {
        this.progressFill.style.width = percentage + '%';
        this.progressText.textContent = text;
    }
    
    setConvertButtonLoading(loading) {
        this.convertBtn.disabled = loading;
        if (loading) {
            this.convertBtn.classList.add('loading');
        } else {
            this.convertBtn.classList.remove('loading');
        }
    }
    
    showResult() {
        this.resultSection.style.display = 'block';
        this.markdownOutput.textContent = this.markdownContent;
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.markdownContent);
            this.showButtonSuccess(this.copyBtn, 'Copied!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError('Failed to copy to clipboard');
        }
    }
    
    downloadMarkdown() {
        const filename = this.currentFile.name.replace(/\.pdf$/i, '.md');
        const blob = new Blob([this.markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showButtonSuccess(this.downloadBtn, 'Downloaded!');
    }
    
    showButtonSuccess(button, text) {
        const originalText = button.textContent;
        button.textContent = text;
        button.classList.add('success');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
        }, 2000);
    }
    
    showError(message) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        
        // Add animation keyframes
        if (!document.querySelector('style[data-error-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-error-animation', '');
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    restart() {
        // Reset all state
        this.currentFile = null;
        this.markdownContent = '';
        
        // Reset form inputs
        this.pdfInput.value = '';
        
        // Reset UI to initial state
        this.uploadArea.style.display = 'block';
        this.conversionArea.style.display = 'none';
        this.progressBar.style.display = 'none';
        this.resultSection.style.display = 'none';
        
        // Remove any error notifications
        const errorDivs = document.querySelectorAll('[data-error-animation]');
        errorDivs.forEach(div => div.remove());
        
        // Reset button states
        this.setConvertButtonLoading(false);
        this.copyBtn.classList.remove('success');
        this.downloadBtn.classList.remove('success');
        
        // Reset progress
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '';
        
        // Clear output
        this.markdownOutput.textContent = '';
    }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PDFToMarkdownConverter();
});