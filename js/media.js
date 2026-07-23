(function () {
    const PLACEHOLDER = typeof MEDIA_PLACEHOLDER !== "undefined"
        ? MEDIA_PLACEHOLDER
        : "/images/img_placeholder.png";

    function initMediaMain() {
        if (typeof MEDIA_DATA === "undefined") {
            console.error("media-data.js가 먼저 로드");
            return;
        }

        renderArchive();
        renderNews();
        renderPromotion();
    }

    function renderArchive() {
        const container = document.getElementById("mediaMainArchiveList");
        if (!container) return;

        const items = getLatestItems("archive", 3);

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
                        <div class="media-archive-desc">${getPreview(item.content, 2)}</div>
                    </div>
                </a>
            `;
        }).join("");
    }

    function renderNews() {
        const container = document.getElementById("mediaMainNewsList");
        if (!container) return;

        const items = getLatestItems("news", 3);

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
                        <div class="media-news-desc">${getPreview(item.content, 2)}</div>
                        <time datetime="${toDateTime(item.date)}">${escapeHtml(item.date || "")}</time>
                    </div>
                </a>
            `;
        }).join("");
    }

    function renderPromotion() {
        const container = document.getElementById("mediaMainPromotionList");
        const featured = document.getElementById("mediaMainFeatured");
        if (!container || !featured) return;

        const items = getLatestItems("promotion", 4);

        if (!items.length) {
            featured.hidden = true;
            container.innerHTML = "";
            return;
        }

        container.innerHTML = items.map((item, index) => `
            <article
                class="media-item${index === 0 ? " is-active" : ""}"
                data-media-index="${index}"
                tabindex="0"
                role="button"
                aria-label="${escapeHtml(item.title)}">
                <span class="media-card-category">${escapeHtml(item.category)}</span>
                <h3 class="media-card-title">${escapeHtml(item.title)}</h3>
                <p class="media-card-text">${escapeHtml(getPlainPreview(item.content, 1))}</p>
            </article>
        `).join("");

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
        text.textContent = getPlainPreview(item.content, 2);
    }

    function getLatestItems(type, limit) {
        return [...(MEDIA_DATA[type] || [])]
            .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date))
            .slice(0, limit);
    }

    function getViewUrl(type, id) {
        return `/Media/media-view.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
    }

    function getPreview(content, limit) {
        const paragraphs = getParagraphs(content).slice(0, limit);
        return paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join("");
    }

    function getPlainPreview(content, limit) {
        return getParagraphs(content).slice(0, limit).join(" ");
    }

    function getParagraphs(content) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = content || "";

        const paragraphs = Array.from(wrapper.querySelectorAll("p"))
            .map(element => element.textContent.trim())
            .filter(Boolean);

        if (paragraphs.length) return paragraphs;

        const text = wrapper.textContent.trim();
        return text ? [text] : [];
    }

    function normalizeDate(date) {
        const value = String(date || "").replaceAll(".", "-");
        const timestamp = Date.parse(value);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    function toDateTime(date) {
        return String(date || "").replaceAll(".", "-");
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
