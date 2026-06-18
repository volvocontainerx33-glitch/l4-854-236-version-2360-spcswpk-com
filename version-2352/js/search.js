(function () {
    function params() {
        return new URLSearchParams(window.location.search);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class="movie-card">",
            "<a href="./" + escapeHtml(movie.url) + "" aria-label="观看 " + escapeHtml(movie.title) + "">",
            "<div class="poster-frame">",
            "<img src="./" + escapeHtml(movie.image) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy" onerror="this.style.display='none';">",
            "<span class="card-badge">" + escapeHtml(movie.category) + "</span>",
            "<span class="card-year">" + escapeHtml(movie.year) + "</span>",
            "<span class="play-mark">▶</span>",
            "</div>",
            "<div class="card-body">",
            "<h3>" + escapeHtml(movie.title) + "</h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class="card-tags">" + tags + "</div>",
            "<div class="card-meta"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function runSearch() {
        var q = (params().get("q") || "").trim();
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        var count = document.querySelector("[data-search-count]");
        var results = document.querySelector("[data-search-results]");
        var movies = window.movieSearchIndex || [];
        if (input) {
            input.value = q;
        }
        if (!results) {
            return;
        }
        if (!q) {
            var hot = movies.slice(0, 24);
            title.textContent = "热门搜索";
            count.textContent = "精选热门影片与分类内容";
            results.innerHTML = hot.map(card).join("");
            return;
        }
        var keyword = q.toLowerCase();
        var matched = movies.filter(function (movie) {
            var text = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                movie.category,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return text.indexOf(keyword) !== -1;
        }).slice(0, 120);
        title.textContent = "搜索结果：" + q;
        count.textContent = matched.length ? "为你找到相关影片" : "没有找到相关影片";
        results.innerHTML = matched.length ? matched.map(card).join("") : "<div class="empty-result">换一个关键词试试</div>";
    }

    runSearch();
})();
