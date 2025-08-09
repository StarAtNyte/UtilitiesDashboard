class URLEncoder {
    constructor() {
        // URL Encoder/Decoder elements
        this.urlInput = document.getElementById('url-input');
        this.urlOutput = document.getElementById('url-output');
        this.encodeUrlBtn = document.getElementById('encode-url-btn');
        this.decodeUrlBtn = document.getElementById('decode-url-btn');
        this.copyUrlBtn = document.getElementById('copy-url-btn');
        this.clearUrlBtn = document.getElementById('clear-url-btn');
        
        // Base64 Encoder/Decoder elements
        this.base64Input = document.getElementById('base64-input');
        this.base64Output = document.getElementById('base64-output');
        this.encodeBase64Btn = document.getElementById('encode-base64-btn');
        this.decodeBase64Btn = document.getElementById('decode-base64-btn');
        this.copyBase64Btn = document.getElementById('copy-base64-btn');
        this.clearBase64Btn = document.getElementById('clear-base64-btn');
        
        // URL Parser elements
        this.urlParserInput = document.getElementById('url-parser-input');
        this.parseUrlBtn = document.getElementById('parse-url-btn');
        this.parsedProtocol = document.getElementById('parsed-protocol');
        this.parsedHostname = document.getElementById('parsed-hostname');
        this.parsedPort = document.getElementById('parsed-port');
        this.parsedPath = document.getElementById('parsed-path');
        this.parsedQuery = document.getElementById('parsed-query');
        this.parsedFragment = document.getElementById('parsed-fragment');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // URL Encoder/Decoder events
        this.encodeUrlBtn.addEventListener('click', () => this.encodeURL());
        this.decodeUrlBtn.addEventListener('click', () => this.decodeURL());
        this.copyUrlBtn.addEventListener('click', () => this.copyToClipboard(this.urlOutput, this.copyUrlBtn));
        this.clearUrlBtn.addEventListener('click', () => this.clearFields(this.urlInput, this.urlOutput));
        
        // Base64 Encoder/Decoder events
        this.encodeBase64Btn.addEventListener('click', () => this.encodeBase64());
        this.decodeBase64Btn.addEventListener('click', () => this.decodeBase64());
        this.copyBase64Btn.addEventListener('click', () => this.copyToClipboard(this.base64Output, this.copyBase64Btn));
        this.clearBase64Btn.addEventListener('click', () => this.clearFields(this.base64Input, this.base64Output));
        
        // URL Parser events
        this.parseUrlBtn.addEventListener('click', () => this.parseURL());
    }
    
    encodeURL() {
        const input = this.urlInput.value.trim();
        
        if (!input) {
            this.urlOutput.value = 'Please enter text to encode';
            return;
        }
        
        try {
            const encoded = encodeURIComponent(input);
            this.urlOutput.value = encoded;
        } catch (error) {
            this.urlOutput.value = `Error: ${error.message}`;
        }
    }
    
    decodeURL() {
        const input = this.urlInput.value.trim();
        
        if (!input) {
            this.urlOutput.value = 'Please enter URL to decode';
            return;
        }
        
        try {
            const decoded = decodeURIComponent(input);
            this.urlOutput.value = decoded;
        } catch (error) {
            this.urlOutput.value = `Error: Invalid URL encoding`;
        }
    }
    
    encodeBase64() {
        const input = this.base64Input.value.trim();
        
        if (!input) {
            this.base64Output.value = 'Please enter text to encode';
            return;
        }
        
        try {
            const encoded = btoa(unescape(encodeURIComponent(input)));
            this.base64Output.value = encoded;
        } catch (error) {
            this.base64Output.value = `Error: ${error.message}`;
        }
    }
    
    decodeBase64() {
        const input = this.base64Input.value.trim();
        
        if (!input) {
            this.base64Output.value = 'Please enter Base64 to decode';
            return;
        }
        
        try {
            const decoded = decodeURIComponent(escape(atob(input)));
            this.base64Output.value = decoded;
        } catch (error) {
            this.base64Output.value = `Error: Invalid Base64 string`;
        }
    }
    
    parseURL() {
        const input = this.urlParserInput.value.trim();
        
        if (!input) {
            this.clearParsedURL();
            return;
        }
        
        try {
            const url = new URL(input);
            
            this.parsedProtocol.textContent = url.protocol;
            this.parsedHostname.textContent = url.hostname;
            this.parsedPort.textContent = url.port || '-';
            this.parsedPath.textContent = url.pathname;
            this.parsedQuery.textContent = url.search || '-';
            this.parsedFragment.textContent = url.hash || '-';
        } catch (error) {
            this.clearParsedURL();
            this.parsedProtocol.textContent = 'Invalid URL';
        }
    }
    
    clearParsedURL() {
        this.parsedProtocol.textContent = '-';
        this.parsedHostname.textContent = '-';
        this.parsedPort.textContent = '-';
        this.parsedPath.textContent = '-';
        this.parsedQuery.textContent = '-';
        this.parsedFragment.textContent = '-';
    }
    
    copyToClipboard(element, button) {
        const text = element.value;
        
        if (!text) {
            return;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => {
                this.showButtonSuccess(button, 'Copied!');
            })
            .catch(() => {
                alert('Failed to copy text');
            });
    }
    
    clearFields(input, output) {
        input.value = '';
        output.value = '';
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

// Initialize the encoder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new URLEncoder();
});