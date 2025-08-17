class PinterestDownloader {
    constructor() {
        this.selectedImages = new Set();
        this.allImages = [];
        this.currentFilter = 'all';
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        const fetchBtn = document.getElementById('fetch-btn');
        const urlInput = document.getElementById('pinterest-url');
        const selectAllBtn = document.getElementById('select-all-btn');
        const downloadSelectedBtn = document.getElementById('download-selected-btn');
        const retryBtn = document.getElementById('retry-btn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        fetchBtn.addEventListener('click', () => this.fetchPinData());
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchPinData();
        });
        
        selectAllBtn.addEventListener('click', () => this.selectAllImages());
        downloadSelectedBtn.addEventListener('click', () => this.downloadSelectedImages());
        retryBtn.addEventListener('click', () => this.fetchPinData());
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterImages(btn.dataset.filter));
        });
    }
    
    async fetchPinData() {
        const url = document.getElementById('pinterest-url').value.trim();
        
        if (!url) {
            this.showError('Please enter a Pinterest URL');
            return;
        }
        
        if (!this.isValidPinterestUrl(url)) {
            this.showError('Please enter a valid Pinterest pin URL');
            return;
        }
        
        this.showProgress('Fetching pin data...');
        
        try {
            // Extract pin ID from URL
            const pinId = this.extractPinId(url);
            
            // Try multiple CORS proxies for better reliability
            const corsProxies = [
                'https://api.allorigins.win/raw?url=',
                'https://cors-anywhere.herokuapp.com/',
                'https://thingproxy.freeboard.io/fetch/'
            ];
            
            let response;
            let lastError;
            
            this.updateProgress(20, 'Fetching Pinterest page...');
            
            for (const proxy of corsProxies) {
                try {
                    const targetUrl = proxy.includes('allorigins') ? encodeURIComponent(url) : url;
                    response = await fetch(proxy + targetUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    
                    if (response.ok) {
                        break;
                    }
                } catch (error) {
                    lastError = error;
                    console.warn(`CORS proxy ${proxy} failed:`, error);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(lastError?.message || 'All CORS proxies failed. Pinterest may be blocking requests.');
            }
            
            const html = await response.text();
            
            this.updateProgress(50, 'Parsing page data...');
            
            // Extract images from the HTML
            const images = await this.extractImagesFromHtml(html, pinId);
            
            this.updateProgress(80, 'Processing images...');
            
            if (images.length === 0) {
                throw new Error('No images found on this Pinterest pin');
            }
            
            this.updateProgress(100, 'Complete!');
            
            setTimeout(() => {
                this.displayResults(images);
            }, 500);
            
        } catch (error) {
            console.error('Error fetching pin data:', error);
            this.showError(error.message || 'Failed to fetch pin data. Please check the URL and try again.');
        }
    }
    
    updateProgress(progress, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressFill.style.width = progress + '%';
        progressText.textContent = text;
    }
    
    async extractImagesFromHtml(html, pinId) {
        const images = [];
        
        try {
            // Extract JSON data from Pinterest page - look for multiple patterns
            let data = null;
            
            // Debug: Log what we're looking for
            console.log('Looking for Pinterest data patterns...');
            
            // Check what data structures are available
            const hasReduxState = html.includes('initialReduxState');
            const hasPwsData = html.includes('__PWS_DATA__');
            const hasWindowPws = html.includes('window.__PWS_DATA__');
            
            console.log('Data structure availability:', {
                hasReduxState,
                hasPwsData,
                hasWindowPws
            });
            
            // Try different JSON extraction patterns with better parsing
            const extractors = [
                {
                    name: 'Redux Store',
                    extract: (html) => {
                        // Look for Redux initial state
                        const reduxMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
                        if (reduxMatch) return reduxMatch[1];
                        
                        // Alternative Redux pattern
                        const altReduxMatch = html.match(/"initialReduxState"\s*:\s*({.+?}),\s*"resourceDataCache"/);
                        if (altReduxMatch) return altReduxMatch[1];
                        
                        return null;
                    }
                },
                {
                    name: '__PWS_DATA__',
                    extract: (html) => {
                        const match = html.match(/"__PWS_DATA__"\s*:\s*({[^}]+(?:{[^}]*}[^}]*)*})/);
                        return match ? match[1] : null;
                    }
                },
                {
                    name: 'window.__PWS_DATA__',
                    extract: (html) => {
                        const match = html.match(/window\.__PWS_DATA__\s*=\s*({.+?});/);
                        return match ? match[1] : null;
                    }
                },
                {
                    name: 'script data extraction',
                    extract: (html) => {
                        // Find script tags with Pinterest data
                        const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
                        
                        for (const script of scripts) {
                            // Look for complete JSON objects, not fragments
                            const patterns = [
                                /window\.__PWS_DATA__\s*=\s*(\{[^<]*\});/,
                                /window\.__INITIAL_STATE__\s*=\s*(\{[^<]*\});/
                            ];
                            
                            for (const pattern of patterns) {
                                const match = script.match(pattern);
                                if (match) {
                                    // Validate it's complete JSON by checking brace balance
                                    const jsonStr = match[1];
                                    let braceCount = 0;
                                    let inString = false;
                                    let escaped = false;
                                    
                                    for (let i = 0; i < jsonStr.length; i++) {
                                        const char = jsonStr[i];
                                        if (escaped) {
                                            escaped = false;
                                            continue;
                                        }
                                        if (char === '\\') {
                                            escaped = true;
                                            continue;
                                        }
                                        if (char === '"') {
                                            inString = !inString;
                                            continue;
                                        }
                                        if (!inString) {
                                            if (char === '{') braceCount++;
                                            else if (char === '}') braceCount--;
                                        }
                                    }
                                    
                                    // Only return if braces are balanced
                                    if (braceCount === 0) {
                                        return jsonStr;
                                    }
                                }
                            }
                        }
                        return null;
                    }
                },
                {
                    name: 'Pinterest JSON-LD',
                    extract: (html) => {
                        // Look for JSON-LD structured data
                        const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
                        if (jsonLdMatch) {
                            try {
                                const jsonLd = JSON.parse(jsonLdMatch[1]);
                                if (jsonLd && (jsonLd.image || jsonLd.url)) {
                                    return JSON.stringify(jsonLd);
                                }
                            } catch (e) {
                                console.warn('JSON-LD parse failed:', e);
                            }
                        }
                        return null;
                    }
                }
            ];
            
            for (const extractor of extractors) {
                try {
                    const jsonStr = extractor.extract(html);
                    if (jsonStr) {
                        data = JSON.parse(jsonStr);
                        console.log(`Successfully parsed JSON using: ${extractor.name}`);
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to parse JSON with ${extractor.name}:`, e.message);
                }
            }
            
            if (data) {
                // Extract main pin image
                const pinData = this.findPinData(data, pinId);
                if (pinData && pinData.images) {
                    const mainImage = this.getMainImage(pinData);
                    if (mainImage) {
                        images.push({
                            id: `main_${pinId}`,
                            url: mainImage.url,
                            type: 'main',
                            width: mainImage.width || 400,
                            height: mainImage.height || 600,
                            title: pinData.title || 'Main Pin Image'
                        });
                    }
                }
                
                // Extract related/similar pins from specific sections
                const relatedPins = this.extractRelatedPins(data, pinId);
                const similarPins = this.extractSimilarPins(data, pinId);
                const recommendedPins = this.extractRecommendedPins(data, pinId);
                
                // Add similar pins
                similarPins.forEach((pin, index) => {
                    const image = this.getMainImage(pin);
                    if (image && image.url !== images[0]?.url) {
                        images.push({
                            id: `similar_${index}`,
                            url: image.url,
                            type: 'similar',
                            width: image.width || 400,
                            height: image.height || 600,
                            title: pin.title || `Similar Image ${index + 1}`
                        });
                    }
                });
                
                // Add recommended pins
                recommendedPins.forEach((pin, index) => {
                    const image = this.getMainImage(pin);
                    if (image && !images.some(img => img.url === image.url)) {
                        images.push({
                            id: `recommended_${index}`,
                            url: image.url,
                            type: 'recommended',
                            width: image.width || 400,
                            height: image.height || 600,
                            title: pin.title || `Recommended Image ${index + 1}`
                        });
                    }
                });
                
                // Fallback: extract from related pins array
                relatedPins.forEach((pin, index) => {
                    const image = this.getMainImage(pin);
                    if (image && !images.some(img => img.url === image.url)) {
                        images.push({
                            id: `related_${index}`,
                            url: image.url,
                            type: index % 2 === 0 ? 'similar' : 'recommended',
                            width: image.width || 400,
                            height: image.height || 600,
                            title: pin.title || `Related Image ${index + 1}`
                        });
                    }
                });
            }
            
            // Additional extraction methods if main data extraction didn't work well
            if (images.length <= 1) {
                console.log('Using enhanced fallback extraction...');
                console.log('Current images found:', images.length);
                
                // Try to extract all Pinterest images from the page directly
                const directImages = this.extractDirectImages(html, pinId);
                directImages.forEach(img => {
                    if (!images.some(existing => existing.url === img.url)) {
                        images.push(img);
                    }
                });
                
                // Try to extract from script tags with JSON data
                const scriptTags = html.match(/<script[^>]*>([^<]*__PWS_DATA__[^<]*)<\/script>/g);
                if (scriptTags) {
                    for (const script of scriptTags) {
                        try {
                            const scriptContent = script.replace(/<\/?script[^>]*>/g, '');
                            const dataMatch = scriptContent.match(/window\.__PWS_DATA__\s*=\s*(.+);/);
                            if (dataMatch) {
                                const scriptData = JSON.parse(dataMatch[1]);
                                const scriptImages = this.extractImagesFromData(scriptData, pinId);
                                scriptImages.forEach(img => {
                                    if (!images.some(existing => existing.url === img.url)) {
                                        images.push(img);
                                    }
                                });
                            }
                        } catch (error) {
                            console.warn('Script tag parsing failed:', error);
                        }
                    }
                }
                
                // Look for Pinterest API calls in the HTML
                const apiUrls = this.extractApiUrls(html);
                for (const apiUrl of apiUrls) {
                    try {
                        const apiImages = await this.fetchFromPinterestApi(apiUrl);
                        apiImages.forEach(img => {
                            if (!images.some(existing => existing.url === img.url)) {
                                images.push(img);
                            }
                        });
                    } catch (error) {
                        console.warn('API call failed:', error);
                    }
                }
                
                // Extract images from HTML img tags as final fallback
                const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
                let match;
                let imgIndex = 0;
                
                while ((match = imgRegex.exec(html)) && imgIndex < 20) {
                    const imgUrl = match[1];
                    
                    // Filter for Pinterest image URLs
                    if (imgUrl.includes('pinimg.com') || imgUrl.includes('i.pinimg.com')) {
                        // Get higher resolution version
                        const highResUrl = this.getHigherResolution(imgUrl);
                        
                        if (!images.some(img => img.url === highResUrl)) {
                            images.push({
                                id: `img_${imgIndex}`,
                                url: highResUrl,
                                type: imgIndex === 0 ? 'main' : (imgIndex % 2 === 0 ? 'similar' : 'recommended'),
                                width: 400,
                                height: 600,
                                title: `Pinterest Image ${imgIndex + 1}`
                            });
                            
                            imgIndex++;
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error parsing Pinterest data:', error);
            
            // Final fallback: Extract any images from the page
            const imgRegex = /<img[^>]+src="([^"]*pinterest[^"]*)"[^>]*>/g;
            let match;
            let imgIndex = 0;
            
            while ((match = imgRegex.exec(html)) && imgIndex < 10) {
                const imgUrl = match[1];
                
                if (imgUrl && !imgUrl.includes('logo') && !imgUrl.includes('icon')) {
                    images.push({
                        id: `fallback_${imgIndex}`,
                        url: imgUrl,
                        type: imgIndex % 2 === 0 ? 'similar' : 'recommended',
                        width: 400,
                        height: 600,
                        title: `Image ${imgIndex + 1}`
                    });
                    
                    imgIndex++;
                }
            }
        }
        
        return images.filter(img => img.url && img.url.startsWith('http'));
    }
    
    findPinData(data, pinId) {
        // Recursively search for pin data by ID
        const search = (obj) => {
            if (typeof obj !== 'object' || obj === null) return null;
            
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    const result = search(item);
                    if (result) return result;
                }
                return null;
            }
            
            if (obj.id === pinId || obj.pin_id === pinId) {
                return obj;
            }
            
            for (const key in obj) {
                const result = search(obj[key]);
                if (result) return result;
            }
            
            return null;
        };
        
        return search(data);
    }
    
    extractRelatedPins(data, currentPinId) {
        const relatedPins = [];
        
        // Look for related pins in various data structures
        const search = (obj, depth = 0) => {
            if (depth > 5 || typeof obj !== 'object' || obj === null) return;
            
            if (Array.isArray(obj)) {
                obj.forEach(item => search(item, depth + 1));
                return;
            }
            
            // Check if this object looks like a pin and is not the current pin
            if (obj.images && (obj.id || obj.pin_id) && (obj.id !== currentPinId && obj.pin_id !== currentPinId)) {
                relatedPins.push(obj);
            }
            
            // Continue searching in nested objects
            for (const key in obj) {
                if (key.includes('related') || key.includes('similar') || key.includes('more') || key.includes('pins')) {
                    search(obj[key], depth + 1);
                }
            }
        };
        
        search(data);
        
        // Remove duplicates and limit results
        const uniquePins = relatedPins.filter((pin, index, self) => 
            index === self.findIndex(p => (p.id || p.pin_id) === (pin.id || pin.pin_id))
        ).slice(0, 20);
        
        return uniquePins;
    }
    
    extractSimilarPins(data, currentPinId) {
        const similarPins = [];
        
        // Look specifically for similar pins in Pinterest's data structure
        const searchSimilar = (obj, depth = 0) => {
            if (depth > 6 || typeof obj !== 'object' || obj === null) return;
            
            if (Array.isArray(obj)) {
                obj.forEach(item => searchSimilar(item, depth + 1));
                return;
            }
            
            // Look for similar pins sections
            for (const key in obj) {
                if (typeof key === 'string') {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('similar') || lowerKey.includes('closeup') || 
                        lowerKey.includes('visual') || lowerKey.includes('lookalike')) {
                        
                        if (Array.isArray(obj[key])) {
                            obj[key].forEach(pin => {
                                if (pin && pin.images && (pin.id || pin.pin_id) && 
                                    (pin.id !== currentPinId && pin.pin_id !== currentPinId)) {
                                    similarPins.push(pin);
                                }
                            });
                        }
                    } else {
                        searchSimilar(obj[key], depth + 1);
                    }
                }
            }
        };
        
        searchSimilar(data);
        
        // Remove duplicates and limit results
        return similarPins.filter((pin, index, self) => 
            index === self.findIndex(p => (p.id || p.pin_id) === (pin.id || pin.pin_id))
        ).slice(0, 15);
    }
    
    extractRecommendedPins(data, currentPinId) {
        const recommendedPins = [];
        
        // Look specifically for recommended pins in Pinterest's data structure
        const searchRecommended = (obj, depth = 0) => {
            if (depth > 6 || typeof obj !== 'object' || obj === null) return;
            
            if (Array.isArray(obj)) {
                obj.forEach(item => searchRecommended(item, depth + 1));
                return;
            }
            
            // Look for recommended pins sections
            for (const key in obj) {
                if (typeof key === 'string') {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('recommend') || lowerKey.includes('suggest') || 
                        lowerKey.includes('more') || lowerKey.includes('explore') ||
                        lowerKey.includes('discover') || lowerKey.includes('inspire')) {
                        
                        if (Array.isArray(obj[key])) {
                            obj[key].forEach(pin => {
                                if (pin && pin.images && (pin.id || pin.pin_id) && 
                                    (pin.id !== currentPinId && pin.pin_id !== currentPinId)) {
                                    recommendedPins.push(pin);
                                }
                            });
                        }
                    } else {
                        searchRecommended(obj[key], depth + 1);
                    }
                }
            }
        };
        
        searchRecommended(data);
        
        // Also look for pins in specific Pinterest sections
        this.extractFromPinterestSections(data, recommendedPins, currentPinId);
        
        // Remove duplicates and limit results
        return recommendedPins.filter((pin, index, self) => 
            index === self.findIndex(p => (p.id || p.pin_id) === (pin.id || pin.pin_id))
        ).slice(0, 15);
    }
    
    extractFromPinterestSections(data, pinsArray, currentPinId) {
        // Look for specific Pinterest API response structures
        const checkPinterestStructure = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            
            // Check for resource responses (common in Pinterest API)
            if (obj.resource_response && obj.resource_response.data) {
                const resourceData = obj.resource_response.data;
                
                if (Array.isArray(resourceData)) {
                    resourceData.forEach(item => {
                        if (item && item.images && (item.id || item.pin_id) && 
                            (item.id !== currentPinId && item.pin_id !== currentPinId)) {
                            pinsArray.push(item);
                        }
                    });
                }
            }
            
            // Check for tree structure (Pinterest's component tree)
            if (obj.tree && Array.isArray(obj.tree)) {
                obj.tree.forEach(branch => checkPinterestStructure(branch));
            }
            
            // Check for children components
            if (obj.children && Array.isArray(obj.children)) {
                obj.children.forEach(child => checkPinterestStructure(child));
            }
            
            // Check for props that might contain pin data
            if (obj.props && obj.props.initialPins) {
                if (Array.isArray(obj.props.initialPins)) {
                    obj.props.initialPins.forEach(pin => {
                        if (pin && pin.images && (pin.id || pin.pin_id) && 
                            (pin.id !== currentPinId && pin.pin_id !== currentPinId)) {
                            pinsArray.push(pin);
                        }
                    });
                }
            }
        };
        
        checkPinterestStructure(data);
    }
    
    getMainImage(pin) {
        if (!pin || !pin.images) return null;
        
        // Try to get the best quality image
        const imageKeys = ['orig', 'original', '736x', '564x', '474x', '236x'];
        
        for (const key of imageKeys) {
            if (pin.images[key]) {
                return {
                    url: pin.images[key].url,
                    width: pin.images[key].width,
                    height: pin.images[key].height
                };
            }
        }
        
        // Fallback to any available image
        const availableImages = Object.values(pin.images);
        if (availableImages.length > 0) {
            const image = availableImages[0];
            return {
                url: image.url,
                width: image.width,
                height: image.height
            };
        }
        
        return null;
    }
    
    extractApiUrls(html) {
        const apiUrls = [];
        
        // Look for Pinterest API endpoints in the HTML
        const apiPatterns = [
            /\/resource\/PinResourceProvider\/get\/\?source_url=[^"&]+/g,
            /\/resource\/RelatedPinFeedResource\/get\/\?source_url=[^"&]+/g,
            /\/resource\/VisualSearchPinResource\/get\/\?source_url=[^"&]+/g,
            /\/resource\/PinCloseupResource\/get\/\?source_url=[^"&]+/g,
            /\/resource\/BoardFeedResource\/get\/\?source_url=[^"&]+/g
        ];
        
        apiPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const fullUrl = 'https://www.pinterest.com' + match[0];
                if (!apiUrls.includes(fullUrl)) {
                    apiUrls.push(fullUrl);
                }
            }
        });
        
        // Also look for data-test-id links that might contain related pins
        const testIdRegex = /data-test-id="[^"]*pin[^"]*"[^>]*href="([^"]+)"/g;
        let match;
        while ((match = testIdRegex.exec(html)) !== null) {
            if (match[1].includes('/pin/') && !apiUrls.includes(match[1])) {
                apiUrls.push('https://www.pinterest.com' + match[1]);
            }
        }
        
        return apiUrls.slice(0, 10); // Limit to avoid too many requests
    }
    
    async fetchFromPinterestApi(apiUrl) {
        const images = [];
        
        try {
            // Use CORS proxy to fetch Pinterest API data
            const corsProxy = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(corsProxy + encodeURIComponent(apiUrl));
            
            if (response.ok) {
                const text = await response.text();
                
                // Try to parse as JSON
                try {
                    const data = JSON.parse(text);
                    
                    // Extract pins from API response
                    if (data.resource_response && data.resource_response.data) {
                        const pins = Array.isArray(data.resource_response.data) ? 
                            data.resource_response.data : [data.resource_response.data];
                        
                        pins.forEach((pin, index) => {
                            if (pin && pin.images) {
                                const image = this.getMainImage(pin);
                                if (image) {
                                    images.push({
                                        id: `api_${Date.now()}_${index}`,
                                        url: image.url,
                                        type: index % 2 === 0 ? 'similar' : 'recommended',
                                        width: image.width || 400,
                                        height: image.height || 600,
                                        title: pin.title || `API Image ${index + 1}`
                                    });
                                }
                            }
                        });
                    }
                } catch (jsonError) {
                    // If not JSON, try to extract images from HTML response
                    const imgRegex = /<img[^>]+src="([^"]*pinimg[^"]*)"[^>]*>/g;
                    let imgMatch;
                    let imgIndex = 0;
                    
                    while ((imgMatch = imgRegex.exec(text)) && imgIndex < 5) {
                        const imgUrl = this.getHigherResolution(imgMatch[1]);
                        
                        images.push({
                            id: `api_html_${Date.now()}_${imgIndex}`,
                            url: imgUrl,
                            type: imgIndex % 2 === 0 ? 'similar' : 'recommended',
                            width: 400,
                            height: 600,
                            title: `API HTML Image ${imgIndex + 1}`
                        });
                        
                        imgIndex++;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to fetch from Pinterest API:', error);
        }
        
        return images;
    }
    
    extractBalancedJSON(html, startPos) {
        // Extract JSON with balanced braces
        let braceCount = 0;
        let inString = false;
        let escaped = false;
        let start = -1;
        
        for (let i = startPos; i < html.length; i++) {
            const char = html[i];
            
            if (escaped) {
                escaped = false;
                continue;
            }
            
            if (char === '\\') {
                escaped = true;
                continue;
            }
            
            if (char === '"') {
                inString = !inString;
                continue;
            }
            
            if (inString) continue;
            
            if (char === '{') {
                if (start === -1) start = i;
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0 && start !== -1) {
                    return html.substring(start, i + 1);
                }
            }
        }
        
        return null;
    }
    
    extractDirectImages(html, currentPinId) {
        const images = [];
        console.log('Extracting images directly from HTML...');
        
        // Extract all Pinterest image URLs from the page
        const imagePatterns = [
            // Standard Pinterest image URLs
            /https?:\/\/i\.pinimg\.com\/[^"'\s)]+/g,
            // Alternative Pinterest CDN URLs
            /https?:\/\/[^"'\s)]*pinimg[^"'\s)]*/g,
            // Pinterest media URLs
            /https?:\/\/[^"'\s)]*pinterest[^"'\s)]*\.jpg/g,
            /https?:\/\/[^"'\s)]*pinterest[^"'\s)]*\.png/g,
            /https?:\/\/[^"'\s)]*pinterest[^"'\s)]*\.webp/g,
        ];
        
        const foundUrls = new Set();
        
        imagePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                let url = match[0];
                
                // Clean up the URL
                url = url.replace(/['")\]}>]+$/, '');
                
                // Skip very small images (likely icons or thumbnails)
                if (url.includes('30x30') || url.includes('17x17') || url.includes('24x24')) {
                    continue;
                }
                
                // Get higher resolution version
                url = this.getHigherResolution(url);
                
                if (url && !foundUrls.has(url)) {
                    foundUrls.add(url);
                }
            }
        });
        
        // Also look for images in specific Pinterest containers
        const imgTags = html.match(/<img[^>]+src="[^"]*pinimg[^"]*"[^>]*>/g) || [];
        imgTags.forEach(tag => {
            const srcMatch = tag.match(/src="([^"]+)"/);
            if (srcMatch) {
                let url = this.getHigherResolution(srcMatch[1]);
                if (!foundUrls.has(url)) {
                    foundUrls.add(url);
                }
            }
        });
        
        // Look for background-image styles
        const bgImageMatches = html.match(/background-image:\s*url\(['"]*([^'"]*pinimg[^'"]*)['"]*\)/g) || [];
        bgImageMatches.forEach(match => {
            const urlMatch = match.match(/url\(['"]*([^'"]*)['"]*\)/);
            if (urlMatch) {
                let url = this.getHigherResolution(urlMatch[1]);
                if (!foundUrls.has(url)) {
                    foundUrls.add(url);
                }
            }
        });
        
        console.log(`Found ${foundUrls.size} unique Pinterest image URLs`);
        
        // Convert to image objects
        let imageIndex = 0;
        const urlArray = Array.from(foundUrls);
        
        // Try to identify the main pin image (usually the largest or most prominent)
        const mainImageCandidates = urlArray.filter(url => 
            url.includes('736x') || url.includes('originals') || url.includes('1200x')
        );
        
        // Add main image
        if (mainImageCandidates.length > 0) {
            images.push({
                id: `main_${currentPinId}`,
                url: mainImageCandidates[0],
                type: 'main',
                width: 736,
                height: 736,
                title: 'Main Pinterest Image'
            });
            imageIndex++;
        }
        
        // Sort URLs by quality and relevance
        const sortedUrls = urlArray
            .filter(url => !images.some(img => img.url === url)) // Remove already added
            .sort((a, b) => {
                // Prioritize by resolution and quality indicators
                const aScore = this.getImageScore(a);
                const bScore = this.getImageScore(b);
                return bScore - aScore;
            });
        
        // Add images with alternating similar/recommended types
        sortedUrls.forEach((url, index) => {
            if (imageIndex < 25) { // Limit total images
                images.push({
                    id: `direct_${Date.now()}_${index}`,
                    url: url,
                    type: imageIndex % 2 === 0 ? 'similar' : 'recommended',
                    width: this.getImageDimension(url),
                    height: this.getImageDimension(url),
                    title: `Pinterest Image ${imageIndex + 1}`
                });
                imageIndex++;
            }
        });
        
        console.log(`Created ${images.length} image objects from direct extraction`);
        return images;
    }
    
    extractImagesFromData(data, currentPinId) {
        const images = [];
        
        // Extract main pin
        const pinData = this.findPinData(data, currentPinId);
        if (pinData && pinData.images) {
            const mainImage = this.getMainImage(pinData);
            if (mainImage) {
                images.push({
                    id: `main_${currentPinId}`,
                    url: mainImage.url,
                    type: 'main',
                    width: mainImage.width || 400,
                    height: mainImage.height || 600,
                    title: pinData.title || 'Main Pin Image'
                });
            }
        }
        
        // Extract related pins
        const relatedPins = this.extractRelatedPins(data, currentPinId);
        const similarPins = this.extractSimilarPins(data, currentPinId);
        const recommendedPins = this.extractRecommendedPins(data, currentPinId);
        
        // Add similar pins
        similarPins.forEach((pin, index) => {
            const image = this.getMainImage(pin);
            if (image && !images.some(img => img.url === image.url)) {
                images.push({
                    id: `similar_${Date.now()}_${index}`,
                    url: image.url,
                    type: 'similar',
                    width: image.width || 400,
                    height: image.height || 600,
                    title: pin.title || `Similar Image ${index + 1}`
                });
            }
        });
        
        // Add recommended pins
        recommendedPins.forEach((pin, index) => {
            const image = this.getMainImage(pin);
            if (image && !images.some(img => img.url === image.url)) {
                images.push({
                    id: `recommended_${Date.now()}_${index}`,
                    url: image.url,
                    type: 'recommended',
                    width: image.width || 400,
                    height: image.height || 600,
                    title: pin.title || `Recommended Image ${index + 1}`
                });
            }
        });
        
        // Add other related pins
        relatedPins.forEach((pin, index) => {
            const image = this.getMainImage(pin);
            if (image && !images.some(img => img.url === image.url)) {
                images.push({
                    id: `related_${Date.now()}_${index}`,
                    url: image.url,
                    type: index % 2 === 0 ? 'similar' : 'recommended',
                    width: image.width || 400,
                    height: image.height || 600,
                    title: pin.title || `Related Image ${index + 1}`
                });
            }
        });
        
        return images;
    }
    
    getImageScore(url) {
        let score = 0;
        
        // Higher score for higher resolution
        if (url.includes('736x')) score += 10;
        else if (url.includes('564x')) score += 8;
        else if (url.includes('474x')) score += 6;
        else if (url.includes('236x')) score += 4;
        
        // Higher score for originals
        if (url.includes('originals')) score += 15;
        
        // Higher score for common Pinterest image paths
        if (url.includes('/pin/')) score += 5;
        
        // Lower score for very small images
        if (url.includes('30x30') || url.includes('17x17')) score -= 10;
        
        // Higher score for JPEG/WebP (better quality)
        if (url.includes('.jpg') || url.includes('.jpeg')) score += 3;
        if (url.includes('.webp')) score += 2;
        
        return score;
    }
    
    getImageDimension(url) {
        if (url.includes('736x')) return 736;
        if (url.includes('564x')) return 564;
        if (url.includes('474x')) return 474;
        if (url.includes('236x')) return 236;
        if (url.includes('originals')) return 600; // Assume larger for originals
        return 400; // Default
    }
    
    getHigherResolution(imgUrl) {
        // Convert Pinterest image URLs to higher resolution
        return imgUrl
            .replace('236x', '736x')
            .replace('474x', '736x')
            .replace('564x', '736x')
            .replace('/236/', '/736/')
            .replace('/474/', '/736/')
            .replace('/564/', '/736/');
    }
    
    displayResults(images) {
        this.allImages = images;
        this.hideProgress();
        this.hideError();
        
        const resultsSection = document.getElementById('results-section');
        resultsSection.style.display = 'block';
        
        this.renderImages();
        this.updateImageCount();
    }
    
    renderImages() {
        const grid = document.getElementById('images-grid');
        const filteredImages = this.getFilteredImages();
        
        grid.innerHTML = '';
        
        filteredImages.forEach(image => {
            const imageCard = this.createImageCard(image);
            grid.appendChild(imageCard);
        });
    }
    
    createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.imageId = image.id;
        
        card.innerHTML = `
            <input type="checkbox" class="image-checkbox" data-image-id="${image.id}">
            <img src="${image.url}" alt="${image.title}" class="image-preview" loading="lazy">
            <div class="image-info">
                <div class="image-type" data-type="${image.type}">${image.type}</div>
                <div class="image-dimensions">${image.width} × ${image.height}</div>
            </div>
        `;
        
        const checkbox = card.querySelector('.image-checkbox');
        checkbox.addEventListener('change', (e) => {
            this.toggleImageSelection(image.id, e.target.checked);
        });
        
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
                this.toggleImageSelection(image.id, checkbox.checked);
            }
        });
        
        return card;
    }
    
    toggleImageSelection(imageId, selected) {
        const card = document.querySelector(`[data-image-id="${imageId}"]`);
        
        if (selected) {
            this.selectedImages.add(imageId);
            card.classList.add('selected');
        } else {
            this.selectedImages.delete(imageId);
            card.classList.remove('selected');
        }
        
        this.updateDownloadButton();
    }
    
    selectAllImages() {
        const filteredImages = this.getFilteredImages();
        const checkboxes = document.querySelectorAll('.image-checkbox');
        
        const allSelected = filteredImages.every(img => this.selectedImages.has(img.id));
        
        filteredImages.forEach(image => {
            if (allSelected) {
                this.selectedImages.delete(image.id);
            } else {
                this.selectedImages.add(image.id);
            }
        });
        
        checkboxes.forEach(checkbox => {
            const imageId = checkbox.dataset.imageId;
            const card = checkbox.closest('.image-card');
            
            if (allSelected) {
                checkbox.checked = false;
                card.classList.remove('selected');
            } else {
                checkbox.checked = true;
                card.classList.add('selected');
            }
        });
        
        this.updateDownloadButton();
    }
    
    async downloadSelectedImages() {
        if (this.selectedImages.size === 0) return;
        
        const downloadBtn = document.getElementById('download-selected-btn');
        const originalText = downloadBtn.textContent;
        
        try {
            downloadBtn.textContent = 'Preparing Download...';
            downloadBtn.disabled = true;
            
            // Create a zip file with all selected images
            await this.createZipDownload();
            
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading images. Please try again.');
        } finally {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }
    
    async createZipDownload() {
        // For demonstration, we'll download images individually
        // In a real implementation, you'd use a library like JSZip
        
        const selectedImageData = this.allImages.filter(img => this.selectedImages.has(img.id));
        
        for (const image of selectedImageData) {
            try {
                await this.downloadImage(image);
                await this.delay(500); // Prevent overwhelming the browser
            } catch (error) {
                console.error(`Failed to download image ${image.id}:`, error);
            }
        }
        
        alert(`Downloaded ${selectedImageData.length} images!`);
    }
    
    async downloadImage(image) {
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pinterest_${image.type}_${image.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            throw error;
        }
    }
    
    filterImages(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderImages();
        this.updateImageCount();
    }
    
    getFilteredImages() {
        if (this.currentFilter === 'all') {
            return this.allImages;
        }
        return this.allImages.filter(img => img.type === this.currentFilter);
    }
    
    updateImageCount() {
        const filteredImages = this.getFilteredImages();
        const countElement = document.getElementById('image-count');
        countElement.textContent = `${filteredImages.length} images found`;
    }
    
    updateDownloadButton() {
        const downloadBtn = document.getElementById('download-selected-btn');
        const selectedCount = this.selectedImages.size;
        
        downloadBtn.disabled = selectedCount === 0;
        downloadBtn.textContent = selectedCount > 0 
            ? `Download Selected (${selectedCount})` 
            : 'Download Selected';
    }
    
    showProgress(message) {
        document.getElementById('progress-section').style.display = 'block';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('error-section').style.display = 'none';
        
        document.getElementById('progress-text').textContent = message;
        document.getElementById('progress-fill').style.width = '0%';
        
        const fetchBtn = document.getElementById('fetch-btn');
        fetchBtn.disabled = true;
        document.body.classList.add('loading');
    }
    
    hideProgress() {
        document.getElementById('progress-section').style.display = 'none';
        
        const fetchBtn = document.getElementById('fetch-btn');
        fetchBtn.disabled = false;
        document.body.classList.remove('loading');
    }
    
    showError(message) {
        document.getElementById('error-section').style.display = 'block';
        document.getElementById('progress-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        
        document.getElementById('error-message').textContent = message;
        
        this.hideProgress();
    }
    
    hideError() {
        document.getElementById('error-section').style.display = 'none';
    }
    
    isValidPinterestUrl(url) {
        const pinterestRegex = /^https?:\/\/(www\.)?pinterest\.(com|co\.uk|ca|com\.au)\/pin\/[\w-]+\/?$/;
        return pinterestRegex.test(url);
    }
    
    extractPinId(url) {
        const match = url.match(/\/pin\/([\w-]+)/);
        return match ? match[1] : null;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the downloader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PinterestDownloader();
});

// Add some utility functions for enhanced functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'a':
                e.preventDefault();
                document.getElementById('select-all-btn')?.click();
                break;
            case 'Enter':
                e.preventDefault();
                document.getElementById('fetch-btn')?.click();
                break;
        }
    }
});