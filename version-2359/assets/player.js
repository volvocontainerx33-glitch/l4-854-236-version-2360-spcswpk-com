(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');
    var poster = player.getAttribute('data-poster');
    var loaded = false;
    var hls = null;
    var state = document.createElement('span');

    state.className = 'player-state';
    state.textContent = '准备播放';
    player.appendChild(state);

    if (poster) {
      video.setAttribute('poster', poster);
    }

    function attachStream() {
      if (loaded || !stream) {
        return;
      }
      loaded = true;
      state.textContent = '加载中';

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          state.textContent = '正在播放';
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            state.textContent = '暂时无法播放，请稍后再试';
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          state.textContent = '正在播放';
        }, { once: true });
      } else {
        state.textContent = '暂时无法播放，请稍后再试';
      }
    }

    function startPlay() {
      attachStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          state.textContent = '点击继续播放';
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlay();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      state.textContent = '正在播放';
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      state.textContent = '已暂停';
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.player[data-stream]').forEach(setupPlayer);
})();
