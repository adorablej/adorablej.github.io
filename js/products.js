const categoryOffset = Math.max(40, (window.innerWidth - 1300) / 2);

const categorySwiper = new Swiper(".sub-category-slider", {
    slidesPerView: "auto",
    spaceBetween: 30,
    speed: 700,
    grabCursor: true,

    slidesOffsetBefore: categoryOffset,
    slidesOffsetAfter: categoryOffset,

    navigation: {
        prevEl: ".sub-slider-prev",
        nextEl: ".sub-slider-next",
    },

    breakpoints: {
        0: {
            slidesOffsetBefore: 20,
            slidesOffsetAfter: 20,
            spaceBetween: 16,
        },

        768: {
            slidesOffsetBefore: 40,
            slidesOffsetAfter: 40,
            spaceBetween: 20,
        },

        1380: {
            slidesOffsetBefore: categoryOffset,
            slidesOffsetAfter: categoryOffset,
            spaceBetween: 30,
        },
    },
});


const dealerSwiper = new Swiper(".sub-dealer-slider", {
    slidesPerView: 3,
    spaceBetween: 30,
    speed: 700,
    grabCursor: true,
    watchOverflow: true,

    navigation: {
        prevEl: ".sub-dealer-prev",
        nextEl: ".sub-dealer-next",
    },

    breakpoints: {
        0: {
            slidesPerView: 1.2,
            spaceBetween: 16,
        },

        768: {
            slidesPerView: 2,
            spaceBetween: 20,
        },

        1200: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
    },
});


const dealerThumbs = document.querySelectorAll(".sub-dealer-thumb");

const dealerMainImage = document.getElementById("dealerMainImage");
const dealerArea = document.getElementById("dealerArea");
const dealerName = document.getElementById("dealerName");
const dealerAddress = document.getElementById("dealerAddress");
const dealerPhone = document.getElementById("dealerPhone");
const dealerMap = document.getElementById("dealerMap");

dealerThumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
        dealerThumbs.forEach((item) => {
            item.classList.remove("is-active");
        });

        thumb.classList.add("is-active");

        dealerMainImage.style.opacity = "0";

        setTimeout(() => {
            dealerMainImage.src = thumb.dataset.image;
            dealerMainImage.alt = thumb.dataset.alt;

            dealerArea.textContent = thumb.dataset.area;
            dealerName.textContent = thumb.dataset.name;
            dealerAddress.textContent = thumb.dataset.address;
            dealerPhone.textContent = thumb.dataset.phone;
            dealerMap.href = thumb.dataset.map;

            dealerMainImage.style.opacity = "1";
        }, 180);
    });
});



const prideSwiper = new Swiper(".sub-pride-slider", {
    slidesPerView: 3,
    spaceBetween: 38,
    speed: 700,
    grabCursor: true,
    watchOverflow: true,

    navigation: {
        prevEl: ".sub-pride-prev",
        nextEl: ".sub-pride-next",
    },

    breakpoints: {
        0: {
            slidesPerView: 1.1,
            spaceBetween: 16,
        },

        768: {
            slidesPerView: 2,
            spaceBetween: 24,
        },

        1200: {
            slidesPerView: 3,
            spaceBetween: 38,
        },
    },
});

const detailProductSwiper = new Swiper(".detail-product-slider", {
    slidesPerView: 1,
    speed: 600,
    effect: "fade",
    fadeEffect: {
        crossFade: true,
    },

    navigation: {
        prevEl: ".detail-visual-prev",
        nextEl: ".detail-visual-next",
    },
});

const featuresOffset = Math.max(40, (window.innerWidth - 1300) / 2);

const featuresSwiper = new Swiper(".detail-features-slider", {
    slidesPerView: "auto",
    spaceBetween: 24,
    speed: 700,
    grabCursor: true,

    slidesOffsetBefore: featuresOffset,
    slidesOffsetAfter: featuresOffset,

    navigation: {
        prevEl: ".detail-features-prev",
        nextEl: ".detail-features-next",
    },

    breakpoints: {
        0: {
            slidesOffsetBefore: 20,
            slidesOffsetAfter: 20,
            spaceBetween: 16,
        },

        768: {
            slidesOffsetBefore: 40,
            slidesOffsetAfter: 40,
            spaceBetween: 20,
        },

        1380: {
            slidesOffsetBefore: featuresOffset,
            slidesOffsetAfter: featuresOffset,
            spaceBetween: 24,
        },
    },
});


const faqItems = document.querySelectorAll(".detail-faq-item");

faqItems.forEach((item) => {
    const question = item.querySelector(".detail-faq-question");
    const answer = item.querySelector(".detail-faq-answer");

    if (item.classList.contains("is-active")) {
        answer.style.height = `${answer.scrollHeight}px`;
    }

    question.addEventListener("click", () => {
        const isActive = item.classList.contains("is-active");

        faqItems.forEach((otherItem) => {
            const otherQuestion = otherItem.querySelector(".detail-faq-question");
            const otherAnswer = otherItem.querySelector(".detail-faq-answer");

            otherItem.classList.remove("is-active");
            otherQuestion.setAttribute("aria-expanded", "false");
            otherAnswer.style.height = "0px";
        });

        if (!isActive) {
            item.classList.add("is-active");
            question.setAttribute("aria-expanded", "true");
            answer.style.height = `${answer.scrollHeight}px`;
        }
    });
});