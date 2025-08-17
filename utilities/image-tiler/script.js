class ImageTiler {
    constructor() {
        this.currentImage = null;
        this.currentMode = 'single';
        this.bulkImages = [];
        this.generatedTiles = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDragAndDrop();
    }

    bindEvents() {
        // Mode switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Single mode events
        document.getElementById('browse-btn').addEventListener('click', () => {
            document.getElementById('image-input').click();
        });

        document.getElementById('image-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleSingleImage(e.target.files[0]);
            }
        });

        // Bulk mode events
        document.getElementById('bulk-browse-btn').addEventListener('click', () => {
            document.getElementById('bulk-image-input').click();
        });

        document.getElementById('bulk-image-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleBulkImages(Array.from(e.target.files));
            }
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rows = e.target.dataset.rows;
                const cols = e.target.dataset.cols;
                document.getElementById('tile-rows').value = rows;
                document.getElementById('tile-cols').value = cols;
            });
        });

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            if (this.currentMode === 'single') {
                this.generateTiles();
            } else {
                this.generateBulkTiles();
            }
        });

        // Download buttons
        document.getElementById('download-all-btn').addEventListener('click', () => {
            this.downloadAllTiles();
        });

        document.getElementById('download-zip-btn').addEventListener('click', () => {
            this.downloadAsZip();
        });

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    setupDragAndDrop() {
        const uploadAreas = document.querySelectorAll('.upload-area');
        
        uploadAreas.forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });

            area.addEventListener('dragleave', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                
                const files = Array.from(e.dataTransfer.files).filter(file => 
                    file.type.startsWith('image/')
                );

                if (files.length > 0) {
                    if (area.id === 'upload-area') {
                        this.handleSingleImage(files[0]);
                    } else if (area.id === 'bulk-upload-area') {
                        this.handleBulkImages(files);
                    }
                }
            });
        });
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Update content sections
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.toggle('active', content.id === `${mode}-mode`);
        });

        // Reset state
        this.hideAllSections();
    }

    handleSingleImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        this.currentImage = file;
        this.showImagePreview(file);
        this.showProcessingArea();
    }

    handleBulkImages(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            alert('Please select valid image files.');
            return;
        }

        this.bulkImages = imageFiles;
        this.showBulkQueue();
    }

    showBulkQueue() {
        const queueContainer = document.getElementById('bulk-queue');
        const queueList = document.getElementById('queue-list');
        const queueCount = document.getElementById('queue-count');

        queueContainer.style.display = 'block';
        queueCount.textContent = this.bulkImages.length;
        queueList.innerHTML = '';

        this.bulkImages.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);

            const info = document.createElement('div');
            info.className = 'queue-item-info';
            info.innerHTML = `
                <div class="queue-item-name">${file.name}</div>
                <div class="queue-item-size">${this.formatFileSize(file.size)}</div>
            `;

            item.appendChild(img);
            item.appendChild(info);
            queueList.appendChild(item);
        });

        this.showProcessingArea();
    }

    showImagePreview(file) {
        const previewImg = document.getElementById('preview-image');
        const imageInfo = document.getElementById('image-info');

        previewImg.src = URL.createObjectURL(file);
        previewImg.onload = () => {
            const img = previewImg;
            imageInfo.innerHTML = `
                <strong>File:</strong> ${file.name}<br>
                <strong>Size:</strong> ${this.formatFileSize(file.size)}<br>
                <strong>Dimensions:</strong> ${img.naturalWidth} × ${img.naturalHeight}px<br>
                <strong>Type:</strong> ${file.type}
            `;
            URL.revokeObjectURL(img.src);
        };
    }

    showProcessingArea() {
        document.getElementById('processing-area').style.display = 'block';
    }

    async generateTiles() {
        if (!this.currentImage) return;

        this.showProgress();
        
        try {
            const rows = parseInt(document.getElementById('tile-rows').value);
            const cols = parseInt(document.getElementById('tile-cols').value);
            const overlap = parseInt(document.getElementById('overlap').value);
            const format = document.getElementById('output-format').value;

            const tiles = await this.createTiles(this.currentImage, rows, cols, overlap, format);
            this.generatedTiles = tiles;
            this.showResults();
        } catch (error) {
            console.error('Error generating tiles:', error);
            alert('Error generating tiles. Please try again.');
        } finally {
            this.hideProgress();
        }
    }

    async generateBulkTiles() {
        if (this.bulkImages.length === 0) return;

        this.showProgress();
        this.generatedTiles = [];

        try {
            const rows = parseInt(document.getElementById('tile-rows').value);
            const cols = parseInt(document.getElementById('tile-cols').value);
            const overlap = parseInt(document.getElementById('overlap').value);
            const format = document.getElementById('output-format').value;

            for (let i = 0; i < this.bulkImages.length; i++) {
                const file = this.bulkImages[i];
                const progress = ((i + 1) / this.bulkImages.length) * 100;
                
                this.updateProgress(progress, `Processing ${file.name}... (${i + 1}/${this.bulkImages.length})`);

                const tiles = await this.createTiles(file, rows, cols, overlap, format, file.name.split('.')[0]);
                this.generatedTiles.push(...tiles);
            }

            this.showResults();
        } catch (error) {
            console.error('Error generating bulk tiles:', error);
            alert('Error generating tiles. Please try again.');
        } finally {
            this.hideProgress();
        }
    }

    async createTiles(file, rows, cols, overlap, format, prefix = 'tile') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const tileWidth = Math.floor(img.width / cols);
                    const tileHeight = Math.floor(img.height / rows);
                    const tiles = [];

                    for (let row = 0; row < rows; row++) {
                        for (let col = 0; col < cols; col++) {
                            const x = Math.max(0, col * tileWidth - overlap);
                            const y = Math.max(0, row * tileHeight - overlap);
                            const w = Math.min(tileWidth + overlap * 2, img.width - x);
                            const h = Math.min(tileHeight + overlap * 2, img.height - y);

                            canvas.width = w;
                            canvas.height = h;
                            
                            ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
                            
                            canvas.toBlob((blob) => {
                                const tileName = `${prefix}_${row + 1}_${col + 1}.${format}`;
                                tiles.push({
                                    name: tileName,
                                    blob: blob,
                                    url: URL.createObjectURL(blob),
                                    size: blob.size,
                                    dimensions: `${w} × ${h}px`
                                });

                                if (tiles.length === rows * cols) {
                                    resolve(tiles);
                                }
                            }, `image/${format}`, format === 'jpeg' ? 0.9 : undefined);
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    showProgress() {
        document.getElementById('progress-section').style.display = 'block';
        document.getElementById('generate-btn').disabled = true;
        this.updateProgress(0, 'Generating tiles...');
    }

    updateProgress(percent, text) {
        document.getElementById('progress-fill').style.width = `${percent}%`;
        document.getElementById('progress-text').textContent = text;
    }

    hideProgress() {
        document.getElementById('progress-section').style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
    }

    showResults() {
        const resultsSection = document.getElementById('results-section');
        const tilesGrid = document.getElementById('tiles-grid');
        
        resultsSection.style.display = 'block';
        tilesGrid.innerHTML = '';

        this.generatedTiles.forEach((tile, index) => {
            const tileItem = document.createElement('div');
            tileItem.className = 'tile-item';
            tileItem.innerHTML = `
                <img src="${tile.url}" alt="${tile.name}" class="tile-image">
                <div class="tile-info">
                    <div class="tile-name">${tile.name}</div>
                    <div class="tile-size">${this.formatFileSize(tile.size)}</div>
                </div>
                <div class="tile-size">${tile.dimensions}</div>
                <button class="tile-download" data-index="${index}">Download</button>
            `;

            const downloadBtn = tileItem.querySelector('.tile-download');
            downloadBtn.addEventListener('click', () => this.downloadTile(index));

            tilesGrid.appendChild(tileItem);
        });
    }

    downloadTile(index) {
        const tile = this.generatedTiles[index];
        const link = document.createElement('a');
        link.href = tile.url;
        link.download = tile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadAllTiles() {
        this.generatedTiles.forEach((tile, index) => {
            setTimeout(() => this.downloadTile(index), index * 100);
        });
    }

    async downloadAsZip() {
        try {
            // Create a simple zip-like structure by downloading files with delay
            const link = document.createElement('a');
            
            for (let i = 0; i < this.generatedTiles.length; i++) {
                const tile = this.generatedTiles[i];
                link.href = tile.url;
                link.download = tile.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Small delay between downloads
                if (i < this.generatedTiles.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        } catch (error) {
            console.error('Error downloading files:', error);
            alert('Error downloading files. Please try downloading individual tiles.');
        }
    }

    hideAllSections() {
        document.getElementById('processing-area').style.display = 'none';
        document.getElementById('progress-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('bulk-queue').style.display = 'none';
    }

    restart() {
        // Reset all state
        this.currentImage = null;
        this.bulkImages = [];
        this.generatedTiles.forEach(tile => {
            if (tile.url) {
                URL.revokeObjectURL(tile.url);
            }
        });
        this.generatedTiles = [];

        // Reset form inputs
        document.getElementById('image-input').value = '';
        document.getElementById('bulk-image-input').value = '';
        document.getElementById('tile-rows').value = '2';
        document.getElementById('tile-cols').value = '2';
        document.getElementById('overlap').value = '0';
        document.getElementById('output-format').value = 'png';

        // Hide all sections
        this.hideAllSections();

        // Reset to single mode
        this.switchMode('single');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ImageTiler();
});