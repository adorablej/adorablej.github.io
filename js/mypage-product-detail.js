(function () {
    "use strict";

    const PAGE_SIZE = 10;
    const PLACEHOLDER = "/images/img_placeholder.png";

    document.addEventListener("DOMContentLoaded", initProductDetail, { once: true });

    async function initProductDetail() {
        const root = document.querySelector(".sub-mypage-product-detail");
        const api = window.HunterFrontAPI?.member;
        const ownedProductId = new URLSearchParams(location.search).get("ownedProductId");
        if (!root || !api) return;
        if (!ownedProductId) {
            showProductError("선택한 제품 정보가 없습니다.");
            const emptyParts = root.querySelector("[data-product-parts]");
            if (emptyParts) emptyParts.innerHTML = '<p class="sub-mypage-list-empty">제품 목록에서 제품을 다시 선택해 주세요.</p>';
            return;
        }

        let product = null;
        let currentPage = 1;
        let requestNumber = 0;
        let searchTimer;
        const category = root.querySelector('[name="part_category"]');
        const keyword = root.querySelector("[data-part-keyword]");
        const partsWrap = root.querySelector("[data-product-parts]");
        const total = root.querySelector("[data-part-total]");
        const paginationRow = root.querySelector("[data-parts-pagination]");
        const pagination = paginationRow.querySelector(".sub-pagination");
        const checkAll = root.querySelector("[data-check-all]");
        const addCartButton = root.querySelector("[data-add-cart]");

        try {
            product = await api.getProduct(ownedProductId);
            renderProduct(product || {});
            await loadParts(false);
        } catch (error) {
            if (handleUnauthorized(error)) return;
            showProductError(error?.message || "제품 정보를 불러오지 못했습니다.");
            renderPartsError("주문 가능한 부품을 불러오지 못했습니다.");
        }

        async function loadParts(resetPage) {
            if (!product) return;
            if (resetPage) currentPage = 1;
            const ownRequest = ++requestNumber;
            partsWrap.innerHTML = '<p class="sub-mypage-list-empty">주문 가능한 부품을 불러오는 중입니다.</p>';
            checkAll.checked = false;
            try {
                const response = await api.getProductParts(ownedProductId, {
                    businessId: product.businessId || localStorage.getItem("hunter.selectedBusinessId") || "",
                    categoryCode: category.value,
                    keyword: keyword.value.trim(),
                    page: currentPage,
                    size: PAGE_SIZE
                });
                if (ownRequest !== requestNumber) return;
                const items = Array.isArray(response?.data) ? response.data : [];
                const meta = response?.meta || {};
                total.textContent = String(Number(meta.totalElements) || items.length);
                renderParts(items);
                renderPagination(Number(meta.totalPages) || 0);
            } catch (error) {
                if (ownRequest !== requestNumber || handleUnauthorized(error)) return;
                total.textContent = "0";
                renderPartsError(error?.message || "주문 가능한 부품을 불러오지 못했습니다.");
            }
        }

        function renderParts(items) {
            if (!items.length) {
                partsWrap.innerHTML = '<p class="sub-mypage-list-empty">주문 가능한 부품이 없습니다.</p>';
                return;
            }
            partsWrap.innerHTML = items.map(item => {
                const price = Number(item.unitPrice) || 0;
                const categoryName = item.partCategoryName || item.categoryName || "-";
                const imageUrl = item.partImageUrl || item.imageUrl || PLACEHOLDER;
                return `<div class="sub-mypage-part-row" data-part-id="${escapeHtml(item.partId)}">
                    <label class="sub-form-checkbox"><input type="checkbox" class="sub-mypage-part-check"><span class="sub-form-checkbox-icon"></span></label>
                    <div class="sub-mypage-part-info"><div class="sub-mypage-part-image"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.partName || "부품 이미지")}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></div><div><small>${escapeHtml(categoryName)}</small><strong>${escapeHtml(item.partName || "-")}</strong><em>${escapeHtml(item.partCode || "-")}</em></div></div>
                    <div class="sub-mypage-part-price" data-price="${price}">${formatMoney(price)}</div>
                    <div class="sub-mypage-quantity"><button type="button" data-qty-minus aria-label="수량 줄이기">−</button><input type="number" value="1" min="1" max="99" readonly aria-label="주문 수량"><button type="button" data-qty-plus aria-label="수량 늘리기">＋</button></div>
                    <div class="sub-mypage-part-total">${formatMoney(price)}</div>
                </div>`;
            }).join("");
        }

        function renderPartsError(message) {
            paginationRow.hidden = true;
            partsWrap.innerHTML = `<p class="sub-mypage-list-empty">${escapeHtml(message)}</p>`;
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
            partsWrap.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        partsWrap.addEventListener("click", event => {
            const row = event.target.closest(".sub-mypage-part-row");
            const input = row?.querySelector('input[type="number"]');
            if (!row || !input) return;
            if (event.target.closest("[data-qty-minus]")) input.value = Math.max(1, Number(input.value) - 1);
            else if (event.target.closest("[data-qty-plus]")) input.value = Math.min(99, Number(input.value) + 1);
            else return;
            updateRowTotal(row);
        });
        checkAll.addEventListener("change", () => {
            partsWrap.querySelectorAll(".sub-mypage-part-check").forEach(check => { check.checked = checkAll.checked; });
        });
        partsWrap.addEventListener("change", event => {
            if (!event.target.matches(".sub-mypage-part-check")) return;
            const checks = [...partsWrap.querySelectorAll(".sub-mypage-part-check")];
            checkAll.checked = checks.length > 0 && checks.every(check => check.checked);
        });
        addCartButton.addEventListener("click", addSelectedParts);
        window.addEventListener("hunterBusinessChanged", event => {
            if (event.detail?.initial) return;
            location.href = "/Mypage/products.html";
        });

        async function addSelectedParts() {
            const selectedRows = [...partsWrap.querySelectorAll(".sub-mypage-part-row")].filter(row => row.querySelector(".sub-mypage-part-check")?.checked);
            if (!selectedRows.length) {
                await showAlert("장바구니에 담을 부품을 선택해 주세요.");
                return;
            }
            addCartButton.disabled = true;
            addCartButton.setAttribute("aria-busy", "true");
            try {
                for (const row of selectedRows) {
                    await api.addCartItem({
                        businessId: product.businessId || localStorage.getItem("hunter.selectedBusinessId") || "",
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
    }

    function renderProduct(product) {
        const active = String(product.status || "").toUpperCase() === "ACTIVE";
        document.querySelectorAll("[data-product-detail]").forEach(card => {
            const status = card.querySelector("[data-product-status]");
            status.textContent = active ? "운영중" : "미운영";
            status.className = `sub-mypage-product-status ${active ? "is-active" : "is-expired"}`;
            setText(card, "[data-product-category]", product.productCategoryName || "-");
            setText(card, "[data-product-name]", product.productName || "-");
            setText(card, "[data-product-serial]", product.serialNumber || "-");
            setText(card, "[data-product-install]", formatDate(product.installDate));
            setText(card, "[data-product-warranty]", formatDate(product.warrantyExpirationDate));
            const image = card.querySelector("[data-product-image]");
            image.src = product.productImageUrl || PLACEHOLDER;
            image.alt = product.productName || "제품 이미지";
            image.addEventListener("error", () => { image.src = PLACEHOLDER; }, { once: true });
            const id = encodeURIComponent(product.ownedProductId);
            card.querySelector("[data-product-as]").href = `/Mypage/cs-request.html?category=as&ownedProductId=${id}`;
            card.querySelector("[data-product-transfer]").href = `/Mypage/cs-request.html?category=transfer&ownedProductId=${id}`;
        });
    }

    function showProductError(message) {
        document.querySelectorAll("[data-product-name]").forEach(element => { element.textContent = message; });
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

    function setText(root, selector, value) {
        const element = root.querySelector(selector);
        if (element) element.textContent = value;
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    }

    function formatMoney(value) {
        return `₩${new Intl.NumberFormat("ko-KR").format(Number(value) || 0)}`;
    }

    async function showAlert(message) {
        if (window.HunterAlert?.open) return window.HunterAlert.open({ message });
        window.alert(message);
        return true;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
    }
})();
