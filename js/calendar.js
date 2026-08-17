(() => {
    "use strict";

    const APPLICATION_STORAGE_KEY = "hunter.trainingApplications";
    const PENDING_APPLICATION_KEY = "hunter.pendingTrainingApplication";
    const trainingData = (window.TRAINING_DATA || []).map((item) => ({
        ...item,
        id: item.scheduleId,
        courseName: item.courseTitle || item.scheduleName,
        date: item.startAt?.slice(0, 10) || "",
        startTime: item.startAt?.slice(11, 16) || "",
        endTime: item.endAt?.slice(11, 16) || "",
        currentApplicants: item.applicationCount || 0,
        status: item.statusCode,
        feeType: String(item.feeType || "FREE").toLowerCase()
    }));
    const appliedTrainingIds = loadAppliedTrainingIds();
    const DEFAULT_TRAINING_IMAGE = "/images/img_placeholder.png";
    const TRAINING_COLOR_COUNT = 10;

    const trainingColorClassById = new Map(
        [...trainingData]
            .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;

                const timeCompare = a.startTime.localeCompare(b.startTime);
                if (timeCompare !== 0) return timeCompare;

                return a.id - b.id;
            })
            .map((item, index) => [
                item.id,
                `training-color-${(index % TRAINING_COLOR_COUNT) + 1}`
            ])
    );

    function getTrainingColorClass(training) {
        return trainingColorClassById.get(training.id) || "training-color-1";
    }

    const statusLabel = {
        RECRUITING: "접수중",
        CLOSED: "접수마감",
        IN_PROGRESS: "교육중",
        COMPLETED: "교육완료",
        CANCELED: "교육취소"
    };

    const statusClass = {
        RECRUITING: "open",
        CLOSED: "closed",
        IN_PROGRESS: "training",
        COMPLETED: "completed",
        CANCELED: "canceled"
    };

    function loadAppliedTrainingIds() {
        try {
            const storedIds = JSON.parse(localStorage.getItem(APPLICATION_STORAGE_KEY) || "[]");
            const sourceAppliedIds = (window.TRAINING_DATA || [])
                .filter((item) => item.applied)
                .map((item) => item.scheduleId);
            return new Set([...storedIds, ...sourceAppliedIds].map(Number).filter(Number.isFinite));
        } catch (error) {
            return new Set();
        }
    }

    function saveAppliedTrainingIds() {
        localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify([...appliedTrainingIds]));
    }

    function isLoggedIn() {
        return new URLSearchParams(window.location.search).get("previewAuth") !== "logout";
    }

    function getStatusClass(status) {
        return statusClass[status] || "closed";
    }

    function moveToLogin(trainingId) {
        sessionStorage.setItem(PENDING_APPLICATION_KEY, String(trainingId));

        const returnUrl = new URL(window.location.href);
        returnUrl.searchParams.delete("previewAuth");

        const loginUrl = new URL("/account/login.html", window.location.origin);
        loginUrl.searchParams.set("returnUrl", returnUrl.href);
        window.location.href = loginUrl.href;
    }

    const calendar = document.querySelector("#training-calendar");
    const isMypageView = calendar?.dataset.trainingView === "mypage";
    const monthTitle = document.querySelector(".sub-training-month-title");
    const prevButton = document.querySelector(".sub-training-month-prev");
    const nextButton = document.querySelector(".sub-training-month-next");
    const sidebarDate = document.querySelector(".sub-training-sidebar-date");
    const sidebarCount = document.querySelector(".sub-training-sidebar-count");
    const trainingList = document.querySelector("#training-list");
    const modal = document.querySelector("#training-modal");
    const modalContent = modal?.querySelector(".sub-training-modal-content");

    if (!calendar || !monthTitle || !prevButton || !nextButton || !trainingList) return;

    const initialDate = getInitialDate();
    let currentDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
    let selectedDate = isMypageView ? "" : formatDate(initialDate);

    function getInitialDate() {
        return new Date();
    }

function parseDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function formatMonth(date) {
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    function formatSidebarDate(dateString) {
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        }).format(parseDate(dateString));
    }

    function getEventsByDate(dateString) {
        return trainingData
            .filter((item) => item.date === dateString)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    function renderCalendar() {
        monthTitle.textContent = formatMonth(currentDate);
        calendar.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const mondayIndex = (firstDay.getDay() + 6) % 7;
        const gridStart = new Date(year, month, 1 - mondayIndex);
        const todayKey = formatDate(new Date());

        for (let index = 0; index < 42; index += 1) {
            const cellDate = new Date(gridStart);
            cellDate.setDate(gridStart.getDate() + index);

            const dateKey = formatDate(cellDate);
            const events = getEventsByDate(dateKey);
            const button = document.createElement("button");

            button.type = "button";
            button.className = "sub-training-day";
            button.dataset.date = dateKey;
            button.setAttribute("aria-label", dateKey);

            if (cellDate.getMonth() !== month) button.classList.add("is-outside");
            if (dateKey === todayKey) button.classList.add("is-today");
            if (dateKey === selectedDate) button.classList.add("is-selected");

            button.innerHTML = `
                <span class="sub-training-day-number">${cellDate.getDate()}</span>
                <span class="sub-training-event-list">
                    ${events.slice(0, 2).map((event) => `
                        <span class="sub-training-event ${getTrainingColorClass(event)} is-${getStatusClass(event.status)}">
                            ${event.startTime}
                        </span>
                    `).join("")}
                    ${events.length > 2 ? `<span class="sub-training-event-more">+${events.length - 2} more</span>` : ""}
                </span>
            `;

            button.addEventListener("click", () => selectDate(dateKey));
            calendar.appendChild(button);
        }
    }

    function selectDate(dateKey) {
        selectedDate = dateKey;
        const selected = parseDate(dateKey);

        if (
            selected.getFullYear() !== currentDate.getFullYear() ||
            selected.getMonth() !== currentDate.getMonth()
        ) {
            currentDate = new Date(selected.getFullYear(), selected.getMonth(), 1);
        }

        renderCalendar();
        renderSidebar();
    }

    function renderSidebar() {
        const events = isMypageView && !selectedDate
            ? trainingData.filter((item) => {
                const itemDate = parseDate(item.date);
                return itemDate.getFullYear() === currentDate.getFullYear()
                    && itemDate.getMonth() === currentDate.getMonth();
            }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
            : getEventsByDate(selectedDate);

        if (sidebarDate) sidebarDate.textContent = selectedDate ? formatSidebarDate(selectedDate) : "";
        if (sidebarCount) sidebarCount.textContent = `${events.length} training schedule${events.length === 1 ? "" : "s"}`;

        if (!events.length) {
            trainingList.innerHTML = '<div class="sub-training-empty">예정된 교육 일정이 없습니다.</div>';
            return;
        }

        trainingList.innerHTML = events.map((event) => {
            const remaining = Math.max(event.capacity - event.currentApplicants, 0);
            const available = event.status === "RECRUITING" && remaining > 0;
            const applyLabel = available ? "교육신청" : statusLabel[event.status];
            return `
                <button type="button" class="sub-training-card ${getTrainingColorClass(event)} ${selectedDate === event.date ? "is-selected" : ""}" data-training-id="${event.id}">
                    <span class="sub-training-card-top">
                        <span class="sub-training-card-time">${event.date.replaceAll("-", ".")} / ${event.startTime}</span>
                        <span class="sub-training-card-status is-${getStatusClass(event.status)}">${statusLabel[event.status]}</span>
                    </span>
                    <strong class="sub-training-card-title">
                    ${event.courseName}
                    </strong>
                    <span class="sub-training-card-location">
                    ${event.courseName} (${event.currentApplicants}/${event.capacity})
                    </span>
                    <span class="sub-training-card-apply ${available ? "" : "is-disabled"}">
                        ${statusLabel[event.status]}
                    </span>
                </button>
            `;
        }).join("");

        trainingList.querySelectorAll("[data-training-id]").forEach((button) => {
            button.addEventListener("click", () => {
                const training = trainingData.find((item) => item.id === Number(button.dataset.trainingId));
                if (training) openModal(training);
            });
        });
    }

    function openModal(training) {
        if (!modal || !modalContent) return;

        const remaining = Math.max(training.capacity - training.currentApplicants, 0);
        const isApplied = appliedTrainingIds.has(training.id);
        const isAvailable = training.status === "RECRUITING" && remaining > 0 && !isApplied;
        const fee = training.feeType === "free"
            ? "무료"
            : `${new Intl.NumberFormat("ko-KR").format(training.price)}원`;

        const modalImage = training.imageUrl || DEFAULT_TRAINING_IMAGE;

        modalContent.innerHTML = `
            <div
                class="modal-media sub-training-modal-visual"
                role="img"
                aria-label="${training.courseName} 교육 이미지"
                style="background-image:url('${modalImage}'); background-size:cover; background-position:center;"
            ></div>

            <div class="modal-content sub-training-modal-body">
                <div class="sub-training-modal-summary">
                    <strong class="sub-training-modal-datetime">
                        ${training.date.replaceAll("-", ".")} / ${training.startTime}
                    </strong>

                    <div class="sub-training-modal-course-row">
                        <div class="sub-training-modal-course">
                            <span class="sub-training-modal-course-dot ${getTrainingColorClass(training)} is-${getStatusClass(training.status)}" aria-hidden="true"></span>
                            <span>${training.courseName} (${training.currentApplicants}/${training.capacity})</span>
                        </div>

                        <div class="sub-training-modal-info">
                            <span class="sub-training-modal-instructor">강사이름 : ${training.instructorName || "-"} / </span>
                            <span class="sub-training-modal-fee">${fee}</span>
                        </div>
                    </div>
                </div>

                <label class="sub-form-checkbox">
                    <input
                        type="checkbox"
                        class="sub-training-modal-checkbox"
                        data-required
                        data-message="개인정보 수집 및 이용에 동의해주세요."
                        ${isAvailable ? "" : "disabled"}
                    >
                    <span class="sub-form-checkbox-icon" aria-hidden="true"></span>
                    <span class="sub-form-checkbox-text">
                        신청하시는 교육 일정과 내용을 확인해주세요. 수강 신청을 위한 개인정보 제3자 제공 및 취소 규정을 확인하였으며 이에 동의합니다.
                    </span>
                </label>

                <div class="sub-training-modal-actions">
                    <button type="button" class="sub-training-modal-cancel" data-training-close>취소</button>
                    <button type="button" class="sub-training-modal-submit" disabled>
                        ${isApplied ? "신청완료" : isAvailable ? "신청하기" : statusLabel[training.status]}
                    </button>
                </div>
            </div>
        `;

        const visual = modalContent.querySelector(".sub-training-modal-visual");
        const fallbackImage = new Image();
        fallbackImage.onerror = () => {
            if (visual) {
                visual.style.backgroundImage = `url('${DEFAULT_TRAINING_IMAGE}')`;
            }
        };
        fallbackImage.src = modalImage;

        const checkbox = modalContent.querySelector(".sub-training-modal-checkbox");
        const submit = modalContent.querySelector(".sub-training-modal-submit");
        const cancel = modalContent.querySelector("[data-training-close]");
        checkbox?.addEventListener("change", () => {
            submit.disabled = !checkbox.checked || !isAvailable;
        });
        cancel?.addEventListener("click", closeModal);
        submit?.addEventListener("click", async () => {
            if (submit.disabled || !isAvailable) return;

            if (!isLoggedIn()) {
                moveToLogin(training.id);
                return;
            }

            appliedTrainingIds.add(training.id);
            training.currentApplicants = Math.min(training.currentApplicants + 1, training.capacity);
            training.applicationCount = training.currentApplicants;
            training.applied = true;
            saveAppliedTrainingIds();

            submit.textContent = "신청완료";
            submit.disabled = true;
            if (checkbox) checkbox.disabled = true;

            renderCalendar();
            renderSidebar();
            closeModal();
            const confirmed = await window.HunterAlert?.open({
                message: "트레이닝 교육 신청이 완료되었습니다.",
                confirmText: "확인"
            });

            if (confirmed) {
                window.location.href = "/Mypage/training-history.html";
            }
        });

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-training-modal-open");
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-training-modal-open");
    }

    prevButton.addEventListener("click", () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        selectedDate = isMypageView ? "" : formatDate(currentDate);
        renderCalendar();
        renderSidebar();
    });

    nextButton.addEventListener("click", () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        selectedDate = isMypageView ? "" : formatDate(currentDate);
        renderCalendar();
        renderSidebar();
    });

    modal?.querySelectorAll("[data-training-close]").forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
    });

    renderCalendar();
    renderSidebar();

    const pendingTrainingId = Number(sessionStorage.getItem(PENDING_APPLICATION_KEY));
    if (pendingTrainingId && isLoggedIn()) {
        sessionStorage.removeItem(PENDING_APPLICATION_KEY);
        const pendingTraining = trainingData.find((item) => item.id === pendingTrainingId);

        if (pendingTraining) {
            const pendingDate = parseDate(pendingTraining.date);
            currentDate = new Date(pendingDate.getFullYear(), pendingDate.getMonth(), 1);
            selectedDate = pendingTraining.date;
            renderCalendar();
            renderSidebar();
            openModal(pendingTraining);
        }
    }
})();
