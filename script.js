class UtilityDashboard {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.getElementById('close-modal');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Add staggered animation to cards
        document.querySelectorAll('.utility-card').forEach((card, index) => {
            card.style.animationDelay = `${0.1 * index}s`;
        });
        
        // Card click handlers with enhanced feedback
        document.querySelectorAll('.utility-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const utility = e.currentTarget.dataset.utility;
                this.addClickRipple(e);
                setTimeout(() => this.openUtility(utility), 200);
            });
            
            // Add hover sound effect simulation (visual feedback)
            card.addEventListener('mouseenter', () => {
                card.style.filter = 'brightness(1.05)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.filter = 'brightness(1)';
            });
        });
        
        // Modal close handlers
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
        
        // Add scroll-based animations
        this.initScrollAnimations();
    }
    
    addClickRipple(event) {
        const card = event.currentTarget;
        const ripple = document.createElement('div');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        if (!document.querySelector('style[data-ripple]')) {
            const style = document.createElement('style');
            style.setAttribute('data-ripple', '');
            style.textContent = `
                @keyframes ripple {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.utility-card').forEach(card => {
            observer.observe(card);
        });
    }
    
    openUtility(utility) {
        const utilities = {
            'pdf-to-markdown': {
                title: 'PDF to Markdown Converter',
                content: this.createPdfToMarkdownUI()
            },
            'text-formatter': {
                title: 'Text Formatter',
                content: this.createTextFormatterUI()
            },
            'json-formatter': {
                title: 'JSON Formatter',
                content: this.createJsonFormatterUI()
            },
            'url-encoder': {
                title: 'URL Encoder/Decoder',
                content: this.createUrlEncoderUI()
            },
            'base64': {
                title: 'Base64 Encoder/Decoder',
                content: this.createBase64UI()
            },
            'hash-generator': {
                title: 'Hash Generator',
                content: this.createHashGeneratorUI()
            }
        };
        
        const util = utilities[utility];
        if (util) {
            this.modalTitle.textContent = util.title;
            this.modalBody.innerHTML = util.content;
            
            // Enhanced modal opening animation
            this.modal.style.display = 'block';
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });
            
            document.body.style.overflow = 'hidden';
            
            // Initialize utility-specific functionality
            this.initUtilityHandlers(utility);
            
            // Add entrance animation to modal content
            this.animateModalContent();
        }
    }
    
    animateModalContent() {
        const elements = this.modalBody.querySelectorAll('.input-group, .btn');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.4s ease';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });
    }
    
    closeModal() {
        this.modal.classList.remove('show');
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    createPdfToMarkdownUI() {
        return `
            <div class="utility-content">
                <div class="input-group">
                    <label for="pdf-input">Upload PDF File</label>
                    <input type="file" id="pdf-input" accept=".pdf">
                </div>
                <button class="btn" id="convert-pdf">Convert to Markdown</button>
                <div class="input-group">
                    <label for="markdown-output">Markdown Output</label>
                    <div id="markdown-output" class="result-area">Upload a PDF file and click convert...</div>
                </div>
                <button class="btn" id="copy-markdown" style="display: none;">Copy to Clipboard</button>
            </div>
        `;
    }
    
    createTextFormatterUI() {
        return `
            <div class="utility-content">
                <div class="input-group">
                    <label for="text-input">Input Text</label>
                    <textarea id="text-input" placeholder="Enter your text here..."></textarea>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn" id="uppercase">UPPERCASE</button>
                    <button class="btn" id="lowercase">lowercase</button>
                    <button class="btn" id="capitalize">Capitalize</button>
                    <button class="btn" id="trim-spaces">Trim Spaces</button>
                    <button class="btn" id="remove-extra-spaces">Remove Extra Spaces</button>
                </div>
                <div class="input-group">
                    <label for="text-output">Formatted Text</label>
                    <div id="text-output" class="result-area">Formatted text will appear here...</div>
                </div>
            </div>
        `;
    }
    
    createJsonFormatterUI() {
        return `
            <div class="utility-content">
                <div class="input-group">
                    <label for="json-input">JSON Input</label>
                    <textarea id="json-input" placeholder="Paste your JSON here..."></textarea>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn" id="format-json">Format & Validate</button>
                    <button class="btn" id="minify-json">Minify</button>
                </div>
                <div class="input-group">
                    <label for="json-output">Formatted JSON</label>
                    <div id="json-output" class="result-area">Formatted JSON will appear here...</div>
                </div>
            </div>
        `;
    }
    
    createUrlEncoderUI() {
        return `
            <div class="utility-content">
                <div class="input-group">
                    <label for="url-input">URL Input</label>
                    <textarea id="url-input" placeholder="Enter URL or text to encode/decode..."></textarea>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn" id="encode-url">Encode</button>
                    <button class="btn" id="decode-url">Decode</button>
                </div>
                <div class="input-group">
                    <label for="url-output">Result</label>
                    <div id="url-output" class="result-area">Encoded/decoded result will appear here...</div>
                </div>
            </div>
        `;
    }
    
    createBase64UI() {
        return `
            <div class="utility-content">
                <div class="input-group">
                    <label for="base64-input">Text Input</label>
                    <textarea id="base64-input" placeholder="Enter text to encode/decode..."></textarea>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn" id="encode-base64">Encode</button>
                    <button class="btn" id="decode-base64">Decode</button>
                </div>
                <div class="input-group">
                    <label for="base64-output">Result</label>
                    <div id="base64-output" class="result-area">Encoded/decoded result will appear here...</div>
                </div>
            </div>
        `;
    }
    
    createHashGeneratorUI() {
        return `
            <div class="utility-content">
                <div class="input-group">
                    <label for="hash-input">Text Input</label>
                    <textarea id="hash-input" placeholder="Enter text to hash..."></textarea>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn" id="md5-hash">MD5</button>
                    <button class="btn" id="sha1-hash">SHA1</button>
                    <button class="btn" id="sha256-hash">SHA256</button>
                </div>
                <div class="input-group">
                    <label for="hash-output">Hash Result</label>
                    <div id="hash-output" class="result-area">Hash will appear here...</div>
                </div>
            </div>
        `;
    }
    
    initUtilityHandlers(utility) {
        switch (utility) {
            case 'pdf-to-markdown':
                this.initPdfToMarkdownHandlers();
                break;
            case 'text-formatter':
                this.initTextFormatterHandlers();
                break;
            case 'json-formatter':
                this.initJsonFormatterHandlers();
                break;
            case 'url-encoder':
                this.initUrlEncoderHandlers();
                break;
            case 'base64':
                this.initBase64Handlers();
                break;
            case 'hash-generator':
                this.initHashGeneratorHandlers();
                break;
        }
    }
    
    initPdfToMarkdownHandlers() {
        const convertBtn = document.getElementById('convert-pdf');
        const fileInput = document.getElementById('pdf-input');
        const output = document.getElementById('markdown-output');
        const copyBtn = document.getElementById('copy-markdown');
        
        convertBtn.addEventListener('click', () => {
            const file = fileInput.files[0];
            if (!file) {
                output.textContent = 'Please select a PDF file first.';
                return;
            }
            
            if (file.type !== 'application/pdf') {
                output.textContent = 'Please select a valid PDF file.';
                return;
            }
            
            output.textContent = 'PDF to Markdown conversion requires a backend service. This is a frontend-only demo.\n\nFor actual PDF conversion, you would need to:\n1. Use a PDF parsing library like PDF.js\n2. Extract text and formatting\n3. Convert to Markdown syntax\n\nExample output:\n# Document Title\n\n## Section 1\nThis would be the extracted text from your PDF...\n\n- List item 1\n- List item 2\n\n**Bold text** and *italic text* would be preserved.';
            copyBtn.style.display = 'block';
        });
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(output.textContent).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy to Clipboard';
                }, 2000);
            });
        });
    }
    
    initTextFormatterHandlers() {
        const input = document.getElementById('text-input');
        const output = document.getElementById('text-output');
        
        const formatText = (formatter) => {
            const text = input.value;
            if (!text) {
                output.textContent = 'Please enter some text first.';
                return;
            }
            
            let result;
            switch (formatter) {
                case 'uppercase':
                    result = text.toUpperCase();
                    break;
                case 'lowercase':
                    result = text.toLowerCase();
                    break;
                case 'capitalize':
                    result = text.replace(/\w\S*/g, (txt) => 
                        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    );
                    break;
                case 'trim-spaces':
                    result = text.trim();
                    break;
                case 'remove-extra-spaces':
                    result = text.replace(/\s+/g, ' ').trim();
                    break;
                default:
                    result = text;
            }
            
            output.textContent = result;
        };
        
        document.getElementById('uppercase').addEventListener('click', () => formatText('uppercase'));
        document.getElementById('lowercase').addEventListener('click', () => formatText('lowercase'));
        document.getElementById('capitalize').addEventListener('click', () => formatText('capitalize'));
        document.getElementById('trim-spaces').addEventListener('click', () => formatText('trim-spaces'));
        document.getElementById('remove-extra-spaces').addEventListener('click', () => formatText('remove-extra-spaces'));
    }
    
    initJsonFormatterHandlers() {
        const input = document.getElementById('json-input');
        const output = document.getElementById('json-output');
        
        document.getElementById('format-json').addEventListener('click', () => {
            try {
                const jsonObj = JSON.parse(input.value);
                output.textContent = JSON.stringify(jsonObj, null, 2);
            } catch (error) {
                output.textContent = `Invalid JSON: ${error.message}`;
            }
        });
        
        document.getElementById('minify-json').addEventListener('click', () => {
            try {
                const jsonObj = JSON.parse(input.value);
                output.textContent = JSON.stringify(jsonObj);
            } catch (error) {
                output.textContent = `Invalid JSON: ${error.message}`;
            }
        });
    }
    
    initUrlEncoderHandlers() {
        const input = document.getElementById('url-input');
        const output = document.getElementById('url-output');
        
        document.getElementById('encode-url').addEventListener('click', () => {
            const text = input.value;
            if (!text) {
                output.textContent = 'Please enter text to encode.';
                return;
            }
            
            try {
                output.textContent = encodeURIComponent(text);
            } catch (error) {
                output.textContent = `Encoding error: ${error.message}`;
            }
        });
        
        document.getElementById('decode-url').addEventListener('click', () => {
            const text = input.value;
            if (!text) {
                output.textContent = 'Please enter text to decode.';
                return;
            }
            
            try {
                output.textContent = decodeURIComponent(text);
            } catch (error) {
                output.textContent = `Decoding error: ${error.message}`;
            }
        });
    }
    
    initBase64Handlers() {
        const input = document.getElementById('base64-input');
        const output = document.getElementById('base64-output');
        
        document.getElementById('encode-base64').addEventListener('click', () => {
            const text = input.value;
            if (!text) {
                output.textContent = 'Please enter text to encode.';
                return;
            }
            
            try {
                output.textContent = btoa(text);
            } catch (error) {
                output.textContent = `Encoding error: ${error.message}`;
            }
        });
        
        document.getElementById('decode-base64').addEventListener('click', () => {
            const text = input.value;
            if (!text) {
                output.textContent = 'Please enter text to decode.';
                return;
            }
            
            try {
                output.textContent = atob(text);
            } catch (error) {
                output.textContent = `Decoding error: ${error.message}`;
            }
        });
    }
    
    initHashGeneratorHandlers() {
        const input = document.getElementById('hash-input');
        const output = document.getElementById('hash-output');
        
        const generateHash = async (algorithm) => {
            const text = input.value;
            if (!text) {
                output.textContent = 'Please enter text to hash.';
                return;
            }
            
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(text);
                
                let hashBuffer;
                if (algorithm === 'md5') {
                    // MD5 requires external library, showing placeholder
                    output.textContent = 'MD5 hashing requires an external library. This is a demo.';
                    return;
                } else {
                    const algoName = algorithm.toUpperCase().replace(/(\d+)/, '-$1');
                    hashBuffer = await crypto.subtle.digest(algoName, data);
                }
                
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                output.textContent = hashHex;
            } catch (error) {
                output.textContent = `Hashing error: ${error.message}`;
            }
        };
        
        document.getElementById('md5-hash').addEventListener('click', () => generateHash('md5'));
        document.getElementById('sha1-hash').addEventListener('click', () => generateHash('sha1'));
        document.getElementById('sha256-hash').addEventListener('click', () => generateHash('sha256'));
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new UtilityDashboard();
});