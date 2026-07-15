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

    /* Section Navigator
    *
    * - 네비 클릭 시 해당 섹션으로 이동
    * - 현재 보이는 섹션에 맞춰 is-active 변경
    * - Section 1, 2에서는 네비 숨김
    * - Section 3 History부터 Section 7 Business까지 표시
    */
   function initSectionNavigator() {
       const navigator = document.querySelector(".section-nav");
   
       if (!navigator) return;
   
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
   
       /**
        * 현재 섹션에 해당하는 버튼 활성화
        */
       function setActiveItem(sectionId) {
           navItems.forEach((item) => {
               item.classList.toggle(
                   "is-active",
                   item.dataset.target === sectionId
               );
           });
       }
   
       /**
        * 현재 스크롤 위치에 따라
        * 네비게이터 표시 여부와 활성 버튼 변경
        */
       function updateNavigator() {
           const scrollY = window.scrollY;
           const checkPoint = scrollY + window.innerHeight / 2;
   
           const firstSectionTop = firstSection.offsetTop;
           const lastSectionBottom =
               lastSection.offsetTop + lastSection.offsetHeight;
   
           /*
            * History 진입 전에는 숨김
            * Business를 벗어난 뒤에도 숨김
            */
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
   
       /**
        * 네비 버튼 클릭 시 해당 섹션으로 이동
        */
       navItems.forEach((item) => {
           item.addEventListener("click", () => {
               const targetSection =
                   document.getElementById(
                       item.dataset.target
                   );
   
               if (!targetSection) return;
   
               setActiveItem(targetSection.id);
   
               targetSection.scrollIntoView({
                   behavior: "smooth",
                   block: "start"
               });
           });
       });
   
       /*
        * 최초 실행
        */
       updateNavigator();
   
       /*
        * 스크롤 시 위치 확인
        */
       window.addEventListener(
           "scroll",
           updateNavigator,
           { passive: true }
       );
   
       /*
        * 화면 크기 변경 시 위치 다시 계산
        */
       window.addEventListener(
           "resize",
           updateNavigator
       );
   }
    
})();