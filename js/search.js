(() => {
    "use strict";

    const searchData = [
        {
            category: "product",
            categoryLabel: "Product",
            path: "Products > Wheel Balancer",
            title: "RoadForce Elite",
            description: "휠 밸런서의 개념을 완전히 바꾼 기술혁명! RoadForce Elite 세계 최초의 비전 테크놀로지 기술, 세계에서 가장 빠른 최강의 진단 휠 밸런서...",
            date: "2026.07.15",
            href: "/Products/Wheel-Balancers/RoadForce-Elite.html"
        },
        {
            category: "product",
            categoryLabel: "Product",
            path: "Products > Wheel Balancer",
            title: "RoadForce Elite",
            description: "RoadForce Elite는 정밀한 진단과 빠른 작업 프로세스를 제공하는 프리미엄 휠 밸런서입니다.",
            date: "2026.07.15",
            href: "/Products/Wheel-Balancers/RoadForce-Elite.html"
        },
        {
            category: "product",
            categoryLabel: "Product",
            path: "Products > Wheel Balancer",
            title: "RoadForce Elite",
            description: "로드포스 측정과 비전 시스템을 통해 진동의 원인을 정확하게 확인할 수 있습니다.",
            date: "2026.07.15",
            href: "/Products/Wheel-Balancers/RoadForce-Elite.html"
        },
        {
            category: "product",
            categoryLabel: "Product",
            path: "Products > Wheel Balancer",
            title: "RoadForce Elite",
            description: "작업자 중심의 자동화 기능으로 작업 시간을 단축하고 일관된 결과를 제공합니다.",
            date: "2026.07.15",
            href: "/Products/Wheel-Balancers/RoadForce-Elite.html"
        },
        {
            category: "support",
            categoryLabel: "Support",
            path: "Support > Equipment Operation Guide",
            title: "RoadForce Elite 장비 운용 가이드",
            description: "RoadForce Elite의 기본 측정 순서와 주요 기능을 영상으로 확인할 수 있습니다.",
            date: "2026.07.14",
            href: "/Support/equipment-operation-guide.html"
        },
        {
            category: "media",
            categoryLabel: "Media",
            path: "Media > News",
            title: "RoadForce Elite 신제품 소식",
            description: "헌터코리아 RoadForce Elite의 새로운 기능과 현장 적용 사례를 소개합니다.",
            date: "2026.07.10",
            href: "/Media/media-list.html?type=news"
        }
    ];

    const productData = [
        { name: "HawkEye Elite X", image: "/images/products/HawkEyeElite_X.png", href: "/Products/Alignment-Systems/Hawkeye-Elite-X.html" },
        { name: "HawkEye Elite X", image: "/images/products/HawkEyeElite_X.png", href: "/Products/Alignment-Systems/Hawkeye-Elite-X.html" },
        { name: "HawkEye Elite X", image: "/images/products/HawkEyeElite_X.png", href: "/Products/Alignment-Systems/Hawkeye-Elite-X.html" },
        { name: "HawkEye Elite X", image: "/images/products/HawkEyeElite_X.png", href: "/Products/Alignment-Systems/Hawkeye-Elite-X.html" },
        { name: "HawkEye Elite X", image: "/images/products/HawkEyeElite_X.png", href: "/Products/Alignment-Systems/Hawkeye-Elite-X.html" }
        
    ];

    document.addEventListener("DOMContentLoaded", initSearchPage);

    function initSearchPage() {
        const form = document.querySelector(".sub-search-form");
        const input = document.querySelector(".sub-search-input");
        const clearButton = document.querySelector(".sub-search-clear");
        const resultArea = document.querySelector(".sub-search-result");
        const tabs = document.querySelectorAll(".sub-search-tab");

        if (!form || !input || !resultArea) return;

        const params = new URLSearchParams(window.location.search);
        const initialKeyword = params.get("keyword")?.trim() || "";
        let activeCategory = "all";
        let currentPage = 1;
        const pageSize = 4;

        input.value = initialKeyword;
        saveRecentSearch(initialKeyword);

        function getFilteredResults() {
            const keyword = input.value.trim().toLowerCase();
            if (!keyword) return [];

            return searchData.filter((item) => {
                const matchesKeyword = [
                    item.title,
                    item.description,
                    item.path
                ].some((value) => value.toLowerCase().includes(keyword));

                const matchesCategory =
                    activeCategory === "all" ||
                    item.category === activeCategory;

                return matchesKeyword && matchesCategory;
            });
        }

        function render() {
            const keyword = input.value.trim();
            const results = getFilteredResults();
            const recommendSection = document.querySelector(".sub-search-recommend");
            const productSection = document.querySelector(".sub-search-products");

            if (!results.length) {
                if (recommendSection) recommendSection.style.display = "";
                if (productSection) productSection.style.display = "";

                resultArea.innerHTML = `
                    <div class="sub-search-empty">
                        <span class="sub-search-empty-icon" aria-hidden="true">!</span>
                        <strong>검색하신 조건에 맞는 결과가 없습니다.</strong>
                        <p>아래의 핵심 서비스를 통해 원하는 정보를 빠르게 확인해 보세요.</p>
                    </div>
                `;
                return;
            }

            if (recommendSection) recommendSection.style.display = "none";
            if (productSection) productSection.style.display = "none";

            const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
            currentPage = Math.min(currentPage, totalPages);
            const startIndex = (currentPage - 1) * pageSize;
            const visibleItems = results.slice(startIndex, startIndex + pageSize);

            resultArea.innerHTML = `
                <p class="sub-search-count"><strong>${results.length}개</strong> 결과 검색</p>
                <ul class="sub-search-list">
                    ${visibleItems.map((item) => createResultItem(item, keyword)).join("")}
                </ul>
                ${createPagination(totalPages)}
            `;

            resultArea.querySelectorAll("[data-page]").forEach((button) => {
                button.addEventListener("click", () => {
                    const nextPage = Number(button.dataset.page);
                    if (!Number.isNaN(nextPage)) {
                        currentPage = Math.min(Math.max(nextPage, 1), totalPages);
                        render();
                    }
                });
            });
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const keyword = input.value.trim();
            if (!keyword) return;

            saveRecentSearch(keyword);
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set("keyword", keyword);
            window.history.replaceState({}, "", nextUrl);
            currentPage = 1;
            render();
        });

        clearButton?.addEventListener("click", () => {
            input.value = "";
            input.focus();
            currentPage = 1;
            render();
        });

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                tabs.forEach((item) => item.classList.remove("is-active"));
                tab.classList.add("is-active");
                activeCategory = tab.dataset.category || "all";
                currentPage = 1;
                render();
            });
        });

        renderProducts();
        initProductSlider();
        render();
    }

    function createResultItem(item, keyword) {
        return `
            <li class="sub-search-item">
                <a href="${item.href}" class="sub-search-item-link">
                    <span class="sub-search-item-category">${item.categoryLabel}</span>
                    <p class="sub-search-item-path">${item.path}</p>
                    <div class="sub-search-item-heading">
                        <h3 class="sub-search-item-title">${highlightKeyword(item.title, keyword)}</h3>
                        <time class="sub-search-item-date">${item.date}</time>
                    </div>
                    <p class="sub-search-item-description">${highlightKeyword(item.description, keyword)}</p>
                </a>
            </li>
        `;
    }

    function createPagination(totalPages) {
        if (totalPages <= 1) return "";

        const pageButtons = Array.from(
            { length: totalPages },
            (_, index) => index + 1
        ).map((page) => `
            <button type="button" data-page="${page}" class="${page === 1 ? "is-active" : ""}">${page}</button>
        `).join("");

        return `
            <nav class="sub-search-pagination" aria-label="검색 결과 페이지">
                <button type="button" class="sub-search-page-arrow is-prev" data-page="1" aria-label="이전 페이지"></button>
                ${pageButtons}
                <button type="button" class="sub-search-page-arrow is-next" data-page="${totalPages}" aria-label="다음 페이지"></button>
            </nav>
        `;
    }

    function highlightKeyword(text, keyword) {
        if (!keyword) return escapeHtml(text);

        const escapedText = escapeHtml(text);
        const escapedKeyword = escapeRegExp(escapeHtml(keyword));

        return escapedText.replace(
            new RegExp(`(${escapedKeyword})`, "gi"),
            "<mark>$1</mark>"
        );
    }

    function escapeHtml(value) {
        return value.replace(/[&<>'"]/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        })[character]);
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function saveRecentSearch(keyword) {
        if (!keyword) return;

        const storageKey = "hunterRecentSearches";
        let items = [];

        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            items = Array.isArray(saved) ? saved : [];
        } catch (error) {
            items = [];
        }

        items = items.filter(
            (item) => item.toLowerCase() !== keyword.toLowerCase()
        );
        items.unshift(keyword);
        localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 8)));
    }

    function renderProducts() {
        const track = document.querySelector(".sub-search-product-track");
        if (!track) return;

        track.innerHTML = productData.map((product) => `
            <a href="${product.href}" class="sub-search-product-card">
                <div class="sub-search-product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <p class="sub-search-product-name">${product.name}</p>
            </a>
        `).join("");
    }

    function initProductSlider() {
        const track = document.querySelector(".sub-search-product-track");
        const prevButton = document.querySelector(".sub-search-product-prev");
        const nextButton = document.querySelector(".sub-search-product-next");

        if (!track || !prevButton || !nextButton) return;

        let index = 0;
        const maxIndex = Math.max(0, productData.length - 4);

        function updateSlider() {
            const card = track.querySelector(".sub-search-product-card");
            if (!card) return;

            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            const distance = card.getBoundingClientRect().width + gap;
            track.style.transform = `translateX(${-index * distance}px)`;

            prevButton.classList.toggle("swiper-button-disabled", index === 0);
            nextButton.classList.toggle("swiper-button-disabled", index === maxIndex);
        }

        prevButton.addEventListener("click", () => {
            index = Math.max(0, index - 1);
            updateSlider();
        });

        nextButton.addEventListener("click", () => {
            index = Math.min(maxIndex, index + 1);
            updateSlider();
        });

        window.addEventListener("resize", updateSlider);
        updateSlider();
    }
})();
