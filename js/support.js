function getYoutubeId(url = "") {
    const value = String(url).trim();
    const patterns = [
        /youtu\.be\/([^?&#/]+)/,
        /youtube\.com\/watch\?[^#]*v=([^?&#/]+)/,
        /youtube\.com\/embed\/([^?&#/]+)/,
        /youtube\.com\/shorts\/([^?&#/]+)/
    ];
    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match) return match[1];
    }
    return value;
}


function getYoutubeThumbnail(url = "") {
    const id = getYoutubeId(url);
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function playIcon() {
    return '<span class="sub-guide-play" aria-hidden="true"></span>';
}

async function initOperationGuide() {
    const guideContent = document.querySelector("#sub-guide-content");
    const guideTabs = document.querySelectorAll("[data-guide-tab]");
    const modal = document.querySelector(".sub-guide-video-modal");
    const pageTitle = document.querySelector("[data-operation-guide-title] span");
    let visibleVideoCount = window.matchMedia("(max-width: 720px)").matches ? 5 : 6;
    let destroyFeatured = null;
    let pointerFeaturedVideo = null;
    let pointerStartedOnActiveVideo = false;
    let normalizeFeaturedVideoTimer = null;

    if (!guideContent || !guideTabs.length) return;

    const searchParams = new URLSearchParams(window.location.search);
    const requestedCategory = searchParams.get("category") || "alignment";
    const requestedType = searchParams.get("type") === "video" ? "video" : "manual";
    const requestedProduct = searchParams.get("product") || "";
    let categoryInfo = null;
    try {
        categoryInfo = await window.HunterFrontAPI.eog.getCategory(requestedCategory);
    } catch (error) {
        console.error("Equipment Operation Guide를 불러오지 못했습니다.", error);
    }

    const products = Array.isArray(categoryInfo?.products) ? categoryInfo.products : [];
    const manualGroups = products
        .slice()
        .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
        .map(product => ({
            title: product.productName || "Other documents",
            displayOrder: product.displayOrder,
            items: (Array.isArray(product.manuals) ? product.manuals : [])
                .filter(item => item.isExposed !== false)
                .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
                .map(item => {
                    const downloadSetting = item.downloadAllowed ?? item.isDownloadAllowed ?? item.downloadYn;
                    const downloadAllowed = downloadSetting !== false && String(downloadSetting || "Y").toUpperCase() !== "N";
                    return {
                        title: item.title || "",
                        url: downloadAllowed ? (item.fileUrl || "") : "",
                        downloadAllowed
                    };
                })
                .filter(item => item.title && (!item.downloadAllowed || item.url))
        }))
        .filter(group => group.items.length);
    const videos = (Array.isArray(categoryInfo?.videos) ? categoryInfo.videos : [])
        .filter(item => item.isExposed !== false)
        .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
        .map(item => ({ ...item, youtube: item.youtubeUrl || "" }));
    const currentGuide = {
        title: categoryInfo?.categoryName || requestedCategory,
        manual: manualGroups,
        video: videos
    };

    if (pageTitle) pageTitle.textContent = currentGuide.title;

    function renderEmpty(type) {
        guideContent.innerHTML = `
            <section class="sub-guide-group">
                <h4 class="sub-guide-group-title">${type === "manual" ? "Manual" : "Video"}</h4>
                <p>등록된 ${type === "manual" ? "매뉴얼이" : "영상이"} 없습니다.</p>
            </section>
        `;
    }

    function renderManual() {
        destroyFeatured?.();
        destroyFeatured = null;
        if (!currentGuide.manual.length) {
            renderEmpty("manual");
            return;
        }
        guideContent.innerHTML = currentGuide.manual.map(group => `
            <section class="sub-guide-group${isRequestedProduct(group.title) ? " is-requested-product" : ""}">
                <h4 class="sub-guide-group-title">${group.title}</h4>
                <ul class="sub-guide-list">
                    ${group.items.map(item => `
                        <li class="sub-guide-item">
                            ${item.downloadAllowed
                                ? `<a class="sub-guide-item-title" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>`
                                : `<span class="sub-guide-item-title">${item.title}</span>`}
                            ${item.downloadAllowed
                                ? `<a class="sub-guide-view" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="View ${item.title}"><span>view</span></a>`
                                : ""}
                        </li>
                    `).join("")}
                </ul>
            </section>
        `).join("");
        scrollToRequestedProduct();
    }

    function normalizeProductName(value) {
        return String(value || "")
            .replace(/[®Ⓡ™]/g, "")
            .normalize("NFKC")
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]/g, "");
    }

    function isRequestedProduct(productName) {
        if (!requestedProduct) return false;
        return normalizeProductName(productName) === normalizeProductName(requestedProduct);
    }

    function scrollToRequestedProduct() {
        if (!requestedProduct) return;
        const target = guideContent.querySelector(".sub-guide-group.is-requested-product");
        if (!target) return;
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
        });
    }

    function initFeaturedVideo() {
        const slider = guideContent.querySelector(".sub-guide-video-featured-slider");
        const stage = guideContent.querySelector(".sub-guide-video-stage");
        const prev = guideContent.querySelector(".sub-guide-video-prev");
        const next = guideContent.querySelector(".sub-guide-video-next");
        if (!slider || !stage || typeof Swiper === "undefined" || !stage.children.length) return () => {};

        function setActiveCard(swiper) {
            [...stage.children].forEach(card => {
                card.classList.toggle("is-active", card.classList.contains("swiper-slide-active"));
            });
        }


        const featuredCount = stage.children.length > 1 ? stage.children.length / 3 : stage.children.length;

        function normalizePosition(swiper) {
            setActiveCard(swiper);
            if (featuredCount < 2) return;
            if (swiper.activeIndex < featuredCount) swiper.slideTo(swiper.activeIndex + featuredCount, 0, false);
            if (swiper.activeIndex >= featuredCount * 2) swiper.slideTo(swiper.activeIndex - featuredCount, 0, false);
            setActiveCard(swiper);
            swiper.navigation?.update();
        }

        function scheduleNormalize(swiper) {
            setActiveCard(swiper);
            window.clearTimeout(normalizeFeaturedVideoTimer);
            normalizeFeaturedVideoTimer = window.setTimeout(() => normalizePosition(swiper), swiper.params.speed);
        }

        function applyCarouselEffect(swiper) {
            swiper.slides.forEach(slide => {
                if (window.innerWidth <= 720) {
                    slide.style.transform = "";
                    slide.style.zIndex = "";
                    slide.style.opacity = "";
                    slide.style.pointerEvents = "";
                    return;
                }
                const progress = slide.progress;
                const distance = Math.abs(progress);
                const scale = Math.max(.6, 1 - distance * .2);
                const limitedProgress = Math.max(-1, Math.min(1, progress));
                const angle = limitedProgress * Math.PI * 55 / 180;
                const radius = slide.swiperSlideSize * .62;
                const slideCenter = slide.offsetLeft + slide.swiperSlideSize / 2;
                const targetCenter = swiper.width / 2 + Math.sin(angle) * radius;
                const translateX = targetCenter - slideCenter;
                slide.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale})`;
                slide.style.zIndex = String(100 - Math.round(distance));
                slide.style.opacity = distance > 1.01 ? "0" : "1";
                slide.style.pointerEvents = distance > 1.01 ? "none" : "auto";
            });
        }

        function applyCarouselTransition(swiper, duration) {
            swiper.slides.forEach(slide => {
                slide.style.transitionDuration = `${duration}ms`;
            });
        }

        const featuredSwiper = new Swiper(slider, {
            slidesPerView: 1,
            centeredSlides: true,
            initialSlide: featuredCount > 1
                ? featuredCount + (window.matchMedia("(max-width: 720px)").matches ? 0 : Math.min(1, featuredCount - 1))
                : 0,
            speed: 600,
            virtualTranslate: false,
            grabCursor: true,
            watchSlidesProgress: true,
            slideToClickedSlide: true,
            breakpoints: {
                721: {
                    slidesPerView: 1.86,
                    virtualTranslate: true
                }
            },
            navigation: {
                prevEl: next,
                nextEl: prev
            },
            on: {
                init: setActiveCard,
                setTranslate: applyCarouselEffect,
                setTransition: applyCarouselTransition,
                slideChangeTransitionStart: scheduleNormalize
            }
        });

        setActiveCard(featuredSwiper);
        return () => {
            window.clearTimeout(normalizeFeaturedVideoTimer);
            featuredSwiper.destroy(true, true);
        };
    }

    function renderVideo() {
        destroyFeatured?.();
        const videos = currentGuide.video;
        if (!videos.length) {
            renderEmpty("video");
            destroyFeatured = null;
            return;
        }
        const featured = videos.filter(video => video.isFeatured).slice(0, 3);
        const featuredSlides = featured.length > 1 ? [...featured, ...featured, ...featured] : featured;
        const list = videos.slice(0, visibleVideoCount);

        guideContent.innerHTML = `
            ${featured.length ? `<section class="sub-guide-video-feature">
                <div class="sub-guide-video-head">
                    <div class="sub-guide-video-controls sub-slider-controls">
                        <button type="button" class="sub-guide-video-prev sub-slider-button sub-slider-prev" aria-label="이전 영상"></button>
                        <button type="button" class="sub-guide-video-next sub-slider-button sub-slider-next" aria-label="다음 영상"></button>
                    </div>
                </div>
                <div class="sub-guide-video-featured-slider swiper">
                    <div class="sub-guide-video-stage swiper-wrapper">
                        ${featuredSlides.map(video => `
                            <button type="button" class="sub-guide-video-featured-card swiper-slide" data-video-id="${video.eogGuideId}">
                                <span class="sub-guide-video-featured-image">
                                    <img src="${getYoutubeThumbnail(video.youtube)}" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${getYoutubeId(video.youtube)}/hqdefault.jpg';" alt="${video.title}">
                                    ${playIcon()}
                                </span>
                                <span class="sub-guide-video-featured-content">
                                    <strong>${video.title}</strong>
                                    <p>${video.summary}</p>
                                </span>
                            </button>
                        `).join("")}
                    </div>
                </div>
            </section>` : ""}
            <section class="sub-guide-video-list-section">
                <div class="sub-guide-video-list-inner">
                    <div class="sub-guide-video-grid">
                        ${list.map(video => `
                            <button type="button" class="sub-guide-video-card" data-video-id="${video.eogGuideId}">
                                <span class="sub-guide-video-thumb">
                                    <img src="${getYoutubeThumbnail(video.youtube)}" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${getYoutubeId(video.youtube)}/hqdefault.jpg';" alt="${video.title}">
                                </span>
                                <span class="sub-guide-video-card-body">
                                    <strong>${video.title}</strong>
                                    <p>${video.summary}</p>
                                </span>
                            </button>
                        `).join("")}
                    </div>
                    ${visibleVideoCount < videos.length ? '<button type="button" class="sub-guide-more sub-button-more">more</button>' : ''}
                </div>
            </section>
        `;
        destroyFeatured = initFeaturedVideo();
    }

    function renderGuide(type) {
        if (type === "manual") renderManual();
        else renderVideo();
    }

    function openVideoModal(video) {
        if (!modal || !video) return;
        const iframe = modal.querySelector("iframe");
        modal.querySelector("h4").textContent = video.title;
        modal.querySelector("p").textContent = video.summary;
        iframe.src = `https://www.youtube.com/embed/${getYoutubeId(video.youtube)}?autoplay=1&rel=0`;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-guide-video-modal-open");
    }

    function closeVideoModal() {
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modal.querySelector("iframe").src = "";
        document.body.classList.remove("is-guide-video-modal-open");
    }

    function activateGuide(type) {
        guideTabs.forEach(item => {
            const active = item.dataset.guideTab === type;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-selected", String(active));
        });
        renderGuide(type);
    }

    guideTabs.forEach(tab => {
        tab.addEventListener("click", () => activateGuide(tab.dataset.guideTab));
    });

    guideContent.addEventListener("pointerdown", event => {
        pointerFeaturedVideo = event.target.closest(".sub-guide-video-featured-card");
        pointerStartedOnActiveVideo = pointerFeaturedVideo?.classList.contains("swiper-slide-active") || false;
    });

    guideContent.addEventListener("click", event => {
        const videoButton = event.target.closest("[data-video-id]");
        if (videoButton) {
            if (videoButton.classList.contains("sub-guide-video-featured-card")) {
                const canOpen = pointerFeaturedVideo === videoButton
                    ? pointerStartedOnActiveVideo
                    : videoButton.classList.contains("swiper-slide-active");
                pointerFeaturedVideo = null;
                pointerStartedOnActiveVideo = false;
                if (!canOpen) return;
            }
            const video = currentGuide.video.find(item => item.eogGuideId === Number(videoButton.dataset.videoId));
            openVideoModal(video);
            return;
        }
        if (event.target.closest(".sub-guide-more")) {
            visibleVideoCount += 3;
            renderVideo();
        }
    });

    modal?.querySelector(".sub-guide-video-modal-close")?.addEventListener("click", closeVideoModal);
    modal?.querySelector(".sub-guide-video-modal-dim")?.addEventListener("click", closeVideoModal);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal?.classList.contains("is-open")) closeVideoModal();
    });

    activateGuide(requestedType);
}

document.addEventListener("DOMContentLoaded", initOperationGuide);

function initTrainingProgram() {
    const tabs = [...document.querySelectorAll("[data-training-program-tab]")];
    const panels = [...document.querySelectorAll("[data-training-program-panel]")];

    if (!tabs.length || !panels.length) return;

    function activateProgram(type) {
        tabs.forEach(tab => {
            const active = tab.dataset.trainingProgramTab === type;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        panels.forEach(panel => {
            const active = panel.dataset.trainingProgramPanel === type;
            panel.classList.toggle("is-active", active);
            panel.hidden = !active;
        });
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activateProgram(tab.dataset.trainingProgramTab));

        tab.addEventListener("keydown", event => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();

            let nextIndex = index;
            if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
            if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End") nextIndex = tabs.length - 1;

            tabs[nextIndex].focus();
            activateProgram(tabs[nextIndex].dataset.trainingProgramTab);
        });
    });

    const initialTab = tabs.find(tab => tab.classList.contains("is-active")) || tabs[0];
    activateProgram(initialTab.dataset.trainingProgramTab);
}

document.addEventListener("DOMContentLoaded", initTrainingProgram);
