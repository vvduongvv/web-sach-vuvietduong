// ============================================
// PROFESSIONAL READER ENGINE — PAGINATED
// Page-by-page reading, TOC sidebar, Settings panel
// Keyboard shortcuts, Reading position memory
// ============================================

(function() {
    'use strict';

    // === CONSTANTS ===
    var PARAGRAPHS_PER_PAGE = 12; // paragraphs per page

    // === READING PREFERENCES (persisted) ===
    var prefs = {
        fontSize: parseInt(localStorage.getItem('bv_fontSize')) || 18,
        lineHeight: parseFloat(localStorage.getItem('bv_lineHeight')) || 1.9,
        font: localStorage.getItem('bv_font') || "'Merriweather', Georgia, serif",
        theme: localStorage.getItem('bv_theme') || 'sepia',
        width: parseInt(localStorage.getItem('bv_width')) || 720
    };

    // Apply theme immediately to avoid flash
    if (prefs.theme === 'dark') document.body.classList.add('dark-mode');
    if (prefs.theme === 'sepia') document.body.classList.add('sepia-mode');

    // === ELEMENTS ===
    var els = {};
    var sectionHeadings = []; // [{id, title, el, pageIndex}]
    var bookInfo = null;

    // === PAGINATION STATE ===
    var allParsedElements = []; // array of HTML strings for each content element
    var currentPage = 1;
    var totalPages = 1;
    var paginationContainer = null;

    document.addEventListener('DOMContentLoaded', function() {
        els = {
            progressBar: document.getElementById('progressBar'),
            topbar: document.getElementById('readerTopbar'),
            miniTitle: document.getElementById('miniTitle'),
            progressText: document.getElementById('progressText'),
            btnToc: document.getElementById('btnToc'),
            btnSettings: document.getElementById('btnSettings'),
            bookHeader: document.getElementById('bookHeader'),
            bookTitle: document.getElementById('bookTitle'),
            bookAuthor: document.getElementById('bookAuthor'),
            pageInfo: document.getElementById('pageInfo'),
            bcBookLink: document.getElementById('bcBookLink'),
            bcPageInfo: document.getElementById('bcPageInfo'),
            contentWrapper: document.getElementById('contentWrapper'),
            readingArea: document.getElementById('reading-area'),
            skeleton: document.getElementById('readingSkeleton'),
            tocOverlay: document.getElementById('tocOverlay'),
            tocSidebar: document.getElementById('tocSidebar'),
            tocClose: document.getElementById('tocClose'),
            tocList: document.getElementById('tocList'),
            settingsOverlay: document.getElementById('settingsOverlay'),
            settingsPanel: document.getElementById('settingsPanel'),
            settingsClose: document.getElementById('settingsClose'),
            fontDown: document.getElementById('fontDown'),
            fontUp: document.getElementById('fontUp'),
            fontSizeDisplay: document.getElementById('fontSizeDisplay'),
            fontOptions: document.getElementById('fontOptions'),
            themeOptions: document.getElementById('themeOptions'),
            lhOptions: document.getElementById('lhOptions'),
            widthOptions: document.getElementById('widthOptions'),
            scrollTopBtn: document.getElementById('scrollTopBtn')
        };

        applyPreferences();
        loadBookContent();
        setupEventListeners();
        setupScrollTracking();
        setupKeyboardShortcuts();
    });

    // === APPLY PREFERENCES ===
    function applyPreferences() {
        var area = els.readingArea;
        area.style.fontSize = prefs.fontSize + 'px';
        area.style.lineHeight = prefs.lineHeight;
        area.style.fontFamily = prefs.font;
        els.fontSizeDisplay.textContent = prefs.fontSize + 'px';

        if (prefs.width > 720) {
            els.contentWrapper.classList.add('wide');
        }

        // Sync settings UI
        syncSettingsUI();
    }

    function syncSettingsUI() {
        // Font options
        els.fontOptions.querySelectorAll('.font-option').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.font === prefs.font);
        });
        // Theme options
        els.themeOptions.querySelectorAll('.theme-option').forEach(function(opt) {
            opt.classList.toggle('active', opt.dataset.theme === prefs.theme);
        });
        // Line height
        els.lhOptions.querySelectorAll('.lh-option').forEach(function(opt) {
            opt.classList.toggle('active', parseFloat(opt.dataset.lh) === prefs.lineHeight);
        });
        // Width
        els.widthOptions.querySelectorAll('.width-option').forEach(function(opt) {
            opt.classList.toggle('active', parseInt(opt.dataset.width) === prefs.width);
        });
    }

    function savePref(key, value) {
        prefs[key] = value;
        localStorage.setItem('bv_' + key, value);
    }

    // === EVENT LISTENERS ===
    function setupEventListeners() {
        // TOC toggle
        els.btnToc.addEventListener('click', function() { toggleToc(true); });
        els.tocOverlay.addEventListener('click', function() { toggleToc(false); });
        els.tocClose.addEventListener('click', function() { toggleToc(false); });

        // Settings toggle
        els.btnSettings.addEventListener('click', function() { toggleSettings(true); });
        els.settingsOverlay.addEventListener('click', function() { toggleSettings(false); });
        els.settingsClose.addEventListener('click', function() { toggleSettings(false); });

        // Font size
        els.fontDown.addEventListener('click', function() {
            var newSize = Math.max(12, prefs.fontSize - 2);
            savePref('fontSize', newSize);
            els.readingArea.style.fontSize = newSize + 'px';
            els.fontSizeDisplay.textContent = newSize + 'px';
        });
        els.fontUp.addEventListener('click', function() {
            var newSize = Math.min(32, prefs.fontSize + 2);
            savePref('fontSize', newSize);
            els.readingArea.style.fontSize = newSize + 'px';
            els.fontSizeDisplay.textContent = newSize + 'px';
        });

        // Font family
        els.fontOptions.addEventListener('click', function(e) {
            var btn = e.target.closest('.font-option');
            if (!btn) return;
            savePref('font', btn.dataset.font);
            els.readingArea.style.fontFamily = btn.dataset.font;
            els.fontOptions.querySelectorAll('.font-option').forEach(function(b) {
                b.classList.toggle('active', b === btn);
            });
        });

        // Theme
        els.themeOptions.addEventListener('click', function(e) {
            var opt = e.target.closest('.theme-option');
            if (!opt) return;
            var theme = opt.dataset.theme;
            document.body.classList.remove('dark-mode', 'sepia-mode');
            if (theme === 'dark') document.body.classList.add('dark-mode');
            if (theme === 'sepia') document.body.classList.add('sepia-mode');
            savePref('theme', theme);
            els.themeOptions.querySelectorAll('.theme-option').forEach(function(o) {
                o.classList.toggle('active', o === opt);
            });
        });

        // Line height
        els.lhOptions.addEventListener('click', function(e) {
            var opt = e.target.closest('.lh-option');
            if (!opt) return;
            var lh = parseFloat(opt.dataset.lh);
            savePref('lineHeight', lh);
            els.readingArea.style.lineHeight = lh;
            els.lhOptions.querySelectorAll('.lh-option').forEach(function(o) {
                o.classList.toggle('active', o === opt);
            });
        });

        // Width
        els.widthOptions.addEventListener('click', function(e) {
            var opt = e.target.closest('.width-option');
            if (!opt) return;
            var w = parseInt(opt.dataset.width);
            savePref('width', w);
            els.contentWrapper.classList.toggle('wide', w > 720);
            els.widthOptions.querySelectorAll('.width-option').forEach(function(o) {
                o.classList.toggle('active', o === opt);
            });
        });

        // Scroll to top
        els.scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Top chapter nav buttons
        var topPrev = document.getElementById('topPrevBtn');
        var topNext = document.getElementById('topNextBtn');
        var btnTocAlt = document.getElementById('btnTocAlt');
        if (topPrev) topPrev.addEventListener('click', function() { goToPage(currentPage - 1); });
        if (topNext) topNext.addEventListener('click', function() { goToPage(currentPage + 1); });
        if (btnTocAlt) btnTocAlt.addEventListener('click', function() { toggleToc(true); });
    }

    // === TOC / SETTINGS TOGGLES ===
    function toggleToc(open) {
        els.tocOverlay.classList.toggle('open', open);
        els.tocSidebar.classList.toggle('open', open);
        els.btnToc.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    function toggleSettings(open) {
        els.settingsOverlay.classList.toggle('open', open);
        els.settingsPanel.classList.toggle('open', open);
        els.btnSettings.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    // === SCROLL TRACKING (simplified for paginated) ===
    function setupScrollTracking() {
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function() {
                var scrollTop = window.scrollY || document.documentElement.scrollTop;

                // Mini title visibility
                var headerBottom = els.bookHeader.offsetTop + els.bookHeader.offsetHeight;
                els.miniTitle.classList.toggle('visible', scrollTop > headerBottom - 60);

                // Topbar shadow
                els.topbar.classList.toggle('shadow', scrollTop > 10);

                // Scroll to top button
                els.scrollTopBtn.classList.toggle('visible', scrollTop > 600);

                ticking = false;
            });
        }, { passive: true });
    }

    function saveReadingPage() {
        var bookId = new URLSearchParams(window.location.search).get('id');
        if (bookId) {
            localStorage.setItem('bv_page_' + bookId, currentPage);
        }
    }

    function restoreReadingPage() {
        var bookId = new URLSearchParams(window.location.search).get('id');
        if (!bookId) return;
        var saved = parseInt(localStorage.getItem('bv_page_' + bookId));
        if (saved && saved > 1 && saved <= totalPages) {
            goToPage(saved, false);
        }
    }

    // === KEYBOARD SHORTCUTS ===
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Escape closes panels
            if (e.key === 'Escape') {
                toggleToc(false);
                toggleSettings(false);
            }
            // 't' opens TOC
            if (e.key === 't' && !isTyping(e)) {
                e.preventDefault();
                toggleToc(!els.tocSidebar.classList.contains('open'));
            }
            // 's' opens settings
            if (e.key === 's' && !isTyping(e)) {
                e.preventDefault();
                toggleSettings(!els.settingsPanel.classList.contains('open'));
            }
            // Arrow left / right for page navigation
            if (e.key === 'ArrowLeft' && !isTyping(e)) {
                e.preventDefault();
                goToPage(currentPage - 1);
            }
            if (e.key === 'ArrowRight' && !isTyping(e)) {
                e.preventDefault();
                goToPage(currentPage + 1);
            }
        });
    }

    function isTyping(e) {
        var tag = (e.target.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    }

    // === CONTENT PARSING (returns array of HTML element strings) ===
    function parseContent(text) {
        var elements = [];
        var paragraphs = text.split(/\n\s*\n/);
        var sectionIndex = 0;
        var sectionHeaderPattern = /^[A-Z\s\d\u2550\u2501\u2500\u254C:&,.'\-!?()]{5,}$/;
        var separatorPattern = /^[\u2550\u2501\u2500\u254C\-_~*]{5,}$/;

        paragraphs.forEach(function(para) {
            var trimmed = para.trim();
            if (!trimmed) return;

            // Separator lines
            if (separatorPattern.test(trimmed)) {
                elements.push({ html: '<div class="separator">\u2022 \u2022 \u2022</div>', type: 'separator' });
                return;
            }

            // Section headers (ALL CAPS)
            if (sectionHeaderPattern.test(trimmed) && trimmed.length < 80 && trimmed.length >= 4) {
                sectionIndex++;
                var sectionId = 'section-' + sectionIndex;
                var title = formatHeading(trimmed);
                elements.push({ html: '<h2 class="section-heading" id="' + sectionId + '">' + escapeHtml(title) + '</h2>', type: 'heading', sectionId: sectionId, title: title });
                sectionHeadings.push({ id: sectionId, title: title, elementIndex: elements.length - 1 });
                return;
            }

            // Chapter/Part sub-headings
            if (/^(Chapter|Part|CHAPTER|PART)\s/i.test(trimmed) && trimmed.length < 120) {
                elements.push({ html: '<h3 class="sub-heading">' + escapeHtml(trimmed).replace(/\n/g, '<br>') + '</h3>', type: 'subheading' });
                return;
            }

            // --- Title --- sub-headings
            var dashTitleMatch = trimmed.match(/^---\s+(.+?)\s+---$/);
            if (dashTitleMatch) {
                elements.push({ html: '<h3 class="sub-heading">' + escapeHtml(dashTitleMatch[1]) + '</h3>', type: 'subheading' });
                return;
            }

            // Quotes
            if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length < 300) {
                elements.push({ html: '<blockquote>' + escapeHtml(trimmed) + '</blockquote>', type: 'quote' });
                return;
            }

            // List items
            if (/^(\d+\.\s|[-\u2022]\s)/.test(trimmed)) {
                elements.push({ html: '<p class="list-item">' + escapeHtml(trimmed).replace(/\n/g, '<br>') + '</p>', type: 'list' });
                return;
            }

            // Regular paragraph
            elements.push({ html: '<p>' + escapeHtml(trimmed).replace(/\n/g, '<br>') + '</p>', type: 'paragraph' });
        });

        return elements;
    }

    function formatHeading(text) {
        return text.replace(/[\u2550\u2501\u2500\u254C]/g, '').trim().split(/\s+/).map(function(word) {
            if (word.length <= 2) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function estimateReadingTime(text) {
        var words = text.split(/\s+/).length;
        var minutes = Math.ceil(words / 230);
        return { words: words, minutes: minutes };
    }

    // === PAGINATION ENGINE ===
    function getPageElements(page) {
        var start = (page - 1) * PARAGRAPHS_PER_PAGE;
        var end = Math.min(start + PARAGRAPHS_PER_PAGE, allParsedElements.length);
        return allParsedElements.slice(start, end);
    }

    function renderPage(page, animate) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;

        var pageElements = getPageElements(page);
        var html = pageElements.map(function(el) { return el.html; }).join('\n');

        if (animate !== false) {
            els.readingArea.classList.remove('page-visible');
            els.readingArea.classList.add('page-transition');

            setTimeout(function() {
                els.readingArea.innerHTML = html;
                els.readingArea.classList.remove('page-transition');
                els.readingArea.classList.add('page-visible');
            }, 250);
        } else {
            els.readingArea.innerHTML = html;
            els.readingArea.classList.add('page-visible');
        }

        // Update progress
        var progress = Math.round((page / totalPages) * 100);
        els.progressBar.style.width = progress + '%';
        els.progressText.textContent = 'Page ' + page + '/' + totalPages;

        // Update pagination buttons
        updatePaginationUI();

        // Update active TOC item
        updateActiveTocForPage(page);

        // Save position
        saveReadingPage();

        // Show/hide end section
        var endSection = els.contentWrapper.querySelector('.reader-end');
        if (endSection) {
            endSection.style.display = (page === totalPages) ? 'block' : 'none';
        }
    }

    function goToPage(page, animate) {
        if (page < 1 || page > totalPages) return;
        renderPage(page, animate);
        // Scroll to top of content
        var topY = els.contentWrapper.offsetTop - 60;
        window.scrollTo({ top: topY, behavior: 'smooth' });
    }

    function updatePaginationUI() {
        // Update top nav
        var topPrev = document.getElementById('topPrevBtn');
        var topNext = document.getElementById('topNextBtn');
        if (topPrev) topPrev.disabled = (currentPage <= 1);
        if (topNext) topNext.disabled = (currentPage >= totalPages);

        // Update bottom nav
        var bottomPrev = document.getElementById('bottomPrevBtn');
        var bottomNext = document.getElementById('bottomNextBtn');
        if (bottomPrev) bottomPrev.disabled = (currentPage <= 1);
        if (bottomNext) bottomNext.disabled = (currentPage >= totalPages);

        // Update page info
        if (els.pageInfo) {
            els.pageInfo.textContent = 'Page ' + currentPage + ' / ' + totalPages;
        }

        // Update breadcrumb page info
        if (els.bcPageInfo) {
            els.bcPageInfo.textContent = 'Page ' + currentPage + '/' + totalPages;
        }

        // Update jump input
        var jumpInput = paginationContainer ? paginationContainer.querySelector('.page-jump-input') : null;
        if (jumpInput) jumpInput.value = currentPage;
    }

    function updateActiveTocForPage(page) {
        if (sectionHeadings.length === 0) return;
        var startIdx = (page - 1) * PARAGRAPHS_PER_PAGE;
        var endIdx = startIdx + PARAGRAPHS_PER_PAGE;
        var activeId = null;

        // Find the last section heading that appears on or before this page
        for (var i = sectionHeadings.length - 1; i >= 0; i--) {
            if (sectionHeadings[i].elementIndex < endIdx) {
                activeId = sectionHeadings[i].id;
                break;
            }
        }

        if (activeId) {
            els.tocList.querySelectorAll('.toc-item').forEach(function(item) {
                item.classList.toggle('active', item.dataset.id === activeId);
            });
        }
    }

    function createPagination() {
        paginationContainer = document.createElement('div');
        paginationContainer.innerHTML =
            '<div class="ornament-divider ornament-large"><svg viewBox="0 0 300 30" xmlns="http://www.w3.org/2000/svg"><path d="M0 15 C20 5, 40 5, 60 15 C70 20, 80 20, 90 15 L100 10 C105 7, 110 5, 120 5 L130 5 C135 5, 137 7, 140 10 L145 15 C147 17, 150 18, 155 15 L160 10 C162 7, 165 5, 170 5 L180 5 C190 5, 195 7, 200 10 L210 15 C220 20, 230 20, 240 15 C260 5, 280 5, 300 15" fill="none" stroke="#b5a27a" stroke-width="1.2"/><path d="M120 3 C130 -2, 140 -2, 150 3 C155 5.5, 145 8, 140 5" fill="none" stroke="#b5a27a" stroke-width="0.8"/><path d="M150 3 C160 -2, 170 -2, 180 3 C175 5.5, 165 8, 160 5" fill="none" stroke="#b5a27a" stroke-width="0.8"/><circle cx="150" cy="2" r="2" fill="#b5a27a" opacity="0.6"/></svg></div>' +
            '<div class="chapter-nav">' +
                '<button class="nav-btn nav-btn-prev" id="bottomPrevBtn" title="Previous (\u2190)"><i class="fas fa-chevron-left"></i> Previous</button>' +
                '<button class="nav-btn nav-btn-list" id="btnTocBottom" title="Table of Contents"><i class="fas fa-list-ul"></i></button>' +
                '<button class="nav-btn nav-btn-next" id="bottomNextBtn" title="Next (\u2192)">Next <i class="fas fa-chevron-right"></i></button>' +
            '</div>' +
            '<div class="page-jump-bar">' +
                '<label>Go to page:</label>' +
                '<input type="number" class="page-jump-input" min="1" max="' + totalPages + '" value="1">' +
                '<button class="page-jump-btn">Go</button>' +
            '</div>';

        // Insert after reading-area, before end section
        els.contentWrapper.insertBefore(paginationContainer, els.contentWrapper.querySelector('.reader-end'));

        // Bottom nav event listeners
        document.getElementById('bottomPrevBtn').addEventListener('click', function() {
            goToPage(currentPage - 1);
        });
        document.getElementById('bottomNextBtn').addEventListener('click', function() {
            goToPage(currentPage + 1);
        });
        document.getElementById('btnTocBottom').addEventListener('click', function() {
            toggleToc(true);
        });
        paginationContainer.querySelector('.page-jump-btn').addEventListener('click', function() {
            var input = paginationContainer.querySelector('.page-jump-input');
            var page = parseInt(input.value);
            if (page >= 1 && page <= totalPages) {
                goToPage(page);
            }
        });
        paginationContainer.querySelector('.page-jump-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var page = parseInt(this.value);
                if (page >= 1 && page <= totalPages) {
                    goToPage(page);
                }
            }
        });

        // Swipe support for mobile
        setupSwipeNavigation();
    }

    function setupSwipeNavigation() {
        var startX = 0;
        var startY = 0;
        var threshold = 60;

        els.readingArea.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        els.readingArea.addEventListener('touchend', function(e) {
            var diffX = e.changedTouches[0].clientX - startX;
            var diffY = e.changedTouches[0].clientY - startY;

            // Only detect horizontal swipes (not vertical scrolling)
            if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
                if (diffX < 0) {
                    // Swipe left -> next page
                    goToPage(currentPage + 1);
                } else {
                    // Swipe right -> previous page
                    goToPage(currentPage - 1);
                }
            }
        }, { passive: true });
    }

    // === BUILD TOC ===
    function buildToc() {
        if (sectionHeadings.length === 0) {
            els.btnToc.style.display = 'none';
            return;
        }
        var html = '';
        sectionHeadings.forEach(function(section, i) {
            var pageForSection = Math.floor(section.elementIndex / PARAGRAPHS_PER_PAGE) + 1;
            html += '<div class="toc-item' + (i === 0 ? ' active' : '') + '" data-id="' + section.id + '" data-page="' + pageForSection + '">';
            html += '<span class="toc-num">' + (i + 1) + '</span>';
            html += '<span class="toc-label">' + section.title + '</span>';
            html += '</div>';
        });
        els.tocList.innerHTML = html;

        // Click handler — navigates to the page containing the section
        els.tocList.addEventListener('click', function(e) {
            var item = e.target.closest('.toc-item');
            if (!item) return;
            var page = parseInt(item.dataset.page);
            if (page) {
                toggleToc(false);
                setTimeout(function() {
                    goToPage(page);
                }, 100);
            }
        });
    }

    // === END OF BOOK ===
    function appendEndSection() {
        var endDiv = document.createElement('div');
        endDiv.className = 'reader-end';
        endDiv.style.display = 'none'; // hidden until last page
        endDiv.innerHTML =
            '<div class="end-icon"><i class="fas fa-bookmark"></i></div>' +
            '<h3>End of Book</h3>' +
            '<p>You have finished reading ' + (bookInfo ? '"' + bookInfo.title + '"' : 'this book') + '. Happy reading!</p>' +
            '<div class="end-actions">' +
            '<a href="" class="end-btn end-btn-primary"><i class="fas fa-home"></i> Home</a>' +
            '<a href="catalog/" class="end-btn end-btn-outline"><i class="fas fa-book"></i> Library</a>' +
            '</div>';
        els.contentWrapper.appendChild(endDiv);
    }

    // === LOAD BOOK CONTENT ===
    function loadBookContent() {
        var urlParams = new URLSearchParams(window.location.search);
        var bookId = parseInt(urlParams.get('id'));

        if (!bookId) {
            if (els.skeleton) els.skeleton.remove();
            showError('No Book Selected', 'Please go back to the library and choose a book to read.');
            return;
        }

        // Try to get book info from BOOKS_DATA
        bookInfo = (typeof BOOKS_DATA !== 'undefined') ? BOOKS_DATA.find(function(b) { return b.id === bookId; }) : null;

        if (bookInfo) {
            els.bookTitle.textContent = bookInfo.title;
            els.miniTitle.textContent = bookInfo.title;
            document.title = bookInfo.title + ' \u2014 Read | BookVoyage';
            els.bookAuthor.innerHTML = 'by <a href="catalog/?q=' + encodeURIComponent(bookInfo.author) + '">' + bookInfo.author + '</a>';
            // Breadcrumb
            if (els.bcBookLink) {
                els.bcBookLink.textContent = bookInfo.title;
                els.bcBookLink.href = 'book-detail/?id=' + bookId;
            }
        }

        // Get content file path from CONTENT_FILES map
        var contentFile = (typeof getContentFile !== 'undefined') ? getContentFile(bookId) : null;

        if (!contentFile) {
            if (els.skeleton) els.skeleton.remove();
            showError('Content Not Found', 'The reading content for this book could not be found.');
            return;
        }

        if (!bookInfo) {
            els.bookTitle.textContent = 'Book #' + bookId;
            els.miniTitle.textContent = 'Book #' + bookId;
            document.title = 'Book #' + bookId + ' \u2014 Read | BookVoyage';
        }

        fetch(contentFile)
            .then(function(res) {
                if (!res.ok) throw new Error('Content file not found');
                return res.text();
            })
            .then(function(text) {
                if (!text) return;

                // Parse content into elements
                allParsedElements = parseContent(text);
                totalPages = Math.ceil(allParsedElements.length / PARAGRAPHS_PER_PAGE);

                // Append end section (hidden by default)
                appendEndSection();

                // Create pagination controls
                createPagination();

                // Build TOC
                buildToc();

                // Render first page (or restore position)
                renderPage(1, false);
                restoreReadingPage();
            })
            .catch(function(err) {
                console.error('Error loading book:', err);
                if (els.skeleton) els.skeleton.remove();
                showError('Content Loading Error', 'An error occurred while loading the book. Please try again.');
            });
    }

    function showError(title, message) {
        els.readingArea.innerHTML =
            '<div class="reading-error">' +
            '<i class="fas fa-book"></i>' +
            '<h3>' + title + '</h3>' +
            '<p>' + message + '</p>' +
            '<a href="" class="end-btn end-btn-primary" style="display:inline-flex;"><i class="fas fa-home"></i> Home</a>' +
            '</div>';
    }

})();
