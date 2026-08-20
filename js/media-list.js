window.addEventListener("includeLoaded", initMediaList);

const MEDIA_ITEMS_PER_PAGE = 10;
const MEDIA_MOBILE_BREAKPOINT = 767;
let mediaListState = null;
let isMediaListInitialized = false;

async function initMediaList() {
    if (isMediaListInitialized) return;

    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("type") || "archive";
    const type = MEDIA_CONFIG[requestedType] ? requestedType : "archive";
    const config = MEDIA_CONFIG[type];
    const requestedPage = Math.max(1, Number(params.get("page")) || 1);
    const breadcrumb = document.getElementById("mediaBreadcrumb");
    const pageTitle = document.getElementById("mediaPageTitle");
    const filter = document.getElementById("mediaFilter");
    const list = document.getElementById("mediaList");

    if (!breadcrumb || !pageTitle || !filter || !list) return;

    isMediaListInitialized = true;
    breadcrumb.textContent = config.title;
    breadcrumb.href = `/Media/media-list.html?type=${type}`;
    pageTitle.textContent = config.title;
    document.title = `${config.title} | Hunter Korea`;

    mediaListState = {
        config,
        type,
        category: "전체",
        currentPage: requestedPage,
        totalPages: 0,
        paginationSize: getMediaPaginationSize()
    };

    renderMediaFilter(config);
    window.addEventListener("resize", handleMediaPaginationResize);
    await loadMediaList(requestedPage);
}

function renderMediaFilter(config) {
    const filter = document.getElementById("mediaFilter");
    const select = document.getElementById("mediaFilterSelect");
    const selectOptions = select?.querySelector(".sub-form-select-options");
    const selectValue = select?.querySelector(".sub-form-select-value");
    const selectHidden = select?.querySelector('input[type="hidden"]');

    filter.innerHTML = config.categories.map((category, index) => `
        <button type="button"
            class="sub-media-filter-button sub-pill-tab${index === 0 ? " is-active" : ""}"
            data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
    `).join("");

    if (selectOptions) {
        selectOptions.innerHTML = config.categories.map((category, index) => `
            <li><button type="button"
                class="sub-form-select-option${index === 0 ? " is-selected" : ""}"
                data-value="${escapeHtml(category)}">${escapeHtml(category)}</button></li>
        `).join("");
        selectValue.textContent = config.categories[0];
        selectHidden.value = config.categories[0];
        initCustomSelect();
    }

    const buttons = filter.querySelectorAll(".sub-media-filter-button");

    async function selectCategory(category) {
        if (mediaListState.category === category) return;
        mediaListState.category = category;
        buttons.forEach(button => button.classList.toggle("is-active", button.dataset.category === category));
        updatePageUrl(1);
        await loadMediaList(1);
    }

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const category = this.dataset.category;
            const option = [...(selectOptions?.querySelectorAll(".sub-form-select-option") || [])]
                .find(item => item.dataset.value === category);
            if (select && option) selectOption(select, option, false);
            else selectCategory(category);
        });
    });

    selectHidden?.addEventListener("change", function () {
        selectCategory(this.value);
    });
}

async function loadMediaList(page) {
    const list = document.getElementById("mediaList");
    if (!list || !mediaListState) return;

    const { type, category } = mediaListState;
    const query = {
        contentTypeCode: getContentTypeCodes(type, category),
        page,
        size: MEDIA_ITEMS_PER_PAGE
    };
    if (category !== "전체" && type !== "promotion") query.categoryName = category;

    try {
        const response = await window.HunterFrontAPI.contents.getList(query);
        const items = (Array.isArray(response?.data) ? response.data : []).map(mapMediaItem);
        const meta = response?.meta || {};

        mediaListState.currentPage = Number(meta.page) || page;
        mediaListState.totalPages = Number(meta.totalPages) || 0;
        renderMediaList(items);
    } catch (error) {
        console.error("Media 콘텐츠 목록을 불러오지 못했습니다.", error);
        mediaListState.currentPage = 1;
        mediaListState.totalPages = 0;
        renderMediaList([]);
    }
}

function getContentTypeCodes(type, category) {
    if (type === "promotion") {
        return category === "전체" ? ["PROMOTION", "EVENT"] : category.toUpperCase();
    }
    return type.toUpperCase();
}

function mapMediaItem(item) {
    return {
        id: item.contentId,
        category: item.categoryName || formatContentType(item.contentTypeCode),
        title: item.title || "",
        summary: item.summary || "",
        thumbnail: item.thumbnailUrl || "",
        date: formatMediaDate(item.publishedAt),
        attachments: Array.isArray(item.attachments) ? item.attachments : []
    };
}

function formatContentType(code) {
    return code === "PROMOTION" ? "Promotion" : code === "EVENT" ? "Event" : code || "";
}

function formatMediaDate(value) {
    return value ? String(value).slice(0, 10).replaceAll("-", ".") : "";
}

function renderMediaList(items) {
    const list = document.getElementById("mediaList");
    if (!items.length) {
        list.innerHTML = '<div class="sub-media-empty">등록된 게시물이 없습니다.</div>';
    } else {
        list.innerHTML = items.map(item => createMediaItem(item, mediaListState.type)).join("");
    }
    renderMediaPagination();
}

function renderMediaPagination() {
    const pagination = document.getElementById("mediaPagination");
    if (!pagination || !mediaListState) return;

    const { currentPage, totalPages } = mediaListState;
    if (totalPages <= 1) {
        pagination.hidden = true;
        pagination.innerHTML = "";
        return;
    }

    const groupSize = getMediaPaginationSize();
    const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
    const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
    const pages = [];
    for (let page = groupStart; page <= groupEnd; page += 1) {
        pages.push(`<button type="button" class="${page === currentPage ? "is-active" : ""}"
            data-media-page="${page}" aria-label="${page}페이지"
            ${page === currentPage ? 'aria-current="page"' : ""}>${page}</button>`);
    }

    pagination.innerHTML = `
        <button type="button" class="sub-pagination-arrow is-prev"
            data-media-page="${Math.max(1, groupStart - groupSize)}" aria-label="이전 페이지 묶음"
            ${groupStart === 1 ? "disabled" : ""}></button>
        ${pages.join("")}
        <button type="button" class="sub-pagination-arrow is-next"
            data-media-page="${groupEnd + 1}" aria-label="다음 페이지 묶음"
            ${groupEnd === totalPages ? "disabled" : ""}></button>`;
    pagination.hidden = false;
    pagination.querySelectorAll("[data-media-page]:not(:disabled)").forEach(button => {
        button.addEventListener("click", () => changeMediaPage(Number(button.dataset.mediaPage)));
    });
}

async function changeMediaPage(page) {
    if (!mediaListState || page === mediaListState.currentPage) return;
    updatePageUrl(page);
    await loadMediaList(page);
    document.querySelector(".sub-media-list-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updatePageUrl(page) {
    const url = new URL(window.location.href);
    if (page === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", page);
    window.history.replaceState({}, "", url);
}

function getMediaPaginationSize() {
    return window.innerWidth <= MEDIA_MOBILE_BREAKPOINT ? 3 : 10;
}

function handleMediaPaginationResize() {
    if (!mediaListState) return;
    const size = getMediaPaginationSize();
    if (size === mediaListState.paginationSize) return;
    mediaListState.paginationSize = size;
    renderMediaPagination();
}

function createMediaItem(item, type) {
    const placeholder = "/images/img_placeholder.png";
    const thumbnail = item.thumbnail || placeholder;
    const viewUrl = `/Media/media-view.html?type=${type}&id=${encodeURIComponent(item.id)}`;
    const attachments = type === "archive" ? getMediaAttachments(item) : [];
    const downloads = attachments.length ? `<div class="sub-media-downloads">${attachments.map((file, index) => `
        <a href="${escapeHtml(file.url)}" class="sub-media-download" download="${escapeHtml(file.name)}">
            ${attachments.length > 1 ? `download${index + 1}` : "download"}
        </a>`).join("")}</div>` : "";

    return `<article class="sub-media-item">
        <a href="${viewUrl}" class="sub-media-thumbnail"><img src="${escapeHtml(thumbnail)}"
            alt="${escapeHtml(item.title)}" onerror="this.onerror=null;this.src='${placeholder}';"></a>
        <div class="sub-media-content">
            <span class="sub-media-category">${escapeHtml(item.category)}</span>
            <h3 class="sub-media-title"><a href="${viewUrl}">${escapeHtml(item.title)}</a></h3>
            <a href="${viewUrl}" class="sub-media-description"><p>${escapeHtml(item.summary)}</p></a>
            <div class="sub-media-bottom"><span class="sub-media-date">${escapeHtml(item.date)}</span>${downloads}</div>
        </div>
    </article>`;
}

function getMediaAttachments(item) {
    return item.attachments.map(file => ({
        url: file.fileUrl || "",
        name: file.displayFileName || "첨부파일"
    })).filter(file => file.url).slice(0, 2);
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMediaList, { once: true });
} else {
    initMediaList();
}
