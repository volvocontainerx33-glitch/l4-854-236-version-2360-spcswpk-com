(function () {
    function attach(video, source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }
        video.src = source;
        return null;
    }

    window.initMoviePlayer = function (source) {
        var shell = document.getElementById('movie-player');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        if (!video) {
            return;
        }
        var attached = false;
        function start() {
            if (!attached) {
                attach(video, source);
                attached = true;
            }
            if (cover) {
                cover.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };
})();
