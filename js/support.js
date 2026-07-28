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

function initOperationGuide() {
    const guideContent = document.querySelector("#sub-guide-content");
    const guideHeading = document.querySelector("#sub-guide-heading");
    const guideTabs = document.querySelectorAll("[data-guide-tab]");
    const modal = document.querySelector(".sub-guide-video-modal");
    let visibleVideoCount = 6;
    let destroyFeatured = null;

    if (!guideContent || !guideHeading || !guideTabs.length) return;

    function renderManual() {
        destroyFeatured?.();
        destroyFeatured = null;
        guideContent.innerHTML = operationGuideData.manual.map(group => `
            <section class="sub-guide-group">
                <h4 class="sub-guide-group-title">${group.title}</h4>
                <ul class="sub-guide-list">
                    ${group.items.map(item => `
                        <li class="sub-guide-item">
                            <span class="sub-guide-item-title">${item.title}</span>
                            <a class="sub-guide-view" href="${item.url}" aria-label="View ${item.title}"><span>view</span></a>
                        </li>
                    `).join("")}
                </ul>
            </section>
        `).join("");
    }

    function initFeaturedVideo() {
        const stage = guideContent.querySelector(".sub-guide-video-stage");
        const cards = [...guideContent.querySelectorAll(".sub-guide-video-featured-card")];
        const prev = guideContent.querySelector(".sub-guide-video-prev");
        const next = guideContent.querySelector(".sub-guide-video-next");
        if (!stage || cards.length !== 3) return () => {};

        let index = 1;
        let animating = false;

        function positions() {
            return {
                left: (index - 1 + cards.length) % cards.length,
                center: index,
                right: (index + 1) % cards.length
            };
        }

        function vars(position) {
            const sideDistance = window.innerWidth * 370 / 1920;
            const sideY = window.innerWidth * 40 / 1920;
            if (position === "center") {
                return { xPercent: -50, x: 0, y: 0, scale: 1, opacity: 1, zIndex: 5, visibility: "visible" };
            }
            return {
                xPercent: -50,
                x: position === "left" ? -sideDistance : sideDistance,
                y: sideY,
                scale: .8,
                opacity: 1,
                zIndex: 2,
                visibility: "visible"
            };
        }

        function updateHeight() {
            const maxHeight = Math.max(...cards.map(card => card.offsetHeight));
            stage.style.height = `${Math.ceil(maxHeight)}px`;
        }

        function applyState() {
            const current = positions();
            cards.forEach((card, cardIndex) => {
                let position = "right";
                if (cardIndex === current.left) position = "left";
                if (cardIndex === current.center) position = "center";
                card.classList.toggle("is-active", position === "center");
                card.style.pointerEvents = "auto";
                gsap.set(card, vars(position));
            });
            requestAnimationFrame(updateHeight);
        }

        function move(direction) {
            if (animating) return;
            animating = true;
            prev?.setAttribute("disabled", "");
            next?.setAttribute("disabled", "");

            const current = positions();
            const outgoingIndex = direction > 0 ? current.left : current.right;
            const centerIndex = current.center;
            const incomingIndex = direction > 0 ? current.right : current.left;
            const outgoingCard = cards[outgoingIndex];
            const centerCard = cards[centerIndex];
            const incomingCard = cards[incomingIndex];
            const incomingPosition = direction > 0 ? "right" : "left";
            const outgoingPosition = direction > 0 ? "left" : "right";

            cards.forEach(card => card.classList.remove("is-active"));
            incomingCard.classList.add("is-active");

            const clone = outgoingCard.cloneNode(true);
            const sideDistance = window.innerWidth * 370 / 1920;
            const enterDistance = window.innerWidth * 170 / 1920;
            const cloneExitX = direction > 0 ? -sideDistance - enterDistance : sideDistance + enterDistance;
            const incomingStartX = direction > 0 ? sideDistance + enterDistance : -sideDistance - enterDistance;

            clone.removeAttribute("data-video-id");
            clone.setAttribute("aria-hidden", "true");
            clone.style.pointerEvents = "none";
            stage.appendChild(clone);
            gsap.set(clone, vars(outgoingPosition));
            gsap.set(outgoingCard, { ...vars(incomingPosition), x: incomingStartX, zIndex: 1 });

            gsap.timeline({
                defaults: { duration: .6, ease: "power3.inOut", overwrite: true },
                onComplete: () => {
                    index = incomingIndex;
                    clone.remove();
                    applyState();
                    animating = false;
                    prev?.removeAttribute("disabled");
                    next?.removeAttribute("disabled");
                }
            })
                .to(clone, { x: cloneExitX, opacity: 0, scale: .74, duration: .48, ease: "power2.in" }, 0)
                .to(centerCard, vars(outgoingPosition), 0)
                .to(incomingCard, vars("center"), 0)
                .to(outgoingCard, vars(incomingPosition), .08);
        }

        const onPrev = () => move(-1);
        const onNext = () => move(1);
        const onResize = () => { if (!animating) applyState(); };

        prev?.addEventListener("click", onPrev);
        next?.addEventListener("click", onNext);
        cards.forEach((card, cardIndex) => {
            card.addEventListener("click", event => {
                if (card.classList.contains("is-active") || animating) return;
                event.preventDefault();
                event.stopPropagation();
                const current = positions();
                if (cardIndex === current.left) move(-1);
                if (cardIndex === current.right) move(1);
            });
            const image = card.querySelector("img");
            if (image && !image.complete) image.addEventListener("load", updateHeight, { once: true });
        });
        window.addEventListener("resize", onResize);
        applyState();

        return () => {
            prev?.removeEventListener("click", onPrev);
            next?.removeEventListener("click", onNext);
            window.removeEventListener("resize", onResize);
        };
    }

    function renderVideo() {
        destroyFeatured?.();
        const videos = operationGuideData.video;
        const featured = videos.filter(video => video.featured).slice(0, 3);
        const list = videos.slice(0, visibleVideoCount);

        guideContent.innerHTML = `
            <section class="sub-guide-video-feature">
                <div class="sub-guide-video-head">
                    <h4 class="sub-guide-video-heading">Featured Video<span>.</span></h4>
                    <div class="sub-guide-video-controls sub-slider-controls">
                        <button type="button" class="sub-guide-video-prev sub-slider-button sub-slider-prev" aria-label="이전 영상"></button>
                        <button type="button" class="sub-guide-video-next sub-slider-button sub-slider-next" aria-label="다음 영상"></button>
                    </div>
                </div>
                <div class="sub-guide-video-featured-slider">
                    <div class="sub-guide-video-stage">
                        ${featured.map(video => `
                            <button type="button" class="sub-guide-video-featured-card" data-video-id="${video.id}">
                                <span class="sub-guide-video-featured-image">
                                    <img src="${getYoutubeThumbnail(video.youtube)}" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${getYoutubeId(video.youtube)}/hqdefault.jpg';" alt="${video.title}">
                                    ${playIcon()}
                                </span>
                                <span class="sub-guide-video-featured-content">
                                    <strong>${video.title}</strong>
                                    <p>${video.description}</p>
                                </span>
                            </button>
                        `).join("")}
                    </div>
                </div>
            </section>
            <section class="sub-guide-video-list-section">
                <div class="sub-guide-video-list-inner">
                    <div class="sub-guide-video-grid">
                        ${list.map(video => `
                            <button type="button" class="sub-guide-video-card" data-video-id="${video.id}">
                                <span class="sub-guide-video-thumb">
                                    <img src="${getYoutubeThumbnail(video.youtube)}" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${getYoutubeId(video.youtube)}/hqdefault.jpg';" alt="${video.title}">
                                </span>
                                <span class="sub-guide-video-card-body">
                                    <strong>${video.title}</strong>
                                    <p>${video.description}</p>
                                </span>
                            </button>
                        `).join("")}
                    </div>
                    ${visibleVideoCount < videos.length ? '<button type="button" class="sub-guide-more"><span>more</span></button>' : ''}
                </div>
            </section>
        `;
        destroyFeatured = initFeaturedVideo();
    }

    function renderGuide(type) {
        guideHeading.innerHTML = `${type === "manual" ? "Manual" : "Video"}<span>.</span>`;
        if (type === "manual") renderManual();
        else renderVideo();
    }

    function openVideoModal(video) {
        if (!modal || !video) return;
        const iframe = modal.querySelector("iframe");
        modal.querySelector("h4").textContent = video.title;
        modal.querySelector("p").textContent = video.description;
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

    guideTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const type = tab.dataset.guideTab;
            guideTabs.forEach(item => {
                const active = item === tab;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", String(active));
            });
            renderGuide(type);
        });
    });

    guideContent.addEventListener("click", event => {
        const videoButton = event.target.closest("[data-video-id]");
        if (videoButton) {
            if (videoButton.classList.contains("sub-guide-video-featured-card") && !videoButton.classList.contains("is-active")) return;
            const video = operationGuideData.video.find(item => item.id === Number(videoButton.dataset.videoId));
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

    renderGuide("manual");
}

document.addEventListener("DOMContentLoaded", initOperationGuide);
