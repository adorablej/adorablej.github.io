window.addEventListener("includeLoaded", initMediaView);

function initMediaView() {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("type") || "archive";
    const type = MEDIA_CONFIG[requestedType] ? requestedType : "archive";
    const requestedId = Number(params.get("id"));
    const config = MEDIA_CONFIG[type];
    const list = MEDIA_DATA[type] || [];
    const item = list.find(data => data.id === requestedId) || list[0];

    if (!item) {
        renderMediaViewEmpty(type, config);
        return;
    }

    renderMediaView(type, config, list, item);
}

function renderMediaView(type, config, list, item) {
    const breadcrumb = document.getElementById("mediaViewBreadcrumb");
    const pageTitle = document.getElementById("mediaViewPageTitle");
    const category = document.getElementById("mediaViewCategory");
    const title = document.getElementById("mediaViewTitle");
    const date = document.getElementById("mediaViewDate");
    const content = document.getElementById("mediaViewContent");
    const fileWrap = document.getElementById("mediaViewFile");
    const fileName = document.getElementById("mediaViewFileName");
    const download = document.getElementById("mediaViewDownload");
    const listButton = document.getElementById("mediaViewListButton");

    if (!breadcrumb || !pageTitle || !category || !title || !date || !content || !fileWrap || !fileName || !download || !listButton) {
        console.error("Media 상세 페이지에 필요한 HTML 요소가 없습니다.");
        return;
    }

    document.title = `${item.title} | Hunter Korea`;
    breadcrumb.textContent = config.title;
    breadcrumb.href = `/Media/media-list.html?type=${type}`;
    pageTitle.textContent = config.title;
    category.textContent = item.category || "";
    title.textContent = item.title || "";
    date.textContent = item.date || "";
    content.innerHTML = item.content || "";
    listButton.href = `/Media/media-list.html?type=${type}`;

    setContentImageFallback(content);

    if (config.download && item.file) {
        fileName.textContent = getFileName(item.file);
        download.href = item.file;
        fileWrap.hidden = false;
    } else {
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
    const placeholder = "/images/common/img_placeholder.jpg";

    content.querySelectorAll("img").forEach(image => {
        image.addEventListener("error", function () {
            this.onerror = null;
            this.src = placeholder;
        });
    });
}

function getFileName(path) {
    return decodeURIComponent(path.split("/").pop() || "");
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
        pageTitle.textContent = config.title;
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
