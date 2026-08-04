document.addEventListener("DOMContentLoaded", () => {
    initMypageAccordion();
    initMypageProductSlider();
    initMypageOrderToggle();
    initMypageWithdrawModal();
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


function initMypageWithdrawModal() {
    const modal = document.querySelector("[data-withdraw-modal]");
    const openButton = document.querySelector("[data-withdraw-open]");

    if (!modal || !openButton) return;

    const closeButtons = modal.querySelectorAll("[data-withdraw-close]");
    const agree = modal.querySelector("[data-withdraw-agree]");
    const submit = modal.querySelector("[data-withdraw-submit]");
    let lastFocusedElement = null;

    const openModal = () => {
        lastFocusedElement = document.activeElement;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("is-modal-open");
        document.body.classList.add("is-modal-open");
        agree?.focus();
    };

    const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-modal-open");
        document.body.classList.remove("is-modal-open");

        if (agree) agree.checked = false;
        if (submit) submit.disabled = true;

        lastFocusedElement?.focus?.();
    };

    openButton.addEventListener("click", openModal);
    closeButtons.forEach(button => button.addEventListener("click", closeModal));

    agree?.addEventListener("change", () => {
        if (submit) submit.disabled = !agree.checked;
    });

    submit?.addEventListener("click", () => {
        if (!agree?.checked) return;
        // API 연동 시 회원탈퇴 요청 로직 연결
    });

    window.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });
}
