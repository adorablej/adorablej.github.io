(function () {
    "use strict";

    const PLACEHOLDER = "/images/img_placeholder.png";
    let initialized = false;
    let latestMemberResponse = null;
    let latestBusinessResponse = null;

    async function initMypageHome() {
        if (initialized || !document.querySelector(".sub-mypage-home-page")) return;
        initialized = true;

        const api = window.HunterFrontAPI?.member;
        if (!api) return;

        bindLogout();
        renderCachedMember();

        let memberResponse;
        try {
            memberResponse = await api.getMe();
            latestMemberResponse = memberResponse;
        } catch (error) {
            if (error?.status !== 401) throw error;
            window.HunterAPI.auth.clearTokens();
            window.location.replace("/account/login.html");
            return;
        }

        try {
            latestBusinessResponse = await api.getBusinesses(false);
        } catch (error) {
            console.error("기업/사업체 정보를 불러오지 못했습니다.", error);
            latestBusinessResponse = null;
        }

        renderMember(memberResponse, latestBusinessResponse);

        const businessId = window.localStorage.getItem("hunter.selectedBusinessId") || "";
        const results = await loadHomeLists(businessId);
        if (results[0].status === "fulfilled") renderProducts(getList(results[0].value));
        else renderProducts([]);
        if (results[1].status === "fulfilled") renderOrders(getList(results[1].value));
        else renderOrders([]);
        if (results[2].status === "fulfilled") renderTraining(getList(results[2].value));
        else renderTraining([]);
    }

    function loadHomeLists(businessId) {
        const api = window.HunterFrontAPI.member;
        const businessQuery = businessId ? { businessId } : {};
        return Promise.allSettled([
            api.getProducts({ ...businessQuery, page: 1, size: 4 }),
            api.getOrders({ ...businessQuery, page: 1, size: 1 }),
            api.getTrainingApplications({ page: 1, size: 3 })
        ]);
    }

    async function reloadBusinessLists(businessId) {
        const api = window.HunterFrontAPI.member;
        try {
            if (businessId) await api.selectBusiness(businessId);
            const businessQuery = businessId ? { businessId } : {};
            const results = await Promise.allSettled([
                api.getProducts({ ...businessQuery, page: 1, size: 4 }),
                api.getOrders({ ...businessQuery, page: 1, size: 1 })
            ]);
            renderProducts(results[0].status === "fulfilled" ? getList(results[0].value) : []);
            renderOrders(results[1].status === "fulfilled" ? getList(results[1].value) : []);
        } catch (error) {
            console.error("사업체별 마이페이지 정보를 불러오지 못했습니다.", error);
        }
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
        if (Array.isArray(response?.items)) return response.items;
        return [];
    }

    function renderMember(response, businessResponse) {
        latestMemberResponse = response;
        if (businessResponse !== undefined) latestBusinessResponse = businessResponse;
        const member = response?.member || response?.data?.member || response?.data || response || {};
        setText("mypageMemberName", member.memberName);
        setText("mypageMemberPhone", member.phoneNumber);
        updateSidebarMember(member.memberName);
        const refreshTokenKey = window.HunterAPIConfig?.tokenKeys?.refresh || "hunter.refreshToken";
        const storage = window.localStorage.getItem(refreshTokenKey) ? window.localStorage : window.sessionStorage;
        storage.setItem("hunter.member", JSON.stringify(member));

        const businessData = latestBusinessResponse?.data || latestBusinessResponse || {};
        const businesses = uniqueBusinesses(businessData.businesses).filter(item =>
            item.approvalStatusCode === "APPROVED"
        );
        const selectedBusiness = businessData.selectedBusiness;
        const selected = selectedBusiness
            ? businesses.find(item => String(item.businessId) === String(selectedBusiness.businessId)) || selectedBusiness
            : businesses.find(item => item.selected || item.isSelected) || businesses[0];

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
                <option value="${escapeHtml(item.businessId)}" ${String(item.businessId) === String(selected?.businessId) ? "selected" : ""}>
                    ${escapeHtml(item.businessName)}
                </option>`).join("");
            wrap.hidden = false;
            select.disabled = false;
            if (select.dataset.businessChangeBound === "true") return;
            select.dataset.businessChangeBound = "true";
            select.addEventListener("change", async () => {
                const currentData = latestBusinessResponse?.data || latestBusinessResponse || {};
                const currentBusinesses = uniqueBusinesses(currentData.businesses).filter(item =>
                    item.approvalStatusCode === "APPROVED"
                );
                const business = currentBusinesses.find(item => String(item.businessId) === select.value);
                renderBusiness(business);
                window.localStorage.setItem("hunter.selectedBusinessId", String(business?.businessId || ""));
                window.localStorage.setItem("hunter.selectedBusinessName", business?.businessName || "");
                await reloadBusinessLists(business?.businessId || "");
                window.dispatchEvent(new CustomEvent("hunterBusinessChanged", {
                    detail: { businessId: business?.businessId || "" }
                }));
            });
        });
    }

    function uniqueBusinesses(items) {
        const businesses = Array.isArray(items) ? items : [];
        const unique = new Map();
        businesses.forEach(item => {
            const key = String(item?.businessId || "");
            if (key && !unique.has(key)) unique.set(key, item);
        });
        return [...unique.values()];
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
        if (latestMemberResponse) renderMember(latestMemberResponse, latestBusinessResponse);
    });
})();
