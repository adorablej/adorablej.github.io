(() => {
    "use strict";

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMainPopup, { once: true });
    } else {
        initMainPopup();
    }

    /*
     * DOM이 모두 로드된 뒤
     * 메인 페이지 기능 초기화
     */
    window.addEventListener("includeLoaded", initMain, { once: true });

    function initMain() {
        initMainVisual();
        initSupportSlider();
        initMediaSection();
    }

    function initMainPopup() {
        const popup = document.querySelector("[data-main-popup]");
        if (!popup) return;

        const closeButtons = popup.querySelectorAll("[data-main-popup-close]");

        function closePopup() {
            popup.classList.remove("is-open");
            popup.setAttribute("aria-hidden", "true");
            document.body.classList.remove("is-main-popup-open");
        }

        document.body.classList.add("is-main-popup-open");
        popup.querySelector(".main-popup-close")?.focus({ preventScroll: true });

        closeButtons.forEach(function (button) {
            button.addEventListener("click", closePopup);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && popup.classList.contains("is-open")) {
                closePopup();
            }
        });
    }


    function initSupportSlider() {
        const supportCards = document.querySelector(".support-cards-mobile");

        if (!supportCards) return;

        return new Swiper(supportCards, {
            slidesPerView: "auto",
            spaceBetween: 16,
            slidesOffsetBefore: 25,
            slidesOffsetAfter: 25,
            watchOverflow: true,
            breakpoints: {
                768: {
                    enabled: false
                }
            }
        });
    }

    /**
     * Section 01 : Main Visual
     *
     * 메인 비주얼 첫 번째 영상 고정 노출
     * - 슬라이드 구조는 추후 재사용할 수 있도록 유지
     * - 하단 진행선은 영상 재생률과 연동
     */
    function initMainVisual() {
        const visual = document.querySelector(".main-visual-swiper");

        if (!visual) return;

        const visualVideos = [...visual.querySelectorAll("video")];
        const visualPagination = visual.querySelector(".main-visual-pagination");
        let progressAnimationFrame = 0;

        if (visualPagination) {
            visualPagination.innerHTML = `
                <div class="main-visual-video-progress">
                    <button type="button" class="main-visual-video-track" aria-label="영상 재생 위치 이동">
                        <span class="main-visual-video-fill"></span>
                    </button>
                </div>
            `;
        }

        const videoProgressTrack = visualPagination?.querySelector(".main-visual-video-track");
        const videoProgressFill = visualPagination?.querySelector(".main-visual-video-fill");

        visualVideos.forEach(video => {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.setAttribute("muted", "");
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");
        });

        const syncVisualVideo = swiper => {
            swiper.slides.forEach(slide => {
                slide.querySelectorAll("video").forEach(video => {
                    const isVisible = window.getComputedStyle(video).display !== "none";

                    if (slide.classList.contains("swiper-slide-active") && isVisible) {
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            });
        };

        const visualSwiper = new Swiper(visual, {
            loop: false,
            initialSlide: 0,
            allowTouchMove: false,
            simulateTouch: false,

            speed: 900,

            /*
             * Swiper 기본 접근성 안내
             */
            a11y: {
                enabled: true,
                prevSlideMessage: "이전 슬라이드",
                nextSlideMessage: "다음 슬라이드"
            },

            on: {
                init: syncVisualVideo,
                slideChangeTransitionStart: syncVisualVideo
            }
        });

        const getVisibleVideo = () => {
            const firstSlide = visualSwiper.slides[0];

            return [...(firstSlide?.querySelectorAll("video") || [])].find(video =>
                window.getComputedStyle(video).display !== "none"
            );
        };

        const updateVideoProgress = () => {
            const video = getVisibleVideo();
            const progress = video?.duration ? video.currentTime / video.duration : 0;

            videoProgressFill?.style.setProperty("--video-progress", String(Math.min(Math.max(progress, 0), 1)));

            if (video && !video.paused && !video.ended) {
                progressAnimationFrame = window.requestAnimationFrame(updateVideoProgress);
            }
        };

        const startVideoProgress = () => {
            window.cancelAnimationFrame(progressAnimationFrame);
            updateVideoProgress();
        };

        visualVideos.forEach(video => {
            video.addEventListener("play", startVideoProgress);
            video.addEventListener("loadedmetadata", updateVideoProgress);
            video.addEventListener("seeking", updateVideoProgress);
            video.addEventListener("ended", updateVideoProgress);
        });

        startVideoProgress();

        videoProgressTrack?.addEventListener("click", event => {
            const video = getVisibleVideo();
            if (!video?.duration) return;

            const rect = videoProgressTrack.getBoundingClientRect();
            const progress = (event.clientX - rect.left) / rect.width;
            video.currentTime = Math.min(Math.max(progress, 0), 1) * video.duration;
            updateVideoProgress();
        });

        const retryActiveVideo = () => {
            syncVisualVideo(visualSwiper);
            startVideoProgress();
        };

        visualVideos.forEach(video => {
            video.addEventListener("loadeddata", retryActiveVideo);
            video.addEventListener("canplay", retryActiveVideo, { once: true });
        });

        window.addEventListener("pageshow", retryActiveVideo);
        window.addEventListener("resize", updateVideoProgress);
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) retryActiveVideo();
        });
        document.addEventListener("pointerdown", retryActiveVideo, { once: true });

        return visualSwiper;
    }

    /**
     * Section 06 : Media
     *
     * 우측 미디어 카드를 클릭하면
     * - 클릭한 카드에 is-active 클래스 적용
     * - 좌측 큰 영역의 이미지, 카테고리, 제목, 설명 교체
     */
    function initMediaSection() {
        const mediaSection = document.querySelector(".media-section");

        if (!mediaSection) return;

        // 프로모션 공용 데이터로 렌더링되는 영역은 media.js에서 제어한다.
        if (mediaSection.querySelector("#mediaMainPromotionList")) return;

        /*
         * 좌측 Featured 영역
         */
        const featuredImage = mediaSection.querySelector(
            ".media-featured-image img"
        );

        const featuredCategory = mediaSection.querySelector(
            ".media-featured .media-card-category"
        );

        const featuredTitle = mediaSection.querySelector(
            ".media-featured .media-card-title"
        );

        const featuredText = mediaSection.querySelector(
            ".media-featured .media-card-text"
        );

        /*
         * 우측 목록 카드
         */
        const mediaItems = mediaSection.querySelectorAll(".media-item");

        /*
         * 필요한 요소가 없으면 기능 실행 중단
         */
        if (
            !featuredImage ||
            !featuredCategory ||
            !featuredTitle ||
            !featuredText ||
            mediaItems.length === 0
        ) {
            return;
        }

        mediaItems.forEach((item) => {
            item.addEventListener("click", () => {
                /*
                 * 클릭한 카드의 data 속성값
                 */
                const image = item.dataset.image;
                const category = item.dataset.category;
                const title = item.dataset.title;
                const description = item.dataset.desc;

                /*
                 * 기존 활성 카드 해제
                 */
                mediaItems.forEach((mediaItem) => {
                    mediaItem.classList.remove("is-active");
                });

                /*
                 * 클릭한 카드 활성화
                 */
                item.classList.add("is-active");

                /*
                 * 좌측 Featured 내용 교체
                 */
                if (image) {
                    featuredImage.src = image;
                    featuredImage.alt = title || "";
                }

                if (category) {
                    featuredCategory.textContent = category;
                }

                if (title) {
                    featuredTitle.textContent = title;
                }

                if (description) {
                    featuredText.textContent = description;
                }
            });
        });
    }
})();
