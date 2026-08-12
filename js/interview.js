function getHunterPrideYoutubeId(url = "") {
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

function getHunterPrideYoutubeThumbnail(url = "") {
    return `https://img.youtube.com/vi/${getHunterPrideYoutubeId(url)}/maxresdefault.jpg`;
}

function hunterPridePlayIcon() {
    return '<span class="sub-pride-play-button" aria-hidden="true"></span>';
}

function initHunterPrideInterviewPage() {
    const page = document.querySelector(".sub-pride-interview-page");
    const stage = document.querySelector("#sub-pride-featured-stage");
    const grid = document.querySelector("#sub-pride-interview-grid");
    const modal = document.querySelector(".sub-pride-interview-modal");
    const prev = page?.querySelector(".sub-pride-interview-prev");
    const next = page?.querySelector(".sub-pride-interview-next");
    const more = page?.querySelector(".sub-pride-more-button");

    if (!page || !stage || !grid || !modal || !Array.isArray(hunterPrideInterviewData)) return;

    const featured = hunterPrideInterviewData.filter(item => item.featured);
    const featuredSlides = featured.length > 1 ? [...featured, ...featured, ...featured] : featured;
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    let visibleCount = isMobile ? 5 : 9;
    let index = isMobile ? 0 : (featured.length > 1 ? 1 : 0);
    let pointerFeaturedCard = null;
    let pointerStartedOnActiveCard = false;
    let normalizeFeaturedTimer = null;

    function imageMarkup(item) {
        const id = getHunterPrideYoutubeId(item.youtube);
        const thumbnail = String(item.thumbnail || "").trim() || getHunterPrideYoutubeThumbnail(item.youtube);
        return `<img src="${thumbnail}"
                     onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${id}/hqdefault.jpg';"
                     alt="${item.title}">`;
    }

    function renderFeatured() {
        stage.innerHTML = featuredSlides.map(item => `
            <button type="button" class="sub-pride-featured-card swiper-slide" data-interview-id="${item.id}">
                <span class="sub-pride-featured-image">
                    ${imageMarkup(item)}
                    ${hunterPridePlayIcon()}
                </span>
                <span class="sub-pride-featured-content">
                    <strong>${item.title}</strong>
                    <p>${item.description}</p>
                </span>
            </button>
        `).join("");

        initFeaturedMotion();
    }

    function renderList() {
        const list = hunterPrideInterviewData.slice(0, visibleCount);

        grid.innerHTML = list.map(item => `
            <button type="button" class="sub-pride-interview-card" data-interview-id="${item.id}">
                <span class="sub-pride-interview-image">
                    ${imageMarkup(item)}
                </span>
                <span class="sub-pride-interview-content">
                    <strong>${item.title}</strong>
                    <p>${item.description}</p>
                </span>
            </button>
        `).join("");

        more.classList.toggle("is-hidden", visibleCount >= hunterPrideInterviewData.length);
    }

    function initFeaturedMotion() {
        if (typeof Swiper === "undefined" || !stage.children.length) return;

        function setActiveCard(swiper) {
            [...stage.children].forEach(card => {
                card.classList.toggle("is-active", card.classList.contains("swiper-slide-active"));
            });
        }

        function normalizePosition(swiper) {
            setActiveCard(swiper);
            if (featured.length < 2) return;
            if (swiper.activeIndex < featured.length) swiper.slideTo(swiper.activeIndex + featured.length, 0, false);
            if (swiper.activeIndex >= featured.length * 2) swiper.slideTo(swiper.activeIndex - featured.length, 0, false);
            setActiveCard(swiper);
            swiper.navigation?.update();
        }

        function scheduleNormalize(swiper) {
            setActiveCard(swiper);
            window.clearTimeout(normalizeFeaturedTimer);
            normalizeFeaturedTimer = window.setTimeout(() => normalizePosition(swiper), swiper.params.speed);
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

        const featuredSwiper = new Swiper(page.querySelector(".sub-pride-featured-slider"), {
            slidesPerView: 1,
            centeredSlides: true,
            initialSlide: featured.length > 1 ? featured.length + index : index,
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
                prevEl: prev,
                nextEl: next
            },
            on: {
                init: setActiveCard,
                setTranslate: applyCarouselEffect,
                setTransition: applyCarouselTransition,
                slideChangeTransitionStart: scheduleNormalize
            }
        });

        setActiveCard(featuredSwiper);
    }

    function openModal(item) {
        if (!item) return;

        const iframe = modal.querySelector("iframe");
        const title = modal.querySelector("h4");
        const description = modal.querySelector("p");
        const date = modal.querySelector("time");

        iframe.src = `https://www.youtube.com/embed/${getHunterPrideYoutubeId(item.youtube)}?autoplay=1&rel=0`;
        title.textContent = item.title;
        description.textContent = item.description;
        date.textContent = item.date || "";
        date.setAttribute("datetime", (item.date || "").replaceAll(".", "-"));

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-modal-open");
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modal.querySelector("iframe").src = "";
        document.body.classList.remove("is-modal-open");
    }

    page.addEventListener("pointerdown", event => {
        pointerFeaturedCard = event.target.closest(".sub-pride-featured-card");
        pointerStartedOnActiveCard = pointerFeaturedCard?.classList.contains("swiper-slide-active") || false;
    });

    page.addEventListener("click", event => {
        const card = event.target.closest("[data-interview-id]");
        if (!card) return;

        if (card.classList.contains("sub-pride-featured-card")) {
            const canOpen = pointerFeaturedCard === card
                ? pointerStartedOnActiveCard
                : card.classList.contains("swiper-slide-active");
            pointerFeaturedCard = null;
            pointerStartedOnActiveCard = false;
            if (!canOpen) return;
        }

        const item = hunterPrideInterviewData.find(data => data.id === Number(card.dataset.interviewId));
        openModal(item);
    });

    more?.addEventListener("click", () => {
        visibleCount += 3;
        renderList();
    });

    modal.querySelector(".sub-pride-interview-close")?.addEventListener("click", closeModal);
    modal.querySelector(".sub-pride-interview-overlay")?.addEventListener("click", closeModal);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    renderFeatured();
    renderList();
}

document.addEventListener("DOMContentLoaded", initHunterPrideInterviewPage);
