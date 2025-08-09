class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.6;
        `;
        
        document.body.appendChild(this.canvas);
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(102, 126, 234, ',
            'rgba(118, 75, 162, ',
            'rgba(120, 119, 198, ',
            'rgba(255, 119, 198, ',
            'rgba(120, 219, 226, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;\n            const dy = this.mouse.y - particle.y;\n            const distance = Math.sqrt(dx * dx + dy * dy);\n            \n            if (distance < 100) {\n                const force = (100 - distance) / 100;\n                particle.vx -= (dx / distance) * force * 0.01;\n                particle.vy -= (dy / distance) * force * 0.01;\n            }\n            \n            // Boundary wrapping\n            if (particle.x < 0) particle.x = this.canvas.width;\n            if (particle.x > this.canvas.width) particle.x = 0;\n            if (particle.y < 0) particle.y = this.canvas.height;\n            if (particle.y > this.canvas.height) particle.y = 0;\n            \n            // Damping\n            particle.vx *= 0.99;\n            particle.vy *= 0.99;\n            \n            // Floating animation\n            particle.y += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.1;\n        });\n    }\n    \n    drawParticles() {\n        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);\n        \n        this.particles.forEach(particle => {\n            // Draw particle\n            this.ctx.beginPath();\n            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);\n            this.ctx.fillStyle = particle.color + particle.opacity + ')';\n            this.ctx.fill();\n            \n            // Draw connections\n            this.particles.forEach(otherParticle => {\n                const dx = particle.x - otherParticle.x;\n                const dy = particle.y - otherParticle.y;\n                const distance = Math.sqrt(dx * dx + dy * dy);\n                \n                if (distance < 120) {\n                    const opacity = (120 - distance) / 120 * 0.2;\n                    this.ctx.beginPath();\n                    this.ctx.moveTo(particle.x, particle.y);\n                    this.ctx.lineTo(otherParticle.x, otherParticle.y);\n                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;\n                    this.ctx.stroke();\n                }\n            });\n        });\n    }\n    \n    animate() {\n        this.updateParticles();\n        this.drawParticles();\n        this.animationId = requestAnimationFrame(() => this.animate());\n    }\n    \n    destroy() {\n        if (this.animationId) {\n            cancelAnimationFrame(this.animationId);\n        }\n        if (this.canvas.parentNode) {\n            this.canvas.parentNode.removeChild(this.canvas);\n        }\n    }\n}\n\n// Initialize particles when DOM is loaded\nif (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', () => {\n        new ParticleSystem();\n    });\n} else {\n    new ParticleSystem();\n}