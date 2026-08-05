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

function initMypageProductMoreMenus() {
    const buttons = document.querySelectorAll('[data-product-more]');
    if (!buttons.length) return;

    const closeAll = except => {
        document.querySelectorAll('.sub-mypage-more-wrap.is-open').forEach(wrap => {
            if (wrap === except) return;
            wrap.classList.remove('is-open');
            wrap.querySelector('[data-product-more]')?.setAttribute('aria-expanded', 'false');
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', event => {
            event.stopPropagation();
            const wrap = button.closest('.sub-mypage-more-wrap');
            const willOpen = !wrap.classList.contains('is-open');
            closeAll(wrap);
            wrap.classList.toggle('is-open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));
        });
    });

    document.addEventListener('click', () => closeAll());
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeAll();
    });
}

function initMypagePartControls() {
    const rows = document.querySelectorAll('.sub-mypage-part-row');
    if (!rows.length) return;

    const checkAll = document.querySelector('[data-check-all]');
    const checks = [...document.querySelectorAll('.sub-mypage-part-check')];

    const updateRowTotal = row => {
        const price = Number(row.querySelector('[data-price]')?.dataset.price || 0);
        const quantity = Number(row.querySelector('.sub-mypage-quantity input')?.value || 1);
        const total = row.querySelector('.sub-mypage-part-total');
        if (total) total.textContent = `₩${(price * quantity).toLocaleString('ko-KR')}`;
    };

    rows.forEach(row => {
        const input = row.querySelector('.sub-mypage-quantity input');
        row.querySelector('[data-qty-minus]')?.addEventListener('click', () => {
            input.value = Math.max(Number(input.min || 1), Number(input.value) - 1);
            updateRowTotal(row);
        });
        row.querySelector('[data-qty-plus]')?.addEventListener('click', () => {
            input.value = Math.min(Number(input.max || 99), Number(input.value) + 1);
            updateRowTotal(row);
        });
        updateRowTotal(row);
    });

    checkAll?.addEventListener('change', () => {
        checks.forEach(check => check.checked = checkAll.checked);
    });
    checks.forEach(check => check.addEventListener('change', () => {
        if (checkAll) checkAll.checked = checks.every(item => item.checked);
    }));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMypageProductMoreMenus();
        initMypagePartControls();
    });
} else {
    initMypageProductMoreMenus();
    initMypagePartControls();
}

function initMypagePartDetailModal() {
    const modal = document.querySelector('[data-part-modal]');
    const openButtons = document.querySelectorAll('[data-part-modal-open]');

    if (!modal || !openButtons.length) return;

    const closeButtons = modal.querySelectorAll('[data-part-modal-close]');
    const dialog = modal.querySelector('.sub-mypage-part-modal-dialog');
    let lastFocusedElement = null;

    const openModal = button => {
        lastFocusedElement = button;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('is-modal-open');
        document.body.classList.add('is-modal-open');
        dialog?.focus?.();
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('is-modal-open');
        document.body.classList.remove('is-modal-open');
        lastFocusedElement?.focus?.();
    };

    openButtons.forEach(button => {
        button.addEventListener('click', () => openModal(button));
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    window.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMypagePartDetailModal);
} else {
    initMypagePartDetailModal();
}


function initMypageCart() {
    const page = document.querySelector('.sub-mypage-cart-page');
    if (!page) return;
    const shipping = 3000;
    const rows = () => [...page.querySelectorAll('.sub-mypage-part-row')];
    const updateSummary = () => {
        const subtotal = rows().reduce((sum, row) => {
            const checked = row.querySelector('.sub-mypage-part-check')?.checked;
            if (!checked) return sum;
            const price = Number(row.querySelector('[data-price]')?.dataset.price || 0);
            const qty = Number(row.querySelector('.sub-mypage-quantity input')?.value || 1);
            return sum + price * qty;
        }, 0);
        page.querySelector('[data-cart-subtotal]').textContent = `${subtotal.toLocaleString('ko-KR')}원`;
        page.querySelector('[data-cart-shipping]').textContent = `+${shipping.toLocaleString('ko-KR')}원`;
        page.querySelector('[data-cart-total]').textContent = `${(subtotal + shipping).toLocaleString('ko-KR')}원`;
    };
    page.addEventListener('click', event => {
        if (event.target.closest('[data-qty-minus], [data-qty-plus]')) requestAnimationFrame(updateSummary);
    });
    page.addEventListener('change', event => {
        if (event.target.matches('.sub-mypage-part-check, [data-check-all], .sub-mypage-quantity input')) updateSummary();
    });
    page.querySelector('[data-cart-delete]')?.addEventListener('click', () => {
        rows().forEach(row => { if (row.querySelector('.sub-mypage-part-check')?.checked) row.remove(); });
        updateSummary();
    });
    updateSummary();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMypageCart); else initMypageCart();

function initMypageOrderListFilter() {
    const page = document.querySelector('.sub-mypage-order-list-page');
    if (!page) return;

    const filterButtons = [...page.querySelectorAll('[data-order-filter]')];
    const cards = [...page.querySelectorAll('[data-order-card]')];
    const search = page.querySelector('[data-order-search]');
    const empty = page.querySelector('.sub-mypage-order-empty');
    let currentFilter = 'all';

    const update = () => {
        const keyword = (search?.value || '').trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach(card => {
            const statusMatch = currentFilter === 'all' || card.dataset.status === currentFilter;
            const text = `${card.dataset.keywords || ''} ${card.textContent}`.toLowerCase();
            const keywordMatch = !keyword || text.includes(keyword);
            const visible = statusMatch && keywordMatch;
            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        if (empty) empty.hidden = visibleCount !== 0;
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.orderFilter || 'all';
            filterButtons.forEach(item => item.classList.toggle('is-active', item === button));
            update();
        });
    });

    search?.addEventListener('input', update);
    update();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMypageOrderListFilter);
} else {
    initMypageOrderListFilter();
}
