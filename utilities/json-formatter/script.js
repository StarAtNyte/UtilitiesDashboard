class JSONFormatter {
    constructor() {
        this.jsonInput = document.getElementById('json-input');
        this.jsonOutput = document.getElementById('json-output');
        this.formatBtn = document.getElementById('format-btn');
        this.validateBtn = document.getElementById('validate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.sampleBtn = document.getElementById('sample-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.indentSize = document.getElementById('indent-size');
        this.sortKeys = document.getElementById('sort-keys');
        this.statusText = document.getElementById('status-text');
        this.sizeText = document.getElementById('size-text');
        
        this.initEventListeners();
        this.updateSize();
    }
    
    initEventListeners() {
        this.formatBtn.addEventListener('click', () => this.formatJSON());
        this.validateBtn.addEventListener('click', () => this.validateJSON());
        this.clearBtn.addEventListener('click', () => this.clearJSON());
        this.sampleBtn.addEventListener('click', () => this.loadSampleJSON());
        this.copyBtn.addEventListener('click', () => this.copyJSON());
        this.downloadBtn.addEventListener('click', () => this.downloadJSON());
        this.jsonInput.addEventListener('input', () => this.updateSize());
        
        // Format on Ctrl+Enter
        this.jsonInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.formatJSON();
            }
        });
    }
    
    formatJSON() {
        const input = this.jsonInput.value.trim();
        
        if (!input) {
            this.updateStatus('Please enter some JSON data', 'error');
            return;
        }
        
        try {
            // Parse the JSON
            let parsed = JSON.parse(input);
            
            // Sort keys if requested
            if (this.sortKeys.checked) {
                parsed = this.sortObjectKeys(parsed);
            }
            
            // Format with selected indentation
            let indent = this.indentSize.value === 'tab' ? '\t' : parseInt(this.indentSize.value);
            const formatted = JSON.stringify(parsed, null, indent);
            
            // Display formatted JSON
            this.jsonOutput.textContent = formatted;
            
            // Update status
            this.updateStatus('JSON formatted successfully', 'success');
            this.updateSize();
        } catch (error) {
            this.updateStatus(`Invalid JSON: ${error.message}`, 'error');
            this.jsonOutput.textContent = '';
        }
    }
    
    validateJSON() {
        const input = this.jsonInput.value.trim();
        
        if (!input) {
            this.updateStatus('Please enter some JSON data', 'error');
            return;
        }
        
        try {
            JSON.parse(input);
            this.updateStatus('Valid JSON', 'success');
        } catch (error) {
            this.updateStatus(`Invalid JSON: ${error.message}`, 'error');
        }
    }
    
    clearJSON() {
        this.jsonInput.value = '';
        this.jsonOutput.textContent = '';
        this.updateStatus('Cleared', 'success');
        this.updateSize();
    }
    
    loadSampleJSON() {
        const sample = {
            "name": "John Doe",
            "age": 30,
            "isStudent": false,
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "zipcode": "10001"
            },
            "hobbies": ["reading", "swimming", "coding"],
            "contact": {
                "email": "john.doe@example.com",
                "phone": "+1-234-567-8900"
            },
            "education": [
                {
                    "degree": "Bachelor's",
                    "major": "Computer Science",
                    "year": 2015
                },
                {
                    "degree": "Master's",
                    "major": "Software Engineering",
                    "year": 2017
                }
            ]
        };
        
        this.jsonInput.value = JSON.stringify(sample, null, 4);
        this.updateStatus('Sample JSON loaded', 'success');
        this.updateSize();
    }
    
    copyJSON() {
        const output = this.jsonOutput.textContent;
        
        if (!output) {
            this.updateStatus('Nothing to copy', 'error');
            return;
        }
        
        navigator.clipboard.writeText(output)
            .then(() => {
                this.updateStatus('Copied to clipboard', 'success');
                this.showButtonSuccess(this.copyBtn, 'Copied!');
            })
            .catch(() => {
                this.updateStatus('Failed to copy', 'error');
            });
    }
    
    downloadJSON() {
        const output = this.jsonOutput.textContent;
        
        if (!output) {
            this.updateStatus('Nothing to download', 'error');
            return;
        }
        
        try {
            // Validate that output is valid JSON before downloading
            JSON.parse(output);
            
            const blob = new Blob([output], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'formatted.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.updateStatus('Downloaded', 'success');
            this.showButtonSuccess(this.downloadBtn, 'Downloaded!');
        } catch (error) {
            this.updateStatus('Invalid JSON for download', 'error');
        }
    }
    
    sortObjectKeys(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        }
        
        const sortedKeys = Object.keys(obj).sort();
        const sortedObj = {};
        
        sortedKeys.forEach(key => {
            sortedObj[key] = this.sortObjectKeys(obj[key]);
        });
        
        return sortedObj;
    }
    
    updateStatus(message, type = 'info') {
        this.statusText.textContent = message;
        this.statusText.className = 'status-value ' + type;
    }
    
    updateSize() {
        const input = this.jsonInput.value;
        const output = this.jsonOutput.textContent;
        
        const inputSize = new Blob([input]).size;
        const outputSize = new Blob([output]).size;
        
        this.sizeText.textContent = `${inputSize} bytes input, ${outputSize} bytes output`;
    }
    
    showButtonSuccess(button, text) {
        const originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> ${text}`;
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success');
        }, 2000);
    }
}

// Initialize the formatter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JSONFormatter();
});