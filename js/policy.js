document.addEventListener("DOMContentLoaded", function () {
    initPolicyPage();
    initPolicyModal();
});

function getPolicy(policyKey) {
    return window.POLICY_DATA && window.POLICY_DATA[policyKey]
        ? window.POLICY_DATA[policyKey]
        : null;
}

function initPolicyPage() {
    var page = document.querySelector("[data-policy-page]");
    if (!page) return;

    var policy = getPolicy(page.dataset.policyPage);
    if (!policy) return;

    var title = page.querySelector("[data-policy-page-title]");
    var content = page.querySelector("[data-policy-page-content]");
    if (title) title.textContent = policy.title;
    if (content) content.textContent = policy.content;
    document.title = policy.title + " | HUNTER KOREA";
}

function initPolicyModal() {
    var modal = document.querySelector("[data-policy-modal]");
    if (!modal) return;

    var title = modal.querySelector("[data-policy-modal-title]");
    var content = modal.querySelector("[data-policy-modal-content]");
    var body = modal.querySelector(".policy-modal__body");
    var lastFocusedElement = null;

    function openModal(policyKey) {
        var policy = getPolicy(policyKey);
        if (!policy) return;
        lastFocusedElement = document.activeElement;
        if (title) title.textContent = policy.title;
        if (content) content.textContent = policy.content;
        if (body) body.scrollTop = 0;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-policy-modal-open");
        modal.querySelector("[data-policy-close]")?.focus();
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-policy-modal-open");
        lastFocusedElement?.focus();
    }

    document.querySelectorAll("[data-policy-open]").forEach(function (button) {
        button.addEventListener("click", function () {
            openModal(button.dataset.policyOpen);
        });
    });
    modal.querySelectorAll("[data-policy-close]").forEach(function (button) {
        button.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
}
