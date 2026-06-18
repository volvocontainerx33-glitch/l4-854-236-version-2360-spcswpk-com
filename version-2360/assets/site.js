(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        document.body.classList.toggle("menu-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          play();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      show(0);
      play();
    }

    var cardList = document.querySelector("[data-card-list]");
    if (cardList) {
      var cards = Array.prototype.slice.call(cardList.querySelectorAll("[data-card]"));
      var searchInput = document.querySelector("[data-search-input]");
      var typeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]"));
      var channelButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-channel]"));
      var emptyState = document.querySelector("[data-empty-state]");
      var selectedType = "all";
      var selectedChannel = "all";

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (searchInput && query) {
        searchInput.value = query;
      }

      function activate(buttons, activeButton) {
        buttons.forEach(function (button) {
          button.classList.toggle("is-active", button === activeButton);
        });
      }

      function applyFilters() {
        var term = normalize(searchInput ? searchInput.value : "");
        var visibleCount = 0;

        cards.forEach(function (card) {
          var type = normalize(card.getAttribute("data-type"));
          var channel = normalize(card.getAttribute("data-channel"));
          var haystack = normalize(
            [
              card.getAttribute("data-title"),
              card.getAttribute("data-region"),
              card.getAttribute("data-type"),
              card.getAttribute("data-keywords")
            ].join(" ")
          );
          var typeMatch = selectedType === "all" || type.indexOf(normalize(selectedType)) !== -1;
          var channelMatch = selectedChannel === "all" || channel === normalize(selectedChannel);
          var termMatch = !term || haystack.indexOf(term) !== -1;
          var shouldShow = typeMatch && channelMatch && termMatch;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visibleCount += 1;
          }
        });

        if (emptyState) {
          emptyState.style.display = visibleCount ? "none" : "block";
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }

      typeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          selectedType = button.getAttribute("data-filter-type") || "all";
          activate(typeButtons, button);
          applyFilters();
        });
      });

      channelButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          selectedChannel = button.getAttribute("data-filter-channel") || "all";
          activate(channelButtons, button);
          applyFilters();
        });
      });

      applyFilters();
    }
  });
})();
