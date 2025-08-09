class UtilitiesDashboard {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
        this.navItems = document.querySelectorAll('.nav-item');
        this.contentSections = document.querySelectorAll('.content-section');
        
        this.currentSection = 'dashboard';
        this.sidebarOverlay = null;
        
        this.initEventListeners();
        this.createMobileSidebarOverlay();
        this.initCardAnimations();
    }
    
    initEventListeners() {
        // Navigation items
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Mobile sidebar toggle
        if (this.mobileSidebarToggle) {
            this.mobileSidebarToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }
        
        // Desktop sidebar toggle (if needed in future)
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Close mobile sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-sidebar-toggle')) {
                    this.closeMobileSidebar();
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileSidebar();
            }
        });
    }
    
    switchSection(sectionId) {
        // Update nav items
        this.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
        
        // Update content sections
        this.contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${sectionId}-section`) {
                section.classList.add('active');
            }
        });
        
        this.currentSection = sectionId;
        
        // Close mobile sidebar after selection
        if (window.innerWidth <= 768) {
            this.closeMobileSidebar();
        }
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
    }
    
    toggleMobileSidebar() {
        const isOpen = this.sidebar.classList.contains('open');
        if (isOpen) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }
    
    openMobileSidebar() {
        this.sidebar.classList.add('open');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }
    
    closeMobileSidebar() {
        this.sidebar.classList.remove('open');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
    }
    
    createMobileSidebarOverlay() {
        this.sidebarOverlay = document.createElement('div');
        this.sidebarOverlay.className = 'sidebar-overlay';
        this.sidebarOverlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });
        document.body.appendChild(this.sidebarOverlay);
    }
    
    initCardAnimations() {
        // Add staggered animation to cards
        const cards = document.querySelectorAll('.utility-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${0.1 * index}s`;
            
            // Add enhanced hover effects for non-coming-soon cards
            if (!card.classList.contains('coming-soon')) {
                card.addEventListener('mouseenter', () => {
                    card.style.filter = 'brightness(1.05)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.filter = 'brightness(1)';
                });
            }
        });
        
        // Add scroll-based animations using Intersection Observer
        if ('IntersectionObserver' in window) {
            this.initScrollAnimations();
        }
    }
    
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';\n                }\n            });\n        }, observerOptions);\n        \n        // Observe all utility cards\n        document.querySelectorAll('.utility-card').forEach(card => {\n            observer.observe(card);\n        });\n        \n        // Observe headers\n        document.querySelectorAll('.header').forEach(header => {\n            observer.observe(header);\n        });\n    }\n}\n\n// Initialize the dashboard when DOM is loaded\ndocument.addEventListener('DOMContentLoaded', () => {\n    new UtilitiesDashboard();\n});