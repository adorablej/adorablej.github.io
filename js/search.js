(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", initSearchPage);

    async function initSearchPage() {
        const api = window.HunterFrontAPI?.search;
        const form = document.querySelector(".sub-search-form");
        const input = document.querySelector(".sub-search-input");
        const clearButton = document.querySelector(".sub-search-clear");
        const resultArea = document.querySelector(".sub-search-result");
        const tabs = [...document.querySelectorAll(".sub-search-tab")];
        const recommendSection = document.querySelector(".sub-search-recommend");
        const recommendList = document.querySelector(".sub-search-recommend-list");
        const productSection = document.querySelector(".sub-search-products");
        if (!form || !input || !resultArea) return;

        const params = new URLSearchParams(window.location.search);
        let keyword = (params.get("q") || params.get("keyword") || "").trim();
        let activeCategory = (params.get("type") || "all").toLowerCase();
        let currentPage = Math.max(1, Number(params.get("page")) || 1);
        const pageSize = 10;
        let recommendedProducts = [];
        let requestSequence = 0;

        if (!tabs.some((tab) => tab.dataset.category === activeCategory)) activeCategory = "all";
        input.value = keyword;
        tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.category === activeCategory));
        saveRecentSearch(keyword);

        const showEmptyRecommendations = (visible) => {
            if (recommendSection) recommendSection.hidden = !visible;
            if (productSection) productSection.hidden = !visible || !recommendedProducts.length;
        };

        function updateUrl() {
            const url = new URL(window.location.href);
            url.searchParams.delete("keyword");
            if (keyword) url.searchParams.set("q", keyword);
            else url.searchParams.delete("q");
            if (activeCategory === "all") url.searchParams.delete("type");
            else url.searchParams.set("type", activeCategory.toUpperCase());
            if (currentPage === 1) url.searchParams.delete("page");
            else url.searchParams.set("page", currentPage);
            window.history.replaceState({}, "", url);
        }

        async function loadRecommendations() {
            if (!api?.getRecommendations) return;
            try {
                const response = await api.getRecommendations();
                const keywords = Array.isArray(response?.keywords) ? response.keywords : [];
                keywords.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                if (recommendList) {
                    recommendList.innerHTML = keywords.map((item) => `
                        <a href="${escapeHtml(safeUrl(item.targetUrl))}">${escapeHtml(item.keyword)}</a>
                    `).join("");
                }
                if (Array.isArray(response?.products)) {
                    recommendedProducts = response.products
                        .slice()
                        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                }
            } catch (error) {
                console.error("추천 검색어 조회에 실패했습니다.", error);
            }
            renderProducts(recommendedProducts);
            if (productSection && !recommendedProducts.length) productSection.hidden = true;
        }

        async function loadResults() {
            const sequence = ++requestSequence;
            if (!keyword) {
                showEmptyRecommendations(true);
                renderEmpty();
                return;
            }
            if (!api?.getResults) {
                renderError("검색 기능을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
                return;
            }

            resultArea.setAttribute("aria-busy", "true");
            resultArea.innerHTML = '<div class="sub-search-empty"><strong>검색 중입니다.</strong></div>';
            try {
                const query = { q: keyword, page: currentPage, size: pageSize };
                if (activeCategory !== "all") query.type = activeCategory.toUpperCase();
                const response = await api.getResults(query);
                if (sequence !== requestSequence) return;
                const results = Array.isArray(response?.data?.results) ? response.data.results : [];
                const meta = response?.meta || {};
                const totalElements = Number(meta.totalElements) || 0;
                const totalPages = Number(meta.totalPages) || 0;
                showEmptyRecommendations(results.length === 0);
                if (!results.length) renderEmpty();
                else renderResults(results, totalElements, totalPages);
            } catch (error) {
                if (sequence !== requestSequence) return;
                showEmptyRecommendations(true);
                renderError(error?.message || "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            } finally {
                if (sequence === requestSequence) resultArea.removeAttribute("aria-busy");
            }
        }

        function renderEmpty() {
            resultArea.innerHTML = `
                <div class="sub-search-empty">
                    <span class="sub-search-empty-icon" aria-hidden="true">!</span>
                    <strong>검색하신 조건에 맞는<br class="mo-only">결과가 없습니다.</strong>
                    <p>아래의 핵심 서비스를 통해 원하는 정보를 빠르게 확인해 보세요.</p>
                </div>`;
        }

        function renderError(message) {
            resultArea.innerHTML = `
                <div class="sub-search-empty">
                    <span class="sub-search-empty-icon" aria-hidden="true">!</span>
                    <strong>검색 결과를 불러오지 못했습니다.</strong>
                    <p>${escapeHtml(message)}</p>
                </div>`;
        }

        function renderResults(results, totalElements, totalPages) {
            resultArea.innerHTML = `
                <p class="sub-search-count">총 <strong>${totalElements}개</strong></p>
                <ul class="sub-search-list">${results.map(createResultItem).join("")}</ul>
                ${createPagination(totalPages, currentPage)}
            `;
            resultArea.querySelectorAll("[data-page]").forEach((button) => {
                button.addEventListener("click", () => {
                    currentPage = Number(button.dataset.page) || 1;
                    updateUrl();
                    loadResults();
                    document.querySelector(".sub-search-result-section")?.scrollIntoView({ behavior: "smooth" });
                });
            });
        }

        function createResultItem(item) {
            return `
                <li class="sub-search-item">
                    <a href="${escapeHtml(safeUrl(item.targetUrl))}" class="sub-search-item-link">
                        <span class="sub-search-item-category">${escapeHtml(item.categoryName || item.categoryCode || "")}</span>
                        <p class="sub-search-item-path">${escapeHtml(item.path || "")}</p>
                        <div class="sub-search-item-heading">
                            <h3 class="sub-search-item-title">${highlightKeyword(item.title || "", keyword)}</h3>
                            <time class="sub-search-item-date pc-only">${formatDate(item.publishedAt)}</time>
                        </div>
                        <p class="sub-search-item-description">${highlightKeyword(item.summary || "", keyword)}</p>
                        <time class="sub-search-item-date mo-only">${formatDate(item.publishedAt)}</time>
                    </a>
                </li>`;
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            keyword = input.value.trim();
            if (!keyword) return;
            saveRecentSearch(keyword);
            currentPage = 1;
            updateUrl();
            loadResults();
        });

        clearButton?.addEventListener("click", () => {
            input.value = "";
            input.focus();
        });

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                tabs.forEach((item) => item.classList.remove("is-active"));
                tab.classList.add("is-active");
                activeCategory = tab.dataset.category || "all";
                currentPage = 1;
                updateUrl();
                loadResults();
            });
        });

        await loadRecommendations();
        initProductSlider(() => recommendedProducts.length);
        updateUrl();
        await loadResults();
    }

    function createPagination(totalPages, currentPage) {
        if (totalPages <= 1) return "";
        const groupSize = window.innerWidth <= 767 ? 3 : 10;
        const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
        const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
        const buttons = [];
        for (let page = groupStart; page <= groupEnd; page += 1) {
            buttons.push(`<button type="button" data-page="${page}" class="${page === currentPage ? "is-active" : ""}" ${page === currentPage ? 'aria-current="page"' : ""}>${page}</button>`);
        }
        return `
            <nav class="sub-pagination" aria-label="검색 결과 페이지">
                <button type="button" class="sub-pagination-arrow is-prev" data-page="${Math.max(1, groupStart - groupSize)}" aria-label="이전 페이지 묶음" ${groupStart === 1 ? "disabled" : ""}></button>
                ${buttons.join("")}
                <button type="button" class="sub-pagination-arrow is-next" data-page="${groupEnd + 1}" aria-label="다음 페이지 묶음" ${groupEnd === totalPages ? "disabled" : ""}></button>
            </nav>`;
    }

    function renderProducts(products) {
        const track = document.querySelector(".sub-search-product-track");
        if (!track) return;
        track.innerHTML = products.map((product) => `
            <a href="${escapeHtml(safeUrl(product.targetUrl))}" class="sub-search-product-card">
                <div class="sub-search-product-image">
                    <img src="${escapeHtml(product.imageUrl || "/images/img_placeholder.png")}" alt="${escapeHtml(product.productName || "")}" onerror="this.onerror=null;this.src='/images/img_placeholder.png'">
                </div>
                <p class="sub-search-product-name">${escapeHtml(product.productName || "")}</p>
            </a>`).join("");
    }

    function initProductSlider(getProductCount) {
        const viewport = document.querySelector(".sub-search-product-viewport");
        const track = document.querySelector(".sub-search-product-track");
        const prev = document.querySelector(".sub-search-product-prev");
        const next = document.querySelector(".sub-search-product-next");
        if (!viewport || !track || !prev || !next) return;
        let index = 0;
        const maxIndex = () => Math.max(0, getProductCount() - (window.innerWidth <= 720 ? 2 : 4));
        const update = (move) => {
            const card = track.querySelector(".sub-search-product-card");
            if (!card) return;
            const distance = card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
            index = Math.min(index, maxIndex());
            if (move) viewport.scrollTo({ left: index * distance, behavior: "smooth" });
            prev.disabled = index === 0;
            next.disabled = index === maxIndex();
        };
        prev.addEventListener("click", () => { index = Math.max(0, index - 1); update(true); });
        next.addEventListener("click", () => { index = Math.min(maxIndex(), index + 1); update(true); });
        viewport.addEventListener("scroll", () => {
            const card = track.querySelector(".sub-search-product-card");
            if (!card) return;
            const distance = card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
            index = Math.round(viewport.scrollLeft / distance);
            update(false);
        }, { passive: true });
        window.addEventListener("resize", () => update(false));
        update(false);
    }

    function highlightKeyword(text, keyword) {
        const safeText = escapeHtml(text);
        if (!keyword) return safeText;
        return safeText.replace(new RegExp(`(${escapeRegExp(escapeHtml(keyword))})`, "gi"), "<mark>$1</mark>");
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return escapeHtml(value);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    }

    function saveRecentSearch(keyword) {
        if (!keyword) return;
        const storageKey = "hunterRecentSearches";
        let items = [];
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            items = Array.isArray(saved) ? saved : [];
        } catch (error) { items = []; }
        items = items.filter((item) => item.toLowerCase() !== keyword.toLowerCase());
        localStorage.setItem(storageKey, JSON.stringify([keyword, ...items].slice(0, 8)));
    }

    function safeUrl(value) {
        const url = String(value || "");
        return /^(\/|https?:\/\/)/i.test(url) ? url : "#";
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
        })[character]);
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
})();
