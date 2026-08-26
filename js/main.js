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

    async function initMainPopup() {
        const popup = document.querySelector("[data-main-popup]");
        if (!popup) return;

        const closeButtons = popup.querySelectorAll("[data-main-popup-close]");
        const content = popup.querySelector("[data-main-popup-content]");
        const dialog = popup.querySelector(".main-popup-dialog");
        const snooze = popup.querySelector("[data-main-popup-snooze]");
        const snoozeDuration = 7 * 24 * 60 * 60 * 1000;
        let activePopupStorageKey = "";

        function closePopup(rememberChoice) {
            if (rememberChoice && snooze?.checked && activePopupStorageKey) {
                try {
                    window.localStorage.setItem(activePopupStorageKey, String(Date.now() + snoozeDuration));
                } catch (error) {
                    console.warn("팝업 재노출 설정을 저장하지 못했습니다.", error);
                }
            }
            popup.classList.remove("is-open");
            popup.setAttribute("aria-hidden", "true");
            document.body.classList.remove("is-main-popup-open");
            window.setTimeout(() => { popup.hidden = true; }, 200);
        }

        function getPopupStorageKey(data) {
            const identity = String(
                data.popupId
                ?? data.id
                ?? data.popupNo
                ?? [data.title, data.imageUrl, data.exposureStartAt].filter(Boolean).join("|")
                ?? "main"
            );
            let hash = 0;
            for (let index = 0; index < identity.length; index += 1) {
                hash = ((hash << 5) - hash + identity.charCodeAt(index)) | 0;
            }
            return `hunter.mainPopup.hiddenUntil.${Math.abs(hash)}`;
        }

        function isSnoozed(storageKey) {
            try {
                const hiddenUntil = Number(window.localStorage.getItem(storageKey));
                if (hiddenUntil > Date.now()) return true;
                if (hiddenUntil) window.localStorage.removeItem(storageKey);
            } catch (error) {
                console.warn("팝업 재노출 설정을 확인하지 못했습니다.", error);
            }
            return false;
        }

        function isAvailable(data) {
            if (!data || data.isOpen === false) return false;
            const now = Date.now();
            const start = data.exposureStartAt ? new Date(data.exposureStartAt).getTime() : Number.NEGATIVE_INFINITY;
            const end = data.exposureEndAt ? new Date(data.exposureEndAt).getTime() : Number.POSITIVE_INFINITY;
            if (Number.isNaN(start) || Number.isNaN(end) || now < start || now > end) return false;
            return Boolean(data.imageUrl || data.content);
        }

        function safeLink(value) {
            const link = String(value || "");
            return /^(\/|https?:\/\/)/i.test(link) ? link : "";
        }

        function sanitizeHtml(value) {
            const template = document.createElement("template");
            template.innerHTML = String(value || "");
            template.content.querySelectorAll("script, iframe, object, embed").forEach((element) => element.remove());
            template.content.querySelectorAll("*").forEach((element) => {
                [...element.attributes].forEach((attribute) => {
                    if (/^on/i.test(attribute.name) || /javascript:/i.test(attribute.value)) {
                        element.removeAttribute(attribute.name);
                    }
                });
            });
            return template.innerHTML;
        }

        function showPopup(data) {
            if (!content || !isAvailable(data)) {
                closePopup(false);
                return false;
            }

            activePopupStorageKey = getPopupStorageKey(data);
            if (isSnoozed(activePopupStorageKey)) {
                closePopup(false);
                return false;
            }

            content.innerHTML = "";
            if (snooze) snooze.checked = false;
            if (data.imageUrl) {
                const image = document.createElement("img");
                image.src = data.imageUrl;
                image.alt = data.imageAlt || data.title || "메인 팝업";
                image.addEventListener("error", () => image.remove(), { once: true });
                const linkUrl = safeLink(data.linkUrl);
                if (linkUrl) {
                    const link = document.createElement("a");
                    link.href = linkUrl;
                    link.target = data.linkTarget === "_blank" ? "_blank" : "_self";
                    if (link.target === "_blank") link.rel = "noopener noreferrer";
                    link.append(image);
                    content.append(link);
                } else {
                    content.append(image);
                }
            }
            if (data.content) {
                const html = document.createElement("div");
                html.className = "main-popup-html";
                html.innerHTML = sanitizeHtml(data.content);
                content.append(html);
            }

            dialog?.setAttribute("aria-label", data.title || data.imageAlt || "메인 팝업");
            popup.hidden = false;
            popup.setAttribute("aria-hidden", "false");
            document.body.classList.add("is-main-popup-open");
            requestAnimationFrame(() => popup.classList.add("is-open"));
            popup.querySelector(".main-popup-close")?.focus({ preventScroll: true });
            return true;
        }

        window.HunterMainPopup = Object.freeze({ show: showPopup, close: () => closePopup(false) });

        closeButtons.forEach(function (button) {
            button.addEventListener("click", () => closePopup(true));
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && popup.classList.contains("is-open")) {
                closePopup(true);
            }
        });

        if (window.HUNTER_MAIN_POPUP) {
            showPopup(window.HUNTER_MAIN_POPUP);
            return;
        }

        try {
            const popups = await window.HunterFrontAPI?.popups?.getActive();
            const popupData = Array.isArray(popups) ? popups[0] : popups;
            if (popupData) showPopup(popupData);
        } catch (error) {
            console.error("메인 팝업 조회에 실패했습니다.", error);
            closePopup(false);
        }
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
