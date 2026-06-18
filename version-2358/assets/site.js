(function () {
  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
      var slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
      var prev = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

      show(0);
      restart();
    });
  }

  function matchYear(cardYear, selectedYear) {
    var year = Number(cardYear);
    if (!selectedYear) {
      return true;
    }
    if (selectedYear === '2020-2023') {
      return year >= 2020 && year <= 2023;
    }
    if (selectedYear === 'before-2020') {
      return year < 2020;
    }
    return String(cardYear) === selectedYear;
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var form = scope.querySelector('[data-filter-form]');
      var cards = Array.from(scope.querySelectorAll('.movie-card'));
      var count = scope.querySelector('[data-filter-count]');
      var empty = scope.querySelector('[data-empty-state]');
      if (!form || !cards.length) {
        return;
      }

      var searchInput = form.querySelector('[data-filter-search]');
      var regionSelect = form.querySelector('[data-filter-region]');
      var yearSelect = form.querySelector('[data-filter-year]');
      var typeSelect = form.querySelector('[data-filter-type]');
      var categorySelect = form.querySelector('[data-filter-category]');

      function apply() {
        var keyword = (searchInput && searchInput.value || '').trim().toLowerCase();
        var region = regionSelect && regionSelect.value || '';
        var year = yearSelect && yearSelect.value || '';
        var type = typeSelect && typeSelect.value || '';
        var category = categorySelect && categorySelect.value || '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-title') || '').toLowerCase();
          var cardRegion = card.getAttribute('data-region') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (region && cardRegion.indexOf(region) === -1) {
            ok = false;
          }
          if (!matchYear(cardYear, year)) {
            ok = false;
          }
          if (type && cardType.indexOf(type) === -1) {
            ok = false;
          }
          if (category && cardCategory !== category) {
            ok = false;
          }

          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      apply();
    });
  }

  function applyQueryToIndexFilter() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) {
      return;
    }
    var input = document.querySelector('#library [data-filter-search]');
    if (input) {
      input.value = q;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    applyQueryToIndexFilter();
  });
})();
