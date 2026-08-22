(function () {
    "use strict";

    const api = window.HunterFrontAPI;
    const state = { member: null, businesses: [], selectedBusiness: null };
    if (!api?.member) return;

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "-";
    };
    const normalizeCode = value => String(value || "").trim().toUpperCase();
    const formatDate = value => value ? String(value).slice(0, 10).replace(/-/g, ".") : "-";
    const approvedBusinesses = () => state.businesses.filter(business =>
        normalizeCode(business.approvalStatusCode) === "APPROVED"
    );

    function resolveSelectedBusiness(response) {
        const selectedId = response?.selectedBusiness?.businessId;
        return state.businesses.find(business => selectedId && String(business.businessId) === String(selectedId))
            || state.businesses.find(business => business.selected === true)
            || approvedBusinesses()[0]
            || state.businesses[0]
            || null;
    }

    function renderMember() {
        const member = state.member || {};
        setText("mypageAccountMemberName", member.memberName);
        setText("mypageAccountMemberPhone", member.phoneNumber);
        document.querySelectorAll(".sub-mypage-user-row strong").forEach(element => {
            element.textContent = member.memberName ? `${member.memberName}님` : "회원님";
        });
        const completeName = document.querySelector("#business-complete-title strong");
        if (completeName) completeName.textContent = member.memberName ? `${member.memberName} 님,` : "회원님,";
    }

    function renderBusiness() {
        const business = state.selectedBusiness || {};
        const type = normalizeCode(business.businessTypeCode);
        const corporate = document.getElementById("mypageAccountBusinessCorporate");
        const individual = document.getElementById("mypageAccountBusinessIndividual");
        if (corporate) corporate.checked = type === "CORPORATION" || type === "CORPORATE";
        if (individual) individual.checked = type === "INDIVIDUAL";

        setText("mypageAccountBusinessNumber", business.businessNumber);
        setText("mypageAccountCorporationNumber", business.corporationNumber);
        setText("mypageAccountBusinessName", business.businessName);
        setText("mypageAccountOpeningDate", formatDate(business.openingDate));
        setText("mypageAccountRepresentativeName", business.representativeName);
        setText("mypageAccountBusinessAddress", [
            business.postalCode ? `(${business.postalCode})` : "",
            business.address1,
            business.address2
        ].filter(Boolean).join(" "));

        const fileLink = document.getElementById("mypageAccountBusinessFile");
        const fileEmpty = document.getElementById("mypageAccountBusinessFileEmpty");
        if (fileLink && business.businessLicenseFileUrl) {
            fileLink.href = business.businessLicenseFileUrl;
            fileLink.textContent = business.businessLicenseFileName || "사업자등록증 확인";
            fileLink.hidden = false;
            if (fileEmpty) fileEmpty.hidden = true;
        } else {
            if (fileLink) fileLink.hidden = true;
            if (fileEmpty) fileEmpty.hidden = false;
        }
    }

    function renderBusinessSelector() {
        const select = document.querySelector(".sub-mypage-company-select");
        const wrap = document.querySelector(".sub-mypage-company-select-wrap");
        const businesses = approvedBusinesses();
        if (!select) return;

        select.innerHTML = "";
        businesses.forEach(business => {
            const option = document.createElement("option");
            option.value = business.businessId;
            option.textContent = business.businessName || "사업체";
            option.selected = state.selectedBusiness
                && String(state.selectedBusiness.businessId) === String(business.businessId);
            select.appendChild(option);
        });
        if (wrap) wrap.hidden = businesses.length < 2;
        select.disabled = businesses.length < 2;

        if (select.dataset.accountApiBound === "true") return;
        select.dataset.accountApiBound = "true";
        select.addEventListener("change", () => selectBusiness(select.value, select));
    }

    function renderAll() {
        renderMember();
        renderBusiness();
        renderBusinessSelector();
    }

    function applyResponse(response) {
        response = response?.data || response || {};
        state.member = response.member || state.member;
        state.businesses = Array.isArray(response.businesses) ? response.businesses : [];
        state.selectedBusiness = resolveSelectedBusiness(response);
        if (state.selectedBusiness) {
            localStorage.setItem("hunter-selected-business-id", state.selectedBusiness.businessId);
            localStorage.setItem("hunter-selected-business-name", state.selectedBusiness.businessName || "");
        }
        renderAll();
    }

    function showError(error) {
        const message = error?.message || "기업/사업체 정보를 불러오지 못했습니다.";
        if (window.HunterAlert?.alert) window.HunterAlert.alert(message);
        else console.error(message, error);
    }

    async function loadBusinesses() {
        try {
            applyResponse(await api.member.getBusinesses(false));
        } catch (error) {
            if (error?.status === 401) {
                api.auth.redirectToLogin();
                return;
            }
            showError(error);
        }
    }

    async function selectBusiness(businessId, select) {
        if (!businessId) return;
        select.disabled = true;
        try {
            applyResponse(await api.member.selectBusiness(businessId));
            window.dispatchEvent(new CustomEvent("hunterBusinessChanged", {
                detail: { businessId: Number(businessId) }
            }));
        } catch (error) {
            renderBusinessSelector();
            showError(error);
        } finally {
            select.disabled = approvedBusinesses().length < 2;
        }
    }

    document.addEventListener("includeLoaded", renderAll);
    window.addEventListener("hunterBusinessesUpdated", loadBusinesses);
    loadBusinesses();
})();
