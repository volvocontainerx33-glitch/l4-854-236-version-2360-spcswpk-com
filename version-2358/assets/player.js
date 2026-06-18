(function () {
  function setStatus(player, message) {
    var status = player.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-start]');
    var hlsUrl = player.getAttribute('data-hls');
    var hlsInstance = null;

    if (!video || !hlsUrl) {
      setStatus(player, '播放器缺少视频源。');
      return;
    }

    function markLoading(isLoading) {
      player.classList.toggle('is-loading', Boolean(isLoading));
    }

    function initHls() {
      markLoading(true);
      setStatus(player, '正在初始化 HLS 播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          markLoading(false);
          setStatus(player, '播放源已就绪，点击播放按钮开始观看');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            markLoading(false);
            setStatus(player, '视频加载失败，请稍后刷新重试。');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', function () {
          markLoading(false);
          setStatus(player, '播放源已就绪，点击播放按钮开始观看');
        }, { once: true });
        return;
      }

      markLoading(false);
      setStatus(player, '当前浏览器不支持 HLS 播放。');
    }

    function startPlayback() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus(player, '请再次点击播放按钮开始观看。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function () {
        startPlayback();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });

    initHls();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-video-player]').forEach(setupPlayer);
  });
})();
