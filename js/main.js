(() => {
    "use strict";

    /*
     * DOM이 모두 로드된 뒤
     * 메인 페이지 기능 초기화
     */
    document.addEventListener("DOMContentLoaded", initMain);

    function initMain() {
        initMainVisual();
        initMediaSection();
        initSectionNavigator();
        initSectionSplashes();
    }

    /**
     * Section 01 : Main Visual
     *
     * 메인 비주얼 Swiper
     * - 자동 재생
     * - 이전/다음 버튼
     * - 번호형 페이지네이션
     */
    function initMainVisual() {
        const visual = document.querySelector(".main-visual-swiper");

        if (!visual) return;

        const visualSwiper = new Swiper(visual, {
            /*
             * 마지막 슬라이드 이후
             * 첫 번째 슬라이드로 반복
             */
            loop: true,

            /*
             * 슬라이드 전환 속도
             */
            speed: 900,

            /*
             * 자동 재생
             */
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },

            /*
             * 이전/다음 버튼
             */
            navigation: {
                prevEl: ".main-visual-prev",
                nextEl: ".main-visual-next"
            },

            /*
             * 하단 번호형 페이지네이션
             */
            pagination: {
                el: ".main-visual-pagination",
                clickable: true,

                renderBullet(index, className) {
                    const number = String(index + 1).padStart(2, "0");

                    return `
                        <button
                            type="button"
                            class="${className}"
                            data-number="${number}"
                            aria-label="${number}번 슬라이드로 이동"
                        ></button>
                    `;
                }
            },

            /*
             * Swiper 기본 접근성 안내
             */
            a11y: {
                enabled: true,
                prevSlideMessage: "이전 슬라이드",
                nextSlideMessage: "다음 슬라이드"
            }
        });

        return visualSwiper;
    }

    /**
     * Section 06 : Media
     *
     * 우측 미디어 카드를 클릭하면
     * - 클릭한 카드에 is-active 클래스 적용
     * - 좌측 큰 영역의 이미지, 카테고리, 제목, 설명 교체
     */
    function initMediaSection() {
        const mediaSection = document.querySelector(".media-section");

        if (!mediaSection) return;

        /*
         * 좌측 Featured 영역
         */
        const featuredImage = mediaSection.querySelector(
            ".media-featured-image img"
        );

        const featuredCategory = mediaSection.querySelector(
            ".media-featured .media-card-category"
        );

        const featuredTitle = mediaSection.querySelector(
            ".media-featured .media-card-title"
        );

        const featuredText = mediaSection.querySelector(
            ".media-featured .media-card-text"
        );

        /*
         * 우측 목록 카드
         */
        const mediaItems = mediaSection.querySelectorAll(".media-item");

        /*
         * 필요한 요소가 없으면 기능 실행 중단
         */
        if (
            !featuredImage ||
            !featuredCategory ||
            !featuredTitle ||
            !featuredText ||
            mediaItems.length === 0
        ) {
            return;
        }

        mediaItems.forEach((item) => {
            item.addEventListener("click", () => {
                /*
                 * 클릭한 카드의 data 속성값
                 */
                const image = item.dataset.image;
                const category = item.dataset.category;
                const title = item.dataset.title;
                const description = item.dataset.desc;

                /*
                 * 기존 활성 카드 해제
                 */
                mediaItems.forEach((mediaItem) => {
                    mediaItem.classList.remove("is-active");
                });

                /*
                 * 클릭한 카드 활성화
                 */
                item.classList.add("is-active");

                /*
                 * 좌측 Featured 내용 교체
                 */
                if (image) {
                    featuredImage.src = image;
                    featuredImage.alt = title || "";
                }

                if (category) {
                    featuredCategory.textContent = category;
                }

                if (title) {
                    featuredTitle.textContent = title;
                }

                if (description) {
                    featuredText.textContent = description;
                }
            });
        });
    }

/**
 * Section Navigator
 *
 * - 네비 클릭 시 해당 섹션으로 이동
 * - 현재 보이는 섹션에 맞춰 is-active 변경
 * - History부터 Business까지 네비 표시
 */
function initSectionNavigator() {
    const navigator = document.querySelector(".section-nav");
    const scrollContainer = document.querySelector(".page-scroll");

    if (!navigator || !scrollContainer) return;

    const navItems = [
        ...navigator.querySelectorAll(".section-nav-item")
    ];

    const sections = navItems
        .map((item) => {
            return document.getElementById(
                item.dataset.target
            );
        })
        .filter(Boolean);

    if (!navItems.length || !sections.length) return;

    const firstSection = sections[0];
    const lastSection = sections[sections.length - 1];

    function setActiveItem(sectionId) {
        navItems.forEach((item) => {
            item.classList.toggle(
                "is-active",
                item.dataset.target === sectionId
            );
        });
    }

    function updateNavigator() {
        const checkPoint =
            scrollContainer.scrollTop +
            scrollContainer.clientHeight / 2;

        const firstSectionTop = firstSection.offsetTop;

        const lastSectionBottom =
            lastSection.offsetTop +
            lastSection.offsetHeight;

        const isVisible =
            checkPoint >= firstSectionTop &&
            checkPoint < lastSectionBottom;

        navigator.classList.toggle(
            "is-visible",
            isVisible
        );

        if (!isVisible) return;

        const activeSection = sections.find((section) => {
            const sectionTop = section.offsetTop;

            const sectionBottom =
                sectionTop + section.offsetHeight;

            return (
                checkPoint >= sectionTop &&
                checkPoint < sectionBottom
            );
        });

        if (activeSection) {
            setActiveItem(activeSection.id);
        }
    }

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            const targetSection =
                document.getElementById(
                    item.dataset.target
                );

            if (!targetSection) return;

            setActiveItem(targetSection.id);

            scrollContainer.scrollTo({
                top: targetSection.offsetTop,
                behavior: "smooth"
            });
        });
    });

    updateNavigator();

    scrollContainer.addEventListener(
        "scroll",
        updateNavigator,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        updateNavigator
    );
}

/**
 * Section Splashes
 *
 * - 기존 브라우저 스크롤과 scroll-snap 유지
 * - 섹션 진입 전에 스플래시 초기 상태 준비
 * - 섹션이 화면 상단에 도착하면 애니메이션 실행
 * - History: 벌어진 텍스트가 모인 뒤 사라짐
 * - Products: 중앙 원이 커지면서 콘텐츠 노출
 * - 각 스플래시는 최초 1회만 실행
 */
function initSectionSplashes() {
    const scrollContainer =
        document.querySelector(".page-scroll");

    const historySection =
        document.querySelector("#section-history");

    const productsSection =
        document.querySelector("#section-products");

    if (
        !scrollContainer ||
        typeof gsap === "undefined"
    ) {
        return;
    }

    const historySplash =
        historySection?.querySelector(
            ".text-splash-section"
        );

    const productsSplash =
        productsSection?.querySelector(
            ".products-splash-section"
        );

    const productsSvg =
        productsSplash?.querySelector(
            ".products-splash-svg"
        );

    const productsCircle =
        productsSplash?.querySelector(
            ".products-splash-circle"
        );

    let historyPlayed = false;
    let productsPlayed = false;
    let isSplashPlaying = false;
    let isSplashPending = false;
    let splashMoveRaf = null;
    let scrollEndTimer = null;

    const SECTION_TOLERANCE = 12;

    /* ========================================
    Scroll Lock
    ======================================== */

    function preventScroll(event) {
        if (
            !isSplashPlaying &&
            !isSplashPending
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    }

    function preventKeyScroll(event) {
        if (
            !isSplashPlaying &&
            !isSplashPending
        ) {
            return;
        }

        const scrollKeys = [
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
            " "
        ];

        if (!scrollKeys.includes(event.key)) return;

        event.preventDefault();
    }

    scrollContainer.addEventListener(
        "wheel",
        preventScroll,
        {
            passive: false
        }
    );

    scrollContainer.addEventListener(
        "touchmove",
        preventScroll,
        {
            passive: false
        }
    );

    window.addEventListener(
        "keydown",
        preventKeyScroll
    );

    /* ========================================
    Splash Section Entry
    ======================================== */

    function waitForSplashSection(
        section,
        playSplash
    ) {
        window.cancelAnimationFrame(
            splashMoveRaf
        );

        function checkPosition() {
            const distance =
                Math.abs(
                    scrollContainer.scrollTop -
                    section.offsetTop
                );

            if (distance <= SECTION_TOLERANCE) {
                isSplashPending = false;
                playSplash();
                return;
            }

            splashMoveRaf =
                window.requestAnimationFrame(
                    checkPosition
                );
        }

        splashMoveRaf =
            window.requestAnimationFrame(
                checkPosition
            );
    }

    function moveToSplashSection(
        section,
        playSplash
    ) {
        if (
            isSplashPending ||
            isSplashPlaying
        ) {
            return;
        }

        isSplashPending = true;

        scrollContainer.scrollTo({
            top: section.offsetTop,
            behavior: "smooth"
        });

        waitForSplashSection(
            section,
            playSplash
        );
    }

    function handleSplashWheel(event) {
        if (
            isSplashPending ||
            isSplashPlaying
        ) {
            event.preventDefault();
            return;
        }

        if (event.deltaY <= 0) return;

        const scrollTop =
            scrollContainer.scrollTop;

        const historyDistance =
            historySection.offsetTop -
            scrollTop;

        const productsDistance =
            productsSection.offsetTop -
            scrollTop;

        if (
            !historyPlayed &&
            historyDistance > 0 &&
            historyDistance <=
                scrollContainer.clientHeight
        ) {
            event.preventDefault();

            moveToSplashSection(
                historySection,
                playHistorySplash
            );

            return;
        }

        if (
            historyPlayed &&
            !productsPlayed &&
            productsDistance > 0 &&
            productsDistance <=
                scrollContainer.clientHeight
        ) {
            event.preventDefault();

            prepareProductsSplash();

            moveToSplashSection(
                productsSection,
                playProductsSplash
            );
        }
    }

    scrollContainer.addEventListener(
        "wheel",
        handleSplashWheel,
        {
            passive: false
        }
    );

    /* ========================================
    History Text Splash
    ======================================== */

    function playHistorySplash() {
        if (
            historyPlayed ||
            isSplashPlaying ||
            !historySplash
        ) {
            return;
        }

        const chars =
            historySplash.querySelectorAll(
                ".text-splash-title .char"
            );

        const secondWord =
            historySplash.querySelector(
                ".text-splash-title .word:nth-child(2)"
            );

        if (
            !chars.length ||
            !secondWord
        ) {
            return;
        }

        historyPlayed = true;
        isSplashPlaying = true;

        gsap.set(historySplash, {
            display: "flex",
            autoAlpha: 1
        });

        gsap.set(chars, {
            marginLeft: "1.8vw",
            marginRight: "1.8vw"
        });

        gsap.set(secondWord, {
            marginLeft: "7vw"
        });

        window.requestAnimationFrame(() => {
            gsap.timeline({
                onComplete() {
                    gsap.set(historySplash, {
                        display: "none"
                    });

                    isSplashPending = false;
                    isSplashPlaying = false;
                }
            })
            .to(
                chars,
                {
                    marginLeft: 0,
                    marginRight: 0,
                    duration: 1.2,
                    ease: "power2.inOut"
                },
                0
            )
            .to(
                secondWord,
                {
                    marginLeft: "0.28em",
                    duration: 1.2,
                    ease: "power2.inOut"
                },
                0
            )
            .to({}, {
                duration: 0.5
            })
            .to(historySplash, {
                autoAlpha: 0,
                duration: 0.75,
                ease: "power1.out"
            });
        });
    }

    /* ========================================
    Products Circle Splash
    ======================================== */

    function prepareProductsSplash() {
        if (
            productsPlayed ||
            !productsSplash ||
            !productsSvg ||
            !productsCircle
        ) {
            return;
        }

        const width = productsSplash.clientWidth;
        const height = productsSplash.clientHeight;

        productsSvg.setAttribute(
            "viewBox",
            `0 0 ${width} ${height}`
        );

        gsap.set(productsSplash, {
            display: "block",
            autoAlpha: 1
        });

        gsap.set(productsCircle, {
            attr: {
                cx: width / 2,
                cy: height / 2,
                r: 0
            }
        });
    }

    function playProductsSplash() {
        if (
            productsPlayed ||
            isSplashPlaying ||
            !productsSplash ||
            !productsCircle
        ) {
            return;
        }

        prepareProductsSplash();

        productsPlayed = true;
        isSplashPlaying = true;

        const width = productsSplash.clientWidth;
        const height = productsSplash.clientHeight;
        const maxRadius = Math.hypot(width, height) / 2;

        gsap.to(productsCircle, {
            attr: {
                r: maxRadius
            },
            duration: 1.6,
            ease: "power2.inOut",

            onComplete() {
                gsap.set(productsSplash, {
                    display: "none"
                });

                isSplashPending = false;
                isSplashPlaying = false;
            }
        });
    }

    /* ========================================
    Current Section Check
    ======================================== */

    function isSectionAtTop(section) {
        if (!section) return false;

        return (
            Math.abs(
                scrollContainer.scrollTop -
                section.offsetTop
            ) <= SECTION_TOLERANCE
        );
    }

    function checkCurrentSection() {
        if (isSplashPlaying) return;

        if (
            !historyPlayed &&
            isSectionAtTop(historySection)
        ) {
            playHistorySplash();
            return;
        }

        if (
            !productsPlayed &&
            isSectionAtTop(productsSection)
        ) {
            playProductsSplash();
        }
    }

    /* ========================================
    Scroll End
    ======================================== */

    function handleScroll() {
        window.clearTimeout(scrollEndTimer);

        scrollEndTimer = window.setTimeout(
            checkCurrentSection,
            80
        );
    }

    scrollContainer.addEventListener(
        "scroll",
        handleScroll,
        {
            passive: true
        }
    );

    if ("onscrollend" in scrollContainer) {
        scrollContainer.addEventListener(
            "scrollend",
            checkCurrentSection
        );
    }

    /* ========================================
    Initial State
    ======================================== */

    prepareProductsSplash();

    window.requestAnimationFrame(() => {
        checkCurrentSection();
    });
}

})();