(function () {
    "use strict";

    const STATUS_LABELS = {
        APPLIED: "신청완료",
        WAITING: "접수대기",
        CANCELED: "신청취소",
        COMPLETED: "교육완료"
    };
    const COLORS = ["#3ccba1", "#ec45ad", "#19a8e6", "#9566e9", "#ff8d3a"];
    const PLACEHOLDER = "/images/img_placeholder.png";

    document.addEventListener("DOMContentLoaded", initTrainingHistory, { once: true });

    async function initTrainingHistory() {
        const page = document.querySelector(".sub-mypage-training-history-page");
        const list = document.querySelector("[data-training-history-list]");
        const modal = document.querySelector("#training-history-modal");
        const memberApi = window.HunterFrontAPI?.member;
        const trainingApi = window.HunterFrontAPI?.training;
        if (!page || !list || !modal || !memberApi || !trainingApi) return;

        const modalDate = modal.querySelector("[data-history-modal-date]");
        const modalCourse = modal.querySelector("[data-history-modal-course]");
        const modalDot = modal.querySelector("[data-history-modal-dot]");
        const modalInstructor = modal.querySelector("[data-history-modal-instructor]");
        const modalFee = modal.querySelector("[data-history-modal-fee]");
        const modalVisual = modal.querySelector(".sub-training-modal-visual");
        const cancelButton = modal.querySelector("[data-training-history-cancel]");
        let applications = [];
        let activeApplication = null;
        let activeDetail = null;
        let lastFocusedElement = null;

        function getItems(response) {
            if (Array.isArray(response)) return response;
            if (Array.isArray(response?.data)) return response.data;
            if (Array.isArray(response?.content)) return response.content;
            return [];
        }

        function renderList() {
            if (!applications.length) {
                list.innerHTML = '<p class="sub-mypage-list-empty">트레이닝 수강 이력이 없습니다.</p>';
                return;
            }
            list.innerHTML = applications.map((item) => {
                const status = item.applicationStatusCode || item.statusCode || "";
                return `
                    <div class="sub-mypage-training-history-row${status === "CANCELED" ? " is-cancelled" : ""}" role="row"
                        data-training-history data-application-id="${Number(item.applicationId) || ""}" data-schedule-id="${Number(item.scheduleId) || ""}">
                        <span role="cell">${escapeHtml(formatDate(item.startAt))}</span>
                        <span role="cell">${escapeHtml(item.courseTitle || "-")}</span>
                        <span role="cell" data-history-status>${escapeHtml(STATUS_LABELS[status] || status || "-")}</span>
                        <span role="cell"><button type="button" class="sub-mypage-history-view" data-training-history-open>view</button></span>
                    </div>`;
            }).join("");
        }

        function closeModal() {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("is-training-modal-open");
            lastFocusedElement?.focus?.();
        }

        function renderModal(detail) {
            const status = activeApplication?.applicationStatusCode || activeApplication?.statusCode || "";
            const count = `${Number(detail.applicationCount) || 0}/${Number(detail.capacity) || 0}`;
            modalDate.textContent = formatDateTime(detail.startAt);
            modalCourse.textContent = `${detail.courseTitle || activeApplication?.courseTitle || "-"} (${count})`;
            modalInstructor.textContent = `강사이름 : ${detail.instructorName || "-"} / `;
            modalFee.textContent = detail.feeType === "FREE" ? "무료" : `${formatMoney(detail.price)}원`;
            modalDot.style.setProperty("--training-color", COLORS[Math.abs(Number(detail.scheduleId) || 0) % COLORS.length]);

            modalVisual.innerHTML = "";
            const image = document.createElement("img");
            image.src = detail.imageUrl || PLACEHOLDER;
            image.alt = "";
            image.addEventListener("error", () => { image.src = PLACEHOLDER; }, { once: true });
            modalVisual.append(image);

            const canCancel = status === "APPLIED" || status === "WAITING";
            cancelButton.hidden = !canCancel;
            cancelButton.disabled = !canCancel;
            cancelButton.classList.toggle("is-disabled", !canCancel);
            cancelButton.textContent = status === "CANCELED" ? "취소 완료" : "신청 취소하기";
        }

        async function openModal(row, button) {
            const applicationId = Number(row.dataset.applicationId);
            activeApplication = applications.find((item) => Number(item.applicationId) === applicationId) || null;
            if (!activeApplication) return;
            lastFocusedElement = button;
            cancelButton.hidden = true;
            modalDate.textContent = "상세 정보를 불러오는 중입니다.";
            modalCourse.textContent = "";
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("is-training-modal-open");
            modal.querySelector("[data-training-history-close]")?.focus();
            try {
                activeDetail = await trainingApi.getSchedule(activeApplication.scheduleId);
                renderModal(activeDetail || {});
            } catch (error) {
                if (error?.status === 401) {
                    window.HunterAPI?.auth?.clearTokens();
                    window.location.replace(`/account/login.html?returnUrl=${encodeURIComponent(window.location.href)}`);
                    return;
                }
                modalDate.textContent = "상세 정보를 불러오지 못했습니다.";
                modalCourse.textContent = error?.message || "잠시 후 다시 시도해 주세요.";
            }
        }

        list.addEventListener("click", (event) => {
            const button = event.target.closest("[data-training-history-open]");
            const row = button?.closest("[data-training-history]");
            if (button && row) openModal(row, button);
        });

        modal.querySelectorAll("[data-training-history-close]").forEach((button) => {
            button.addEventListener("click", closeModal);
        });

        cancelButton.addEventListener("click", async () => {
            const status = activeApplication?.applicationStatusCode || activeApplication?.statusCode;
            if (!activeApplication || !["APPLIED", "WAITING"].includes(status)) return;
            const confirmed = await showAlert({
                type: "confirm",
                message: "교육 신청 취소시 교육 재신청이 어려울 수 있습니다.\n신청을 취소 하시겠습니까?",
                cancelText: "취소"
            });
            if (!confirmed) return;

            cancelButton.disabled = true;
            cancelButton.setAttribute("aria-busy", "true");
            try {
                const response = await trainingApi.cancel(activeApplication.scheduleId);
                activeApplication.applicationStatusCode = response?.statusCode || "CANCELED";
                const row = list.querySelector(`[data-application-id="${activeApplication.applicationId}"]`);
                row?.classList.add("is-cancelled");
                const statusCell = row?.querySelector("[data-history-status]");
                if (statusCell) statusCell.textContent = "신청취소";
                cancelButton.textContent = "취소 완료";
                cancelButton.hidden = false;
                cancelButton.classList.add("is-disabled");
            } catch (error) {
                await showAlert({ message: error?.message || "교육 신청 취소 중 오류가 발생했습니다." });
                cancelButton.disabled = false;
            } finally {
                cancelButton.removeAttribute("aria-busy");
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
        });

        try {
            applications = getItems(await memberApi.getTrainingApplications());
            renderList();
        } catch (error) {
            if (error?.status === 401) {
                window.HunterAPI?.auth?.clearTokens();
                window.location.replace(`/account/login.html?returnUrl=${encodeURIComponent(window.location.href)}`);
                return;
            }
            list.innerHTML = `<p class="sub-mypage-list-empty">${escapeHtml(error?.message || "수강 이력을 불러오지 못했습니다.")}</p>`;
        }
    }

    async function showAlert(options) {
        if (window.HunterAlert?.open) return window.HunterAlert.open(options);
        if (options.type === "confirm") return window.confirm(options.message);
        window.alert(options.message);
        return true;
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    }

    function formatDateTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return `${formatDate(value)} / ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }

    function formatMoney(value) {
        return new Intl.NumberFormat("ko-KR").format(Number(value) || 0);
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
        })[character]);
    }
})();
