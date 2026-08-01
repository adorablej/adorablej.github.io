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

        const vw = function (value) {
            return window.innerWidth * value;
        };

        gsap.set(copyUsa, {
            autoAlpha: 1,
            yPercent: -50,
            y: 0
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
            x: function () { return vw(0.245); },
            y: 0,
            scale: 1.08,
            autoAlpha: 1
        });

        gsap.set(koreaScene, {
            xPercent: -50,
            yPercent: -50,
            x: function () { return vw(-0.74); },
            y: function () { return vw(0.09); },
            scale: 2.72,
            autoAlpha: 0
        });

        gsap.set(partnersScene, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: function () { return window.innerHeight * 0.98; },
            scale: 1.12,
            autoAlpha: 0
        });

        gsap.set([usaImage, koreaImage, partnersImage], { opacity: 0 });
        gsap.set([usaSolid, koreaSolid, partnersSolid], { opacity: 1 });
        gsap.set([usaRed, koreaRed, partnersRed], { opacity: 1, scaleX: 1 });

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

        /* 03. 같은 장면 안에서 초기 H가 확대되며 이미지 마스크 상태로 전환 */
        timeline
            .to({}, { duration: 0.45 })
            .to(usaScene, {
                x: function () { return vw(0.285); },
                y: function () { return vw(0.015); },
                scale: 2.56,
                duration: 0.9,
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
            .to({}, { duration: 0.48 });

        /* 03 → 05. 확대된 USA H는 우측으로 빠지고, KOREA H는 좌측에서 별도로 진입 */
        timeline
            .to(copyUsa, {
                autoAlpha: 0,
                y: -24,
                duration: 0.2
            }, "korea-switch")
            .to(usaScene, {
                x: function () { return vw(0.94); },
                scale: 2.62,
                autoAlpha: 0,
                duration: 0.78,
                ease: "power2.inOut"
            }, "korea-switch+=0.02")
            .set(koreaScene, { autoAlpha: 1 }, "korea-switch+=0.24")
            .to(koreaSolid, { opacity: 0, duration: 0.14 }, "korea-switch+=0.24")
            .to(koreaRed, { opacity: 0, duration: 0.14 }, "korea-switch+=0.24")
            .to(koreaImage, { opacity: 1, duration: 0.22 }, "korea-switch+=0.25")
            .to(koreaScene, {
                x: function () { return vw(-0.30); },
                duration: 0.92,
                ease: "power2.inOut"
            }, "korea-switch+=0.24")
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
                y: function () { return window.innerHeight * 0.18; },
                scale: 1.2,
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
                scale: 0.78,
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
