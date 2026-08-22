(function () {
    "use strict";

    const PLACEHOLDER = "/images/img_placeholder.png";
    let initialized = false;
    let latestMemberResponse = null;

    async function initMypageHome() {
        if (initialized || !document.querySelector(".sub-mypage-home-page")) return;
        initialized = true;

        const api = window.HunterFrontAPI?.member;
        if (!api) return;

        bindLogout();
        renderCachedMember();

        const results = await Promise.allSettled([
            api.getMe(),
            api.getProducts({ page: 1, size: 4 }),
            api.getOrders({ page: 1, size: 1 }),
            api.getTrainingApplications({ page: 1, size: 3 })
        ]);

        const unauthorized = results.find(result => result.status === "rejected" && result.reason?.status === 401);
        if (unauthorized) {
            window.HunterAPI.auth.clearTokens();
            window.location.replace("/account/login.html");
            return;
        }

        if (results[0].status === "fulfilled") renderMember(results[0].value);
        if (results[1].status === "fulfilled") renderProducts(getList(results[1].value));
        else renderProducts([]);
        if (results[2].status === "fulfilled") renderOrders(getList(results[2].value));
        else renderOrders([]);
        if (results[3].status === "fulfilled") renderTraining(getList(results[3].value));
        else renderTraining([]);
    }

    function renderCachedMember() {
        const member = readStoredMember();
        if (!member) return;
        setText("mypageMemberName", member.memberName);
        setText("mypageMemberPhone", member.phoneNumber);
        updateSidebarMember(member.memberName);
    }

    function readStoredMember() {
        for (const storage of [window.sessionStorage, window.localStorage]) {
            try {
                const value = JSON.parse(storage.getItem("hunter.member") || "null");
                if (value) return value.member || value;
            } catch (error) {
                // 손상된 임시 저장값은 무시하고 API 회원정보를 사용합니다.
            }
        }
        return null;
    }

    function getList(response) {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.content)) return response.content;
        return [];
    }

    function renderMember(response) {
        latestMemberResponse = response;
        const member = response?.member || response?.data?.member || response?.data || response || {};
        setText("mypageMemberName", member.memberName);
        setText("mypageMemberPhone", member.phoneNumber);
        updateSidebarMember(member.memberName);
        const refreshTokenKey = window.HunterAPIConfig?.tokenKeys?.refresh || "hunter.refreshToken";
        const storage = window.localStorage.getItem(refreshTokenKey) ? window.localStorage : window.sessionStorage;
        storage.setItem("hunter.member", JSON.stringify(member));

        const businesses = Array.isArray(response?.businesses)
            ? response.businesses.filter(item => item.approvalStatusCode === "APPROVED")
            : [];
        const selected = response?.selectedBusiness
            ? businesses.find(item => item.businessId === response.selectedBusiness.businessId) || response.selectedBusiness
            : businesses.find(item => item.isSelected) || businesses[0];

        if (selected?.businessId) {
            window.localStorage.setItem("hunter.selectedBusinessId", String(selected.businessId));
            window.localStorage.setItem("hunter.selectedBusinessName", selected.businessName || "");
        }

        renderBusiness(selected);
        updateBusinessSelect(businesses, selected);
    }

    function renderBusiness(business) {
        setText("mypageBusinessName", business?.businessName);
        setText("mypageBusinessNumber", business?.businessNumber);
        setText("mypageBusinessRepresentative", business?.representativeName);
        setText("mypageBusinessAddress", [business?.address1, business?.address2].filter(Boolean).join(" "));
    }

    function updateSidebarMember(name) {
        document.querySelectorAll(".sub-mypage-user-row strong").forEach(element => {
            element.textContent = name ? `${name}님` : "회원님";
        });
    }

    function updateBusinessSelect(businesses, selected) {
        document.querySelectorAll(".sub-mypage-company-select").forEach(select => {
            const wrap = select.closest(".sub-mypage-company-select-wrap");
            if (!businesses.length) {
                wrap.hidden = true;
                return;
            }

            select.innerHTML = businesses.map(item => `
                <option value="${item.businessId}" ${item.businessId === selected?.businessId ? "selected" : ""}>
                    ${escapeHtml(item.businessName)}
                </option>`).join("");
            wrap.hidden = businesses.length <= 1;
            select.addEventListener("change", () => {
                const business = businesses.find(item => String(item.businessId) === select.value);
                renderBusiness(business);
                window.localStorage.setItem("hunter.selectedBusinessId", String(business?.businessId || ""));
                window.localStorage.setItem("hunter.selectedBusinessName", business?.businessName || "");
                window.dispatchEvent(new CustomEvent("hunterBusinessChanged", {
                    detail: { businessId: business?.businessId || "" }
                }));
            });
        });
    }

    function renderProducts(items) {
        const list = document.getElementById("mypageProductList");
        if (!list) return;
        list.innerHTML = items.slice(0, 4).map(item => `
            <article class="swiper-slide sub-mypage-product-card">
                <div class="sub-mypage-product-image"><img src="${escapeHtml(item.productImageUrl || PLACEHOLDER)}"
                    alt="${escapeHtml(item.productName)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}';"></div>
                <div class="sub-mypage-product-info"><strong>${escapeHtml(item.productName)}</strong>
                    <span>설치일 : ${formatDate(item.installDate)}</span></div>
            </article>`).join("");
        list.closest(".sub-mypage-product-slider")?.swiper?.update();
    }

    function renderOrders(items) {
        const list = document.getElementById("mypageOrderList");
        if (!list) return;
        list.innerHTML = items.slice(0, 1).map(order => {
            const parts = Array.isArray(order.items) ? order.items : [];
            return `<article class="sub-mypage-order-history sub-mypage-home-order-history" data-order-card>
                <div class="sub-mypage-order-history-head"><strong>
                    <span class="sub-mypage-order-meta">${formatDate(order.requestedAt)} / 총 ${Number(order.itemCount) || 0}개 주문</span>
                    <span class="sub-mypage-order-total">총금액 <em>${formatMoney(order.totalAmount)}원</em></span>
                </strong><span class="sub-mypage-status is-request">${formatOrderStatus(order.orderStatusCode)}</span></div>
                <div class="sub-mypage-order-history-body">${parts.map(part => `
                    <div class="sub-mypage-order-history-item">
                        <div class="sub-mypage-order-history-image"><img src="${escapeHtml(part.imageUrl || PLACEHOLDER)}"
                            alt="${escapeHtml(part.partName)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}';"></div>
                        <div class="sub-mypage-order-history-info"><strong>${escapeHtml(part.partName)}</strong><dl>
                            <div><dt>부품 개수</dt><dd>${Number(part.quantity) || 0}개</dd></div>
                            <div><dt>금액</dt><dd>${formatMoney(part.totalPrice)}원 <small>(개당 ${formatMoney(part.unitPrice)}원)</small></dd></div>
                        </dl></div>
                    </div>`).join("")}</div>
                ${parts.length > 1 ? `<button type="button" class="sub-mypage-order-toggle" aria-expanded="true">
                    <span>총 ${parts.length}건 주문 접기</span><i aria-hidden="true"></i></button>` : ""}
            </article>`;
        }).join("");
        initMypageOrderToggle();
    }

    function renderTraining(items) {
        const list = document.getElementById("mypageTrainingList");
        if (!list) return;
        list.innerHTML = items.slice(0, 3).map((item, index) => {
            const status = formatTrainingStatus(item.applicationStatusCode);
            return `<tr data-training-history data-date="${formatDate(item.startAt)}"
                data-time="${formatTime(item.startAt)}" data-course="${escapeHtml(item.courseTitle)}"
                data-count="${escapeHtml(item.location || "-")}" data-status="${status}"
                data-color="training-color-${index % 5 + 1}">
                <td>${formatDate(item.startAt)}</td><td>${escapeHtml(item.courseTitle)}</td>
                <td data-history-status>${status}</td>
                <td><button type="button" class="sub-button-more" data-training-history-open>view</button></td>
            </tr>`;
        }).join("");
    }

    function bindLogout() {
        document.addEventListener("click", async event => {
            const link = event.target.closest('a[href="/logout.html"], .btn-logout');
            if (!link) return;
            event.preventDefault();
            try { await window.HunterFrontAPI.auth.logout(); }
            catch (error) { window.HunterAPI.auth.clearTokens(); }
            window.location.href = "/account/login.html";
        });
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "-";
    }

    function formatDate(value) {
        return value ? String(value).slice(0, 10).replaceAll("-", ".") : "-";
    }

    function formatTime(value) {
        return value && String(value).includes("T") ? String(value).split("T")[1].slice(0, 5) : "";
    }

    function formatMoney(value) {
        return Number(value || 0).toLocaleString("ko-KR");
    }

    function formatOrderStatus(code) {
        return ({ REQUESTED: "주문 신청", APPROVED: "승인", COMPLETED: "완료", CANCELLED: "취소" })[code] || code || "-";
    }

    function formatTrainingStatus(code) {
        return ({ APPLIED: "신청완료", COMPLETED: "수강완료", CANCELLED: "신청취소" })[code] || code || "-";
    }

    function escapeHtml(value) {
        return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMypageHome, { once: true });
    } else {
        initMypageHome();
    }

    window.addEventListener("includeLoaded", () => {
        if (latestMemberResponse) renderMember(latestMemberResponse);
    });
})();
