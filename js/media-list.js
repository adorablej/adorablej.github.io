window.addEventListener("includeLoaded", initMediaList);

function initMediaList() {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("type") || "archive";
    const type = MEDIA_CONFIG[requestedType] ? requestedType : "archive";
    const config = MEDIA_CONFIG[type];
    const data = sortMediaByLatest(MEDIA_DATA[type] || []);

    const breadcrumb = document.getElementById("mediaBreadcrumb");
    const pageTitle = document.getElementById("mediaPageTitle");
    const filter = document.getElementById("mediaFilter");
    const list = document.getElementById("mediaList");

    if (!breadcrumb || !pageTitle || !filter || !list) {
        console.error("Media 목록 페이지에 필요한 HTML 요소가 없습니다.");
        return;
    }

    breadcrumb.textContent = config.title;
    breadcrumb.href = `/Media/media-list.html?type=${type}`;
    pageTitle.textContent = config.title;
    document.title = `${config.title} | Hunter Korea`;

    renderMediaFilter(config, data, type);
    renderMediaList(config, data, type);
}

function sortMediaByLatest(data) {
    return [...data].sort((a, b) => {
        return normalizeMediaDate(b.date) - normalizeMediaDate(a.date);
    });
}

function normalizeMediaDate(date) {
    const timestamp = Date.parse(String(date || "").replaceAll(".", "-"));
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function renderMediaFilter(config, data, type) {
    const filter = document.getElementById("mediaFilter");
    const select = document.getElementById("mediaFilterSelect");

    filter.innerHTML = config.categories.map((category, index) => `
        <button
            type="button"
            class="sub-media-filter-button sub-pill-tab${index === 0 ? " is-active" : ""}"
            data-category="${category}">
            ${category}
        </button>
    `).join("");

    if (select) {
        select.innerHTML = config.categories.map(category => `
            <option value="${category}">${category}</option>
        `).join("");
    }

    const buttons = filter.querySelectorAll(".sub-media-filter-button");

    const filterList = category => {
        const filteredData = category === "전체"
            ? data
            : data.filter(item => item.category === category);

        renderMediaList(config, filteredData, type);
    };

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            buttons.forEach(item => item.classList.remove("is-active"));
            this.classList.add("is-active");

            const category = this.dataset.category;
            if (select) select.value = category;
            filterList(category);
        });
    });

    select?.addEventListener("change", function () {
        const category = this.value;
        buttons.forEach(button => {
            button.classList.toggle("is-active", button.dataset.category === category);
        });
        filterList(category);
    });
}

function renderMediaList(config, data, type) {
    const list = document.getElementById("mediaList");

    if (!data.length) {
        list.innerHTML = `
            <div class="sub-media-empty">
                등록된 게시물이 없습니다.
            </div>
        `;
        return;
    }

    list.innerHTML = data.map(item => createMediaItem(item, config, type)).join("");
}

function createMediaItem(item, config, type) {
    const placeholder = "/images/img_placeholder.png";
    const thumbnail = item.thumbnail || placeholder;
    const preview = getMediaPreview(item.content);
    const viewUrl = `/Media/media-view.html?type=${type}&id=${item.id}`;

    const downloadButton = config.download && item.file
        ? `
            <a href="${item.file}" class="sub-media-download" download>
                download
            </a>
        `
        : "";

    return `
        <article class="sub-media-item">
            <a href="${viewUrl}" class="sub-media-thumbnail">
                <img
                    src="${thumbnail}"
                    alt="${escapeHtml(item.title)}"
                    onerror="this.onerror=null;this.src='${placeholder}';">
            </a>

            <div class="sub-media-content">
                <span class="sub-media-category">${item.category}</span>

                <h3 class="sub-media-title">
                    <a href="${viewUrl}">${item.title}</a>
                </h3>

                <div class="sub-media-description">
                    ${preview}
                </div>

                <div class="sub-media-bottom">
                    <span class="sub-media-date">${item.date || ""}</span>
                    ${downloadButton}
                </div>
            </div>
        </article>
    `;
}

function getMediaPreview(content) {
    if (!content) return "";

    const element = document.createElement("div");
    element.innerHTML = content;

    const paragraphs = Array.from(element.querySelectorAll("p")).slice(0, 2);

    return paragraphs.map(paragraph => {
        return `<p>${escapeHtml(paragraph.textContent.trim())}</p>`;
    }).join("");
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
