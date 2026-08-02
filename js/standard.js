(function () {
    "use strict";

    function initStandardPage() {
        if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        initIntroMotion();
        initStoryMotion();
        initHeaderTheme();
    }

    function initIntroMotion() {
        gsap.fromTo(
            ".sub-standard-main-title",
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
        );

        gsap.fromTo(
            ".sub-standard-intro-content",
            { opacity: 0, y: 70 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".sub-standard-intro",
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    function initStoryMotion() {
        const story = document.querySelector(".sub-standard-story");
        if (!story) return;

        const copyUsa = ".sub-standard-story-copy-usa";
        const copyKorea = ".sub-standard-story-copy-korea";
        const copyPartners = ".sub-standard-story-copy-partners";

        const usaScene = ".sub-standard-h-scene-usa";
        const koreaScene = ".sub-standard-h-scene-korea";
        const partnersScene = ".sub-standard-h-scene-partners";

        const usaImage = ".sub-standard-h-image-usa";
        const koreaImage = ".sub-standard-h-image-korea";
        const partnersImage = ".sub-standard-h-image-partners";

        const usaSolid = ".sub-standard-h-solid-usa";
        const koreaSolid = ".sub-standard-h-solid-korea";
        const partnersSolid = ".sub-standard-h-solid-partners";

        const usaRed = ".sub-standard-h-red-usa";
        const koreaRed = ".sub-standard-h-red-korea";
        const partnersRed = ".sub-standard-h-red-partners";

        const designWidth = function () {
            return Math.min(window.innerWidth, 1920);
        };

        const vw = function (value) {
            return designWidth() * value;
        };

        gsap.set(copyUsa, {
            autoAlpha: 0,
            yPercent: -50,
            y: 34
        });

        gsap.set(copyKorea, {
            autoAlpha: 0,
            yPercent: -50,
            y: 34
        });

        gsap.set(copyPartners, {
            autoAlpha: 0,
            xPercent: -50,
            y: 34
        });

        gsap.set(usaScene, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1
        });

        gsap.set(koreaScene, {
            xPercent: -50,
            yPercent: -50,
            x: function () { return vw(-0.86); },
            y: 0,
            scale: 3.08,
            autoAlpha: 0
        });

        gsap.set(partnersScene, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: function () { return window.innerHeight * 1.08; },
            scale: 2.02,
            autoAlpha: 0
        });

        gsap.set([usaImage, partnersImage], { opacity: 0 });
        gsap.set(koreaImage, { opacity: 1 });

        gsap.set([usaSolid, partnersSolid], { opacity: 1 });
        gsap.set(koreaSolid, { opacity: 0 });

        gsap.set([usaRed, partnersRed], { opacity: 1, scaleX: 1 });
        gsap.set(koreaRed, { opacity: 0, scaleX: 1 });

        const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: story,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2,
                invalidateOnRefresh: true,
                anticipatePin: 1
            }
        });

        /* 03 → 04. 중앙의 H가 우측 이미지 영역까지 확대되고 USA 카피가 등장 */
        timeline
            .to({}, { duration: 0.5 })
            .to(usaScene, {
                x: function () { return vw(0.305); },
                y: 0,
                scale: 3.14,
                duration: 1.08,
                ease: "power2.inOut"
            }, "usa-open")
            .to(usaRed, {
                opacity: 0,
                scaleX: 0.72,
                duration: 0.22
            }, "usa-open+=0.1")
            .to(usaSolid, {
                opacity: 0,
                duration: 0.26
            }, "usa-open+=0.2")
            .to(usaImage, {
                opacity: 1,
                duration: 0.3
            }, "usa-open+=0.18")
            .to(copyUsa, {
                autoAlpha: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            }, "usa-open+=0.58")
            .to({}, { duration: 0.5 });

        /* 03 → 05. 확대된 USA H는 우측으로 빠지고, KOREA H는 좌측에서 별도로 진입 */
        timeline
            .to(copyUsa, {
                autoAlpha: 0,
                y: -24,
                duration: 0.2
            }, "korea-switch")
            .to(usaScene, {
                x: function () { return vw(0.94); },
                scale: 3.18,
                autoAlpha: 0,
                duration: 0.78,
                ease: "power2.inOut"
            }, "korea-switch+=0.02")
            .set(koreaScene, {
                autoAlpha: 1
            }, "korea-switch+=0.10")
            .to(koreaScene, {
                x: function () { return vw(-0.34); },
                duration: 1.02,
                ease: "power2.inOut"
            }, "korea-switch+=0.12")
            .to(copyKorea, {
                autoAlpha: 1,
                y: 0,
                duration: 0.26,
                ease: "power2.out"
            }, "korea-switch+=0.66")
            .to({}, { duration: 0.48 });

        /* 05 → 06. KOREA H는 다시 좌측으로 빠지고 PARTNERS 카피가 먼저 등장 */
        timeline
            .to(copyKorea, {
                autoAlpha: 0,
                y: -24,
                duration: 0.18
            }, "partners-copy")
            .to(koreaScene, {
                x: function () { return vw(-0.96); },
                autoAlpha: 0,
                duration: 0.84,
                ease: "power2.inOut"
            }, "partners-copy+=0.01")
            .to(copyPartners, {
                autoAlpha: 1,
                y: 0,
                duration: 0.28,
                ease: "power2.out"
            }, "partners-copy+=0.56")
            .to({}, { duration: 0.55 });

        /* 06. 카피를 먼저 충분히 보여준 뒤 작은 H가 아래에서 새로 상승 */
        timeline
            .set(partnersScene, { autoAlpha: 1 }, "partners-rise")
            .to(partnersImage, { opacity: 1, duration: 0.18 }, "partners-rise+=0.02")
            .to(partnersSolid, { opacity: 0, duration: 0.16 }, "partners-rise+=0.03")
            .to(partnersRed, { opacity: 0, scaleX: 0.78, duration: 0.16 }, "partners-rise+=0.03")
            .to(partnersScene, {
                y: function () { return window.innerHeight * 0.49; },
                scale: 2.02,
                duration: 0.98,
                ease: "power3.out"
            }, "partners-rise")
            .to({}, { duration: 0.52 });

        /* 06 → 07. 카피가 사라진 뒤 작은 H가 중앙으로 이동하며 최종 로고로 축소 */
        timeline
            .to(copyPartners, {
                autoAlpha: 0,
                y: -25,
                duration: 0.2
            }, "final-logo")
            .to(partnersScene, {
                y: 0,
                scale: 1,
                duration: 1,
                ease: "power2.inOut"
            }, "final-logo+=0.04")
            .to(partnersImage, { opacity: 0, duration: 0.28 }, "final-logo+=0.43")
            .to(partnersSolid, { opacity: 1, duration: 0.28 }, "final-logo+=0.46")
            .to(partnersRed, { opacity: 1, scaleX: 1, duration: 0.3 }, "final-logo+=0.5")
            .to({}, { duration: 0.62 });
    }

    function initHeaderTheme() {
        const header = document.querySelector(".header");
        if (!header) return;

        document.querySelectorAll("[data-header-theme]").forEach(function (target) {
            ScrollTrigger.create({
                trigger: target,
                start: "top 5%",
                end: "bottom 5%",
                onEnter: function () {
                    setHeaderTheme(header, target.dataset.headerTheme);
                },
                onEnterBack: function () {
                    setHeaderTheme(header, target.dataset.headerTheme);
                }
            });
        });
    }

    function setHeaderTheme(header, theme) {
        header.classList.toggle("theme-dark", theme === "dark");
        header.classList.toggle("theme-light", theme === "light");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initStandardPage);
    } else {
        initStandardPage();
    }
})();
