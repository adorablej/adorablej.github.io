document.addEventListener("DOMContentLoaded", () => {
    initMypageAccordion();
    initMypageProductSlider();
    initMypageOrderToggle();
    initMypageWithdrawModal();
    initMypageMobileMenu();
    initMypagePagination();
});

function initMypagePagination() {
    document.querySelectorAll('.sub-mypage-pagination-row').forEach(row => {
        if (row.dataset.paginationInitialized === 'true') return;

        const pagination = row.querySelector('.sub-pagination');
        const list = row.previousElementSibling;
        if (!pagination || !list) return;

        const itemSelector = '.sub-mypage-product-row, .sub-mypage-part-row';
        const itemsPerPage = 10;
        const pageScope = row.closest('.sub-mypage-products, .sub-mypage-cart-page, .sub-mypage-content');
        const totalElement = pageScope?.querySelector('.sub-mypage-list-actions strong em');
        let currentPage = Number(new URLSearchParams(window.location.search).get('page')) || 1;
        let currentGroupSize = window.innerWidth <= 767 ? 3 : 10;

        const render = () => {
            const items = [...list.querySelectorAll(itemSelector)];
            const declaredTotal = Number(String(totalElement?.textContent || '').replace(/[^0-9]/g, ''));
            const totalItems = declaredTotal > 0 ? Math.max(declaredTotal, items.length) : items.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const hasAllItems = totalItems === items.length;

            if (totalPages <= 1) {
                items.forEach(item => { item.hidden = false; });
                pagination.innerHTML = '';
                row.hidden = true;
                return;
            }

            currentPage = Math.min(Math.max(1, currentPage), totalPages);
            const startIndex = (currentPage - 1) * itemsPerPage;
            items.forEach((item, index) => {
                item.hidden = hasAllItems && (index < startIndex || index >= startIndex + itemsPerPage);
            });

            const groupSize = window.innerWidth <= 767 ? 3 : 10;
            currentGroupSize = groupSize;
            const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
            const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
            const pageButtons = [];

            for (let page = groupStart; page <= groupEnd; page += 1) {
                pageButtons.push(`<button type="button" data-page="${page}" class="${page === currentPage ? 'is-active' : ''}" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</button>`);
            }

            pagination.innerHTML = `
                <button type="button" class="sub-pagination-arrow is-prev" data-page="${Math.max(1, groupStart - groupSize)}" aria-label="이전 페이지 묶음" ${groupStart === 1 ? 'disabled' : ''}></button>
                ${pageButtons.join('')}
                <button type="button" class="sub-pagination-arrow is-next" data-page="${groupEnd + 1}" aria-label="다음 페이지 묶음" ${groupEnd === totalPages ? 'disabled' : ''}></button>
            `;
            row.hidden = false;

            pagination.querySelectorAll('[data-page]:not(:disabled)').forEach(button => {
                button.addEventListener('click', () => {
                    currentPage = Number(button.dataset.page);
                    render();

                    const url = new URL(window.location.href);
                    if (currentPage === 1) url.searchParams.delete('page');
                    else url.searchParams.set('page', currentPage);
                    window.history.replaceState({}, '', url);
                    pagination.dispatchEvent(new CustomEvent('paginationchange', {
                        bubbles: true,
                        detail: { page: currentPage, itemsPerPage }
                    }));
                    list.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        };

        window.addEventListener('resize', () => {
            const nextGroupSize = window.innerWidth <= 767 ? 3 : 10;
            if (nextGroupSize !== currentGroupSize) render();
        });

        new MutationObserver(mutations => {
            if (mutations.some(mutation => mutation.type === 'childList')) render();
        }).observe(list, { childList: true, subtree: true });

        row.dataset.paginationInitialized = 'true';
        render();
    });
}

function initMypageMobileMenu() {
    document.querySelectorAll("[data-mypage-mobile-menu]").forEach(menu => {
        if (menu.dataset.initialized === "true") return;
        const currentPath = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        const groupPaths = {
            parts: ["/mypage/parts-list.html", "/mypage/cart.html", "/mypage/order-list.html"],
            training: ["/mypage/training-apply.html", "/mypage/training-history.html"]
        };
        const activeGroup = Object.keys(groupPaths).find(group => groupPaths[group].includes(currentPath));
        const primary = menu.querySelector("[data-mypage-primary-select]");

        menu.querySelectorAll("[data-mypage-secondary]").forEach(select => {
            select.hidden = select.dataset.mypageSecondary !== activeGroup;
        });

        const closeAll = () => menu.querySelectorAll(".sub-mypage-mobile-select").forEach(select => {
            select.classList.remove("is-open");
            select.querySelector(".sub-mypage-mobile-select-trigger")?.setAttribute("aria-expanded", "false");
        });

        menu.querySelectorAll(".sub-mypage-mobile-select").forEach(select => {
            if (select.hidden) return;
            const trigger = select.querySelector(".sub-mypage-mobile-select-trigger");
            const value = select.querySelector(".sub-mypage-mobile-select-value");
            const options = select.querySelector(".sub-mypage-mobile-select-options");
            const links = options ? [...options.querySelectorAll("a")] : [];
            if (!trigger || !value || !links.length) return;

            let current;
            if (select === primary && activeGroup) {
                current = links.find(link => link.dataset.mypageGroup === activeGroup);
            } else {
                const menuPath = select === primary && currentPath === "/mypage/product-detail.html"
                    ? "/mypage/products.html"
                    : currentPath;
                current = links.find(link => new URL(link.href).pathname.replace(/\/+$/, "").toLowerCase() === menuPath);
            }
            if (current) {
                value.textContent = current.textContent.trim();
                current.classList.add("is-current");
                current.setAttribute("aria-current", "page");
            }

            trigger.addEventListener("click", () => {
                const open = !select.classList.contains("is-open");
                closeAll();
                select.classList.toggle("is-open", open);
                trigger.setAttribute("aria-expanded", String(open));
            });
        });

        document.addEventListener("click", event => {
            if (!menu.contains(event.target)) closeAll();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeAll();
        });

        menu.dataset.initialized = "true";
    });
}

window.addEventListener("includeLoaded", initMypageMobileMenu);

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
            0: { slidesPerView: "auto", spaceBetween: 15 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 }
        }
    });
}

function initMypageOrderToggle() {
    document.querySelectorAll(".sub-mypage-order-toggle").forEach(button => {
        const card = button.closest(".sub-mypage-order-card, .sub-mypage-order-history");
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

function initMypageTrainingHistory() {
    const page = document.querySelector('.sub-mypage-training-history-page');
    const modal = document.querySelector('#training-history-modal');
    if (!page || !modal) return;

    const date = modal.querySelector('[data-history-modal-date]');
    const course = modal.querySelector('[data-history-modal-course]');
    const dot = modal.querySelector('[data-history-modal-dot]');
    const instructor = modal.querySelector('[data-history-modal-instructor]');
    const fee = modal.querySelector('[data-history-modal-fee]');
    const cancelButton = modal.querySelector('[data-training-history-cancel]');
    let activeRow = null;
    let lastFocusedElement = null;

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-training-modal-open');
        lastFocusedElement?.focus?.();
    };

    const openModal = row => {
        activeRow = row;
        lastFocusedElement = document.activeElement;
        date.textContent = `${row.dataset.date} / ${row.dataset.time}`;
        course.textContent = `${row.dataset.course} (${row.dataset.count})`;
        instructor.textContent = `강사이름 : ${row.dataset.instructor || '-'} / `;
        fee.textContent = row.dataset.fee || '-';
        const historyColorMap = {
            'training-color-1': '#3ccba1', 'training-color-2': '#ec45ad',
            'training-color-3': '#19a8e6', 'training-color-4': '#9566e9',
            'training-color-5': '#ff8d3a'
        };
        dot.style.setProperty('--training-color', historyColorMap[row.dataset.color] || historyColorMap['training-color-1']);

        const isCancelled = row.dataset.status === '신청취소';
        cancelButton.textContent = isCancelled ? '취소 완료' : '신청 취소하기';
        cancelButton.disabled = isCancelled;
        cancelButton.classList.toggle('is-disabled', isCancelled);

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-training-modal-open');
        modal.querySelector('[data-training-history-close]')?.focus();
    };

    page.querySelectorAll('[data-training-history-open]').forEach(button => {
        button.addEventListener('click', () => {
            const row = button.closest('[data-training-history]');
            if (row) openModal(row);
        });
    });

    modal.querySelectorAll('[data-training-history-close]').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    cancelButton?.addEventListener('click', () => {
        if (!activeRow || activeRow.dataset.status === '신청취소') return;
        activeRow.dataset.status = '신청취소';
        activeRow.classList.add('is-cancelled');
        const status = activeRow.querySelector('[data-history-status]');
        if (status) status.textContent = '신청취소';
        cancelButton.textContent = '취소 완료';
        cancelButton.disabled = true;
        cancelButton.classList.add('is-disabled');
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMypageTrainingHistory);
} else {
    initMypageTrainingHistory();
}

function initMypageHomeLists() {
    document.querySelectorAll('[data-mypage-list]').forEach(region => {
        const selector = region.dataset.itemSelector;
        const empty = region.querySelector('[data-mypage-empty]');
        if (!selector || !empty) return;

        const update = () => {
            const hasItems = region.querySelectorAll(selector).length > 0;
            empty.hidden = hasItems;
            region.classList.toggle('is-empty', !hasItems);

            [...region.children].forEach(child => {
                if (child === empty) return;
                child.hidden = !hasItems;
            });
        };

        update();
        new MutationObserver(update).observe(region, { childList: true, subtree: true });
    });
}

function initMypageHomeTrainingModal() {
    const page = document.querySelector('.sub-mypage-home-page');
    const modal = document.querySelector('#mypage-home-training-modal');
    if (!page || !modal) return;

    const date = modal.querySelector('[data-home-training-date]');
    const course = modal.querySelector('[data-home-training-course]');
    const dot = modal.querySelector('[data-home-training-dot]');
    const cancelButton = modal.querySelector('[data-home-training-cancel]');
    const colorMap = {
        'training-color-1': '#3ccba1', 'training-color-2': '#ec45ad',
        'training-color-3': '#19a8e6', 'training-color-4': '#9566e9',
        'training-color-5': '#ff8d3a'
    };
    let activeRow = null;
    let lastFocusedElement = null;

    const close = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-mypage-home-modal-open');
        lastFocusedElement?.focus?.();
    };

    page.addEventListener('click', event => {
        const button = event.target.closest('[data-training-history-open]');
        if (!button) return;

        const row = button.closest('[data-training-history]');
        if (!row) return;
        activeRow = row;
        lastFocusedElement = button;
        date.textContent = `${row.dataset.date} / ${row.dataset.time}`;
        course.textContent = `${row.dataset.course} (${row.dataset.count})`;
        dot.style.setProperty('--training-color', colorMap[row.dataset.color] || colorMap['training-color-1']);

        const cancelled = row.dataset.status === '신청취소';
        cancelButton.textContent = cancelled ? '취소 완료' : '신청 취소하기';
        cancelButton.disabled = cancelled;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-mypage-home-modal-open');
        modal.querySelector('[data-home-training-close]')?.focus();
    });

    modal.querySelectorAll('[data-home-training-close]').forEach(button => button.addEventListener('click', close));
    cancelButton?.addEventListener('click', () => {
        if (!activeRow || activeRow.dataset.status === '신청취소') return;
        activeRow.dataset.status = '신청취소';
        activeRow.querySelector('[data-history-status]').textContent = '신청취소';
        cancelButton.textContent = '취소 완료';
        cancelButton.disabled = true;
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMypageHomeLists();
        initMypageHomeTrainingModal();
    });
} else {
    initMypageHomeLists();
    initMypageHomeTrainingModal();
}
