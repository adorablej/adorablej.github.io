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

    const featured = hunterPrideInterviewData.filter(item => item.featured).slice(0, 3);
    let visibleCount = 9;
    let index = featured.length > 1 ? 1 : 0;
    let animating = false;

    function imageMarkup(item) {
        const id = getHunterPrideYoutubeId(item.youtube);
        return `<img src="${getHunterPrideYoutubeThumbnail(item.youtube)}"
                     onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${id}/hqdefault.jpg';"
                     alt="${item.title}">`;
    }

    function renderFeatured() {
        stage.innerHTML = featured.map(item => `
            <button type="button" class="sub-pride-featured-card" data-interview-id="${item.id}">
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
        const cards = [...stage.querySelectorAll(".sub-pride-featured-card")];
        if (!cards.length) return;

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
            if (animating || cards.length !== 3) return;

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

            clone.removeAttribute("data-interview-id");
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

        prev?.addEventListener("click", () => move(-1));
        next?.addEventListener("click", () => move(1));

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

        window.addEventListener("resize", () => {
            if (!animating) applyState();
        });

        applyState();
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

    page.addEventListener("click", event => {
        const card = event.target.closest("[data-interview-id]");
        if (!card) return;

        if (card.classList.contains("sub-pride-featured-card") && !card.classList.contains("is-active")) return;

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
