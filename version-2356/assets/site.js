(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs('.menu-toggle');
        var menu = qs('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
        qsa('a', menu).forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
            });
        });
    }

    function setupHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        var prev = qs('.hero-prev');
        var next = qs('.hero-next');
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                restart();
            });
        }

        setSlide(0);
        restart();
    }

    function setupSearchForms() {
        qsa('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var value = input ? input.value.trim() : '';
                var url = './search.html';
                if (value) {
                    url += '?q=' + encodeURIComponent(value);
                }
                window.location.href = url;
            });
        });
    }

    function setupFilters() {
        var input = qs('.js-filter-input');
        var selects = qsa('.js-filter-select');
        var cards = qsa('.movie-card');
        if (!input && selects.length === 0) {
            return;
        }
        var empty = qs('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (input && initial) {
            input.value = initial;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var term = input ? normalize(input.value) : '';
            var filters = selects.map(function (select) {
                return {
                    key: select.getAttribute('data-filter'),
                    value: normalize(select.value)
                };
            }).filter(function (filter) {
                return filter.key && filter.value;
            });
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var matchesTerm = !term || haystack.indexOf(term) !== -1;
                var matchesFilters = filters.every(function (filter) {
                    return normalize(card.getAttribute('data-' + filter.key)) === filter.value;
                });
                var visible = matchesTerm && matchesFilters;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    window.initMoviePlayer = function (videoId, streamUrl) {
        var video = document.getElementById(videoId);
        if (!video || !streamUrl) {
            return;
        }
        var wrapper = video.closest('.player-wrap');
        var button = wrapper ? wrapper.querySelector('.player-mask') : null;
        var attached = false;
        var hls = null;

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = streamUrl;
        }

        function start() {
            attachSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
