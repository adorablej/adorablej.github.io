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
    let item = null;

    if (Number.isInteger(requestedId) && requestedId > 0) {
        try {
            const detail = await window.HunterFrontAPI.contents.getDetail(requestedId);
            item = matchesContentType(type, detail.contentTypeCode) ? mapContentDetail(detail) : null;
        } catch (error) {
            console.error("Media 상세 콘텐츠를 불러오지 못했습니다.", error);
            item = null;
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
    renderMediaView(type, config, item);
}

function mapContentDetail(item) {
    return {
        id: item.contentId,
        category: item.categoryName || formatContentType(item.contentTypeCode),
        title: item.title || "",
        date: formatMediaDate(item.publishedAt),
        content: item.content || "",
        attachments: item.attachments || [],
        previousContent: mapContentNavigation(item.previousContent),
        nextContent: mapContentNavigation(item.nextContent)
    };
}

function matchesContentType(type, code) {
    if (type === "promotion") return code === "PROMOTION" || code === "EVENT";
    return code === type.toUpperCase();
}

function formatContentType(code) {
    return code === "PROMOTION" ? "Promotion" : code === "EVENT" ? "Event" : code || "";
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

function renderMediaView(type, config, item) {
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

    renderMediaNavigation(type, item);
}

function renderMediaNavigation(type, item) {
    setNavigationItem(document.getElementById("mediaViewPrev"), type, item.previousContent);
    setNavigationItem(document.getElementById("mediaViewNext"), type, item.nextContent);
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
            const name = file.displayFileName || file.name || file.fileName || file.originalName || getFileName(url);
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
