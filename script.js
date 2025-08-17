class UtilitiesDashboard {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay');
        this.navItems = document.querySelectorAll('.nav-item');
        this.contentSections = document.querySelectorAll('.content-section');
        
        this.initEventListeners();
        this.initCardAnimations();
        this.initNavigation();
    }
    
    initEventListeners() {
        // Mobile sidebar toggle
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }
        
        // Sidebar overlay click to close
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileSidebar();
            }
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!e.target.closest('.sidebar') && 
                    !e.target.closest('.sidebar-toggle') && 
                    this.sidebar?.classList.contains('open')) {
                    this.closeMobileSidebar();
                }
            }
        });
    }
    
    initNavigation() {
        // Add click event listeners to navigation items
        this.navItems.forEach(navItem => {
            navItem.addEventListener('click', (e) => {
                e.preventDefault();
                
                const sectionName = navItem.getAttribute('data-section');
                if (sectionName && !navItem.classList.contains('disabled')) {
                    this.switchSection(sectionName, navItem);
                    
                    // Close mobile sidebar after navigation
                    if (window.innerWidth <= 768) {
                        this.closeMobileSidebar();
                    }
                }
            });
        });
        
        // Add click listeners to dashboard cards for navigation
        const utilityCards = document.querySelectorAll('.utility-card[data-section]');
        utilityCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const sectionName = card.getAttribute('data-section');
                if (sectionName && !card.classList.contains('disabled')) {
                    this.switchSection(sectionName);
                    
                    // Update sidebar navigation state
                    const correspondingNavItem = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
                    if (correspondingNavItem) {
                        this.setActiveNavItem(correspondingNavItem);
                    }
                }
            });
        });
    }
    
    switchSection(sectionName, navItem = null) {
        // Hide all content sections
        this.contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Trigger animation for the section content
            this.animateSectionContent(targetSection);
        }
        
        // Update navigation state if navItem is provided
        if (navItem) {
            this.setActiveNavItem(navItem);
        }
        
        // Update page title
        this.updatePageTitle(sectionName);
    }
    
    setActiveNavItem(activeNavItem) {
        // Remove active class from all nav items
        this.navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to the clicked item
        activeNavItem.classList.add('active');
    }
    
    updatePageTitle(sectionName) {
        const titles = {
            'dashboard': 'Dashboard',
            'pdf-converter': 'PDF Converter',
            'json-formatter': 'JSON Formatter',
            'text-tools': 'Text Tools',
            'url-encoder': 'URL Encoder',
            'pinterest-downloader': 'Pinterest Downloader',
            'encoders': 'Encoders',
            'settings': 'Settings',
            'about': 'About'
        };
        
        const title = titles[sectionName] || 'Utilities Dashboard';
        document.title = title + ' - Utilities Dashboard';
    }
    
    animateSectionContent(section) {
        // Reset and trigger animation for section content
        const animatedElements = section.querySelectorAll('.page-header, .utilities-grid, .converter-container, .coming-soon-content, .settings-grid, .about-content');
        
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    toggleMobileSidebar() {
        if (this.sidebar?.classList.contains('open')) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }
    
    openMobileSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.add('open');
            
            // Create overlay if it doesn't exist
            if (!this.sidebarOverlay) {
                this.createSidebarOverlay();
            }
            
            if (this.sidebarOverlay) {
                this.sidebarOverlay.classList.add('active');
            }
            
            // Update toggle button state
            if (this.sidebarToggle) {
                this.sidebarToggle.setAttribute('aria-expanded', 'true');
            }
            
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeMobileSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('open');
            
            if (this.sidebarOverlay) {
                this.sidebarOverlay.classList.remove('active');
            }
            
            // Update toggle button state
            if (this.sidebarToggle) {
                this.sidebarToggle.setAttribute('aria-expanded', 'false');
            }
            
            // Restore body scrolling
            document.body.style.overflow = '';
        }
    }
    
    createSidebarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
        
        this.sidebarOverlay = overlay;
    }
    
    initCardAnimations() {
        // Add staggered animation to cards
        const cards = document.querySelectorAll('.utility-card');
        cards.forEach((card, index) => {
            // Set initial animation delay
            card.style.animationDelay = `${0.1 * index}s`;
            
            // Enhanced hover effects for active cards
            if (!card.classList.contains('disabled')) {
                this.addCardInteractions(card);
            }
        });
        
        // Initialize intersection observer for scroll animations
        if ('IntersectionObserver' in window) {
            this.initScrollAnimations();
        }
    }
    
    addCardInteractions(card) {
        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('disabled')) {
                card.style.filter = 'brightness(1.05)';
                
                // Add subtle vibration effect for touch devices
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.filter = 'brightness(1)';
        });
        
        // Click ripple effect
        card.addEventListener('click', (e) => {
            if (!card.classList.contains('disabled')) {
                this.createClickRipple(e, card);
            }
        });
    }
    
    createClickRipple(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(249, 115, 22, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 2;
        `;
        
        // Add ripple animation if not already present
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
        
        element.appendChild(ripple);
        
        // Remove ripple after animation
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
                    // Add visible class for additional styling
                    entry.target.classList.add('visible');
                    
                    // Staggered animation for cards in a group
                    if (entry.target.classList.contains('utility-card')) {
                        const cards = document.querySelectorAll('.utility-card');
                        const currentIndex = Array.from(cards).indexOf(entry.target);
                        
                        // Animate subsequent cards with delay
                        cards.forEach((card, index) => {
                            if (index >= currentIndex) {
                                setTimeout(() => {
                                    card.classList.add('visible');
                                }, (index - currentIndex) * 100);
                            }
                        });
                    }
                }
            });
        }, observerOptions);
        
        // Observe all animatable elements
        document.querySelectorAll('.utility-card, .page-header').forEach(el => {
            observer.observe(el);
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UtilitiesDashboard();
    
    // Add custom cursor effect for premium feel on desktop
    if (window.innerWidth > 768) {
        initCustomCursor();
    }
});

// Custom cursor effect for desktop
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div>';
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Animate cursor with smooth following
    function animateCursor() {
        const speed = 0.15;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Add cursor styles
    if (!document.querySelector('style[data-cursor]')) {
        const style = document.createElement('style');
        style.setAttribute('data-cursor', '');
        style.textContent = `
            .custom-cursor {
                position: fixed;
                top: -10px;
                left: -10px;
                width: 20px;
                height: 20px;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: difference;
            }
            
            .cursor-dot {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: #f97316;
                opacity: 0.8;
                transition: transform 0.15s ease;
            }
            
            .utility-card:hover ~ * .cursor-dot,
            .utility-card:hover .cursor-dot {
                transform: scale(2);
            }
        `;
        document.head.appendChild(style);
    }
}