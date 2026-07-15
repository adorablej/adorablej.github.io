(() => {
    "use strict";

    /*
     * header.html, footer.html이 모두 include된 뒤 실행
     */
    window.addEventListener("includeLoaded", initCommon);

    function initCommon() {
        initCurrentGnb();
        initHeaderTheme();
        //initHeaderTransition();
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
     * 기본값은 검정 메뉴인 theme-dark
     *
     * 메인 페이지에 data-header-theme 속성이 있으면
     * 현재 헤더 위치에 걸린 섹션의 값을 읽어
     * theme-light / theme-dark를 변경
     */
    function initHeaderTheme() {
        const header = document.querySelector(".header");

        if (!header) return;

        const sections = [
            ...document.querySelectorAll(
                ".main-section[data-header-theme]"
            )
        ];

        /*
         * 서브페이지에는 main-section이 없으므로
         * 기본 검정 테마 유지
         */
        if (!sections.length) {
            applyHeaderTheme(header, "dark");
            return;
        }

        let ticking = false;

        /**
         * 현재 헤더 중앙 지점에 걸린 섹션 찾기
         */
        function updateHeaderTheme() {
            const checkPoint = header.offsetHeight / 2;
            let activeSection = null;

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();

                if (
                    rect.top <= checkPoint &&
                    rect.bottom > checkPoint
                ) {
                    activeSection = section;
                }
            });

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

            window.requestAnimationFrame(
                updateHeaderTheme
            );

            ticking = true;
        }

        /*
         * 최초 화면 테마 적용
         */
        updateHeaderTheme();

        /*
         * 스크롤 시 테마 변경
         */
        window.addEventListener(
            "scroll",
            requestThemeUpdate,
            { passive: true }
        );

        /*
         * 화면 크기 변경 시 위치 재계산
         */
        window.addEventListener(
            "resize",
            requestThemeUpdate
        );
    }

    /**
     * Header에 테마 클래스 적용
     */
    function applyHeaderTheme(header, theme) {
        header.classList.remove(
            "theme-light",
            "theme-dark"
        );

        header.classList.add(
            theme === "light"
                ? "theme-light"
                : "theme-dark"
        );
    }

    /**
     * 경로 끝의 /와 index.html 차이를 정리
     */
    function normalizePath(pathname) {
        const path = pathname.replace(/\/+$/, "");

        if (
            path === "" ||
            path.endsWith("/index.html")
        ) {
            return "/";
        }

        return path;
    }

    /**
 * Header Transition
 *
 * 섹션이 변경될 때
 * Header를 숨겼다가 다시 표시한다.
 */
function initHeaderTransition() {
    const header = document.querySelector(".header");

    if (!header) return;

    const sections = document.querySelectorAll(
        ".main-section"
    );

    if (!sections.length) return;

    let currentSection = null;
    let timer;

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;

                if (currentSection === entry.target) return;

                currentSection = entry.target;

                header.classList.add("is-hidden");

                clearTimeout(timer);

                timer = setTimeout(() => {
                    header.classList.remove("is-hidden");
                }, 280);

            });

        },
        {
            threshold:0.65
        }
    );

    sections.forEach((section)=>{
        observer.observe(section);
    });
}
})();