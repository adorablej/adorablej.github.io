document.addEventListener("DOMContentLoaded", () => {
    initMypageAccordion();
    initMypageProductSlider();
    initMypageOrderToggle();
});

function initMypageAccordion() {
    document.querySelectorAll("[data-mypage-accordion]").forEach(group => {
        const button = group.querySelector(".sub-mypage-nav-toggle");
        const depth = group.querySelector(".sub-mypage-nav-depth");
        const inner = group.querySelector(".sub-mypage-nav-depth-inner");

        if (!button || !depth || !inner) return;

        const updateHeight = () => {
            depth.style.height = group.classList.contains("is-open")
                ? `${inner.scrollHeight}px`
                : "0px";
        };

        button.addEventListener("click", () => {
            const willOpen = !group.classList.contains("is-open");

            document.querySelectorAll("[data-mypage-accordion].is-open").forEach(item => {
                if (item === group) return;
                item.classList.remove("is-open");
                item.querySelector(".sub-mypage-nav-toggle")?.setAttribute("aria-expanded", "false");
                const itemDepth = item.querySelector(".sub-mypage-nav-depth");
                if (itemDepth) itemDepth.style.height = "0px";
            });

            group.classList.toggle("is-open", willOpen);
            button.setAttribute("aria-expanded", String(willOpen));
            updateHeight();
        });

        updateHeight();
        window.addEventListener("resize", updateHeight);
    });
}

function initMypageProductSlider() {
    const slider = document.querySelector(".sub-mypage-product-slider");
    if (!slider || typeof Swiper === "undefined") return;

    new Swiper(slider, {
        slidesPerView: 3,
        spaceBetween: 20,
        speed: 650,
        navigation: {
            prevEl: ".sub-mypage-product-prev",
            nextEl: ".sub-mypage-product-next"
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 }
        }
    });
}

function initMypageOrderToggle() {
    document.querySelectorAll(".sub-mypage-order-toggle").forEach(button => {
        const card = button.closest(".sub-mypage-order-card");
        const text = button.querySelector("span");
        if (!card || !text) return;

        button.addEventListener("click", () => {
            const collapsed = card.classList.toggle("is-collapsed");
            button.setAttribute("aria-expanded", String(!collapsed));
            text.textContent = collapsed ? "총 3건 주문 펼치기" : "총 3건 주문 접기";
        });
    });
}
