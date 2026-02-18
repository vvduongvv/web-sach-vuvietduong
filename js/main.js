// ============================================
// BookVoyage - Main JavaScript
// ============================================

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(22, 33, 62, 0.98)';
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
            } else {
                header.style.background = '#16213e';
                header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.3)';
            }
        });
    }

    // Search form
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = this.querySelector('input').value;
            const category = this.querySelector('select').value;
            if (query.trim()) {
                alert('Searching for: "' + query + '"' + (category ? ' in category: ' + category : ''));
            }
        });
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input').value;
            if (email.trim()) {
                alert('Thank you for subscribing with: ' + email);
                this.querySelector('input').value = '';
            }
        });
    }

    // Contact form
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you within 24 hours.');
            this.reset();
        });
    }

    // Login form
    const loginForm = document.querySelector('.auth-section form');
    if (loginForm && document.title.includes('Login')) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Login successful! Welcome back to BookVoyage.');
        });
    }

    // Register form
    if (loginForm && document.title.includes('Register')) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                alert('Passwords do not match!');
                return;
            }
            alert('Registration successful! Welcome to BookVoyage. Start your reading journey!');
        });
    }

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation to cards
    const animatedElements = document.querySelectorAll(
        '.feature-card, .book-card, .category-card, .category-full-card, .arrival-item, .testimonial-card, .team-card, .contact-card, .stat-item'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease ' + (index % 4) * 0.1 + 's, transform 0.6s ease ' + (index % 4) * 0.1 + 's';
        observer.observe(el);
    });

    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-item h3, .hero-stats .stat h3');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/[^0-9]/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * number);
            
            element.textContent = current.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = text;
            }
        }

        requestAnimationFrame(update);
    }

    // View toggle in catalog
    const viewToggleButtons = document.querySelectorAll('.view-toggle button');
    viewToggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewToggleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Category sidebar filter
    const sidebarLinks = document.querySelectorAll('.sidebar-section ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Back to top button (create dynamically)
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.setAttribute('id', 'backToTop');
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: #e94560;
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    console.log('📚 BookVoyage - Reading is a Journey | Website loaded successfully!');
});
