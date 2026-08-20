(function () {
    const PLACEHOLDER = typeof MEDIA_PLACEHOLDER !== "undefined"
        ? MEDIA_PLACEHOLDER
        : "/images/img_placeholder.png";

    async function initMediaMain() {
        const tasks = [];
        if (document.getElementById("mediaMainArchiveList")) {
            tasks.push(loadContentSection("ARCHIVE", 3, renderArchive));
        }
        if (document.getElementById("mediaMainNewsList")) {
            tasks.push(loadContentSection("NEWS", 3, renderNews));
        }
        if (document.getElementById("mediaMainPromotionList")) {
            tasks.push(loadContentSection(["PROMOTION", "EVENT"], 4, renderPromotion));
        }
        await Promise.allSettled(tasks);
    }

    async function loadContentSection(contentTypeCode, size, render) {
        try {
            render(await fetchContentItems(contentTypeCode, size));
        } catch (error) {
            console.error(`${[].concat(contentTypeCode).join(" & ")} 콘텐츠를 불러오지 못했습니다.`, error);
            render([]);
        }
    }

    function renderArchive(items) {
        const container = document.getElementById("mediaMainArchiveList");
        if (!container) return;

        container.innerHTML = items.map(item => {
            const url = getViewUrl("archive", item.id);
            const thumbnail = item.thumbnail || PLACEHOLDER;

            return `
                <a href="${url}" class="media-archive-card">
                    <div class="media-archive-image">
                        <img src="${thumbnail}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}';">
                    </div>
                    <div class="media-archive-content">
                        <span class="media-archive-category">${escapeHtml(item.category)}</span>
                        <strong class="media-archive-subject">${escapeHtml(item.title)}</strong>
                        <div class="media-archive-desc"><p>${escapeHtml(item.summary)}</p></div>
                    </div>
                </a>
            `;
        }).join("");
    }

    function renderNews(items) {
        const container = document.getElementById("mediaMainNewsList");
        if (!container) return;

        container.innerHTML = items.map(item => {
            const url = getViewUrl("news", item.id);
            const thumbnail = item.thumbnail || PLACEHOLDER;

            return `
                <a href="${url}" class="media-news-item">
                    <div class="media-news-image">
                        <img src="${thumbnail}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}';">
                    </div>
                    <div class="media-news-content">
                        <span class="media-news-category">${escapeHtml(item.category)}</span>
                        <strong class="media-news-subject">${escapeHtml(item.title)}</strong>
                        <div class="media-news-desc"><p>${escapeHtml(item.summary)}</p></div>
                        <time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(formatDate(item.publishedAt))}</time>
                    </div>
                </a>
            `;
        }).join("");
    }

    async function fetchContentItems(contentTypeCode, size) {
        if (!window.HunterFrontAPI?.contents) {
            throw new Error("콘텐츠 API가 로드되지 않았습니다.");
        }

        const response = await window.HunterFrontAPI.contents.getList({
            contentTypeCode,
            page: 1,
            size
        });
        const data = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.content)
                    ? response.content
                    : [];

        return data
            .map(item => ({
                id: item.contentId,
                category: item.categoryName || formatContentType(item.contentTypeCode),
                title: item.title || "",
                thumbnail: item.thumbnailUrl || "",
                summary: item.summary || "",
                publishedAt: item.publishedAt || ""
            }))
            .filter(item => item.id !== undefined && item.id !== null)
            .sort((a, b) => normalizeDate(b.publishedAt) - normalizeDate(a.publishedAt))
            .slice(0, size);
    }

    function formatContentType(code) {
        return code === "PROMOTION" ? "Promotion" : code === "EVENT" ? "Event" : code || "";
    }

    function renderPromotion(items) {
        const container = document.getElementById("mediaMainPromotionList");
        const mobileContainer = document.getElementById("mediaMainPromotionMobileList");
        const featured = document.getElementById("mediaMainFeatured");
        if (!container || !featured) return;

        if (!items.length) {
            featured.hidden = true;
            container.innerHTML = "";
            if (mobileContainer) mobileContainer.innerHTML = "";
            return;
        }

        container.innerHTML = items.map((item, index) => `
            <article
                class="media-item${index === 0 ? " is-active" : ""}"
                data-media-index="${index}"
                tabindex="0"
                role="button"
                aria-label="${escapeHtml(item.title)}">
                <div class="media-item-image">
                    <img
                        src="${item.thumbnail || PLACEHOLDER}"
                        alt="${escapeHtml(item.title)}"
                        onerror="this.onerror=null;this.src='${PLACEHOLDER}';">
                </div>
                <span class="media-card-category">${escapeHtml(item.category)}</span>
                <h3 class="media-card-title">${escapeHtml(item.title)}</h3>
                <p class="media-card-text">${escapeHtml(item.summary)}</p>
            </article>
        `).join("");

        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <div class="swiper-wrapper">
                    ${items.map(item => `
                        <a href="${getViewUrl("promotion", item.id)}" class="media-item swiper-slide">
                            <div class="media-item-image">
                                <img src="${item.thumbnail || PLACEHOLDER}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}';">
                            </div>
                            <span class="media-card-category">${escapeHtml(item.category)}</span>
                            <h3 class="media-card-title">${escapeHtml(item.title)}</h3>
                            <p class="media-card-text">${escapeHtml(item.summary)}</p>
                        </a>
                    `).join("")}
                </div>
            `;
        }

        setFeatured(items[0]);

        container.addEventListener("click", event => {
            const itemElement = event.target.closest(".media-item");
            if (!itemElement) return;
            activatePromotionItem(itemElement, items);
        });

        container.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const itemElement = event.target.closest(".media-item");
            if (!itemElement) return;
            event.preventDefault();
            activatePromotionItem(itemElement, items);
        });

        if (mobileContainer) {
            new Swiper(mobileContainer, {
                slidesPerView: 1,
                spaceBetween: 16,
                pagination: {
                    el: ".media-pagination",
                    clickable: true
                },
                breakpoints: {
                    768: {
                        enabled: false
                    }
                }
            });
        }
    }

    function activatePromotionItem(itemElement, items) {
        const index = Number(itemElement.dataset.mediaIndex);
        const item = items[index];
        if (!item) return;

        document.querySelectorAll("#mediaMainPromotionList .media-item").forEach(element => {
            element.classList.toggle("is-active", element === itemElement);
        });

        setFeatured(item);
    }

    function setFeatured(item) {
        const featured = document.getElementById("mediaMainFeatured");
        const image = document.getElementById("mediaMainFeaturedImage");
        const category = document.getElementById("mediaMainFeaturedCategory");
        const title = document.getElementById("mediaMainFeaturedTitle");
        const text = document.getElementById("mediaMainFeaturedText");

        featured.href = getViewUrl("promotion", item.id);
        image.src = item.thumbnail || PLACEHOLDER;
        image.alt = item.title || "";
        image.onerror = function () {
            this.onerror = null;
            this.src = PLACEHOLDER;
        };
        category.textContent = item.category || "";
        title.textContent = item.title || "";
        text.textContent = item.summary || "";
    }

    function getViewUrl(type, id) {
        return `/Media/media-view.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
    }

    function normalizeDate(date) {
        const value = String(date || "").replaceAll(".", "-");
        const timestamp = Date.parse(value);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    function formatDate(value) {
        return value ? String(value).slice(0, 10).replaceAll("-", ".") : "";
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
        document.addEventListener("DOMContentLoaded", initMediaMain, { once: true });
    } else {
        initMediaMain();
    }
})();
