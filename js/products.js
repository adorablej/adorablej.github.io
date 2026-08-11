/* products.html , Category. */

const categoryOffset = Math.max(40, (window.innerWidth - 1300) / 2);

const categorySwiper = new Swiper(".sub-category-slider", {
    slidesPerView: "auto",
    spaceBetween: 25,
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
            slidesOffsetBefore: 25,
            slidesOffsetAfter: 25,
            spaceBetween: 20,
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


/* products.html , Hunter Pride Dealer. */

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
            slidesPerView: 2,
            spaceBetween: 8,
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


/* products.html , Hunter Pride Dealer. */

const dealerThumbs = document.querySelectorAll(".sub-dealer-thumb");

const dealerMainImage = document.getElementById("dealerMainImage");
const dealerArea = document.getElementById("dealerArea");
const dealerName = document.getElementById("dealerName");
const dealerAddress = document.getElementById("dealerAddress");
const dealerPhone = document.getElementById("dealerPhone");
const dealerMap = document.getElementById("dealerMap");

function changeDealer(thumb, useFade = true) {
    if (!thumb || !dealerMainImage) return;

    const updateDealer = () => {
        dealerMainImage.src = thumb.dataset.image;
        dealerMainImage.alt = thumb.dataset.alt;
        dealerArea.textContent = thumb.dataset.area;
        dealerName.textContent = thumb.dataset.name;
        dealerAddress.textContent = thumb.dataset.address;
        dealerPhone.textContent = thumb.dataset.phone;
        dealerMap.href = thumb.dataset.map;
        dealerMainImage.style.opacity = "1";
    };

    dealerThumbs.forEach((item) => {
        item.classList.remove("is-active");
    });

    thumb.classList.add("is-active");

    if (!useFade) {
        updateDealer();
        return;
    }

    dealerMainImage.style.opacity = "0";
    setTimeout(updateDealer, 180);
}

dealerThumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
        changeDealer(thumb);
    });
});

// 첫 번째 업체를 초기 선택 상태로 적용
if (dealerThumbs.length) {
    changeDealer(dealerThumbs[0], false);
}


/* products.html , Hunter Pride Interview. */
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
            slidesPerView: "auto",
            spaceBetween: 16,
            slidesOffsetBefore: 25,
            slidesOffsetAfter: 25,
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


/* product-detail.html , Main Features. */
const featuresHeading = document.querySelector(
    ".detail-features .detail-section-heading"
);

function getFeaturesOffset() {
    if (!featuresHeading) return window.innerWidth <= 767 ? 25 : 40;
    return Math.max(0, featuresHeading.getBoundingClientRect().left);
}

const featuresOffset = getFeaturesOffset();

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

    on: {
        resize(swiper) {
            const offset = getFeaturesOffset();
            swiper.params.slidesOffsetBefore = offset;
            swiper.params.slidesOffsetAfter = offset;
            swiper.originalParams.slidesOffsetBefore = offset;
            swiper.originalParams.slidesOffsetAfter = offset;
            swiper.updateSlides();
        },
    },

    breakpoints: {
        0: {
            spaceBetween: 15,
        },

        768: {
            spaceBetween: 20,
        },

        1380: {
            spaceBetween: 24,
        },
    },
});


/* product-detail.html , FAQ. */
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


/* products-ROICalculator.html , Products Hero. */

window.addEventListener("includeLoaded",initProductsHero,{once:true});

function initProductsHero(){
    const section=document.querySelector(".sub-products-visual");
    if(!section)return;

    const categoryItems=[...section.querySelectorAll(".sub-products-category-list li")];
    const productGroups=[...section.querySelectorAll(".sub-products-group")];
    const visualImage=section.querySelector(".sub-products-visual-bg img");
    const visualMobileSource=section.querySelector(".sub-products-visual-bg source");
    let productIndex=1;

    productGroups.forEach(group=>{
        group.querySelectorAll(".swiper-slide").forEach(slide=>{
            slide.dataset.productIndex=productIndex;
            productIndex+=1;
        });
    });

    function changeProductVisual(slide){
        const index=Number(slide?.dataset.productIndex);
        if(!index||!visualImage||!visualMobileSource)return;

        const desktopSrc=`/images/products/item/item_${index}.png`;
        const mobileSrc=`/images/products/item/item_m_${index}.png`;

        visualMobileSource.srcset=mobileSrc;
        visualImage.src=window.matchMedia("(max-width: 720px)").matches?mobileSrc:desktopSrc;
    }

    productGroups.forEach(group=>{
        const slider=group.querySelector(".sub-products-swiper");
        const prevButton=group.querySelector(".sub-products-prev");
        const nextButton=group.querySelector(".sub-products-next");
        const categoryButton=section.querySelector(`.sub-products-category-button[data-category="${group.dataset.category}"]`);
        const categoryName=categoryButton?.textContent.trim()||"Products";
        const pagination=document.createElement("div");

        pagination.className="sub-products-pagination";
        group.appendChild(pagination);

        group.querySelectorAll(".sub-products-info").forEach(info=>{
            const mobileCategory=document.createElement("span");
            const mobileMore=document.createElement("button");

            mobileCategory.className="sub-products-mobile-category";
            mobileCategory.textContent=categoryName;
            mobileMore.type="button";
            mobileMore.className="sub-button-more sub-products-mobile-more";
            mobileMore.textContent="more";
            info.prepend(mobileCategory);
            info.appendChild(mobileMore);
        });

        if(!slider||typeof Swiper==="undefined")return;

        group.productSwiper=new Swiper(slider,{
            slidesPerView:1,
            speed:600,
            effect:"fade",
            fadeEffect:{
                crossFade:true
            },
            observer:true,
            observeParents:true,
            resizeObserver:true,
            navigation:{
                prevEl:prevButton,
                nextEl:nextButton
            },
            pagination:{
                el:pagination,
                clickable:true
            },
            on:{
                init(swiper){
                    if(group.classList.contains("is-active")){
                        changeProductVisual(swiper.slides[swiper.activeIndex]);
                    }
                },
                slideChange(swiper){
                    if(group.classList.contains("is-active")){
                        changeProductVisual(swiper.slides[swiper.activeIndex]);
                    }
                }
            }
        });
    });

    function changeCategory(category){
        categoryItems.forEach(item=>{
            const button=item.querySelector(".sub-products-category-button");
            item.classList.toggle("is-active",button?.dataset.category===category);
        });

        productGroups.forEach(group=>{
            const isActive=group.dataset.category===category;
            group.classList.toggle("is-active",isActive);

            if(!isActive||!group.productSwiper)return;

            requestAnimationFrame(()=>{
                group.productSwiper.updateSize();
                group.productSwiper.updateSlides();
                group.productSwiper.updateProgress();
                group.productSwiper.updateSlidesClasses();
                group.productSwiper.slideTo(0,0,false);
                group.productSwiper.navigation?.update();
                changeProductVisual(group.productSwiper.slides[0]);
            });
        });
    }

    categoryItems.forEach(item=>{
        const button=item.querySelector(".sub-products-category-button");
        if(!button)return;

        button.addEventListener("click",()=>{
            changeCategory(button.dataset.category);

            if(window.matchMedia("(max-width: 720px)").matches){
                const categoryList=button.closest(".sub-products-category-list");
                const targetLeft=button.parentElement.offsetLeft-(categoryList.clientWidth-button.offsetWidth)/2;
                categoryList.scrollTo({left:targetLeft,behavior:"smooth"});
            }
        });
    });

    let visualTouchStartX=0;
    let visualTouchStartY=0;
    let visualTouchEnabled=false;

    section.addEventListener("touchstart",event=>{
        const touch=event.touches[0];
        const backgroundRect=section.querySelector(".sub-products-visual-bg")?.getBoundingClientRect();

        visualTouchEnabled=Boolean(
            backgroundRect&&
            touch.clientY>=backgroundRect.top&&
            touch.clientY<=backgroundRect.bottom&&
            !event.target.closest(".sub-products-category")
        );
        visualTouchStartX=touch.clientX;
        visualTouchStartY=touch.clientY;
    },{passive:true});

    section.addEventListener("touchend",event=>{
        if(!visualTouchEnabled)return;

        const touch=event.changedTouches[0];
        const distanceX=touch.clientX-visualTouchStartX;
        const distanceY=touch.clientY-visualTouchStartY;

        visualTouchEnabled=false;

        if(Math.abs(distanceX)<35||Math.abs(distanceX)<=Math.abs(distanceY))return;

        const activeGroup=section.querySelector(".sub-products-group.is-active");
        if(distanceX<0){
            activeGroup?.productSwiper?.slideNext();
        }else{
            activeGroup?.productSwiper?.slidePrev();
        }
    },{passive:true});

    const activeButton=section.querySelector(
        ".sub-products-category-list li.is-active .sub-products-category-button"
    );

    changeCategory(activeButton?.dataset.category||"alignment");
}
