// Simple dashboard script for animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add staggered animation to cards
    const cards = document.querySelectorAll('.utility-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${0.1 * index}s`;
        
        // Add hover sound effect simulation (visual feedback)
        if (!card.classList.contains('coming-soon')) {
            card.addEventListener('mouseenter', () => {
                card.style.filter = 'brightness(1.05)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.filter = 'brightness(1)';
            });
        }
    });
    
    // Add scroll-based animations
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
    
    cards.forEach(card => {
        observer.observe(card);
    });
});