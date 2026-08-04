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
            y: 34,
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

    function initTrackpadScrollStability() {
        const trust = document.querySelector(".sub-usa-trust");
        if (!trust) return;

        ScrollTrigger.create({
            trigger: trust,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            anticipatePin: 1
        });
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



/* usa */
(function () {
    "use strict";

    function initHunterUsaPage() {
        if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        initHeroStory();
        initKoreaVision();
        initTrustAccordion();
        initValueMotions();
        initTrackpadScrollStability();
        initHeaderTheme();
    }

    function initHeroStory() {
        const hero = document.querySelector(".sub-standard-detail-hero");
        const media = document.querySelector(".sub-standard-detail-hero-media");
        const preview = document.querySelector(".sub-standard-detail-hero-preview");
        const video = document.querySelector(".sub-standard-detail-hero-video");
        const dim = document.querySelector(".sub-standard-detail-hero-dim");
        const copy = document.querySelector(".sub-standard-detail-hero-copy");
        const lines = gsap.utils.toArray(".sub-standard-detail-hero-line");

        if (!hero || !media || !preview || !dim || !copy || !lines.length) return;

        gsap.set(copy, { autoAlpha: 0, y: 30 });
        gsap.set(lines, { color: "rgba(255,255,255,.22)" });
        if (video) gsap.set(video, { autoAlpha: 0, scale: 1.04 });

        const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.15,
                invalidateOnRefresh: true,
                anticipatePin: 1
            }
        });

        timeline
            .to({}, { duration: 0.35 })
            .to(media, {
                width: "100vw",
                height: "100vh",
                duration: 1.05,
                ease: "power2.inOut"
            }, "hero-expand")
            .to(preview, {
                scale: 1,
                duration: 1.05,
                ease: "power2.inOut"
            }, "hero-expand");

        if (video) {
            timeline
                .to(video, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "power1.out"
                }, "hero-expand+=0.72")
                .to(preview, {
                    autoAlpha: 0,
                    duration: 0.42
                }, "hero-expand+=0.78");
        }

        timeline
            .to(dim, {
                opacity: 1,
                duration: 0.42
            }, "hero-expand+=0.72")
            .to(copy, {
                autoAlpha: 1,
                y: 0,
                duration: 0.36,
                ease: "power2.out"
            }, "hero-expand+=0.9");

        lines.forEach(function (line, index) {
            timeline.to(line, {
                color: "rgba(255,255,255,1)",
                duration: 0.48,
                ease: "power1.out"
            }, "line-" + index);

            timeline.to({}, { duration: 0.22 });
        });

        timeline.to({}, { duration: 0.6 });
    }



    function initKoreaVision() {
        const panels = Array.from(document.querySelectorAll(".sub-korea-vision-panel"));
        if (!panels.length) return;

        const section = document.querySelector(".sub-korea-vision");

        function activate(target) {
            if (section) section.classList.add("has-active");
            panels.forEach(function (panel) {
                panel.classList.toggle("is-active", panel === target);
            });
        }

        panels.forEach(function (panel) {
            panel.addEventListener("mouseenter", function () { activate(panel); });
            panel.addEventListener("focus", function () { activate(panel); });
            panel.addEventListener("click", function () { activate(panel); });
        });

        if (section) {
            section.addEventListener("mouseleave", function () {
                section.classList.remove("has-active");
                panels.forEach(function (panel) { panel.classList.remove("is-active"); });
            });
        }
    }

    function initTrustAccordion() {
        const items = Array.from(document.querySelectorAll(".sub-usa-trust-item"));
        if (!items.length) return;

        let activeItem = items.find(function (item) {
            return item.classList.contains("is-active");
        }) || items[0];
        let hoverTimer = null;

        function hideAllCopy() {
            items.forEach(function (item) {
                item.classList.remove("is-copy-visible");
            });
        }

        function applyState(target, immediate) {
            if (!target) return;

            activeItem = target;
            hideAllCopy();

            items.forEach(function (item) {
                item.classList.toggle("is-active", item === target);
            });

            if (immediate) {
                gsap.set(items, {
                    flexBasis: function (index, item) {
                        return item === target ? "83%" : "8.5%";
                    }
                });
                target.classList.add("is-copy-visible");
                return;
            }

            gsap.to(items, {
                flexBasis: function (index, item) {
                    return item === target ? "83%" : "8.5%";
                },
                duration: 0.82,
                ease: "power3.inOut",
                overwrite: true,
                onComplete: function () {
                    if (target === activeItem) {
                        target.classList.add("is-copy-visible");
                    }
                }
            });
        }

        applyState(activeItem, true);

        items.forEach(function (item) {
            item.addEventListener("mouseenter", function () {
                window.clearTimeout(hoverTimer);
                hoverTimer = window.setTimeout(function () {
                    if (item !== activeItem) applyState(item, false);
                }, 60);
            });

            item.addEventListener("mouseleave", function () {
                window.clearTimeout(hoverTimer);
            });

            item.addEventListener("focus", function () {
                applyState(item, false);
            });

            item.addEventListener("click", function () {
                applyState(item, false);
            });
        });
    }

    function initValueMotions() {
        gsap.utils.toArray(".sub-usa-value").forEach(function (section) {
            const copy = section.querySelector(".sub-usa-value-copy");
            const mask = section.querySelector(".sub-usa-h-mask");
            if (!copy || !mask) return;

            const fromLeft = mask.classList.contains("sub-usa-h-mask-left");

            // 문구는 페이지 진입 시부터 그대로 노출
            gsap.set(copy, {
                y: 0,
                autoAlpha: 1,
                clearProps: "visibility"
            });

            // H는 숨김/등장 없이 현재 위치에서 좌우로만 아주 살짝 이동
            gsap.fromTo(mask,
                {
                    xPercent: fromLeft ? -4 : 4,
                    autoAlpha: 1
                },
                {
                    xPercent: fromLeft ? 4 : -4,
                    autoAlpha: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                }
            );
        });
    }

    function initUsaSectionSnap() {
        const sections = Array.from(document.querySelectorAll(".sub-usa-trust, .sub-usa-value"));
        if (!sections.length) return;

        let locked = false;
        let lockTimer = null;

        function getActiveIndex() {
            const center = window.scrollY + window.innerHeight * 0.5;
            let index = -1;
            let distance = Infinity;

            sections.forEach(function (section, sectionIndex) {
                const top = section.getBoundingClientRect().top + window.scrollY;
                const sectionCenter = top + section.offsetHeight * 0.5;
                const nextDistance = Math.abs(sectionCenter - center);

                if (nextDistance < distance) {
                    distance = nextDistance;
                    index = sectionIndex;
                }
            });

            return index;
        }

        function isSnapArea() {
            const firstTop = sections[0].getBoundingClientRect().top + window.scrollY;
            const last = sections[sections.length - 1];
            const lastBottom = last.getBoundingClientRect().top + window.scrollY + last.offsetHeight;
            const current = window.scrollY + window.innerHeight * 0.5;
            return current >= firstTop && current <= lastBottom;
        }

        function goToSection(index) {
            const target = sections[index];
            if (!target) return;

            locked = true;
            target.scrollIntoView({ behavior: "smooth", block: "start" });

            window.clearTimeout(lockTimer);
            lockTimer = window.setTimeout(function () {
                locked = false;
            }, 900);
        }

        window.addEventListener("wheel", function (event) {
            if (!isSnapArea() || locked || Math.abs(event.deltaY) < 12) return;

            const activeIndex = getActiveIndex();
            if (activeIndex < 0) return;

            const nextIndex = event.deltaY > 0 ? activeIndex + 1 : activeIndex - 1;
            if (nextIndex < 0 || nextIndex >= sections.length) return;

            event.preventDefault();
            goToSection(nextIndex);
        }, { passive: false });
    }

    function initTrackpadScrollStability() {
        const trust = document.querySelector(".sub-usa-trust");
        if (!trust) return;

        ScrollTrigger.create({
            trigger: trust,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            anticipatePin: 1
        });
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
        document.addEventListener("DOMContentLoaded", initHunterUsaPage);
    } else {
        initHunterUsaPage();
    }
})();
