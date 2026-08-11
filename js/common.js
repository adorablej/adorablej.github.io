(() => {
    "use strict";

    /*
     * header.html, footer.html이 모두 include된 뒤 실행
     */
    window.addEventListener("includeLoaded", initCommon);

    function initCommon() {
        initCurrentGnb();
        initHeaderTheme();
        initDragCursor();
        initAllMenu();
        initHeaderSearch();
        initHeaderTransition();
    }

    /**
     * 현재 페이지와 메뉴 href를 비교해
     * 해당 GNB 메뉴에 is-active 적용
     */
    function initCurrentGnb() {
        const menuLinks = document.querySelectorAll(
            ".gnb .depth1 > li > a"
        );

        if (!menuLinks.length) return;

        const currentPath = normalizePath(
            window.location.pathname
        );

        menuLinks.forEach((link) => {
            const linkUrl = new URL(
                link.href,
                window.location.href
            );

            const linkPath = normalizePath(
                linkUrl.pathname
            );

            link.classList.toggle(
                "is-active",
                linkPath === currentPath
            );
        });
    }

    /**
     * Header Theme
     *
     * data-header-theme="light"
     * - 흰색 메뉴
     * - 흰색 로고
     *
     * data-header-theme="dark"
     * - 검정 메뉴
     * - 검정 로고
     */
    function initHeaderTheme() {
        const header = document.querySelector(".header");
        const pageScroll = document.querySelector(".page-scroll");

        if (!header) return;

        const isMainPage = document.body.classList.contains("main-page");

        if (!isMainPage) {
            applyHeaderTheme(header, "dark");
            return;
        }

        const themeSections = [
            ...document.querySelectorAll(
                "[data-header-theme]"
            )
        ].filter((section) => {
            return !section.closest(
                '[data-include="includes/header.html"]'
            );
        });

        /*
         * 테마 지정 요소가 없으면
         * 기본 검정 테마 적용
         */
        if (!themeSections.length) {
            applyHeaderTheme(header, "dark");
            return;
        }

        const pageScrollStyle = pageScroll
            ? window.getComputedStyle(pageScroll)
            : null;

        const isPageScrollContainer =
            pageScroll &&
            (
                pageScrollStyle.overflowY === "auto" ||
                pageScrollStyle.overflowY === "scroll"
            );

        const scrollTarget = isPageScrollContainer
            ? pageScroll
            : window;

        let ticking = false;

        /**
         * 헤더 중앙 위치에 걸린 요소의 테마 적용
         */
        function updateHeaderTheme() {
            const checkPoint =
                header.offsetHeight / 2;

            let activeSection = null;

            themeSections.forEach((section) => {
                const rect =
                    section.getBoundingClientRect();

                if (
                    rect.top <= checkPoint &&
                    rect.bottom > checkPoint
                ) {
                    activeSection = section;
                }
            });

            if (!activeSection) {
                const firstSection =
                    themeSections[0];

                const firstRect =
                    firstSection.getBoundingClientRect();

                if (firstRect.top > checkPoint) {
                    activeSection = firstSection;
                }
            }

            if (activeSection) {
                const isFirstVisual = activeSection === themeSections[0];

                header.classList.toggle(
                    "is-main-solid",
                    !isFirstVisual
                );

                applyHeaderTheme(
                    header,
                    isFirstVisual ? "light" : "dark"
                );
            }

            ticking = false;
        }

        /**
         * 스크롤 이벤트 과다 실행 방지
         */
        function requestThemeUpdate() {
            if (ticking) return;

            ticking = true;

            window.requestAnimationFrame(
                updateHeaderTheme
            );
        }

        updateHeaderTheme();

        scrollTarget.addEventListener(
            "scroll",
            requestThemeUpdate,
            {
                passive: true
            }
        );

        window.addEventListener(
            "resize",
            requestThemeUpdate
        );
    }

    /**
     * Header에 테마 클래스 적용
     */
    function applyHeaderTheme(header, theme) {
        const currentTheme =
            theme === "light"
                ? "light"
                : "dark";

        header.classList.toggle(
            "theme-light",
            currentTheme === "light"
        );

        header.classList.toggle(
            "theme-dark",
            currentTheme === "dark"
        );
    }

    /**
     * 경로 끝의 /와 index.html 차이를 정리
     */
    function normalizePath(pathname) {
        let path = pathname.replace(/\/+$/, "");

        path = path.replace(
            /\/index\.html$/i,
            ""
        );

        if (!path) {
            return "/";
        }

        return path;
    }

    /**
     * Header Transition
     *
     * 섹션이 변경될 때
     * Header를 숨겼다가 다시 표시
     */
    function initHeaderTransition() {
        const header = document.querySelector(".header");
        const pageScroll = document.querySelector(".page-scroll");
        const isMainPage = document.body.classList.contains("main-page");
    
        if (!header) return;
    
        const pageScrollStyle = pageScroll
            ? window.getComputedStyle(pageScroll)
            : null;
    
        const isPageScrollContainer =
            pageScroll &&
            (
                pageScrollStyle.overflowY === "auto" ||
                pageScrollStyle.overflowY === "scroll"
            );
    
        const scrollTarget = isPageScrollContainer
            ? pageScroll
            : window;
    
        let lastScrollTop = getScrollTop();
        let ticking = false;
    
        function getScrollTop() {
            return isPageScrollContainer
                ? pageScroll.scrollTop
                : window.scrollY;
        }
    
        function updateHeader() {
            const currentScrollTop = getScrollTop();

            if (!isMainPage) {
                header.classList.toggle("is-scrolled", currentScrollTop > 1);
            }
    
            const isMenuOpen =
                document.documentElement.classList.contains("is-menu-open");
    
            const isSearchOpen =
                document.documentElement.classList.contains("is-search-open");
    
            if (isMenuOpen || isSearchOpen) {
                header.classList.remove("is-hidden");
                lastScrollTop = currentScrollTop;
                ticking = false;
                return;
            }
    
            if (currentScrollTop <= 10) {
                header.classList.remove("is-hidden");
            } else if (currentScrollTop > lastScrollTop) {
                header.classList.add("is-hidden");
            } else if (currentScrollTop < lastScrollTop) {
                header.classList.remove("is-hidden");
            }
    
            lastScrollTop = Math.max(currentScrollTop, 0);
            ticking = false;
        }
    
        function handleScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateHeader);
            }
        }
    
        scrollTarget.addEventListener("scroll", handleScroll, {
            passive: true
        });

        updateHeader();
    }

    /**
 * Drag Cursor
 *
 * drag-cursor-area 영역에서
 * 커스텀 드래그 커서 표시
 */
function initDragCursor() {
    const dragCursor =
        document.querySelector(
            ".drag-cursor"
        );

    if (!dragCursor) return;

    let currentArea = null;
    let pointerX = 0;
    let pointerY = 0;
    let rafId = null;

    function updateCursorPosition() {
        dragCursor.style.setProperty(
            "--cursor-x",
            `${pointerX}px`
        );

        dragCursor.style.setProperty(
            "--cursor-y",
            `${pointerY - 35}px`
        );

        rafId = null;
    }

    function requestCursorUpdate() {
        if (rafId) return;

        rafId =
            window.requestAnimationFrame(
                updateCursorPosition
            );
    }

    document.addEventListener(
        "pointerover",
        (event) => {
            const area =
                event.target.closest(
                    ".drag-cursor-area"
                );

            if (!area) return;

            currentArea = area;

            /*
             * 커서가 처음 나타날 때
             * 이전 위치에서 튀지 않도록 현재 위치 적용
             */
            pointerX = event.clientX;
            pointerY = event.clientY;

            updateCursorPosition();

            dragCursor.classList.add(
                "is-visible"
            );
        }
    );

    document.addEventListener(
        "pointerout",
        (event) => {
            if (!currentArea) return;

            const area =
                event.target.closest(
                    ".drag-cursor-area"
                );

            if (!area) return;

            if (
                area.contains(
                    event.relatedTarget
                )
            ) {
                return;
            }

            currentArea = null;

            dragCursor.classList.remove(
                "is-visible",
                "is-dragging"
            );
        }
    );

    document.addEventListener(
        "pointermove",
        (event) => {
            if (!currentArea) return;

            pointerX = event.clientX;
            pointerY = event.clientY;

            requestCursorUpdate();
        },
        {
            passive: true
        }
    );

    document.addEventListener(
        "pointerdown",
        () => {
            if (!currentArea) return;

            dragCursor.classList.add(
                "is-dragging"
            );
        }
    );

    document.addEventListener(
        "pointerup",
        () => {
            dragCursor.classList.remove(
                "is-dragging"
            );
        }
    );

    document.addEventListener(
        "pointercancel",
        () => {
            dragCursor.classList.remove(
                "is-dragging"
            );
        }
    );
}

    /**
 * All Menu
 *
 * - 전체 메뉴 열기 / 닫기
 * - ESC 닫기
 * - 딤 클릭 닫기
 * - 아코디언 메뉴
 * - 로그인 / 로그아웃 상태 분기
 */
    function initAllMenu() {
        console.log("initAllMenu 실행");
        const openButtons = document.querySelectorAll(".btn-menu");
        const allMenu = document.querySelector(".all-menu");
        const panel = document.querySelector(".all-menu-panel");
        const toggleButtons = document.querySelectorAll(".all-menu-toggle");
        const subToggleButtons = document.querySelectorAll(".all-menu-subtoggle");
    
        if (
            !openButtons.length ||
            !allMenu ||
            !panel
        ) {
            return;
        }
    
        const headerLogin = document.querySelector(".header-r.is-login");
        const headerLogout = document.querySelector(".header-r.is-logout");
    
        let lastFocusedElement = null;
    
        function setMemberState() {
            allMenu.classList.remove(
                "is-login",
                "is-logout",
                "has-alarm"
            );
    
            if (headerLogin) {
                allMenu.classList.add("is-login");
                allMenu.classList.add("has-alarm");
                return;
            }
    
            if (headerLogout) {
                allMenu.classList.add("is-logout");
                return;
            }
    
            allMenu.classList.add("is-logout");
        }
    
        function preventPageScroll(event) {
            if (!allMenu.classList.contains("is-open")) return;
            if (panel.contains(event.target)) return;
            event.preventDefault();
        }

        function lockScroll() {
            document.documentElement.classList.add("is-menu-open");
            document.body.classList.add("is-menu-open");

            window.addEventListener("wheel", preventPageScroll, { passive: false });
            window.addEventListener("touchmove", preventPageScroll, { passive: false });
        }
    
        function unlockScroll() {
            document.documentElement.classList.remove("is-menu-open");
            document.body.classList.remove("is-menu-open");

            window.removeEventListener("wheel", preventPageScroll);
            window.removeEventListener("touchmove", preventPageScroll);
        }
    
        function openMenu() {
            console.log("openMenu 실행");
            lastFocusedElement = document.activeElement;
    
            setMemberState();
            openCurrentDepth();

            allMenu.classList.add("is-open");
            allMenu.setAttribute("aria-hidden", "false");
    
            document.querySelector(".header")?.classList.add("is-menu-open");
    
            lockScroll();
        }
    
        function closeMenu() {
            allMenu.classList.remove("is-open");
            allMenu.setAttribute("aria-hidden", "true");
    
            document.querySelector(".header")?.classList.remove("is-menu-open");

            unlockScroll();
            closeAllDepths();
    
            if (
                lastFocusedElement &&
                typeof lastFocusedElement.focus === "function"
            ) {
                lastFocusedElement.focus();
            }
        }
    
        function closeAllDepths(exceptItem = null) {
            const items = allMenu.querySelectorAll(".all-menu-item");
    
            items.forEach((item) => {
                if (item === exceptItem) return;
    
                const button = item.querySelector(".all-menu-toggle");
                const depth = item.querySelector(".all-menu-depth");
                const title = item.querySelector(".all-menu-title")?.textContent.trim();
    
                item.classList.remove("is-open");
    
                if (button) {
                    button.setAttribute("aria-expanded", "false");
                    button.setAttribute("aria-label", `${title} 하위 메뉴 펼치기`);
                }
    
                if (depth) {
                    depth.style.height = "0px";
                }
            });
        }

        function getCurrentMenuItem() {
            const currentSection = window.location.pathname
                .split("/")
                .filter(Boolean)[0]
                ?.toLowerCase();

            if (!currentSection) return null;

            return [...allMenu.querySelectorAll(".all-menu-item")].find((item) => {
                const href = item.querySelector(".all-menu-title")?.getAttribute("href");
                const menuSection = href
                    ?.split("/")
                    .filter(Boolean)[0]
                    ?.toLowerCase();

                return menuSection === currentSection;
            }) || null;
        }

        function openCurrentDepth() {
            const currentItem = getCurrentMenuItem();
            closeAllDepths(currentItem);

            if (!currentItem) return;

            const button = currentItem.querySelector(".all-menu-toggle");
            const title = currentItem.querySelector(".all-menu-title")?.textContent.trim();
            const depth = currentItem.querySelector(".all-menu-depth");
            const depthInner = currentItem.querySelector(".all-menu-depth-inner");

            if (!button || !depth || !depthInner) return;

            currentItem.classList.add("is-open");
            button.setAttribute("aria-expanded", "true");
            button.setAttribute("aria-label", `${title} 하위 메뉴 접기`);
            depth.style.height = `${depthInner.scrollHeight}px`;
        }
    
        function toggleDepth(button) {
            const item = button.closest(".all-menu-item");
            const depth = item?.querySelector(".all-menu-depth");
            const depthInner = item?.querySelector(".all-menu-depth-inner");
            const title = item?.querySelector(".all-menu-title")?.textContent.trim();
    
            if (!item || !depth || !depthInner) return;
    
            const willOpen = !item.classList.contains("is-open");
    
            closeAllDepths(item);
    
            if (willOpen) {
                item.classList.add("is-open");
                button.setAttribute("aria-expanded", "true");
                button.setAttribute("aria-label", `${title} 하위 메뉴 접기`);
                depth.style.height = `${depthInner.scrollHeight}px`;
            } else {
                item.classList.remove("is-open");
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-label", `${title} 하위 메뉴 펼치기`);
                depth.style.height = "0px";
            }
        }

        function setSubDepthHeight(subitem) {
            const subdepth = subitem.querySelector(".all-menu-subdepth");
            const subdepthInner = subitem.querySelector(".all-menu-subdepth-inner");

            if (!subdepth || !subdepthInner) return;

            subdepth.style.height = subitem.classList.contains("is-open")
                ? `${subdepthInner.scrollHeight}px`
                : "0px";
        }

        function updateParentDepthHeight(subitem, heightDelta = 0) {
            const item = subitem.closest(".all-menu-item");
            const depth = item?.querySelector(".all-menu-depth");
            const depthInner = item?.querySelector(".all-menu-depth-inner");

            if (!item?.classList.contains("is-open") || !depth || !depthInner) return;
            depth.style.height = `${depth.getBoundingClientRect().height + heightDelta}px`;
        }

        function toggleSubDepth(button) {
            const subitem = button.closest(".all-menu-subitem");
            if (!subitem) return;

            const subdepth = subitem.querySelector(".all-menu-subdepth");
            const previousHeight = subdepth?.getBoundingClientRect().height || 0;
            const willOpen = !subitem.classList.contains("is-open");
            subitem.classList.toggle("is-open", willOpen);
            button.setAttribute("aria-expanded", String(willOpen));
            button.setAttribute(
                "aria-label",
                `HUNTER USA 하위 메뉴 ${willOpen ? "접기" : "펼치기"}`
            );
            setSubDepthHeight(subitem);
            const targetHeight = parseFloat(subdepth?.style.height || "0");
            updateParentDepthHeight(subitem, targetHeight - previousHeight);
        }
    
        openButtons.forEach((button) => {
          
            button.addEventListener("click", () => {
                console.log("메뉴 클릭");
                if (allMenu.classList.contains("is-open")) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        });

        allMenu.addEventListener("click", (event) => {
            if (window.innerWidth <= 720) return;
            if (!allMenu.classList.contains("is-open")) return;
            if (panel.contains(event.target)) return;
            closeMenu();
        });
    
        toggleButtons.forEach((button) => {
            button.addEventListener("click", () => {
                toggleDepth(button);
            });
        });

        subToggleButtons.forEach((button) => {
            const subitem = button.closest(".all-menu-subitem");
            if (subitem) setSubDepthHeight(subitem);

            button.addEventListener("click", () => {
                toggleSubDepth(button);
            });
        });
    
        window.addEventListener("keydown", (event) => {
            if (!allMenu.classList.contains("is-open")) return;
    
            if (event.key === "Escape") {
                closeMenu();
            }
        });
    
        window.addEventListener("resize", () => {
            const openedItem = allMenu.querySelector(
                ".all-menu-item.is-open"
            );
    
            if (!openedItem) return;
    
            const depth = openedItem.querySelector(".all-menu-depth");
            const depthInner = openedItem.querySelector(
                ".all-menu-depth-inner"
            );
    
            if (!depth || !depthInner) return;

            openedItem.querySelectorAll(".all-menu-subitem").forEach(setSubDepthHeight);
    
            depth.style.height = `${depthInner.scrollHeight}px`;
        });
    
        setMemberState();
    }

    /**
     * Header Search
     * - 검색 패널 열기 / 닫기
     * - 최근 검색어 저장 / 삭제
     * - 검색 결과 페이지 이동
     */
    function initHeaderSearch() {
        const header = document.querySelector(".header");
        const search = document.querySelector(".header-search");
        const openButtons = document.querySelectorAll(".btn-search");

        if (!header || !search || !openButtons.length) return;

        const form = search.querySelector(".header-search-form");
        const input = search.querySelector(".header-search-input");
        const dim = search.querySelector(".header-search-dim");
        const recentSection = search.querySelector(".header-search-recent");
        const recentList = search.querySelector(".header-search-recent-list");
        const deleteAllButton = search.querySelector(".header-search-delete-all");
        const storageKey = "hunterRecentSearches";
        const maxRecentCount = 8;
        let lastFocusedElement = null;

        function getRecentSearches() {
            try {
                const saved = JSON.parse(localStorage.getItem(storageKey));
                return Array.isArray(saved) ? saved : [];
            } catch (error) {
                return [];
            }
        }

        function saveRecentSearches(items) {
            localStorage.setItem(
                storageKey,
                JSON.stringify(items.slice(0, maxRecentCount))
            );
        }

        function addRecentSearch(keyword) {
            const value = keyword.trim();
            if (!value) return;

            const items = getRecentSearches().filter(
                (item) => item.toLowerCase() !== value.toLowerCase()
            );

            items.unshift(value);
            saveRecentSearches(items);
        }

        function removeRecentSearch(keyword) {
            const items = getRecentSearches().filter(
                (item) => item !== keyword
            );

            saveRecentSearches(items);
            renderRecentSearches();
        }

        function renderRecentSearches() {
            if (!recentList || !recentSection) return;

            const items = getRecentSearches();
            recentList.innerHTML = "";
            recentSection.classList.toggle("is-empty", !items.length);

            items.forEach((keyword) => {
                const item = document.createElement("div");
                item.className = "header-search-recent-item";

                const link = document.createElement("a");
                link.className = "header-search-recent-link";
                link.href = `/search.html?keyword=${encodeURIComponent(keyword)}`;
                link.textContent = keyword;

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "header-search-recent-delete";
                deleteButton.setAttribute("aria-label", `${keyword} 삭제`);
                deleteButton.addEventListener("click", () => {
                    removeRecentSearch(keyword);
                });

                item.append(link, deleteButton);
                recentList.append(item);
            });
        }

        function openSearch() {
            lastFocusedElement = document.activeElement;
            search.classList.add("is-open");
            search.setAttribute("aria-hidden", "false");
            header.classList.add("is-search-open");
            document.documentElement.classList.add("is-search-open");
            document.body.classList.add("is-search-open");

            openButtons.forEach((button) => {
                button.setAttribute("aria-label", "검색 닫기");
                button.setAttribute("aria-expanded", "true");
            });

            renderRecentSearches();

            window.setTimeout(() => {
                input?.focus();
            }, 250);
        }

        function closeSearch() {
            search.classList.remove("is-open");
            search.setAttribute("aria-hidden", "true");
            header.classList.remove("is-search-open");
            document.documentElement.classList.remove("is-search-open");
            document.body.classList.remove("is-search-open");

            openButtons.forEach((button) => {
                button.setAttribute("aria-label", "검색 열기");
                button.setAttribute("aria-expanded", "false");
            });

            if (
                lastFocusedElement &&
                typeof lastFocusedElement.focus === "function"
            ) {
                lastFocusedElement.focus();
            }
        }

        openButtons.forEach((button) => {
            button.setAttribute("aria-expanded", "false");
            button.addEventListener("click", () => {
                if (search.classList.contains("is-open")) {
                    closeSearch();
                } else {
                    openSearch();
                }
            });
        });

        form?.addEventListener("submit", (event) => {
            const keyword = input?.value.trim() || "";

            if (!keyword) {
                event.preventDefault();
                input?.focus();
                return;
            }

            addRecentSearch(keyword);
        });

        deleteAllButton?.addEventListener("click", () => {
            localStorage.removeItem(storageKey);
            renderRecentSearches();
        });

        dim?.addEventListener("click", closeSearch);

        window.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                search.classList.contains("is-open")
            ) {
                closeSearch();
            }
        });

        renderRecentSearches();
    }

})();
