window.addEventListener("includeLoaded", initMediaList);

function initMediaList() {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("type") || "archive";
    const type = MEDIA_CONFIG[requestedType] ? requestedType : "archive";
    const config = MEDIA_CONFIG[type];
    const data = MEDIA_DATA[type] || [];

    const breadcrumb = document.getElementById("mediaBreadcrumb");
    const pageTitle = document.getElementById("mediaPageTitle");
    const filter = document.getElementById("mediaFilter");
    const list = document.getElementById("mediaList");

    if (!breadcrumb || !pageTitle || !filter || !list) {
        console.error("Media 목록 페이지에 필요한 HTML 요소가 없습니다.");
        return;
    }

    breadcrumb.textContent = config.title;
    breadcrumb.href = `/media-list.html?type=${type}`;
    pageTitle.textContent = config.title;
    document.title = `${config.title} | Hunter Korea`;

    renderMediaFilter(config, data, type);
    renderMediaList(config, data, type);
}

function renderMediaFilter(config, data, type) {
    const filter = document.getElementById("mediaFilter");

    filter.innerHTML = config.categories.map((category, index) => `
        <button
            type="button"
            class="sub-media-filter-button sub-pill-tab${index === 0 ? " is-active" : ""}"
            data-category="${category}">
            ${category}
        </button>
    `).join("");

    const buttons = filter.querySelectorAll(".sub-media-filter-button");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            buttons.forEach(item => item.classList.remove("is-active"));
            this.classList.add("is-active");

            const category = this.dataset.category;
            const filteredData = category === "전체"
                ? data
                : data.filter(item => item.category === category);

            renderMediaList(config, filteredData, type);
        });
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
    const viewUrl = `/media-view.html?type=${type}&id=${item.id}`;

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
