window.addEventListener("includeLoaded", initMediaList);

const MEDIA_ITEMS_PER_PAGE = 10;
const MEDIA_MOBILE_BREAKPOINT = 767;
let mediaListState = null;

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

    const requestedPage = Number(params.get("page")) || 1;
    renderMediaList(config, data, type, requestedPage);

    if (!mediaListState?.resizeBound) {
        window.addEventListener("resize", handleMediaPaginationResize);
        if (mediaListState) mediaListState.resizeBound = true;
    }
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
    const selectOptions = select?.querySelector(".sub-form-select-options");
    const selectValue = select?.querySelector(".sub-form-select-value");
    const selectHidden = select?.querySelector('input[type="hidden"]');

    filter.innerHTML = config.categories.map((category, index) => `
        <button
            type="button"
            class="sub-media-filter-button sub-pill-tab${index === 0 ? " is-active" : ""}"
            data-category="${category}">
            ${category}
        </button>
    `).join("");

    if (selectOptions) {
        selectOptions.innerHTML = config.categories.map((category, index) => `
            <li>
                <button
                    type="button"
                    class="sub-form-select-option${index === 0 ? " is-selected" : ""}"
                    data-value="${category}">
                    ${category}
                </button>
            </li>
        `).join("");

        selectValue.textContent = config.categories[0];
        selectHidden.value = config.categories[0];
        initCustomSelect();
    }

    const buttons = filter.querySelectorAll(".sub-media-filter-button");

    const filterList = category => {
        const filteredData = category === "전체"
            ? data
            : data.filter(item => item.category === category);

        renderMediaList(config, filteredData, type, 1);

        const url = new URL(window.location.href);
        url.searchParams.delete("page");
        window.history.replaceState({}, "", url);
    };

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            buttons.forEach(item => item.classList.remove("is-active"));
            this.classList.add("is-active");

            const category = this.dataset.category;
            const option = [...(selectOptions?.querySelectorAll(".sub-form-select-option") || [])]
                .find(item => item.dataset.value === category);

            if (select && option) {
                selectOption(select, option, false);
            } else {
                filterList(category);
            }
        });
    });

    selectHidden?.addEventListener("change", function () {
        const category = this.value;
        buttons.forEach(button => {
            button.classList.toggle("is-active", button.dataset.category === category);
        });
        filterList(category);
    });
}

function renderMediaList(config, data, type, page = 1) {
    const list = document.getElementById("mediaList");
    const totalPages = Math.ceil(data.length / MEDIA_ITEMS_PER_PAGE);
    const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

    mediaListState = {
        config,
        data,
        type,
        currentPage,
        resizeBound: mediaListState?.resizeBound || false,
        paginationSize: getMediaPaginationSize()
    };

    if (!data.length) {
        list.innerHTML = `
            <div class="sub-media-empty">
                등록된 게시물이 없습니다.
            </div>
        `;
        renderMediaPagination();
        return;
    }

    const startIndex = (currentPage - 1) * MEDIA_ITEMS_PER_PAGE;
    const pageItems = data.slice(startIndex, startIndex + MEDIA_ITEMS_PER_PAGE);

    list.innerHTML = pageItems.map(item => createMediaItem(item, config, type)).join("");
    renderMediaPagination();
}

function renderMediaPagination() {
    const pagination = document.getElementById("mediaPagination");
    if (!pagination || !mediaListState) return;

    const { data, currentPage } = mediaListState;
    const totalPages = Math.ceil(data.length / MEDIA_ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        pagination.hidden = true;
        pagination.innerHTML = "";
        return;
    }

    const groupSize = getMediaPaginationSize();
    const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
    const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
    const pageButtons = [];

    for (let page = groupStart; page <= groupEnd; page += 1) {
        pageButtons.push(`
            <button
                type="button"
                class="${page === currentPage ? "is-active" : ""}"
                data-media-page="${page}"
                aria-label="${page}페이지"
                ${page === currentPage ? 'aria-current="page"' : ""}>
                ${page}
            </button>
        `);
    }

    pagination.innerHTML = `
        <button
            type="button"
            class="sub-pagination-arrow is-prev"
            data-media-page="${Math.max(1, groupStart - groupSize)}"
            aria-label="이전 페이지 묶음"
            ${groupStart === 1 ? "disabled" : ""}></button>
        ${pageButtons.join("")}
        <button
            type="button"
            class="sub-pagination-arrow is-next"
            data-media-page="${groupEnd + 1}"
            aria-label="다음 페이지 묶음"
            ${groupEnd === totalPages ? "disabled" : ""}></button>
    `;
    pagination.hidden = false;

    pagination.querySelectorAll("[data-media-page]:not(:disabled)").forEach(button => {
        button.addEventListener("click", () => {
            changeMediaPage(Number(button.dataset.mediaPage));
        });
    });
}

function changeMediaPage(page) {
    if (!mediaListState) return;

    const { config, data, type } = mediaListState;
    renderMediaList(config, data, type, page);

    const url = new URL(window.location.href);
    if (page === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", page);
    window.history.replaceState({}, "", url);

    document.querySelector(".sub-media-list-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function getMediaPaginationSize() {
    return window.innerWidth <= MEDIA_MOBILE_BREAKPOINT ? 3 : 10;
}

function handleMediaPaginationResize() {
    if (!mediaListState) return;

    const nextSize = getMediaPaginationSize();
    if (nextSize === mediaListState.paginationSize) return;

    mediaListState.paginationSize = nextSize;
    renderMediaPagination();
}

function createMediaItem(item, config, type) {
    const placeholder = "/images/img_placeholder.png";
    const thumbnail = item.thumbnail || placeholder;
    const preview = getMediaPreview(item.content);
    const viewUrl = `/Media/media-view.html?type=${type}&id=${item.id}`;
    const attachments = type === "archive" ? getMediaAttachments(item) : [];
    const downloadButtons = attachments.length
        ? `
            <div class="sub-media-downloads">
                ${attachments.map((attachment, index) => `
                    <a href="${escapeHtml(attachment.url)}" class="sub-media-download" download>
                        ${attachments.length > 1 ? `download${index + 1}` : "download"}
                    </a>
                `).join("")}
            </div>
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

                <a href="${viewUrl}" class="sub-media-description">
                    ${preview}
                </a>

                <div class="sub-media-bottom">
                    <span class="sub-media-date">${item.date || ""}</span>
                    ${downloadButtons}
                </div>
            </div>
        </article>
    `;
}

function getMediaAttachments(item) {
    const source = Array.isArray(item.files)
        ? item.files
        : Array.isArray(item.attachments)
            ? item.attachments
            : [item.file, item.file2];

    return source
        .map(file => {
            if (typeof file === "string") return { url: file };
            if (!file || typeof file !== "object") return null;

            return {
                url: file.url || file.fileUrl || file.downloadUrl || file.path || "",
            };
        })
        .filter(file => file?.url)
        .slice(0, 2);
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
