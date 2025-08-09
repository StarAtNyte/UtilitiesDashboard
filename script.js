class UtilitiesDashboard {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.menuToggle = document.getElementById('menu-toggle');
        this.headerNav = document.querySelector('.header-nav');
        
        this.initEventListeners();
        this.initCardAnimations();
    }
    
    initEventListeners() {
        // Theme toggle (placeholder for future functionality)
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!e.target.closest('.header-nav') && 
                    !e.target.closest('.menu-toggle') && 
                    this.headerNav?.classList.contains('open')) {
                    this.closeMobileMenu();
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleTheme() {
        // Placeholder for theme switching functionality
        // Could implement light/dark mode toggle here
        console.log('Theme toggle clicked - functionality to be implemented');
        
        // Example animation feedback
        this.themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    }
    
    toggleMobileMenu() {
        if (this.headerNav) {
            const isOpen = this.headerNav.classList.contains('open');
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }
    
    openMobileMenu() {
        if (this.headerNav) {
            this.headerNav.classList.add('open');
            this.menuToggle.setAttribute('aria-expanded', 'true');
        }
    }
    
    closeMobileMenu() {
        if (this.headerNav) {
            this.headerNav.classList.remove('open');
            this.menuToggle.setAttribute('aria-expanded', 'false');
        }
    }
    
    initCardAnimations() {
        // Add staggered animation to cards
        const cards = document.querySelectorAll('.utility-card');
        cards.forEach((card, index) => {
            // Set initial animation delay
            card.style.animationDelay = `${0.1 * index}s`;
            
            // Enhanced hover effects for active cards
            if (!card.classList.contains('coming-soon')) {
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
            card.style.filter = 'brightness(1.05)';
            
            // Add subtle vibration effect for touch devices
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.filter = 'brightness(1)';
        });
        
        // Click ripple effect
        card.addEventListener('click', (e) => {
            this.createClickRipple(e, card);
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
                    // Trigger animation
                    entry.target.style.animationPlayState = 'running';
                    
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
        document.querySelectorAll('.utility-card, .hero-section').forEach(el => {
            observer.observe(el);
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UtilitiesDashboard();
    
    // Add custom cursor effect for premium feel
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