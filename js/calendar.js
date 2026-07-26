(() => {
    "use strict";

    const trainingData = (window.TRAINING_DATA || []).map((item) => ({ ...item }));
    const appliedTrainingIds = new Set();
    const DEFAULT_TRAINING_IMAGE = "/images/img_placeholder.png";

    const statusLabel = {
        waiting: "접수대기",
        open: "접수중",
        closed: "접수마감",
        training: "교육중",
        completed: "교육완료"
    };

    const calendar = document.querySelector("#training-calendar");
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
    let selectedDate = formatDate(initialDate);

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
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long"
        }).format(date);
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
                        <span class="sub-training-event is-${event.status}">
                            ${event.startTime}
                        </span>
                    `).join("")}
                    ${events.length > 2 ? `<span class="sub-training-event">+${events.length - 2} more</span>` : ""}
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
        const events = getEventsByDate(selectedDate);

        sidebarDate.textContent = formatSidebarDate(selectedDate);
        sidebarCount.textContent = `${events.length} training schedule${events.length === 1 ? "" : "s"}`;

        if (!events.length) {
            trainingList.innerHTML = '<div class="sub-training-empty">일정이 없어효</div>';
            return;
        }

        trainingList.innerHTML = events.map((event) => {
            const remaining = Math.max(event.capacity - event.currentApplicants, 0);
            const available = event.status === "open" && remaining > 0;
            const applyLabel = available ? "교육신청" : statusLabel[event.status];
            return `
                <button type="button" class="sub-training-card" data-training-id="${event.id}">
                    <span class="sub-training-card-top">
                        <span class="sub-training-card-time">${event.date.replaceAll("-", ".")} / ${event.startTime}</span>
                        <span class="sub-training-card-status is-${event.status}">${statusLabel[event.status]}</span>
                    </span>
                    <strong class="sub-training-card-title">
                    ${event.courseName}
                    </strong>
                    <span class="sub-training-card-location">
                    ${event.courseName} · ${event.currentApplicants}/${event.capacity}
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
        const isAvailable = training.status === "open" && remaining > 0 && !isApplied;
        const fee = training.feeType === "free"
            ? "무료"
            : `${new Intl.NumberFormat("ko-KR").format(training.price)}원`;

        const modalImage = training.imageUrl || DEFAULT_TRAINING_IMAGE;

        modalContent.innerHTML = `
            <div
                class="sub-training-modal-visual"
                role="img"
                aria-label="${training.courseName} 교육 이미지"
                style="background-image:url('${modalImage}'); background-size:cover; background-position:center;"
            ></div>

            <div class="sub-training-modal-body">
                <div class="sub-training-modal-summary">
                    <strong class="sub-training-modal-datetime">
                        ${training.date.replaceAll("-", ".")} / ${training.startTime}
                    </strong>

                    <div class="sub-training-modal-course">
                        <span class="sub-training-modal-course-dot is-${training.status}" aria-hidden="true"></span>
                        <span>${training.courseName} (${training.currentApplicants}/${training.capacity})</span>
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
        submit?.addEventListener("click", () => {
            if (submit.disabled || !isAvailable) return;

            appliedTrainingIds.add(training.id);
            training.currentApplicants = Math.min(training.currentApplicants + 1, training.capacity);

            submit.textContent = "신청완료";
            submit.disabled = true;
            if (checkbox) checkbox.disabled = true;

            renderCalendar();
            renderSidebar();
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
        selectedDate = formatDate(currentDate);
        renderCalendar();
        renderSidebar();
    });

    nextButton.addEventListener("click", () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        selectedDate = formatDate(currentDate);
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
})();
