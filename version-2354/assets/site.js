(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupHeaderSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupSearchPage() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var reset = document.querySelector("[data-filter-reset]");
    var line = document.querySelector("[data-result-line]");
    if (!cards.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function valueOf(element) {
      return element ? element.value.trim() : "";
    }

    function apply() {
      var q = input.value.trim().toLowerCase();
      var selectedRegion = valueOf(region);
      var selectedType = valueOf(type);
      var selectedYear = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var okQuery = !q || text.indexOf(q) !== -1;
        var okRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
        var okType = !selectedType || card.getAttribute("data-type") === selectedType;
        var okYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var ok = okQuery && okRegion && okType && okYear;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (line) {
        line.textContent = "匹配影片 " + visible + " 部";
      }
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        input.value = "";
        if (region) {
          region.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupSearchPage();
  });
})();
