(function () {
    "use strict";

    const PAGE_SIZE = 10;
    const PLACEHOLDER = "/images/img_placeholder.png";
    const STATUS = {
        REQUESTED: { label: "주문 신청", className: "is-request" },
        ACCEPTED: { label: "주문 확인", className: "is-confirm" },
        SHIPPING: { label: "주문 확인", className: "is-confirm" },
        DELIVERED: { label: "주문 완료", className: "is-order-complete" },
        CANCELED: { label: "주문 취소", className: "is-cancel" }
    };

    document.addEventListener("DOMContentLoaded", initOrderList, { once: true });

    function initOrderList() {
        const root = document.querySelector("[data-api-orders]");
        const api = window.HunterFrontAPI?.member;
        if (!root || !api) return;

        const list = root.querySelector("[data-order-list]");
        const total = root.querySelector("[data-order-total]");
        const search = root.querySelector("[data-order-search]");
        const filterButtons = [...root.querySelectorAll("[data-order-filter]")];
        const paginationRow = root.querySelector("[data-order-pagination]");
        const pagination = paginationRow.querySelector(".sub-pagination");
        let currentPage = Math.max(1, Number(new URLSearchParams(location.search).get("page")) || 1);
        let currentStatus = "";
        let searchTimer;
        let requestNumber = 0;

        async function loadOrders(resetPage) {
            if (resetPage) currentPage = 1;
            const businessId = localStorage.getItem("hunter.selectedBusinessId") || "";
            if (!businessId) {
                total.textContent = "0";
                list.innerHTML = '<p class="sub-mypage-order-empty">마이페이지에서 사용할 사업체를 먼저 선택해 주세요.</p>';
                paginationRow.hidden = true;
                return;
            }
            const ownRequest = ++requestNumber;
            list.innerHTML = '<p class="sub-mypage-order-empty">주문 내역을 불러오는 중입니다.</p>';
            try {
                const response = await api.getOrders({
                    page: currentPage,
                    size: PAGE_SIZE,
                    statusCode: currentStatus,
                    keyword: search.value.trim(),
                    businessId
                }, true);
                if (ownRequest !== requestNumber) return;
                const items = Array.isArray(response?.data) ? response.data : [];
                const meta = response?.meta || {};
                total.textContent = String(Number(meta.totalElements) || items.length);
                renderOrders(items);
                renderPagination(Number(meta.totalPages) || 0);
                updateUrl();
            } catch (error) {
                if (ownRequest !== requestNumber || handleUnauthorized(error)) return;
                total.textContent = "0";
                paginationRow.hidden = true;
                list.innerHTML = `<p class="sub-mypage-order-empty">${escapeHtml(error?.message || "주문 내역을 불러오지 못했습니다.")}</p>`;
            }
        }

        function renderOrders(orders) {
            if (!orders.length) {
                list.innerHTML = '<p class="sub-mypage-order-empty">검색 결과가 없습니다.</p>';
                return;
            }
            list.innerHTML = orders.map((order, index) => {
                const status = STATUS[order.orderStatusCode] || { label: order.orderStatusCode || "-", className: "is-cancel" };
                const items = Array.isArray(order.items) ? order.items : [];
                const itemMarkup = items.map(item => `<div class="sub-mypage-order-history-item"><div class="sub-mypage-order-history-image"><img src="${escapeHtml(item.imageUrl || PLACEHOLDER)}" alt="${escapeHtml(item.partName || "부품 이미지")}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></div><div class="sub-mypage-order-history-info"><strong>${escapeHtml(item.partName || "-")}</strong><span>${escapeHtml(item.partDescription || "")}</span><dl><div><dt>부품 개수</dt><dd>${Number(item.quantity) || 0}개</dd></div><div><dt>금액</dt><dd>${formatNumber(item.totalPrice)}원 <small>(개당 ${formatNumber(item.unitPrice)}원)</small></dd></div></dl></div></div>`).join("");
                const collapsed = index > 0 && items.length > 1;
                return `<article class="sub-mypage-order-history${collapsed ? " is-collapsed" : ""}" data-order-card data-order-id="${escapeHtml(order.orderId)}">
                    <div class="sub-mypage-order-history-head"><strong><span class="sub-mypage-order-meta">${formatDate(order.requestedAt)} / 총 ${Number(order.itemCount) || items.length}개 주문</span><span class="sub-mypage-order-total">총금액 <em>${formatNumber(order.totalAmount)}원</em></span></strong><span class="sub-mypage-status ${status.className}">${status.label}</span></div>
                    <div class="sub-mypage-order-history-body">${itemMarkup || '<p class="sub-mypage-order-empty">주문 부품 정보가 없습니다.</p>'}</div>
                    ${items.length > 1 ? `<button type="button" class="sub-mypage-order-toggle" aria-expanded="${String(!collapsed)}"><span>총 ${items.length}건 주문 ${collapsed ? "펼치기" : "접기"}</span><i aria-hidden="true"></i></button>` : ""}
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
                buttons += `<button type="button" data-order-page="${number}" class="${number === currentPage ? "is-active" : ""}" ${number === currentPage ? 'aria-current="page"' : ""}>${number}</button>`;
            }
            pagination.innerHTML = `<button type="button" class="sub-pagination-arrow is-prev" data-order-page="${Math.max(1, start - groupSize)}" aria-label="이전 페이지 묶음" ${start === 1 ? "disabled" : ""}></button>${buttons}<button type="button" class="sub-pagination-arrow is-next" data-order-page="${end + 1}" aria-label="다음 페이지 묶음" ${end === totalPages ? "disabled" : ""}></button>`;
            paginationRow.hidden = false;
        }

        function updateUrl() {
            const url = new URL(location.href);
            currentPage === 1 ? url.searchParams.delete("page") : url.searchParams.set("page", currentPage);
            history.replaceState({}, "", url);
        }

        filterButtons.forEach(button => button.addEventListener("click", () => {
            currentStatus = button.dataset.orderFilter || "";
            filterButtons.forEach(item => item.classList.toggle("is-active", item === button));
            loadOrders(true);
        }));
        search.addEventListener("input", () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => loadOrders(true), 350);
        });
        pagination.addEventListener("click", event => {
            const button = event.target.closest("[data-order-page]:not(:disabled)");
            if (!button) return;
            currentPage = Number(button.dataset.orderPage);
            loadOrders(false);
            list.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        list.addEventListener("click", event => {
            const button = event.target.closest(".sub-mypage-order-toggle");
            if (!button) return;
            const card = button.closest(".sub-mypage-order-history");
            const count = card.querySelectorAll(".sub-mypage-order-history-item").length;
            const collapsed = card.classList.toggle("is-collapsed");
            button.setAttribute("aria-expanded", String(!collapsed));
            button.querySelector("span").textContent = `총 ${count}건 주문 ${collapsed ? "펼치기" : "접기"}`;
        });
        window.addEventListener("hunterBusinessChanged", () => loadOrders(true));
        loadOrders(false);
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("ko-KR").format(Number(value) || 0);
    }

    function handleUnauthorized(error) {
        if (error?.status !== 401) return false;
        window.HunterAPI?.auth?.clearTokens();
        location.replace(`/account/login.html?returnUrl=${encodeURIComponent(location.href)}`);
        return true;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
    }
})();
