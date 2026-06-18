(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === current);
            });
        }
        function restart() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupFilters() {
        var pages = Array.prototype.slice.call(document.querySelectorAll('.filter-page'));
        pages.forEach(function (page) {
            var input = page.querySelector('.page-search');
            var buttons = Array.prototype.slice.call(page.querySelectorAll('.filter-btn'));
            var clear = page.querySelector('.clear-filter');
            var items = Array.prototype.slice.call(page.querySelectorAll('.movie-item'));
            var selected = 'all';
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            if (input && initialQuery) {
                input.value = initialQuery;
            }
            function apply() {
                var query = normalize(input ? input.value : '');
                items.forEach(function (item) {
                    var combined = normalize([
                        item.dataset.title,
                        item.dataset.category,
                        item.dataset.genre,
                        item.dataset.year,
                        item.dataset.region,
                        item.dataset.keywords
                    ].join(' '));
                    var matchText = !query || combined.indexOf(query) !== -1;
                    var matchCategory = selected === 'all' || item.dataset.category === selected;
                    item.classList.toggle('hidden', !(matchText && matchCategory));
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    selected = button.dataset.filter || 'all';
                    buttons.forEach(function (entry) {
                        entry.classList.toggle('active', entry === button);
                    });
                    apply();
                });
            });
            if (clear) {
                clear.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    selected = 'all';
                    buttons.forEach(function (button) {
                        button.classList.toggle('active', button.dataset.filter === 'all');
                    });
                    apply();
                });
            }
            apply();
        });
    }

    function setupImageFallback() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
            }, { once: true });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupImageFallback();
    });
})();
