import { H as Hls } from "../assets/hls-vendor-dru42stk.js";

function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var message = player.querySelector("[data-player-message]");
    var source = video ? video.getAttribute("data-hls") : "";
    var loaded = false;
    var hls = null;

    function showMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
    }

    function loadSource() {
        if (!video || loaded || !source) {
            return;
        }
        loaded = true;
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    showMessage("视频正在重新连接");
                    return;
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    showMessage("视频正在恢复播放");
                    return;
                }
                showMessage("视频暂时无法播放");
            });
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        showMessage("当前浏览器暂不支持播放");
    }

    function play() {
        loadSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                showMessage("点击视频画面可继续播放");
            });
        }
    }

    if (!video || !button) {
        return;
    }

    button.addEventListener("click", function () {
        play();
    });

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", function () {
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
    });

    video.addEventListener("pause", function () {
        if (!video.ended) {
            player.classList.remove("is-playing");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
