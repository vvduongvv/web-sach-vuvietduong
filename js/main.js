// ============================================
// BookVoyage - Main JavaScript (Performance Optimized)
// ============================================

// --- Scroll throttle utility (RAF-based) ---
var _scrollCallbacks = [];
var _scrollTicking = false;
function onScrollThrottled(fn) {
    _scrollCallbacks.push(fn);
}
(function() {
    window.addEventListener('scroll', function() {
        if (!_scrollTicking) {
            _scrollTicking = true;
            requestAnimationFrame(function() {
                var scrollTop = window.scrollY || document.documentElement.scrollTop;
                for (var i = 0; i < _scrollCallbacks.length; i++) {
                    _scrollCallbacks[i](scrollTop);
                }
                _scrollTicking = false;
            });
        }
    }, { passive: true });
})();

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navParent = navMenu ? navMenu.parentNode : null; // original parent (<nav>)

    // Create overlay — append to body (root stacking context)
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    // Helper: close mobile menu
    function closeMobileMenu() {
        if (navMenu) {
            navMenu.classList.remove('active');
            // Move nav-menu back inside header <nav> for desktop layout
            if (navParent && navMenu.parentNode !== navParent) {
                navParent.appendChild(navMenu);
            }
        }
        if (hamburger) hamburger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        dropdownParents.forEach(function(li) { li.classList.remove('dropdown-open'); });
    }

    // Helper: open mobile menu
    function openMobileMenu() {
        // Move nav-menu to body so it escapes header's stacking context
        if (navMenu.parentNode !== document.body) {
            document.body.appendChild(navMenu);
        }
        navMenu.classList.add('active');
        hamburger.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (hamburger && navMenu) {
        // Move nav-auth into nav-menu on mobile for visibility
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) {
            const navAuthClone = navAuth.cloneNode(true);
            navAuthClone.classList.add('nav-auth-mobile');
            navMenu.appendChild(navAuthClone);
        }

        // Create close button inside the nav-menu sidebar
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('nav-menu-close');
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        navMenu.insertBefore(closeBtn, navMenu.firstChild);

        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close button inside sidebar
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMobileMenu();
        });

        // Close when clicking overlay
        overlay.addEventListener('click', function() {
            closeMobileMenu();
        });
    }

    // Mobile dropdown toggle (touch-friendly)
    const dropdownParents = document.querySelectorAll('.nav-menu > li');
    dropdownParents.forEach(function(li) {
        const dropdown = li.querySelector('.dropdown');
        const link = li.querySelector('a');
        if (dropdown && link) {
            link.addEventListener('click', function(e) {
                // Only intercept on mobile (when hamburger is visible)
                if (hamburger && window.getComputedStyle(hamburger).display !== 'none') {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdownParents.forEach(function(otherLi) {
                        if (otherLi !== li) {
                            otherLi.classList.remove('dropdown-open');
                        }
                    });
                    li.classList.toggle('dropdown-open');
                }
            });
        }
    });

    // Close mobile menu when clicking a nav link (not dropdown parent)
    const navLinks = document.querySelectorAll('.nav-menu li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const parentLi = this.closest('li');
            const hasDropdown = parentLi && parentLi.querySelector('.dropdown');
            if (hamburger && window.getComputedStyle(hamburger).display !== 'none' && hasDropdown) {
                return;
            }
            if (navMenu && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    });

    // Close mobile menu when clicking outside (fallback)
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        }
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

    // Header scroll effect (throttled via RAF, uses classList)
    const header = document.querySelector('.header');
    if (header) {
        onScrollThrottled(function(scrollTop) {
            header.classList.toggle('header-scrolled', scrollTop > 100);
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

    // Counter animation for stats (reuse single observer)
    var statNumbers = document.querySelectorAll('.stat-item h3, .hero-stats .stat h3');
    if (statNumbers.length > 0) {
        var counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(function(el) { counterObserver.observe(el); });
    }

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

    // ======================================================
    // CATALOG PAGE - Dynamic book rendering with search/filter
    // ======================================================
    const booksGrid = document.getElementById('booksGrid');
    const catalogSearch = document.getElementById('catalogSearch');
    const catalogSort = document.getElementById('catalogSort');
    const categorySidebar = document.getElementById('categorySidebar');
    const resultsCount = document.getElementById('resultsCount');
    const catalogPagination = document.getElementById('catalogPagination');

    if (booksGrid && typeof BOOKS_DATA !== 'undefined') {
        const BOOKS_PER_PAGE = 12;
        let currentPage = 1;
        let currentCategory = 'all';
        let currentSearch = '';
        let currentSort = 'popular';
        let currentMinRating = 0;

        // Populate category counts
        const counts = getCategoryCounts();
        const countAllEl = document.getElementById('countAll');
        if (countAllEl) countAllEl.textContent = BOOKS_DATA.length;
        Object.keys(counts).forEach(function(cat) {
            const el = document.getElementById('count' + cat);
            if (el) el.textContent = counts[cat];
        });

        // Read URL params for initial category
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('cat');
        if (catParam) {
            // Map URL slug to category name
            const catMap = {
                'fiction': 'Fiction', 'nonfiction': 'Non-Fiction', 'science': 'Science',
                'technology': 'Technology', 'history': 'History', 'romance': 'Romance',
                'children': 'Children', 'selfhelp': 'Self-Help', 'biography': 'Biography',
                'mystery': 'Mystery', 'poetry': 'Poetry', 'business': 'Business'
            };
            if (catMap[catParam]) {
                currentCategory = catMap[catParam];
                // Update active sidebar link
                document.querySelectorAll('#categorySidebar a').forEach(function(a) {
                    a.classList.remove('active');
                    if (a.dataset.category === currentCategory) a.classList.add('active');
                });
            }
        }

        // Read URL params for search query
        const searchParam = urlParams.get('q');
        if (searchParam) {
            currentSearch = searchParam;
            catalogSearch.value = searchParam;
        }

        function getFilteredBooks() {
            let books = [...BOOKS_DATA];
            books = filterByCategory(currentCategory, books);
            books = searchBooks(currentSearch, books);
            // Rating filter
            if (currentMinRating > 0) {
                books = books.filter(function(b) { return b.rating >= currentMinRating; });
            }
            books = sortBooks(books, currentSort);
            return books;
        }

        function renderCatalog() {
            const filtered = getFilteredBooks();
            const totalBooks = filtered.length;
            const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
            if (currentPage > totalPages) currentPage = 1;

            const start = (currentPage - 1) * BOOKS_PER_PAGE;
            const end = Math.min(start + BOOKS_PER_PAGE, totalBooks);
            const pageBooks = filtered.slice(start, end);

            // Render books
            if (pageBooks.length === 0) {
                booksGrid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><h3>No books found</h3><p>Try adjusting your search or filters</p></div>';
            } else {
                booksGrid.innerHTML = pageBooks.map(function(book) { return renderBookCard(book); }).join('');
            }

            // Update results count
            if (resultsCount) {
                if (totalBooks === 0) {
                    resultsCount.innerHTML = 'No books found';
                } else {
                    resultsCount.innerHTML = 'Showing <strong>' + (start + 1) + '-' + end + '</strong> of <strong>' + totalBooks + '</strong> books';
                }
            }

            // Render pagination
            renderPagination(totalPages);

            // Re-apply scroll animation to new cards
            const newCards = booksGrid.querySelectorAll('.book-card');
            newCards.forEach(function(el, index) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.4s ease ' + (index % 4) * 0.08 + 's, transform 0.4s ease ' + (index % 4) * 0.08 + 's';
                requestAnimationFrame(function() {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
            });
        }

        function renderPagination(totalPages) {
            if (!catalogPagination) return;
            if (totalPages <= 1) { catalogPagination.innerHTML = ''; return; }
            let html = '';
            // Prev
            html += '<a href="#" data-page="' + Math.max(1, currentPage - 1) + '"' + (currentPage === 1 ? ' class="disabled"' : '') + '><i class="fas fa-chevron-left"></i></a>';
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
                    html += '<a href="#" data-page="' + i + '"' + (i === currentPage ? ' class="active"' : '') + '>' + i + '</a>';
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                    html += '<span class="ellipsis">...</span>';
                }
            }
            // Next
            html += '<a href="#" data-page="' + Math.min(totalPages, currentPage + 1) + '"' + (currentPage === totalPages ? ' class="disabled"' : '') + '><i class="fas fa-chevron-right"></i></a>';
            catalogPagination.innerHTML = html;

            // Add event listeners
            catalogPagination.querySelectorAll('a[data-page]').forEach(function(a) {
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentPage = parseInt(this.dataset.page);
                    renderCatalog();
                    window.scrollTo({ top: booksGrid.offsetTop - 120, behavior: 'smooth' });
                });
            });
        }

        // Category sidebar click
        if (categorySidebar) {
            categorySidebar.addEventListener('click', function(e) {
                const link = e.target.closest('a[data-category]');
                if (!link) return;
                e.preventDefault();
                categorySidebar.querySelectorAll('a').forEach(function(a) { a.classList.remove('active'); });
                link.classList.add('active');
                currentCategory = link.dataset.category;
                currentPage = 1;
                renderCatalog();
            });
        }

        // Search input
        let searchTimeout;
        if (catalogSearch) {
            catalogSearch.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function() {
                    currentSearch = catalogSearch.value;
                    currentPage = 1;
                    renderCatalog();
                }, 300);
            });
        }

        // Sort change
        if (catalogSort) {
            catalogSort.addEventListener('change', function() {
                currentSort = this.value;
                currentPage = 1;
                renderCatalog();
            });
        }

        // Rating filter
        const ratingFilter = document.getElementById('ratingFilter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', function(e) {
                if (e.target.name === 'rating') {
                    currentMinRating = parseFloat(e.target.value);
                    currentPage = 1;
                    renderCatalog();
                }
            });
        }

        // Initial render with skeleton delay
        setTimeout(function() { renderCatalog(); }, 400);
    }

    // ======================================================
    // BOOK DETAIL PAGE - Dynamic rendering from data
    // ======================================================
    const bookDetailLayout = document.querySelector('.book-detail-layout');
    if (bookDetailLayout && typeof BOOKS_DATA !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = parseInt(urlParams.get('id'));
        
        if (bookId) {
            const book = BOOKS_DATA.find(function(b) { return b.id === bookId; });
            if (book) {
                // Update page title
                document.title = book.title + ' - BookVoyage';
                
                // Update breadcrumb
                const breadcrumb = document.querySelector('.breadcrumb');
                if (breadcrumb) {
                    breadcrumb.innerHTML = '<a href="/">Home</a> <span>/</span> <a href="/catalog/">Library</a> <span>/</span> <span>' + book.title + '</span>';
                }

                // Generate stars
                const fullStars = Math.floor(book.rating);
                const hasHalf = book.rating - fullStars >= 0.3;
                let starsHtml = '';
                for (let i = 0; i < fullStars; i++) starsHtml += '&#11088;';
                if (hasHalf) starsHtml += '&#11088;';

                // Render book detail
                bookDetailLayout.innerHTML = `
                    <div class="book-detail-cover" style="background: linear-gradient(135deg, ${book.gradient[0]}, ${book.gradient[1]});">
                        <span class="cover-fallback-icon"><i class="fas fa-book-open"></i></span>
                        <img src="${book.cover}" alt="${book.title}" onload="if(this.naturalWidth<10||this.naturalHeight<10)this.remove();" onerror="this.remove();" crossorigin="anonymous">
                    </div>
                    <div class="book-detail-info">
                        <span class="book-category-badge">${book.category}</span>
                        <h1>${book.title}</h1>
                        <p class="detail-author"><i class="fas fa-user"></i> by <strong>${book.author}</strong></p>
                        
                        <div class="detail-rating">
                            <span class="stars">${starsHtml}</span>
                            <span>${book.rating} / 5.0</span>
                        </div>

                        <div class="book-detail-meta">
                            <div class="meta-item"><span>Pages</span><strong>${book.pages}</strong></div>
                            <div class="meta-item"><span>Published</span><strong>${book.year > 0 ? book.year : Math.abs(book.year) + ' BC'}</strong></div>
                            <div class="meta-item"><span>Language</span><strong>${book.language}</strong></div>
                            <div class="meta-item"><span>Format</span><strong>${book.format}</strong></div>
                            <div class="meta-item"><span>ISBN</span><strong>${book.isbn}</strong></div>
                            <div class="meta-item"><span>Publisher</span><strong>${book.publisher}</strong></div>
                        </div>

                        <div class="book-description">
                            <h3>&#128196; Description</h3>
                            <p>${book.description}</p>
                        </div>

                        <div class="book-description">
                            <h3>&#127991; Tags</h3>
                            <div class="book-tags">
                                <span class="book-tag">${book.category}</span>
                                ${book.badge ? '<span class="book-tag">' + book.badge + '</span>' : ''}
                                <span class="book-tag">${book.language}</span>
                                <span class="book-tag">${book.year > 0 ? book.year : 'Classic'}</span>
                            </div>
                        </div>

                        <div class="book-detail-actions">
                            <a href="/read.html?id=${book.id}" class="btn btn-primary btn-large"><i class="fas fa-book-reader"></i> Read Now</a>
                            <a href="#" class="btn btn-outline btn-large"><i class="fas fa-heart"></i> Wishlist</a>
                        </div>
                    </div>`;

                // Render related books (same category, exclude current)
                const relatedSection = document.querySelector('.popular-books .books-grid');
                if (relatedSection) {
                    const related = BOOKS_DATA
                        .filter(function(b) { return b.category === book.category && b.id !== book.id; })
                        .sort(function(a, b) { return b.rating - a.rating; })
                        .slice(0, 4);
                    
                    if (related.length > 0) {
                        relatedSection.innerHTML = related.map(function(b) { return renderBookCard(b); }).join('');
                        // Update header
                        const relatedHeader = document.querySelector('.popular-books .section-header');
                        if (relatedHeader) {
                            relatedHeader.querySelector('h2').textContent = 'You May Also Like';
                            relatedHeader.querySelector('p').textContent = 'More books in ' + book.category;
                        }
                    }
                }
            }
        }
    }

    // ======================================================
    // HOMEPAGE - Dynamic popular books & new arrivals
    // ======================================================
    var popularBooksGrid = document.getElementById('popularBooksGrid') || document.querySelector('.popular-books .books-grid');
    const isHomepage = document.querySelector('.hero') !== null;
    if (isHomepage && popularBooksGrid && typeof BOOKS_DATA !== 'undefined') {
        // Simulate a brief loading delay so skeleton is visible, then render
        setTimeout(function() {
            // Popular books = highest rated
            const popular = [...BOOKS_DATA]
                .sort(function(a, b) { return b.rating - a.rating; })
                .slice(0, 4);
            popularBooksGrid.innerHTML = popular.map(function(b) { return renderBookCard(b); }).join('');

            // Animate cards in
            popularBooksGrid.querySelectorAll('.book-card').forEach(function(card, i) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease ' + (i * 0.1) + 's, transform 0.5s ease ' + (i * 0.1) + 's';
                requestAnimationFrame(function() {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            });

            // New arrivals
            var arrivalsList = document.getElementById('arrivalsListGrid') || document.querySelector('.arrivals-list');
            if (arrivalsList) {
                const newest = [...BOOKS_DATA]
                    .sort(function(a, b) { return b.year - a.year; })
                    .slice(0, 4);
                arrivalsList.innerHTML = newest.map(function(book) {
                    return `<div class="arrival-item">
                        <a href="/book-detail/?id=${book.id}" style="display:block;text-decoration:none;">
                            <div class="arrival-cover" style="background: linear-gradient(135deg, ${book.gradient[0]}, ${book.gradient[1]});">
                                <img src="${book.cover}" alt="${book.title}" onload="if(this.naturalWidth<10||this.naturalHeight<10)this.remove();" onerror="this.remove();" crossorigin="anonymous">
                            </div>
                        </a>
                        <div class="arrival-info">
                            <span class="date">Published: ${book.year}</span>
                            <h3><a href="/book-detail/?id=${book.id}">${book.title}</a></h3>
                            <p class="author">by ${book.author}</p>
                            <p>${book.description}</p>
                        </div>
                    </div>`;
                }).join('');

                // Animate arrivals in
                arrivalsList.querySelectorAll('.arrival-item').forEach(function(item, i) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.style.transition = 'opacity 0.5s ease ' + (i * 0.12) + 's, transform 0.5s ease ' + (i * 0.12) + 's';
                    requestAnimationFrame(function() {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    });
                });
            }
        }, 600);
    }

    // ======================================================
    // HOMEPAGE SEARCH - redirect to catalog with query
    // ======================================================
    if (isHomepage) {
        const heroSearchForm = document.querySelector('.hero-search-bar') || document.querySelector('.search-bar');
        if (heroSearchForm) {
            heroSearchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = this.querySelector('input');
                const select = this.querySelector('select');
                const query = input ? input.value.trim() : '';
                const category = select ? select.value : '';
                let url = '/catalog/';
                const params = [];
                if (query) params.push('q=' + encodeURIComponent(query));
                if (category) params.push('cat=' + encodeURIComponent(category));
                if (params.length) url += '?' + params.join('&');
                window.location.href = url;
            });
        }
    }

    // ======================================================
    // SYNC STATS - Real numbers from BOOKS_DATA across all pages
    // (cached computations to avoid repeated iterations)
    // ======================================================
    if (typeof BOOKS_DATA !== 'undefined') {
        var totalBooks = BOOKS_DATA.length;
        var _authorSet = {};
        var _catSet = {};
        for (var si = 0; si < BOOKS_DATA.length; si++) {
            _authorSet[BOOKS_DATA[si].author] = 1;
            _catSet[BOOKS_DATA[si].category] = 1;
        }
        var uniqueAuthors = Object.keys(_authorSet).length;
        var uniqueCategories = Object.keys(_catSet).length;
        var counts = getCategoryCounts();

        // Map stat label -> real value
        var statsMap = {
            'Total Books': totalBooks,
            'Books Available': totalBooks,
            'Books': totalBooks,
            'Authors': uniqueAuthors,
            'Categories': uniqueCategories
        };

        // Update about page stat elements (.stat-item with h3 + p)
        document.querySelectorAll('.stat-item').forEach(function(el) {
            var label = el.querySelector('p');
            var value = el.querySelector('h3');
            if (!label || !value) return;
            var key = label.textContent.trim();
            if (statsMap[key]) value.textContent = statsMap[key];
        });

        // Update homepage quick-stats strip
        document.querySelectorAll('.quick-stats .stat').forEach(function(el) {
            var strong = el.querySelector('strong');
            if (!strong) return;
            var text = el.textContent.trim();
            if (text.includes('Books'))      strong.textContent = totalBooks;
            if (text.includes('Authors'))    strong.textContent = uniqueAuthors;
            if (text.includes('Categories')) strong.textContent = uniqueCategories;
        });

        // Update homepage category cards
        document.querySelectorAll('.categories-grid .category-card').forEach(function(card) {
            var h4 = card.querySelector('h4');
            var span = card.querySelector('span:not(.cat-icon)');
            if (!h4 || !span) return;
            var name = h4.textContent.trim();
            var count = counts[name] || 0;
            if (span.textContent.includes('books')) {
                span.textContent = count + ' books';
            }
        });

        // Update about page description text
        document.querySelectorAll('.about-text p').forEach(function(p) {
            if (p.textContent.includes('15,000') || p.textContent.includes('50,000')) {
                p.textContent = p.textContent
                    .replace(/over 15,000/g, totalBooks)
                    .replace(/15,000/g, totalBooks)
                    .replace(/20\+ categories/g, uniqueCategories + ' categories')
                    .replace(/50,000\+ active readers/g, uniqueAuthors + ' authors');
            }
        });

        // Update register page subtitle
        var authSubtitle = document.querySelector('.auth-subtitle');
        if (authSubtitle && authSubtitle.textContent.includes('15,000')) {
            authSubtitle.textContent = authSubtitle.textContent.replace('15,000+', totalBooks);
        }
    }

    // ======================================================
    // CATEGORIES PAGE - Dynamic book counts
    // ======================================================
    const categoriesGrid = document.querySelector('.categories-full-grid');
    if (categoriesGrid && typeof BOOKS_DATA !== 'undefined') {
        const counts = getCategoryCounts();
        const catStatsElements = categoriesGrid.querySelectorAll('.cat-stats');
        catStatsElements.forEach(function(statsEl) {
            const card = statsEl.closest('.category-full-card');
            if (!card) return;
            const catName = card.querySelector('h3');
            if (!catName) return;
            let name = catName.textContent.trim();
            if (name === 'Mystery & Thriller') name = 'Mystery';
            const count = counts[name] || 0;
            // Compute average rating for this category
            const catBooks = BOOKS_DATA.filter(function(b) { return b.category === name; });
            const avgRating = catBooks.length > 0
                ? (catBooks.reduce(function(sum, b) { return sum + b.rating; }, 0) / catBooks.length).toFixed(1)
                : '0.0';
            const booksSpan = statsEl.querySelector('span:first-child');
            if (booksSpan) booksSpan.innerHTML = '&#128218; ' + count + ' Books';
            const readersSpan = statsEl.querySelector('span:last-child');
            if (readersSpan && readersSpan !== booksSpan) readersSpan.innerHTML = '&#11088; ' + avgRating + ' Avg Rating';
        });
    }

    // Back to top button (create dynamically, use throttled scroll)
    var backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    document.body.appendChild(backToTop);

    onScrollThrottled(function(scrollTop) {
        backToTop.classList.toggle('visible', scrollTop > 500);
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ======================================================
    // SECTION REVEAL ANIMATION (IntersectionObserver)
    // ======================================================
    var revealSections = document.querySelectorAll('.features, .categories, .popular-books, .new-arrivals, .stats-banner, .testimonials, .newsletter, .java-featured');
    revealSections.forEach(function(sec) { sec.classList.add('reveal-section'); });

    if ('IntersectionObserver' in window) {
        var sectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.reveal-section').forEach(function(sec) {
            sectionObserver.observe(sec);
        });
    } else {
        // Fallback: show all immediately
        document.querySelectorAll('.reveal-section').forEach(function(sec) {
            sec.classList.add('revealed');
        });
    }

    // (Duplicate search handler removed — already handled in HOMEPAGE SEARCH section above)

});

// ======================================================
// PAGE LOADER — hide once resources are ready
// ======================================================
(function() {
    var loader = document.getElementById('pageLoader');
    if (!loader) return;

    function hideLoader() {
        loader.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(function() {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);
    }

    // Hide on window load (all images & resources loaded)
    window.addEventListener('load', function() {
        // Small delay so the animation is visible even on fast connections
        setTimeout(hideLoader, 350);
    });

    // Safety: hide after max 4s even if some resources fail
    setTimeout(hideLoader, 4000);
})();