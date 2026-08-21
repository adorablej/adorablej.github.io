(function () {
    "use strict";

    const PAGE_SIZE = 10;
    const PLACEHOLDER = "/images/img_placeholder.png";

    document.addEventListener("DOMContentLoaded", initProducts, { once: true });

    function initProducts() {
        const page = document.querySelector(".sub-mypage-products-page");
        const list = page?.querySelector("[data-product-list]");
        const total = page?.querySelector("[data-product-total]");
        const category = page?.querySelector('[name="product_category"]');
        const keyword = page?.querySelector("[data-product-keyword]");
        const paginationRow = page?.querySelector("[data-product-pagination]");
        const pagination = paginationRow?.querySelector(".sub-pagination");
        const api = window.HunterFrontAPI?.member;
        if (!page || !list || !total || !category || !keyword || !paginationRow || !pagination || !api) return;

        let currentPage = Math.max(1, Number(new URLSearchParams(location.search).get("page")) || 1);
        let requestNumber = 0;
        let searchTimer;

        async function loadProducts(resetPage) {
            if (resetPage) currentPage = 1;
            const ownRequest = ++requestNumber;
            const businessId = localStorage.getItem("hunter.selectedBusinessId") || "";
            list.innerHTML = '<p class="sub-mypage-list-empty">보유 제품을 불러오는 중입니다.</p>';

            try {
                const response = await api.getProducts({
                    page: currentPage,
                    size: PAGE_SIZE,
                    businessId,
                    categoryCode: category.value,
                    keyword: keyword.value.trim()
                }, true);
                if (ownRequest !== requestNumber) return;
                const items = Array.isArray(response?.data) ? response.data : [];
                const meta = response?.meta || {};
                total.textContent = String(Number(meta.totalElements) || items.length);
                renderProducts(items);
                renderPagination(Number(meta.totalPages) || 0);
                updateUrl();
            } catch (error) {
                if (ownRequest !== requestNumber) return;
                if (error?.status === 401) {
                    window.HunterAPI?.auth?.clearTokens();
                    location.replace(`/account/login.html?returnUrl=${encodeURIComponent(location.href)}`);
                    return;
                }
                total.textContent = "0";
                paginationRow.hidden = true;
                list.innerHTML = `<p class="sub-mypage-list-empty">${escapeHtml(error?.message || "보유 제품을 불러오지 못했습니다.")}</p>`;
            }
        }

        function renderProducts(items) {
            if (!items.length) {
                list.innerHTML = '<p class="sub-mypage-list-empty">보유중인 헌터 제품이 없습니다.</p>';
                return;
            }
            list.innerHTML = items.map(item => {
                const id = encodeURIComponent(item.ownedProductId);
                const status = getStatus(item);
                return `<article class="sub-mypage-product-row" data-owned-product-id="${escapeHtml(item.ownedProductId)}">
                    <div class="sub-mypage-product-cell">
                        <div class="sub-mypage-list-image"><img src="${escapeHtml(item.productImageUrl || PLACEHOLDER)}" alt="${escapeHtml(item.productName || "제품 이미지")}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></div>
                        <div class="sub-mypage-list-product-text"><span class="sub-mypage-product-status ${status.className}">${status.label}</span><small>${escapeHtml(item.productCategoryName || "-")}</small><strong>${escapeHtml(item.productName || "-")}</strong></div>
                    </div>
                    <div>${escapeHtml(item.serialNumber || "-")}</div><div>${formatDate(item.installDate)}</div><div>${formatDate(item.warrantyExpirationDate)}</div>
                    <div class="sub-mypage-more-wrap"><button type="button" class="sub-mypage-more-button" aria-label="제품 메뉴 열기" aria-expanded="false" data-product-more><i></i><i></i><i></i></button>
                        <div class="sub-mypage-more-menu"><a href="/Mypage/product-detail.html?ownedProductId=${id}">제품 상세</a><a href="/Mypage/product-detail.html?ownedProductId=${id}#parts">부품 주문</a><a href="/Mypage/cs-request.html?category=as&amp;ownedProductId=${id}">A/S 신청</a><a href="/Mypage/cs-request.html?category=transfer&amp;ownedProductId=${id}">제품 이전 신청</a></div>
                    </div></article>`;
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
            for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
                buttons += `<button type="button" data-server-page="${pageNumber}" class="${pageNumber === currentPage ? "is-active" : ""}" ${pageNumber === currentPage ? 'aria-current="page"' : ""}>${pageNumber}</button>`;
            }
            pagination.innerHTML = `<button type="button" class="sub-pagination-arrow is-prev" data-server-page="${Math.max(1, start - groupSize)}" aria-label="이전 페이지 묶음" ${start === 1 ? "disabled" : ""}></button>${buttons}<button type="button" class="sub-pagination-arrow is-next" data-server-page="${end + 1}" aria-label="다음 페이지 묶음" ${end === totalPages ? "disabled" : ""}></button>`;
            paginationRow.hidden = false;
        }

        function updateUrl() {
            const url = new URL(location.href);
            currentPage === 1 ? url.searchParams.delete("page") : url.searchParams.set("page", currentPage);
            history.replaceState({}, "", url);
        }

        category.addEventListener("change", () => loadProducts(true));
        keyword.addEventListener("input", () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => loadProducts(true), 350);
        });
        pagination.addEventListener("click", event => {
            const button = event.target.closest("[data-server-page]:not(:disabled)");
            if (!button) return;
            currentPage = Number(button.dataset.serverPage);
            loadProducts(false);
            list.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        list.addEventListener("click", event => {
            const button = event.target.closest("[data-product-more]");
            if (!button) return;
            event.stopPropagation();
            const wrap = button.closest(".sub-mypage-more-wrap");
            const willOpen = !wrap.classList.contains("is-open");
            list.querySelectorAll(".sub-mypage-more-wrap.is-open").forEach(item => {
                item.classList.remove("is-open");
                item.querySelector("[data-product-more]")?.setAttribute("aria-expanded", "false");
            });
            wrap.classList.toggle("is-open", willOpen);
            button.setAttribute("aria-expanded", String(willOpen));
        });
        document.addEventListener("click", () => {
            list.querySelectorAll(".sub-mypage-more-wrap.is-open").forEach(item => {
                item.classList.remove("is-open");
                item.querySelector("[data-product-more]")?.setAttribute("aria-expanded", "false");
            });
        });
        window.addEventListener("hunterBusinessChanged", () => loadProducts(true));
        loadProducts(false);
    }

    function getStatus(item) {
        const csType = item.activeCsRequest?.csTypeCode;
        if (csType === "AS") return { label: "A/S 신청", className: "is-as" };
        if (csType === "TRANSFER") return { label: "제품 이전 신청", className: "is-transfer" };
        return ["A", "ACTIVE", "OPERATING"].includes(String(item.status || "").toUpperCase())
            ? { label: "운영중", className: "is-active" }
            : { label: "미운영", className: "is-expired" };
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
    }
})();
