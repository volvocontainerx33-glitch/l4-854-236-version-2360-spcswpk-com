(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function play(video) {
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {});
    }
  }

  function useHls(video, streamUrl, Hls) {
    if (Hls && Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        play(video);
      });
      return;
    }
    video.src = streamUrl;
    play(video);
  }

  function loadRemoteHls(callback, fallback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }

    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", function () {
        callback(window.Hls);
      });
      existing.addEventListener("error", fallback);
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", function () {
      callback(window.Hls);
    });
    script.addEventListener("error", fallback);
    document.head.appendChild(script);
  }

  function attachStream(video, streamUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = streamUrl;
      }
      play(video);
      return;
    }

    import("./hls.js").then(function (module) {
      var Hls = module.H;
      if (Hls && Hls.isSupported()) {
        useHls(video, streamUrl, Hls);
      } else {
        loadRemoteHls(function (RemoteHls) {
          useHls(video, streamUrl, RemoteHls);
        }, function () {
          video.src = streamUrl;
          play(video);
        });
      }
    }).catch(function () {
      loadRemoteHls(function (RemoteHls) {
        useHls(video, streamUrl, RemoteHls);
      }, function () {
        video.src = streamUrl;
        play(video);
      });
    });
  }

  window.initPlayback = function (streamUrl) {
    ready(function () {
      var video = document.querySelector(".movie-video");
      var cover = document.querySelector(".play-cover");
      var started = false;
      if (!video || !streamUrl) {
        return;
      }

      function begin() {
        if (!started) {
          started = true;
          attachStream(video, streamUrl);
        } else {
          play(video);
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }

      if (cover) {
        cover.addEventListener("click", begin);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
    });
  };
})();
