(function () {
    "use strict";

    function initStandardPage() {
        if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        initMainVisualMotion();
        initStoryMotion();
        initAwardsHero();
        initHeaderTheme();
    }

    function initMainVisualMotion() {
        const section = document.querySelector(".sub-standard-main-visual");
        if (!section) return;

        const titleTop = section.querySelector(".sub-standard-main-title-top");
        const titleBottom = section.querySelector(".sub-standard-main-title-bottom");
        const titleTopFill = titleTop && titleTop.querySelector(".sub-standard-main-title-fill");
        const titleBottomFill = titleBottom && titleBottom.querySelector(".sub-standard-main-title-fill");
        const reveal = section.querySelector(".sub-standard-main-reveal");
        const frame = section.querySelector(".sub-standard-main-frame");
        const revealImage = reveal && reveal.querySelector("img");
        const revealCopy = section.querySelector(".sub-standard-main-reveal-copy");
        if (!titleTop || !titleBottom || !titleTopFill || !titleBottomFill || !frame || !reveal || !revealImage || !revealCopy) return;

        const revealHeight = function () {
            const ratio = window.innerWidth <= 720 ? 1.25 : 9 / 16;
            return Math.min(frame.clientHeight, reveal.clientWidth * ratio);
        };

        gsap.set([titleTopFill, titleBottomFill], { clipPath: "inset(0 100% 0 0)" });
        gsap.set(reveal, {
            scale: .92,
            height: 2
        });
        gsap.set(revealImage, {
            height: revealHeight,
            yPercent: -50,
            scale: 1.12
        });
        gsap.set(revealCopy, { autoAlpha: 0, y: 32 });

        gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                invalidateOnRefresh: true
            }
        })
            .to(titleTopFill, { clipPath: "inset(0 0% 0 0)", duration: .75 })
            .to(titleBottomFill, { clipPath: "inset(0 0% 0 0)", duration: .75 })
            .to({}, { duration: .18 })
            .to(titleTop, { yPercent: -165, autoAlpha: 0, duration: .72 }, "open")
            .to(titleBottom, { yPercent: 165, autoAlpha: 0, duration: .72 }, "open")
            .to(reveal, {
                scale: 1,
                height: revealHeight,
                duration: .9
            }, "open+=.08")
            .to(revealImage, { scale: 1, duration: 1.05 }, "open+=.08")
            .to(revealCopy, { autoAlpha: 1, y: 0, duration: .42 }, "open+=.58")
            .to({}, { duration: .5 });
    }

    function initAwardsHero() {
        const scroll = document.querySelector(".sub-awards-hero-scroll");
        const hero = scroll && scroll.querySelector(".sub-awards-hero");
        const media = hero && hero.querySelector(".sub-awards-hero-media");
        const images = hero && hero.querySelectorAll("img");
        const dim = hero && hero.querySelector(".sub-awards-hero-dim");
        const copy = hero && hero.querySelector(".sub-awards-hero-copy");
        const lines = copy && copy.querySelectorAll("span");
        if (!scroll || !hero || !media || !images || !dim || !copy || !lines.length) return;

        const mobile = window.matchMedia("(max-width: 720px)").matches;
        gsap.set(copy, { xPercent: mobile ? -50 : 0, yPercent: -50, y: 30 });
        gsap.set(lines, { color: "rgba(255, 255, 255, .35)" });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: scroll,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                invalidateOnRefresh: true
            }
        });

        if (mobile) {
            timeline
                .to(hero, {
                    width: "100vw",
                    height: "100vh",
                    marginLeft: "-25px",
                    ease: "none"
                }, 0)
                .to(images, { scale: 1.08, ease: "none" }, 0);
        } else {
            timeline
                .to(hero, {
                    width: "100vw",
                    height: "100vh",
                    marginLeft: "calc(50% - 50vw)",
                    ease: "none"
                }, 0)
                .to(images, { scale: 1.12, ease: "none" }, 0);
        }

        timeline
            .to(dim, { opacity: 1, ease: "none" }, .3)
            .to(copy, { opacity: 1, y: 0, ease: "none" }, .38);

        lines.forEach(function (line, index) {
            const position = .58 + index * .16;
            timeline.to(line, {
                color: "#fff",
                duration: .12,
                ease: "none"
            }, position);
        });
    }

    function initStoryMotion() {
        const story = document.querySelector(".sub-standard-story");
        if (!story) return;
        const isMobile = window.matchMedia("(max-width: 720px)").matches;

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

        // USA 상세 페이지의 H 폭(3000 * --vw)과 동일한 크기.
        // story H의 기본 폭은 500 * --vw이므로 6배가 같은 실제 폭이다.
        const detailHScale = 6;
        const storyLogoScale = function () {
            return window.innerWidth <= 720 ? 2.02 : 1;
        };
        const storyDetailY = function () {
            return window.innerWidth <= 720 ? window.innerHeight * -0.23 : 0;
        };
        const partnersExpandedScale = function () {
            return window.innerWidth <= 720 ? 3.83 : 2.02;
        };
        const partnersExpandedY = function () {
            return window.innerHeight * (window.innerWidth <= 720 ? 0.31 : 0.49);
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
            scale: storyLogoScale,
            autoAlpha: 1
        });

        gsap.set(koreaScene, {
            xPercent: -50,
            yPercent: -50,
            x: function () { return vw(-1.45); },
            y: storyDetailY,
            scale: detailHScale,
            autoAlpha: 0
        });

        gsap.set(partnersScene, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: function () { return window.innerHeight * 1.08; },
            scale: partnersExpandedScale,
            autoAlpha: 0
        });

        gsap.set([usaImage, partnersImage], { opacity: 0 });
        gsap.set(koreaImage, { opacity: 1 });

        gsap.set([usaSolid, partnersSolid], { opacity: 1 });
        gsap.set(koreaSolid, { opacity: 0 });

        gsap.set([usaRed, partnersRed], { opacity: 1, scaleX: 1 });
        gsap.set(koreaRed, { opacity: 0, scaleX: 1 });

        let partnersAutoTimeline = null;
        let partnersFinalTimeline = null;
        let partnersAwaitingFinal = false;
        let partnersRiseScrollY = 0;
        let partnersLastScrollY = window.scrollY;

        function playPartnersRise() {
            const direction = timeline.scrollTrigger ? timeline.scrollTrigger.direction : 1;
            if (partnersAutoTimeline) {
                partnersAutoTimeline.kill();
                partnersAutoTimeline = null;
            }
            if (partnersFinalTimeline) {
                partnersFinalTimeline.kill();
                partnersFinalTimeline = null;
            }
            partnersAwaitingFinal = false;
            gsap.killTweensOf([partnersScene, partnersImage, partnersSolid, partnersRed]);

            if (direction < 0) {
                gsap.set(partnersScene, {
                    y: function () { return window.innerHeight * 1.08; },
                    scale: partnersExpandedScale,
                    autoAlpha: 0
                });
                gsap.set(partnersImage, { opacity: 0 });
                gsap.set(partnersSolid, { opacity: 1 });
                gsap.set(partnersRed, { opacity: 1, scaleX: 1 });
                gsap.set(copyPartners, { autoAlpha: 1, y: 0 });
                return;
            }

            partnersAutoTimeline = gsap.timeline({ delay: 0.65 })
                .set(partnersScene, { autoAlpha: 1 })
                .to(partnersImage, { opacity: 1, duration: 0.18 }, 0.02)
                .to(partnersSolid, { opacity: 0, duration: 0.16 }, 0.03)
                .to(partnersRed, { opacity: 0, scaleX: 0.78, duration: 0.16 }, 0.03)
                .to(partnersScene, {
                    y: partnersExpandedY,
                    scale: partnersExpandedScale,
                    duration: 0.98,
                    ease: "power3.out"
                }, 0)
                .call(function () {
                    partnersAwaitingFinal = true;
                    partnersRiseScrollY = window.scrollY;
                });
        }

        function playPartnersFinal() {
            if (!partnersAwaitingFinal || partnersFinalTimeline) return;
            partnersAwaitingFinal = false;

            partnersFinalTimeline = gsap.timeline()
                .to(copyPartners, {
                    autoAlpha: 0,
                    y: -25,
                    duration: 0.2,
                    ease: "power2.out"
                }, "final")
                .to(partnersScene, {
                    y: 0,
                    scale: storyLogoScale,
                    duration: 1,
                    ease: "power2.inOut"
                }, "final+=0.04")
                .to(partnersImage, { opacity: 0, duration: 0.28 }, "final+=0.43")
                .to(partnersSolid, { opacity: 1, duration: 0.28 }, "final+=0.46")
                .to(partnersRed, { opacity: 1, scaleX: 1, duration: 0.3 }, "final+=0.5");

            partnersFinalTimeline.eventCallback("onReverseComplete", function () {
                partnersFinalTimeline = null;
                partnersAwaitingFinal = true;
                partnersRiseScrollY = window.scrollY;
            });
        }

        window.addEventListener("scroll", function () {
            const currentScrollY = window.scrollY;
            const isScrollingDown = currentScrollY > partnersLastScrollY + 2;
            const isScrollingUp = currentScrollY < partnersLastScrollY - 2;

            if (partnersAwaitingFinal && currentScrollY > partnersRiseScrollY + 4) {
                playPartnersFinal();
            }

            if (isScrollingUp && partnersFinalTimeline && partnersFinalTimeline.progress() > 0) {
                partnersFinalTimeline.reverse();
            } else if (isScrollingUp && partnersAwaitingFinal && partnersAutoTimeline) {
                partnersAwaitingFinal = false;
                partnersAutoTimeline.reverse();
            } else if (isScrollingDown && partnersFinalTimeline && partnersFinalTimeline.reversed()) {
                partnersFinalTimeline.play();
            }

            partnersLastScrollY = currentScrollY;
        }, { passive: true });

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
                x: function () { return vw(0.708333); },
                y: storyDetailY,
                scale: detailHScale,
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
            // USA 장면 완성 상태 유지
            .to({}, { duration: 1.4 });

        /* 03 → 05. 확대된 USA H는 우측으로 빠지고, KOREA H는 좌측에서 별도로 진입 */
        timeline
            .to(copyUsa, {
                autoAlpha: 0,
                y: -24,
                duration: 0.2
            }, "korea-switch")
            .to(usaScene, {
                x: function () { return vw(1.45); },
                scale: detailHScale,
                duration: 0.78,
                ease: "power2.inOut"
            }, "korea-switch+=0.02")
            .set(koreaScene, {
                autoAlpha: 1
            }, "korea-switch+=0.70")
            .to(koreaScene, {
                x: function () { return vw(-0.708333); },
                duration: 1.02,
                ease: "power2.inOut"
            }, "korea-switch+=0.72")
            .to(copyKorea, {
                autoAlpha: 1,
                y: 0,
                duration: 0.26,
                ease: "power2.out"
            }, "korea-switch+=1.34")
            // KOREA 장면 완성 상태 유지
            .to({}, { duration: 1.4 });

        /* 05 → 06. KOREA H는 다시 좌측으로 빠지고 PARTNERS 카피가 먼저 등장 */
        timeline
            .to(copyKorea, {
                autoAlpha: 0,
                y: -24,
                duration: 0.18
            }, "partners-copy")
            .to(koreaScene, {
                x: function () { return vw(-1.45); },
                duration: 0.84,
                ease: "power2.inOut"
            }, "partners-copy+=0.01")
            .to(copyPartners, {
                autoAlpha: 1,
                y: 0,
                duration: 0.28,
                ease: "power2.out"
            }, "partners-copy+=0.56");

        if (isMobile) {
            /* 모바일은 관성 스크롤에서도 누락되지 않도록 마지막 H까지 스크롤 타임라인에 포함 */
            timeline
                .set(partnersScene, { autoAlpha: 1 }, "partners-mobile-rise")
                .to(partnersImage, { opacity: 1, duration: 0.18 }, "partners-mobile-rise")
                .to(partnersSolid, { opacity: 0, duration: 0.16 }, "partners-mobile-rise+=0.02")
                .to(partnersRed, { opacity: 0, scaleX: 0.78, duration: 0.16 }, "partners-mobile-rise+=0.02")
                .to(partnersScene, {
                    y: partnersExpandedY,
                    scale: partnersExpandedScale,
                    duration: 0.9,
                    ease: "power3.out"
                }, "partners-mobile-rise")
                .to({}, { duration: 0.35 })
                .to(copyPartners, {
                    autoAlpha: 0,
                    y: -25,
                    duration: 0.2,
                    ease: "power2.out"
                }, "partners-mobile-final")
                .to(partnersScene, {
                    y: 0,
                    scale: storyLogoScale,
                    duration: 0.95,
                    ease: "power2.inOut"
                }, "partners-mobile-final+=0.04")
                .to(partnersImage, { opacity: 0, duration: 0.28 }, "partners-mobile-final+=0.4")
                .to(partnersSolid, { opacity: 1, duration: 0.28 }, "partners-mobile-final+=0.43")
                .to(partnersRed, { opacity: 1, scaleX: 1, duration: 0.3 }, "partners-mobile-final+=0.46")
                .to({}, { duration: 1.2 });
        } else {
            timeline
                .call(playPartnersRise, null, "partners-copy+=0.86")
                // 자동 상승이 끝난 뒤 스크롤을 다시 받을 짧은 유지 구간
                .to({}, { duration: 0.45 })
                // 최종 H 로고 장면 유지
                .to({}, { duration: 2.2 });
        }
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

(function () {
    "use strict";

    function initPartnersTopButton() {
        const button = document.querySelector(".sub-partners-top-button");
        const directory = document.querySelector(".sub-partners-directory");
        const intro = document.querySelector(".sub-partners-intro");
        if (!button || !directory || !intro) return;

        let directoryTop = 0;
        let ticking = false;

        function measureDirectoryTop() {
            directoryTop = directory.getBoundingClientRect().top + window.scrollY;
        }

        function updateButtonVisibility() {
            button.classList.toggle("is-visible", window.scrollY >= directoryTop);
            ticking = false;
        }

        function requestVisibilityUpdate() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(updateButtonVisibility);
        }

        measureDirectoryTop();
        updateButtonVisibility();

        window.addEventListener("scroll", requestVisibilityUpdate, { passive: true });
        window.addEventListener("resize", function () {
            measureDirectoryTop();
            requestVisibilityUpdate();
        });
        window.addEventListener("load", function () {
            measureDirectoryTop();
            requestVisibilityUpdate();
        }, { once: true });

        button.addEventListener("click", function () {
            intro.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                block: "start"
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPartnersTopButton);
    } else {
        initPartnersTopButton();
    }
})();

(function () {
    "use strict";

    function initPartnersCategoryLinks() {
        const links = document.querySelectorAll(".sub-partners-category-link[href^='#']");
        if (!links.length) return;

        links.forEach(function (link) {
            link.addEventListener("click", function (event) {
                const target = document.querySelector(link.getAttribute("href"));
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                    block: "start"
                });

                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, "", link.getAttribute("href"));
                }
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPartnersCategoryLinks);
    } else {
        initPartnersCategoryLinks();
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
        const sticky = document.querySelector(".sub-standard-detail-hero-sticky");
        const media = document.querySelector(".sub-standard-detail-hero-media");
        const preview = document.querySelectorAll(".sub-standard-detail-hero-preview");
        const video = document.querySelector(".sub-standard-detail-hero-video");
        const dim = document.querySelector(".sub-standard-detail-hero-dim");
        const copy = document.querySelector(".sub-standard-detail-hero-copy");
        const mobile = window.matchMedia("(max-width: 720px)").matches;
        const useHeroVideo = Boolean(
            video &&
            !mobile &&
            /\/Standard\/USA\.html$/i.test(window.location.pathname)
        );
        const lines = gsap.utils.toArray(".sub-standard-detail-hero-line").filter(function (line) {
            return mobile
                ? !line.classList.contains("pc-only")
                : !line.classList.contains("mo-only");
        });

        if (!hero || !sticky || !media || !preview.length || !dim || !copy || !lines.length) return;

        function getHeaderHeight() {
            const header = document.querySelector(".header");
            return header
                ? header.getBoundingClientRect().height
                : (mobile ? 64 : window.innerWidth * 100 / 1920);
        }

        function getHeroScrollDistance() {
            return Math.max(window.innerHeight - getHeaderHeight(), 1) * (mobile ? 2.35 : 2.55);
        }

        function getFrameClip() {
            const width = sticky.clientWidth;
            const height = sticky.clientHeight;

            if (mobile) {
                const side = 25;
                const frameWidth = Math.max(width - side * 2, 1);
                const frameHeight = Math.min(frameWidth * 460 / 310, height);
                const top = mobilePinOffset + Math.min(30, Math.max(height - frameHeight, 0));
                const bottom = Math.max(height - top - frameHeight, 0);
                const x = side / width * 100;
                const topY = top / height * 100;
                const bottomY = 100 - bottom / height * 100;
                return "polygon(" + x + "% " + topY + "%, " + (100 - x) + "% " + topY + "%, " + (100 - x) + "% " + bottomY + "%, " + x + "% " + bottomY + "%)";
            }

            const designScale = width / 1920;
            const frameWidth = Math.min(1300 * designScale, width);
            const frameHeight = Math.min(840 * designScale, height);
            const horizontal = Math.max((width - frameWidth) / 2, 0);
            const vertical = Math.max((height - frameHeight) / 2, 0);

            const x = horizontal / width * 100;
            const y = vertical / height * 100;
            return "polygon(" + x + "% " + y + "%, " + (100 - x) + "% " + y + "%, " + (100 - x) + "% " + (100 - y) + "%, " + x + "% " + (100 - y) + "%)";
        }

        function getMobileFrameSize() {
            const width = Math.max(sticky.clientWidth - 50, 1);
            const availableHeight = sticky.clientHeight;
            const height = Math.min(width * 460 / 310, availableHeight);
            const top = mobilePinOffset + Math.min(30, Math.max(availableHeight - height, 0));
            return {
                width: width,
                height: height,
                top: top
            };
        }

        const mobilePinOffset = mobile
            ? Math.max(hero.getBoundingClientRect().top, 0)
            : 0;
        const frameClip = getFrameClip();
        const frameDuration = mobile ? 2.35 : 1.15;
        const nextSection = hero.nextElementSibling;
        let mobileStage = null;

        if (mobile && nextSection) {
            gsap.set(nextSection, { marginTop: -mobilePinOffset });
        }

        gsap.set(sticky, { position: "relative" });
        gsap.set(media, {
            clipPath: frameClip,
            y: mobile ? -mobilePinOffset : 0,
            height: "100%"
        });
        gsap.set(copy, {
            autoAlpha: 0,
            y: mobile ? -mobilePinOffset : 0
        });
        gsap.set(lines, {
            autoAlpha: 1,
            yPercent: 0,
            clipPath: "inset(0 0 0% 0)",
            color: "rgba(255,255,255,.28)"
        });
        if (mobile) {
            const mobilePreview = Array.from(preview).find(function (image) {
                return !image.classList.contains("pc-only");
            }) || preview[0];
            const frameSize = getMobileFrameSize();

            mobileStage = mobilePreview.cloneNode(true);
            mobileStage.className = "sub-standard-detail-hero-mobile-stage";
            mobileStage.removeAttribute("id");
            media.appendChild(mobileStage);

            gsap.set(preview, { autoAlpha: 0, scale: 1 });
            gsap.set(mobileStage, {
                width: frameSize.width,
                height: frameSize.height,
                top: frameSize.top + frameSize.height / 2,
                autoAlpha: 1,
                scale: 1,
                transformOrigin: "50% 50%"
            });

        } else {
            gsap.set(preview, { scale: 1.08 });
        }
        if (video) {
            const videoReady = useHeroVideo && video.readyState >= 2;
            gsap.set(video, {
                autoAlpha: videoReady ? 1 : 0,
                scale: 1.08
            });
            video.pause();
            if (useHeroVideo) {
                if (videoReady) {
                    gsap.set(preview, { autoAlpha: 0 });
                } else {
                    video.addEventListener("loadeddata", function () {
                        video.pause();
                        video.currentTime = 0;
                        gsap.set(video, { autoAlpha: 1 });
                        gsap.set(preview, { autoAlpha: 0 });
                    }, { once: true });
                }
            }
        }

        const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: hero,
                start: function () {
                    return mobile
                        ? "top top+=" + mobilePinOffset
                        : "top top";
                },
                end: function () { return "+=" + getHeroScrollDistance(); },
                pin: sticky,
                pinSpacing: true,
                scrub: 0.9,
                invalidateOnRefresh: true,
                anticipatePin: 1,
                onUpdate: function (self) {
                    if (!useHeroVideo) return;

                    if (self.progress >= 0.34) {
                        if (video.paused) video.play().catch(function () {});
                    } else {
                        if (!video.paused) video.pause();
                        if (self.progress <= 0.04 && video.readyState >= 1) video.currentTime = 0;
                    }
                }
            }
        });

        timeline
            .to(media, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: frameDuration,
                ease: "power2.inOut"
            }, "frame-open")
            .to(preview, {
                scale: 1,
                duration: frameDuration,
                ease: "power2.out"
            }, "frame-open")
            .set(media, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
            }, "frame-open+=" + frameDuration);

        if (mobileStage) {
            timeline.to(mobileStage, {
                width: "100%",
                height: "100%",
                top: "50%",
                scale: 1,
                duration: frameDuration,
                ease: "power2.inOut"
            }, "frame-open");
        }

        if (useHeroVideo) {
            timeline.to(video, {
                scale: 1,
                duration: 1.15,
                ease: "power2.out"
            }, "frame-open");
        }

        timeline
            .to(dim, {
                opacity: 1,
                duration: 0.5,
                ease: "power1.inOut"
            }, "frame-open+=" + (mobile ? 1.82 : 0.82))
            .to(copy, {
                autoAlpha: 1,
                duration: 0.25,
                ease: "power1.out"
            }, "copy-in")
            .to(mobileStage || (useHeroVideo ? video : preview), {
                scale: mobileStage
                    ? 1
                    : (mobile ? 1.012 : 1.035),
                duration: 1.15,
                ease: "none"
            }, "copy-in+=0.12");

        lines.forEach(function (line) {
            timeline
                .to(line, {
                    color: "rgba(255,255,255,1)",
                    duration: 0.38,
                    ease: "power1.out"
                })
                .to({}, { duration: 0.1 });
        });

        timeline.to({}, { duration: 0.35 });

        let heroResizeFrame = 0;
        window.addEventListener("resize", function () {
            window.cancelAnimationFrame(heroResizeFrame);
            heroResizeFrame = window.requestAnimationFrame(function () {
                ScrollTrigger.refresh();
            });
        }, { passive: true });
    }



    function initKoreaVision() {
        const section = document.querySelector(".sub-korea-vision");
        const panels = Array.from(
            document.querySelectorAll(".sub-korea-vision-panel")
        );
        const desktopHover = window.matchMedia("(min-width: 721px) and (hover: hover) and (pointer: fine)");
    
        if (!section || !panels.length) return;
    
        function resetPanels() {
            section.classList.remove("has-active");
            panels.forEach(function (panel) {
                panel.classList.remove("is-active", "is-inactive");
            });
        }

        function activatePanel(target) {
            section.classList.add("has-active");
            panels.forEach(function (panel) {
                panel.classList.toggle("is-active", panel === target);
                panel.classList.toggle("is-inactive", panel !== target);
            });
        }

        section.addEventListener("pointerover", function (event) {
            if (!desktopHover.matches) return;

            const panel = event.target.closest(".sub-korea-vision-panel");
            if (panel && section.contains(panel)) activatePanel(panel);
        });

        section.addEventListener("pointerleave", function () {
            if (desktopHover.matches) resetPanels();
        });

        panels.forEach(function (panel) {
            panel.addEventListener("focus", function () {
                if (panel.matches(":focus-visible")) activatePanel(panel);
            });
        });
    
        resetPanels();
    }

    function initTrustAccordion() {
        const items = Array.from(document.querySelectorAll(".sub-usa-trust-item"));
        if (!items.length) return;

        if (window.matchMedia("(max-width: 720px)").matches) {
            items.forEach(function (item, index) {
                item.classList.remove("is-active");
                item.classList.add("is-copy-visible");
                gsap.set(item, { clearProps: "flex-basis,width" });

                gsap.fromTo(item,
                    {
                        autoAlpha: 0,
                        y: 40
                    },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: .7,
                        delay: index * .06,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 86%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });
            return;
        }

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
        const mobileValueLayout = window.matchMedia("(max-width: 720px)").matches;
        const motionDistance = mobileValueLayout ? 7 : 4;

        function fitMaskImageToViewport(mask) {
            const svg = mask.querySelector("svg");
            const image = svg && svg.querySelector("image");
            if (!svg || !image) return;

            const rect = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            if (!rect.width || !rect.height || !viewBox.width || !viewBox.height) return;

            const bleed = 2;
            const clipPath = svg.querySelector("clipPath");
            const clipId = clipPath ? clipPath.id : "";
            const desktop = window.innerWidth > 720;
            const motionBleed = desktop ? 0 : rect.width * 0.08;
            let focusX = 0;
            let focusY = 0;

            if (desktop && clipId === "sub-usa-awards-clip") {
                focusX = window.innerWidth * -0.4;
                focusY = window.innerHeight * -0.07;
            } else if (desktop && clipId === "sub-usa-korea-clip") {
                focusX = window.innerWidth * 0.28;
                focusY = 0;
            }

            const centeredTop = (window.innerHeight - rect.height) / 2;
            const x = (focusX - rect.left - bleed - motionBleed) / rect.width * viewBox.width;
            const y = (focusY - centeredTop - bleed) / rect.height * viewBox.height;
            const width = (window.innerWidth + bleed * 2 + motionBleed * 2) / rect.width * viewBox.width;
            const height = (window.innerHeight + bleed * 2) / rect.height * viewBox.height;

            image.setAttribute("x", x.toFixed(3));
            image.setAttribute("y", y.toFixed(3));
            image.setAttribute("width", width.toFixed(3));
            image.setAttribute("height", height.toFixed(3));
            image.setAttribute("preserveAspectRatio", "xMidYMid slice");
        }

        gsap.utils.toArray(".sub-usa-value").forEach(function (section) {
            const copy = section.querySelector(".sub-usa-value-copy");
            const mask = section.querySelector(".sub-usa-h-mask");
            if (!copy || !mask) return;

            const fromLeft = mask.classList.contains("sub-usa-h-mask-left");

            fitMaskImageToViewport(mask);

            // 문구는 페이지 진입 시부터 그대로 노출
            gsap.set(copy, {
                y: 0,
                autoAlpha: 1,
                clearProps: "visibility"
            });

            // H는 숨김/등장 없이 현재 위치에서 좌우로만 아주 살짝 이동
            gsap.fromTo(mask,
                {
                    xPercent: fromLeft ? -motionDistance : motionDistance,
                    autoAlpha: 1
                },
                {
                    xPercent: fromLeft ? motionDistance : -motionDistance,
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

        let maskResizeFrame = 0;
        window.addEventListener("resize", function () {
            window.cancelAnimationFrame(maskResizeFrame);
            maskResizeFrame = window.requestAnimationFrame(function () {
                document.querySelectorAll(".sub-usa-h-mask").forEach(fitMaskImageToViewport);
            });
        }, { passive: true });
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


/* HUNTER History */
(function () {
    "use strict";

    function initHistoryTimeline() {
        const timeline = document.querySelector(".sub-history-timeline");
        if (!timeline || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        const eraTrack = timeline.querySelector(".sub-history-era-track");
        const steps = gsap.utils.toArray(".sub-history-step");
        const centerAxis = timeline.querySelector(".sub-history-center-axis");
        const copy = timeline.querySelector(".sub-history-center-copy");
        const year = timeline.querySelector(".sub-history-center-year");
        const content = timeline.querySelector(".sub-history-center-content");
        const title = timeline.querySelector(".sub-history-center-title");
        const description = timeline.querySelector(".sub-history-center-description");
        const finaleStage = document.querySelector(".sub-history-finale-stage");
        const finaleImage = finaleStage && finaleStage.querySelector(".sub-history-finale-image");

        if (eraTrack) {
            gsap.fromTo(eraTrack,
                { y: "58vh" },
                {
                    y: function () {
                        return -(eraTrack.scrollHeight - window.innerHeight * .88);
                    },
                    ease: "none",
                    scrollTrigger: {
                        trigger: timeline,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1.1,
                        invalidateOnRefresh: true
                    }
                }
            );
        }

        if (centerAxis && steps.length) {
            gsap.fromTo(centerAxis,
                { y: 0 },
                {
                    y: function () {
                        return window.matchMedia("(max-width: 720px)").matches ? -30 : -80;
                    },
                    ease: "none",
                    scrollTrigger: {
                        trigger: timeline,
                        start: "top top",
                        endTrigger: steps[steps.length - 1],
                        end: "top 58%",
                        scrub: 1.1,
                        invalidateOnRefresh: true
                    }
                }
            );
        }

        if (finaleStage && finaleImage) {
            gsap.fromTo(finaleImage,
                {
                    width: function () {
                        return window.matchMedia("(max-width: 720px)").matches
                            ? 244
                            : Math.min(window.innerWidth, 1920) * 940 / 1920;
                    },
                    height: function () {
                        return window.matchMedia("(max-width: 720px)").matches
                            ? 137
                            : Math.min(window.innerWidth, 1920) * 520 / 1920;
                    }
                },
                {
                    width: "100%",
                    height: "100%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: finaleStage,
                        start: "center center",
                        end: "+=70%",
                        scrub: 1.1,
                        pin: true,
                        pinSpacing: true,
                        invalidateOnRefresh: true
                    }
                }
            );
        }

        let activeYear = year ? year.textContent.trim() : "1940";
        let contentChangeId = 0;

        function buildYearDigits(value) {
            if (!year) return;
            year.innerHTML = "";

            value.split("").forEach(function (digit) {
                const digitWrap = document.createElement("span");
                const track = document.createElement("span");
                const valueEl = document.createElement("span");

                digitWrap.className = "sub-history-year-digit";
                track.className = "sub-history-year-digit-track";
                valueEl.className = "sub-history-year-digit-value";
                valueEl.textContent = digit;

                track.appendChild(valueEl);
                digitWrap.appendChild(track);
                year.appendChild(digitWrap);
            });
        }

        function rollDigit(digitWrap, oldDigit, newDigit, direction, delay) {
            if (oldDigit === newDigit) return;

            const track = digitWrap.querySelector(".sub-history-year-digit-track");
            if (!track) return;

            const oldEl = document.createElement("span");
            const newEl = document.createElement("span");

            oldEl.className = "sub-history-year-digit-value";
            newEl.className = "sub-history-year-digit-value";
            oldEl.textContent = oldDigit;
            newEl.textContent = newDigit;
            track.innerHTML = "";

            if (direction > 0) {
                track.appendChild(oldEl);
                track.appendChild(newEl);
                gsap.set(track, { yPercent: 0 });
                gsap.to(track, {
                    yPercent: -50,
                    duration: .46,
                    delay: delay,
                    ease: "power3.inOut",
                    onComplete: function () {
                        track.innerHTML = "";
                        track.appendChild(newEl);
                        gsap.set(track, { yPercent: 0 });
                    }
                });
            } else {
                track.appendChild(newEl);
                track.appendChild(oldEl);
                gsap.set(track, { yPercent: -50 });
                gsap.to(track, {
                    yPercent: 0,
                    duration: .46,
                    delay: delay,
                    ease: "power3.inOut",
                    onComplete: function () {
                        track.innerHTML = "";
                        track.appendChild(newEl);
                        gsap.set(track, { yPercent: 0 });
                    }
                });
            }
        }

        function animateYear(nextYear) {
            if (!year || activeYear === nextYear) return;

            const oldYear = activeYear.padStart(4, "0");
            const targetYear = nextYear.padStart(4, "0");
            const direction = Number(targetYear) > Number(oldYear) ? 1 : -1;
            const changedIndexes = [];

            for (let index = 0; index < targetYear.length; index += 1) {
                if (oldYear[index] !== targetYear[index]) changedIndexes.push(index);
            }

            const order = changedIndexes.length > 1
                ? changedIndexes.slice().sort(function (a, b) { return b - a; })
                : changedIndexes;

            const digitWraps = Array.from(year.querySelectorAll(".sub-history-year-digit"));

            order.forEach(function (digitIndex, orderIndex) {
                rollDigit(
                    digitWraps[digitIndex],
                    oldYear[digitIndex],
                    targetYear[digitIndex],
                    direction,
                    orderIndex * .08
                );
            });

            activeYear = targetYear;
        }

        function changeHistory(step) {
            if (!step || !year || !content || !title || !description || !copy) return;

            const nextYear = step.dataset.year || "";
            if (!nextYear || activeYear === nextYear) return;

            contentChangeId += 1;
            const currentChangeId = contentChangeId;
            animateYear(nextYear);

            gsap.killTweensOf(content);
            gsap.to(content, {
                autoAlpha: 0,
                duration: .18,
                ease: "power1.out",
                overwrite: true,
                onComplete: function () {
                    if (currentChangeId !== contentChangeId) return;

                    const nextTitle = step.dataset.title || "";
                    const nextDescription = step.dataset.description || "";
                    const hasContent = Boolean(nextTitle || nextDescription);

                    copy.dataset.activeYear = nextYear;
                    title.textContent = nextTitle;
                    description.textContent = nextDescription;

                    if (!hasContent) {
                        gsap.set(content, { autoAlpha: 0 });
                        return;
                    }

                    gsap.to(content, {
                        autoAlpha: 1,
                        duration: .3,
                        ease: "power1.out",
                        overwrite: true
                    });
                }
            });
        }

        buildYearDigits(activeYear);
        if (copy) copy.dataset.activeYear = activeYear;

        steps.forEach(function (step) {
            ScrollTrigger.create({
                trigger: step,
                start: "top 58%",
                end: "bottom 58%",
                onEnter: function () { changeHistory(step); },
                onEnterBack: function () { changeHistory(step); }
            });
        });

        ScrollTrigger.refresh();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHistoryTimeline);
    } else {
        initHistoryTimeline();
    }
})();
