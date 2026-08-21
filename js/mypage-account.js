(function () {
    "use strict";

    let memberName = "";

    async function initMypageAccount() {
        if (!document.querySelector(".sub-mypage-account")) return;

        try {
            const profile = await window.HunterFrontAPI.member.getProfile();
            memberName = profile?.memberName || "";
            setText("mypageAccountMemberName", memberName);
            setText("mypageAccountMemberPhone", profile?.phoneNumber);
            updateMemberName();
        } catch (error) {
            if (error?.status === 401) {
                window.HunterAPI.auth.clearTokens();
                window.location.replace("/account/login.html");
                return;
            }
            console.error("회원 기본정보를 불러오지 못했습니다.", error);
        }
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "-";
    }

    function updateMemberName() {
        document.querySelectorAll(".sub-mypage-user-row strong").forEach(element => {
            element.textContent = memberName ? `${memberName}님` : "회원님";
        });
        const completeName = document.querySelector("#business-complete-title strong");
        if (completeName) completeName.textContent = memberName ? `${memberName} 님,` : "회원님,";
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMypageAccount, { once: true });
    } else {
        initMypageAccount();
    }

    window.addEventListener("includeLoaded", updateMemberName);
})();
