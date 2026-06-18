(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function move(step) {
      showSlide(activeIndex + step);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        move(1);
      }, 5200);
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          move(-1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          move(1);
          restart();
        });
      }
      restart();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var searchInput = scope.querySelector('[data-filter-search]');
    var categorySelect = scope.querySelector('[data-filter-category]');
    var sortSelect = scope.querySelector('[data-sort]');
    var query = normalize(searchInput ? searchInput.value : '');
    var category = categorySelect ? categorySelect.value : '';
    var grid = scope.querySelector('[data-card-grid]');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));
      var categoryMatch = !category || card.getAttribute('data-category') === category;
      var searchMatch = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-filter-hidden', !(categoryMatch && searchMatch));
    });

    if (grid && sortSelect) {
      var sortKey = sortSelect.value;
      cards.sort(function (a, b) {
        if (sortKey === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        if (sortKey === 'likes') {
          return Number(b.getAttribute('data-likes') || 0) - Number(a.getAttribute('data-likes') || 0);
        }
        if (sortKey === 'views') {
          return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
        }
        return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var inputs = scope.querySelectorAll('[data-filter-search], [data-filter-category], [data-sort]');
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        applyFilters(scope);
      });
      input.addEventListener('change', function () {
        applyFilters(scope);
      });
    });

    var searchInput = scope.querySelector('[data-filter-search]');
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchInput.value = q;
      }
    }

    applyFilters(scope);
  });
})();
