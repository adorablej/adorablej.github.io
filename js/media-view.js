let isMediaViewInitialized = false;
let isMediaViewInitializing = false;

window.addEventListener("includeLoaded", initMediaView);

async function initMediaView() {
    if (isMediaViewInitialized || isMediaViewInitializing) return;
    isMediaViewInitializing = true;

    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("type") || "archive";
    const type = MEDIA_CONFIG[requestedType] ? requestedType : "archive";
    const requestedId = Number(params.get("id"));
    const config = MEDIA_CONFIG[type];
    let list = sortMediaByLatest(MEDIA_DATA[type] || []);
    let item = list.find(data => data.id === requestedId) || list[0];

    if (type === "promotion" && Number.isFinite(requestedId)) {
        try {
            item = mapContentDetail(await window.HunterFrontAPI.contents.getDetail(requestedId));
            list = sortMediaByLatest([
                mapContentNavigation(item.nextContent),
                item,
                mapContentNavigation(item.previousContent)
            ].filter(Boolean));
        } catch (error) {
            console.error("Promotion & Event 상세 콘텐츠를 불러오지 못했습니다.", error);
            item = null;
            list = [];
        }
    }

    if (!item) {
        isMediaViewInitialized = true;
        isMediaViewInitializing = false;
        renderMediaViewEmpty(type, config);
        return;
    }

    isMediaViewInitialized = true;
    isMediaViewInitializing = false;
    renderMediaView(type, config, list, item);
}

function mapContentDetail(item) {
    const thumbnail = item.thumbnailUrl
        ? `<div class="sub-media-view-image"><img src="${escapeHtml(item.thumbnailUrl)}" alt="${escapeHtml(item.title)}"></div>`
        : "";
    const body = item.content || (item.summary ? `<div class="sub-media-view-text"><p>${escapeHtml(item.summary)}</p></div>` : "");

    return {
        id: item.contentId,
        category: item.contentTypeCode === "EVENT" ? "Event" : "Promotion",
        title: item.title || "",
        date: formatMediaDate(item.publishedAt),
        content: thumbnail + body,
        attachments: item.attachments || [],
        publishedAt: item.publishedAt,
        previousContent: item.previousContent,
        nextContent: item.nextContent
    };
}

function mapContentNavigation(item) {
    if (!item) return null;
    return {
        id: item.contentId,
        title: item.title || "",
        date: formatMediaDate(item.publishedAt),
        publishedAt: item.publishedAt
    };
}

function formatMediaDate(value) {
    if (!value) return "";
    return String(value).slice(0, 10).replaceAll("-", ".");
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

function renderMediaView(type, config, list, item) {
    const breadcrumb = document.getElementById("mediaViewBreadcrumb");
    const pageTitle = document.getElementById("mediaViewPageTitle");
    const category = document.getElementById("mediaViewCategory");
    const title = document.getElementById("mediaViewTitle");
    const date = document.getElementById("mediaViewDate");
    const content = document.getElementById("mediaViewContent");
    const fileWrap = document.getElementById("mediaViewFile");
    const listButton = document.getElementById("mediaViewListButton");

    if (!breadcrumb || !pageTitle || !category || !title || !date || !content || !fileWrap || !listButton) {
        console.error("Media 상세 페이지에 필요한 HTML 요소가 없습니다.");
        return;
    }

    document.title = `${item.title} | Hunter Korea`;
    breadcrumb.textContent = config.title;
    breadcrumb.href = `/Media/media-list.html?type=${type}`;
    if (type === "promotion") {
        pageTitle.innerHTML = `Promotion &amp;<br class="mo-only"> Event`;
    } else {
        pageTitle.textContent = config.title;
    }
    category.textContent = item.category || "";
    title.textContent = item.title || "";
    date.textContent = item.date || "";
    content.innerHTML = item.content || "";
    listButton.href = `/Media/media-list.html?type=${type}`;

    setContentImageFallback(content);

    const attachments = getMediaAttachments(item);

    if (attachments.length) {
        fileWrap.innerHTML = attachments.map((attachment, index) => `
            <div class="sub-media-view-file-item">
                <div class="sub-media-view-file-info">
                    <span class="sub-media-view-file-label">
                        ${attachments.length > 1 ? `첨부파일${index + 1}` : "첨부파일"}
                    </span>
                    <span class="sub-media-view-file-name">
                        ${escapeHtml(attachment.name)}
                    </span>
                </div>
                <a href="${escapeHtml(attachment.url)}" class="sub-media-download" download>
                    ${attachments.length > 1 ? `download${index + 1}` : "download"}
                </a>
            </div>
        `).join("");
        fileWrap.hidden = false;
    } else {
        fileWrap.innerHTML = "";
        fileWrap.hidden = true;
    }

    renderMediaNavigation(type, list, item);
}

function renderMediaNavigation(type, list, item) {
    const currentIndex = list.findIndex(data => data.id === item.id);
    const prevItem = list[currentIndex - 1];
    const nextItem = list[currentIndex + 1];

    setNavigationItem(document.getElementById("mediaViewPrev"), type, prevItem);
    setNavigationItem(document.getElementById("mediaViewNext"), type, nextItem);
}

function setNavigationItem(element, type, item) {
    if (!element) return;

    if (!item) {
        element.classList.add("is-disabled");
        element.removeAttribute("href");
        element.querySelector(".sub-media-view-nav-title").textContent = "게시물이 없습니다.";
        element.querySelector(".sub-media-view-nav-date").textContent = "";
        return;
    }

    element.classList.remove("is-disabled");
    element.href = `/Media/media-view.html?type=${type}&id=${item.id}`;
    element.querySelector(".sub-media-view-nav-title").textContent = item.title;
    element.querySelector(".sub-media-view-nav-date").textContent = item.date || "";
}

function setContentImageFallback(content) {
    const placeholder = "/images/img_placeholder.png";

    content.querySelectorAll("img").forEach(image => {
        image.addEventListener("error", function () {
            this.onerror = null;
            this.src = placeholder;
        });
    });
}

function getFileName(path) {
    const cleanPath = String(path || "").split(/[?#]/)[0];
    const name = cleanPath.split("/").filter(Boolean).pop();
    return decodeURIComponent(name || "첨부파일");
}

function getMediaAttachments(item) {
    const source = Array.isArray(item.files)
        ? item.files
        : Array.isArray(item.attachments)
            ? item.attachments
            : [item.file, item.file2];

    return source
        .map(file => {
            if (typeof file === "string") {
                return { url: file, name: getFileName(file) };
            }

            if (!file || typeof file !== "object") return null;

            const url = file.url || file.fileUrl || file.downloadUrl || file.path || "";
            const name = file.name || file.fileName || file.originalName || getFileName(url);
            return { url, name };
        })
        .filter(file => file?.url)
        .slice(0, 2);
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderMediaViewEmpty(type, config) {
    const breadcrumb = document.getElementById("mediaViewBreadcrumb");
    const pageTitle = document.getElementById("mediaViewPageTitle");
    const section = document.querySelector(".sub-media-view-section .inner");

    if (breadcrumb) {
        breadcrumb.textContent = config.title;
        breadcrumb.href = `/Media/media-list.html?type=${type}`;
    }

    if (pageTitle) {
        if (type === "promotion") {
            pageTitle.innerHTML = `Promotion &amp;<br class="mo-only"> Event`;
        } else {
            pageTitle.textContent = config.title;
        }
    }

    if (section) {
        section.innerHTML = `
            <div class="sub-media-empty">
                등록된 게시물이 없습니다.
            </div>
            <div class="sub-media-view-list-wrap">
                <a href="/Media/media-list.html?type=${type}" class="sub-media-view-list-button">
                    List
                </a>
            </div>
        `;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMediaView, { once: true });
} else {
    initMediaView();
}
