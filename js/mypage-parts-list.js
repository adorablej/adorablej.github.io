(function () {
    "use strict";

    const PAGE_SIZE = 10;
    const PLACEHOLDER = "/images/img_placeholder.png";

    document.addEventListener("DOMContentLoaded", initPartsList, { once: true });

    function initPartsList() {
        const root = document.querySelector(".sub-mypage-parts-list-page");
        const api = window.HunterFrontAPI;
        if (!root || !api?.parts || !api?.member) return;

        const list = root.querySelector("[data-parts-list]");
        const total = root.querySelector("[data-part-total]");
        const category = root.querySelector('[name="part_category_id"]');
        const categorySelect = root.querySelector("[data-part-category-select]");
        const categoryOptions = categorySelect.querySelector(".sub-form-select-options");
        const keyword = root.querySelector("[data-part-keyword]");
        const checkAll = root.querySelector("[data-check-all]");
        const addCartButton = root.querySelector("[data-add-cart]");
        const paginationRow = root.querySelector("[data-parts-pagination]");
        const pagination = paginationRow.querySelector(".sub-pagination");
        const modal = document.querySelector("[data-part-modal]");
        const knownCategories = new Map();
        let currentPage = Math.max(1, Number(new URLSearchParams(location.search).get("page")) || 1);
        let requestNumber = 0;
        let searchTimer;

        async function loadParts(resetPage) {
            if (resetPage) currentPage = 1;
            const ownRequest = ++requestNumber;
            list.innerHTML = '<p class="sub-mypage-list-empty">부품 목록을 불러오는 중입니다.</p>';
            checkAll.checked = false;
            try {
                const response = await api.parts.getList({
                    keyword: keyword.value.trim(),
                    categoryId: category.value,
                    page: currentPage,
                    size: PAGE_SIZE
                });
                if (ownRequest !== requestNumber) return;
                const items = Array.isArray(response?.data) ? response.data : [];
                const meta = response?.meta || {};
                total.textContent = String(Number(meta.totalElements) || items.length);
                updateCategoryOptions(items);
                renderParts(items);
                renderPagination(Number(meta.totalPages) || 0);
                updateUrl();
            } catch (error) {
                if (ownRequest !== requestNumber) return;
                if (handleUnauthorized(error)) return;
                total.textContent = "0";
                paginationRow.hidden = true;
                list.innerHTML = `<p class="sub-mypage-list-empty">${escapeHtml(error?.message || "부품 목록을 불러오지 못했습니다.")}</p>`;
            }
        }

        function updateCategoryOptions(items) {
            items.forEach(item => {
                const id = item.categoryId ?? item.partCategoryId;
                const name = item.partCategoryName || item.categoryName;
                if (id != null && name) knownCategories.set(String(id), name);
            });
            const current = category.value;
            categoryOptions.innerHTML = '<li><button type="button" class="sub-form-select-option" data-value="">전체</button></li>' +
                [...knownCategories].map(([id, name]) => `<li><button type="button" class="sub-form-select-option" data-value="${escapeHtml(id)}">${escapeHtml(name)}</button></li>`).join("");
            const selected = categoryOptions.querySelector(`[data-value="${cssEscape(current)}"]`) || categoryOptions.querySelector('[data-value=""]');
            selected.classList.add("is-selected");
        }

        function renderParts(items) {
            if (!items.length) {
                list.innerHTML = '<p class="sub-mypage-list-empty">등록된 부품이 없습니다.</p>';
                return;
            }
            list.innerHTML = items.map(item => {
                const price = Number(item.unitPrice) || 0;
                return `<article class="sub-mypage-part-row" data-part-id="${escapeHtml(item.partId)}" data-part='${escapeAttributeJson(item)}'>
                    <label class="sub-form-checkbox"><input class="sub-mypage-part-check" type="checkbox"><span class="sub-form-checkbox-icon" aria-hidden="true"></span></label>
                    <div class="sub-mypage-part-info"><button type="button" class="sub-mypage-part-image sub-mypage-part-open" data-dynamic-part-open aria-label="${escapeHtml(item.partName || "부품")} 상세보기"><img src="${escapeHtml(item.partImageUrl || PLACEHOLDER)}" alt="${escapeHtml(item.partName || "부품 이미지")}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></button><button type="button" class="sub-mypage-part-text sub-mypage-part-open" data-dynamic-part-open><small>${escapeHtml(item.partCategoryName || "-")}</small><strong>${escapeHtml(item.partName || "-")}</strong><em>${escapeHtml(item.partCode || "-")}</em></button></div>
                    <div class="sub-mypage-part-price" data-price="${price}">${formatMoney(price)}</div>
                    <div class="sub-mypage-quantity"><button type="button" data-dynamic-qty-minus aria-label="수량 감소">−</button><input type="number" value="1" min="1" max="99" readonly aria-label="수량"><button type="button" data-dynamic-qty-plus aria-label="수량 증가">＋</button></div>
                    <div class="sub-mypage-part-total">${formatMoney(price)}</div>
                </article>`;
            }).join("");
        }

        function renderPagination(totalPages) {
            if (totalPages <= 1) {
                pagination.innerHTML = "";
                paginationRow.hidden = true;
                return;
            }
            currentPage = Math.min(currentPage, totalPages);
            const groupSize = innerWidth <= 767 ? 3 : 10;
            const start = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
            const end = Math.min(start + groupSize - 1, totalPages);
            let buttons = "";
            for (let number = start; number <= end; number += 1) {
                buttons += `<button type="button" data-parts-page="${number}" class="${number === currentPage ? "is-active" : ""}" ${number === currentPage ? 'aria-current="page"' : ""}>${number}</button>`;
            }
            pagination.innerHTML = `<button type="button" class="sub-pagination-arrow is-prev" data-parts-page="${Math.max(1, start - groupSize)}" aria-label="이전 페이지 묶음" ${start === 1 ? "disabled" : ""}></button>${buttons}<button type="button" class="sub-pagination-arrow is-next" data-parts-page="${end + 1}" aria-label="다음 페이지 묶음" ${end === totalPages ? "disabled" : ""}></button>`;
            paginationRow.hidden = false;
        }

        function updateUrl() {
            const url = new URL(location.href);
            currentPage === 1 ? url.searchParams.delete("page") : url.searchParams.set("page", currentPage);
            history.replaceState({}, "", url);
        }

        function openPartModal(row) {
            if (!modal) return;
            let item = {};
            try { item = JSON.parse(row.dataset.part || "{}"); } catch (error) { item = {}; }
            const image = modal.querySelector("[data-modal-part-image]");
            image.src = item.partImageUrl || PLACEHOLDER;
            image.alt = item.partName || "부품 이미지";
            image.onerror = () => { image.onerror = null; image.src = PLACEHOLDER; };
            modal.querySelector("[data-modal-part-category]").textContent = item.partCategoryName || "-";
            modal.querySelector("[data-modal-part-name]").textContent = item.partName || "-";
            modal.querySelector("[data-modal-part-code]").textContent = item.partCode || "-";
            modal.querySelector("[data-modal-part-price]").textContent = `${new Intl.NumberFormat("ko-KR").format(Number(item.unitPrice) || 0)}원`;
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.documentElement.classList.add("is-modal-open");
            document.body.classList.add("is-modal-open");
            modal.querySelector(".sub-mypage-part-modal-dialog")?.focus?.();
        }

        function closePartModal() {
            if (!modal) return;
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.documentElement.classList.remove("is-modal-open");
            document.body.classList.remove("is-modal-open");
        }

        category.addEventListener("change", () => loadParts(true));
        keyword.addEventListener("input", () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => loadParts(true), 350);
        });
        pagination.addEventListener("click", event => {
            const button = event.target.closest("[data-parts-page]:not(:disabled)");
            if (!button) return;
            currentPage = Number(button.dataset.partsPage);
            loadParts(false);
            list.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        list.addEventListener("click", event => {
            const row = event.target.closest(".sub-mypage-part-row");
            if (!row) return;
            if (event.target.closest("[data-dynamic-part-open]")) {
                openPartModal(row);
                return;
            }
            const input = row.querySelector('input[type="number"]');
            if (event.target.closest("[data-dynamic-qty-minus]")) input.value = Math.max(1, Number(input.value) - 1);
            else if (event.target.closest("[data-dynamic-qty-plus]")) input.value = Math.min(99, Number(input.value) + 1);
            else return;
            updateRowTotal(row);
        });
        checkAll.addEventListener("change", () => {
            list.querySelectorAll(".sub-mypage-part-check").forEach(check => { check.checked = checkAll.checked; });
        });
        list.addEventListener("change", event => {
            if (!event.target.matches(".sub-mypage-part-check")) return;
            const checks = [...list.querySelectorAll(".sub-mypage-part-check")];
            checkAll.checked = checks.length > 0 && checks.every(check => check.checked);
        });
        addCartButton.addEventListener("click", addSelectedParts);
        modal?.querySelectorAll("[data-part-modal-close]").forEach(button => button.addEventListener("click", closePartModal));
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && modal?.classList.contains("is-open")) closePartModal();
        });

        async function addSelectedParts() {
            const selectedRows = [...list.querySelectorAll(".sub-mypage-part-row")].filter(row => row.querySelector(".sub-mypage-part-check")?.checked);
            if (!selectedRows.length) {
                await showAlert("장바구니에 담을 부품을 선택해 주세요.");
                return;
            }
            const businessId = localStorage.getItem("hunter.selectedBusinessId") || "";
            if (!businessId) {
                await showAlert("마이페이지에서 사용할 사업체를 먼저 선택해 주세요.");
                return;
            }
            addCartButton.disabled = true;
            addCartButton.setAttribute("aria-busy", "true");
            try {
                for (const row of selectedRows) {
                    await api.member.addCartItem({
                        businessId: Number(businessId),
                        partId: Number(row.dataset.partId),
                        quantity: Number(row.querySelector('input[type="number"]')?.value) || 1
                    });
                }
                await showAlert("선택한 부품을 장바구니에 담았습니다.");
                selectedRows.forEach(row => { row.querySelector(".sub-mypage-part-check").checked = false; });
                checkAll.checked = false;
            } catch (error) {
                if (!handleUnauthorized(error)) await showAlert(error?.message || "장바구니에 부품을 담지 못했습니다.");
            } finally {
                addCartButton.disabled = false;
                addCartButton.removeAttribute("aria-busy");
            }
        }

        loadParts(false);
    }

    function updateRowTotal(row) {
        const price = Number(row.querySelector("[data-price]")?.dataset.price) || 0;
        const quantity = Number(row.querySelector('input[type="number"]')?.value) || 1;
        row.querySelector(".sub-mypage-part-total").textContent = formatMoney(price * quantity);
    }

    function handleUnauthorized(error) {
        if (error?.status !== 401) return false;
        window.HunterAPI?.auth?.clearTokens();
        location.replace(`/account/login.html?returnUrl=${encodeURIComponent(location.href)}`);
        return true;
    }

    function formatMoney(value) {
        return `₩${new Intl.NumberFormat("ko-KR").format(Number(value) || 0)}`;
    }

    async function showAlert(message) {
        if (window.HunterAlert?.open) return window.HunterAlert.open({ message });
        window.alert(message);
        return true;
    }

    function cssEscape(value) {
        return window.CSS?.escape ? window.CSS.escape(String(value)) : String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
    }

    function escapeAttributeJson(value) {
        return escapeHtml(JSON.stringify(value));
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
    }
})();
