(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var container = panel.closest('section') || document;
      var list = container.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var searchInput = panel.querySelector('[data-filter-search]');
      var typeInput = panel.querySelector('[data-filter-type]');
      var yearInput = panel.querySelector('[data-filter-year]');
      var categoryInput = panel.querySelector('[data-filter-category]');
      var countLabel = panel.querySelector('[data-filter-count]');

      var params = new URLSearchParams(window.location.search);
      if (searchInput && params.get('q')) {
        searchInput.value = params.get('q');
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var text = normalize(searchInput && searchInput.value);
        var type = normalize(typeInput && typeInput.value);
        var year = normalize(yearInput && yearInput.value);
        var category = normalize(categoryInput && categoryInput.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var matched = true;

          if (text && haystack.indexOf(text) === -1) {
            matched = false;
          }
          if (type && cardType.indexOf(type) === -1) {
            matched = false;
          }
          if (year && cardYear.indexOf(year) === -1) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }

          card.classList.toggle('is-hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (countLabel) {
          countLabel.textContent = '筛选结果已更新';
        }
      }

      [searchInput, typeInput, yearInput, categoryInput].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (wrap) {
      var button = wrap.querySelector('[data-play-button]');
      var poster = wrap.querySelector('.player-poster');
      var video = wrap.querySelector('video');
      var message = wrap.querySelector('[data-player-message]');
      var src = wrap.getAttribute('data-src');

      if (!button || !video || !src) {
        return;
      }

      button.addEventListener('click', function () {
        button.disabled = true;
        if (message) {
          message.textContent = '正在初始化播放源…';
        }

        if (poster) {
          poster.classList.add('is-hidden');
        }
        video.classList.add('is-active');
        video.setAttribute('controls', 'controls');

        if (window.Hls && window.Hls.isSupported()) {
          if (video._hlsInstance) {
            video._hlsInstance.destroy();
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          video._hlsInstance = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video, message);
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (message && data && data.fatal) {
              message.textContent = '播放源暂时无法加载，请刷新页面后重试。';
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            playVideo(video, message);
          }, { once: true });
          return;
        }

        video.src = src;
        playVideo(video, message);
      });
    });
  }

  function playVideo(video, message) {
    var playPromise = video.play();
    if (message) {
      message.textContent = '播放器已连接 HLS 播放源。';
    }
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (message) {
          message.textContent = '播放源已就绪，请点击视频控件开始播放。';
        }
      });
    }
  }
})();
