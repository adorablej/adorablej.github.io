(function () {
    "use strict";

    const PAGE_SIZE = 10;
    const PLACEHOLDER = "/images/img_placeholder.png";

    document.addEventListener("DOMContentLoaded", initCart, { once: true });

    function initCart() {
        const root = document.querySelector("[data-api-cart]");
        const api = window.HunterFrontAPI?.member;
        if (!root || !api) return;

        const list = root.querySelector("[data-cart-list]");
        const count = root.querySelector("[data-cart-count]");
        const checkAll = root.querySelector("[data-check-all]");
        const deleteButton = root.querySelector("[data-cart-delete]");
        const orderButton = root.querySelector("[data-cart-order]");
        const paginationRow = root.querySelector("[data-cart-pagination]");
        const pagination = paginationRow.querySelector(".sub-pagination");
        let currentPage = Math.max(1, Number(new URLSearchParams(location.search).get("page")) || 1);
        let cart = null;

        async function loadCart() {
            const businessId = localStorage.getItem("hunter.selectedBusinessId") || "";
            if (!businessId) {
                list.innerHTML = '<p class="sub-mypage-list-empty">마이페이지에서 사용할 사업체를 먼저 선택해 주세요.</p>';
                root.querySelector("[data-cart-subtotal]").textContent = "0원";
                root.querySelector("[data-cart-shipping]").textContent = "+0원";
                root.querySelector("[data-cart-total]").textContent = "0원";
                orderButton.disabled = true;
                return;
            }
            list.innerHTML = '<p class="sub-mypage-list-empty">장바구니를 불러오는 중입니다.</p>';
            try {
                const response = await api.getCart({ businessId, page: currentPage, size: PAGE_SIZE });
                cart = response?.data || {};
                const meta = response?.meta || {};
                const items = Array.isArray(cart.items) ? cart.items : [];
                count.textContent = String(Number(cart.itemCount) || Number(meta.totalElements) || items.length);
                renderDelivery(cart);
                renderItems(items);
                renderPagination(Number(meta.totalPages) || 0);
                checkAll.checked = false;
                updateSummary();
                updateUrl(currentPage);
            } catch (error) {
                if (handleUnauthorized(error)) return;
                list.innerHTML = `<p class="sub-mypage-list-empty">${escapeHtml(error?.message || "장바구니를 불러오지 못했습니다.")}</p>`;
                paginationRow.hidden = true;
            }
        }

        function renderItems(items) {
            if (!items.length) {
                list.innerHTML = '<p class="sub-mypage-list-empty">장바구니에 담긴 부품이 없습니다.</p>';
                return;
            }
            list.innerHTML = items.map(item => {
                const price = Number(item.unitPrice) || 0;
                const quantity = Math.min(99, Math.max(1, Number(item.quantity) || 1));
                return `<article class="sub-mypage-part-row" data-cart-item-id="${escapeHtml(item.cartItemId)}">
                    <label class="sub-form-checkbox"><input class="sub-mypage-part-check" type="checkbox"><span class="sub-form-checkbox-icon" aria-hidden="true"></span></label>
                    <div class="sub-mypage-part-info"><div class="sub-mypage-part-image"><img src="${escapeHtml(item.partImageUrl || PLACEHOLDER)}" alt="${escapeHtml(item.partName || "부품 이미지")}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></div><div class="sub-mypage-part-text"><small>${escapeHtml(item.productCategoryName || "-")}</small><strong>${escapeHtml(item.partName || "-")}</strong><em>${escapeHtml(item.partCode || "-")}</em></div></div>
                    <div class="sub-mypage-part-price" data-price="${price}">${formatMoney(price)}</div>
                    <div class="sub-mypage-quantity"><button type="button" data-cart-qty-minus aria-label="수량 감소">−</button><input type="number" value="${quantity}" min="1" max="99" readonly aria-label="수량"><button type="button" data-cart-qty-plus aria-label="수량 증가">＋</button></div>
                    <div class="sub-mypage-part-total">${formatMoney(price * quantity)}</div>
                </article>`;
            }).join("");
        }

        function renderDelivery(data) {
            const delivery = data.deliveryAddress || {};
            setText("[data-cart-business]", data.businessName || "-");
            setText("[data-cart-address]", [delivery.postalCode, delivery.address1, delivery.address2].filter(Boolean).join(" ") || "-");
            setText("[data-cart-member]", delivery.memberName || "-");
            setText("[data-cart-phone]", delivery.phoneNumber || "-");
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
                buttons += `<button type="button" data-cart-page="${number}" class="${number === currentPage ? "is-active" : ""}" ${number === currentPage ? 'aria-current="page"' : ""}>${number}</button>`;
            }
            pagination.innerHTML = `<button type="button" class="sub-pagination-arrow is-prev" data-cart-page="${Math.max(1, start - groupSize)}" aria-label="이전 페이지 묶음" ${start === 1 ? "disabled" : ""}></button>${buttons}<button type="button" class="sub-pagination-arrow is-next" data-cart-page="${end + 1}" aria-label="다음 페이지 묶음" ${end === totalPages ? "disabled" : ""}></button>`;
            paginationRow.hidden = false;
        }

        function selectedRows() {
            return [...list.querySelectorAll(".sub-mypage-part-row")].filter(row => row.querySelector(".sub-mypage-part-check")?.checked);
        }

        function updateSummary() {
            const subtotal = selectedRows().reduce((sum, row) => {
                const price = Number(row.querySelector("[data-price]")?.dataset.price) || 0;
                const quantity = Number(row.querySelector('input[type="number"]')?.value) || 1;
                return sum + price * quantity;
            }, 0);
            const shipping = subtotal > 0 ? Number(cart?.shippingFee) || 0 : 0;
            setText("[data-cart-subtotal]", `${new Intl.NumberFormat("ko-KR").format(subtotal)}원`);
            setText("[data-cart-shipping]", `+${new Intl.NumberFormat("ko-KR").format(shipping)}원`);
            setText("[data-cart-total]", `${new Intl.NumberFormat("ko-KR").format(subtotal + shipping)}원`);
            orderButton.disabled = !selectedRows().length;
        }

        async function changeQuantity(row, delta) {
            const input = row.querySelector('input[type="number"]');
            const previous = Number(input.value) || 1;
            const next = Math.min(99, Math.max(1, previous + delta));
            if (next === previous) return;
            input.value = next;
            updateRowTotal(row);
            updateSummary();
            row.classList.add("is-updating");
            try {
                await api.updateCartItem(row.dataset.cartItemId, next);
            } catch (error) {
                input.value = previous;
                updateRowTotal(row);
                updateSummary();
                if (!handleUnauthorized(error)) await showAlert(error?.message || "수량을 변경하지 못했습니다.");
            } finally {
                row.classList.remove("is-updating");
            }
        }

        async function deleteSelected() {
            const rows = selectedRows();
            if (!rows.length) {
                await showAlert("삭제할 부품을 선택해 주세요.");
                return;
            }
            const confirmed = await showConfirm("선택하신 부품을 장바구니에서\n삭제하시겠습니까?");
            if (!confirmed) return;
            deleteButton.disabled = true;
            try {
                await api.deleteCartItems(rows.map(row => Number(row.dataset.cartItemId)));
                await loadCart();
            } catch (error) {
                if (!handleUnauthorized(error)) await showAlert(error?.message || "선택한 부품을 삭제하지 못했습니다.");
            } finally {
                deleteButton.disabled = false;
            }
        }

        async function createOrder() {
            const rows = selectedRows();
            if (!rows.length) {
                await showAlert("주문할 부품을 선택해 주세요.");
                return;
            }
            const confirmed = await showConfirm("선택하신 부품들을 주문하시겠습니까?");
            if (!confirmed) return;
            orderButton.disabled = true;
            try {
                await api.createOrder({
                    cartItemIds: rows.map(row => Number(row.dataset.cartItemId)),
                    deliveryAddress: cart.deliveryAddress || {},
                    memo: ""
                });
                location.href = "/Mypage/order-list.html";
            } catch (error) {
                if (!handleUnauthorized(error)) await showAlert(error?.message || "주문을 신청하지 못했습니다.");
                orderButton.disabled = false;
            }
        }

        list.addEventListener("click", event => {
            const row = event.target.closest(".sub-mypage-part-row");
            if (!row || row.classList.contains("is-updating")) return;
            if (event.target.closest("[data-cart-qty-minus]")) changeQuantity(row, -1);
            if (event.target.closest("[data-cart-qty-plus]")) changeQuantity(row, 1);
        });
        list.addEventListener("change", event => {
            if (!event.target.matches(".sub-mypage-part-check")) return;
            const checks = [...list.querySelectorAll(".sub-mypage-part-check")];
            checkAll.checked = checks.length > 0 && checks.every(check => check.checked);
            updateSummary();
        });
        checkAll.addEventListener("change", () => {
            list.querySelectorAll(".sub-mypage-part-check").forEach(check => { check.checked = checkAll.checked; });
            updateSummary();
        });
        deleteButton.addEventListener("click", deleteSelected);
        orderButton.addEventListener("click", createOrder);
        pagination.addEventListener("click", event => {
            const button = event.target.closest("[data-cart-page]:not(:disabled)");
            if (!button) return;
            currentPage = Number(button.dataset.cartPage);
            loadCart();
            list.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        window.addEventListener("hunterBusinessChanged", () => {
            currentPage = 1;
            loadCart();
        });
        loadCart();

        function setText(selector, value) {
            const element = root.querySelector(selector);
            if (element) element.textContent = value;
        }
    }

    function updateRowTotal(row) {
        const price = Number(row.querySelector("[data-price]")?.dataset.price) || 0;
        const quantity = Number(row.querySelector('input[type="number"]')?.value) || 1;
        row.querySelector(".sub-mypage-part-total").textContent = formatMoney(price * quantity);
    }

    function updateUrl(currentPage) {
        const url = new URL(location.href);
        if (currentPage === 1) url.searchParams.delete("page");
        else url.searchParams.set("page", currentPage);
        history.replaceState({}, "", url);
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

    async function showConfirm(message) {
        if (window.HunterAlert?.open) return window.HunterAlert.open({ type: "confirm", message, cancelText: "취소" });
        return window.confirm(message);
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
    }
})();
