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
        // initHeaderTransition();
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

        const scrollTarget = pageScroll || window;

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
                applyHeaderTheme(
                    header,
                    activeSection.dataset.headerTheme
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
        const header =
            document.querySelector(".header");

        const pageScroll =
            document.querySelector(".page-scroll");

        const sections =
            document.querySelectorAll(
                ".main-section"
            );

        if (
            !header ||
            !sections.length
        ) {
            return;
        }

        let currentSection = null;
        let timer = null;

        const observer =
            new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        if (
                            currentSection ===
                            entry.target
                        ) {
                            return;
                        }

                        currentSection =
                            entry.target;

                        header.classList.add(
                            "is-hidden"
                        );

                        window.clearTimeout(timer);

                        timer =
                            window.setTimeout(() => {
                                header.classList.remove(
                                    "is-hidden"
                                );
                            }, 280);
                    });
                },
                {
                    root: pageScroll || null,
                    threshold: 0.65
                }
            );

        sections.forEach((section) => {
            observer.observe(section);
        });
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

        document.addEventListener(
            "pointerover",
            (event) => {
                const area =
                    event.target.closest(
                        ".drag-cursor-area"
                    );

                if (!area) return;

                currentArea = area;

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

                dragCursor.style.transform =
                    `translate3d(${event.clientX}px, ${event.clientY - 35}px, 0)`;
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
    
        function lockScroll() {
            const pageScroll = document.querySelector(".page-scroll");
    
            document.documentElement.classList.add("is-menu-open");
            document.body.classList.add("is-menu-open");
    
            if (pageScroll) {
                pageScroll.classList.add("is-menu-open");
            }
        }
    
        function unlockScroll() {
            const pageScroll = document.querySelector(".page-scroll");
    
            document.documentElement.classList.remove("is-menu-open");
            document.body.classList.remove("is-menu-open");
    
            if (pageScroll) {
                pageScroll.classList.remove("is-menu-open");
            }
        }
    
        function openMenu() {
            console.log("openMenu 실행");
            lastFocusedElement = document.activeElement;
    
            setMemberState();
    
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
    
                item.classList.remove("is-open");
    
                if (button) {
                    button.setAttribute("aria-expanded", "false");
                }
    
                if (depth) {
                    depth.style.height = "0px";
                }
            });
        }
    
        function toggleDepth(button) {
            const item = button.closest(".all-menu-item");
            const depth = item?.querySelector(".all-menu-depth");
            const depthInner = item?.querySelector(".all-menu-depth-inner");
    
            if (!item || !depth || !depthInner) return;
    
            const willOpen = !item.classList.contains("is-open");
    
            closeAllDepths(item);
    
            if (willOpen) {
                item.classList.add("is-open");
                button.setAttribute("aria-expanded", "true");
                depth.style.height = `${depthInner.scrollHeight}px`;
            } else {
                item.classList.remove("is-open");
                button.setAttribute("aria-expanded", "false");
                depth.style.height = "0px";
            }
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
    
        toggleButtons.forEach((button) => {
            button.addEventListener("click", () => {
                toggleDepth(button);
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
    
            depth.style.height = `${depthInner.scrollHeight}px`;
        });
    
        setMemberState();
    }
})();