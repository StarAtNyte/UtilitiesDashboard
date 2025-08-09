class TextTools {
    constructor() {
        this.inputText = document.getElementById('input-text');
        this.outputText = document.getElementById('output-text');
        this.clearInputBtn = document.getElementById('clear-input-btn');
        this.clearOutputBtn = document.getElementById('clear-output-btn');
        this.copyOutputBtn = document.getElementById('copy-output-btn');
        this.sampleTextBtn = document.getElementById('sample-text-btn');
        this.wordCountEl = document.getElementById('word-count');
        this.characterCountEl = document.getElementById('character-count');
        this.lineCountEl = document.getElementById('line-count');
        this.paragraphCountEl = document.getElementById('paragraph-count');
        
        this.initEventListeners();
        this.updateStats();
    }
    
    initEventListeners() {
        // Text input events
        this.inputText.addEventListener('input', () => this.updateStats());
        
        // Button events
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
        this.copyOutputBtn.addEventListener('click', () => this.copyOutput());
        this.sampleTextBtn.addEventListener('click', () => this.loadSampleText());
        
        // Tool buttons
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.processText(action);
            });
        });
    }
    
    processText(action) {
        const input = this.inputText.value;
        
        if (!input) {
            this.outputText.value = 'Please enter some text first';
            this.updateStats();
            return;
        }
        
        let output = '';
        
        switch (action) {
            case 'uppercase':
                output = input.toUpperCase();
                break;
            case 'lowercase':
                output = input.toLowerCase();
                break;
            case 'titlecase':
                output = this.toTitleCase(input);
                break;
            case 'sentencecase':
                output = this.toSentenceCase(input);
                break;
            case 'remove-extra-spaces':
                output = input.replace(/\s+/g, ' ').trim();
                break;
            case 'remove-line-breaks':
                output = input.replace(/\n/g, ' ');
                break;
            case 'add-line-breaks':
                output = input.replace(/([.!?])\s+/g, '$1\n');
                break;
            case 'reverse-text':
                output = input.split('').reverse().join('');
                break;
            case 'word-count':
                this.showWordCount(input);
                return;
            case 'character-count':
                this.showCharacterCount(input);
                return;
            case 'sort-lines':
                output = this.sortLines(input);
                break;
            case 'remove-duplicates':
                output = this.removeDuplicateLines(input);
                break;
            case 'reverse-words':
                output = this.reverseWords(input);
                break;
            case 'shuffle-words':
                output = this.shuffleWords(input);
                break;
            case 'camelcase':
                output = this.toCamelCase(input);
                break;
            case 'snakecase':
                output = this.toSnakeCase(input);
                break;
            default:
                output = input;
        }
        
        this.outputText.value = output;
        this.updateStats();
    }
    
    toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
    
    toSentenceCase(str) {
        return str.replace(
            /(^\s*\w|[.!?]\s+\w)/g,
            txt => txt.toUpperCase()
        );
    }
    
    sortLines(str) {
        return str.split('\n').sort().join('\n');
    }
    
    removeDuplicateLines(str) {
        const lines = str.split('\n');
        const uniqueLines = [...new Set(lines)];
        return uniqueLines.join('\n');
    }
    
    reverseWords(str) {
        return str.split(' ').reverse().join(' ');
    }
    
    shuffleWords(str) {
        const words = str.split(' ');
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        return words.join(' ');
    }
    
    toCamelCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }
    
    toSnakeCase(str) {
        return str
            .replace(/\s+/g, '_')
            .toLowerCase();
    }
    
    showWordCount(str) {
        const words = str.trim().split(/\s+/).filter(word => word.length > 0);
        const count = words.length;
        this.outputText.value = `Word count: ${count}\n\nWords: ${words.join(', ')}`;
    }
    
    showCharacterCount(str) {
        const charCount = str.length;
        const noSpacesCount = str.replace(/\s/g, '').length;
        this.outputText.value = `Character count (with spaces): ${charCount}\nCharacter count (without spaces): ${noSpacesCount}`;
    }
    
    clearInput() {
        this.inputText.value = '';
        this.updateStats();
    }
    
    clearOutput() {
        this.outputText.value = '';
    }
    
    copyOutput() {
        const output = this.outputText.value;
        
        if (!output) {
            return;
        }
        
        navigator.clipboard.writeText(output)
            .then(() => {
                this.showButtonSuccess(this.copyOutputBtn, 'Copied!');
            })
            .catch(() => {
                alert('Failed to copy text');
            });
    }
    
    loadSampleText() {
        const sample = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;
        
        this.inputText.value = sample;
        this.updateStats();
    }
    
    updateStats() {
        const text = this.inputText.value;
        
        // Word count
        const words = text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
        this.wordCountEl.textContent = words;
        
        // Character count
        this.characterCountEl.textContent = text.length;
        
        // Line count
        const lines = text ? text.split('\n').length : 0;
        this.lineCountEl.textContent = lines;
        
        // Paragraph count
        const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
        this.paragraphCountEl.textContent = paragraphs;
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

// Initialize the text tools when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TextTools();
});