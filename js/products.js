/* products.html , Category. */

const categoryHeading = document.querySelector(
    ".sub-product-category .sub-section-heading"
);

function getCategoryOffset() {
    if (!categoryHeading) return window.innerWidth <= 767 ? 25 : 40;
    return Math.max(0, categoryHeading.getBoundingClientRect().left);
}

const categoryOffset = getCategoryOffset();

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

    on: {
        resize(swiper) {
            const offset = getCategoryOffset();
            swiper.params.slidesOffsetBefore = offset;
            swiper.params.slidesOffsetAfter = offset;
            swiper.originalParams.slidesOffsetBefore = offset;
            swiper.originalParams.slidesOffsetAfter = offset;
            swiper.updateSlides();
        },
    },

    breakpoints: {
        0: {
            spaceBetween: 20,
        },

        768: {
            spaceBetween: 20,
        },

        1380: {
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
            slidesPerView: 3,
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

    const productDetailUrls={
        "HawkEye Elite X":"/Products/Alignment-Systems/Hawkeye-Elite-X.html",
        "HawkEye Elite Premium":"/Products/Alignment-Systems/Hawkeye-Elite-Premium.html",
        "Hunter Standard Alignment":"/Products/Alignment-Systems/Hunter-Standard-Alignment.html",
        "RoadForce Walkaway":"/Products/Wheel-Balancers/RoadForce-Walkaway.html",
        "RoadForce Elite":"/Products/Wheel-Balancers/RoadForce-Elite.html",
        "SmartWeight Elite":"/Products/Wheel-Balancers/SmartWeight-Elite.html",
        "SmartWeight Hybrid":"/Products/Wheel-Balancers/SmartWeight-Hybrid.html",
        "TCRH Revolution":"/Products/Tire-Changers/TCRH-Revolution.html",
        "TCMW Maverick":"/Products/Tire-Changers/TCMW-Maverick.html",
        "TCX70":"/Products/Tire-Changers/TCX70.html",
        "TCX54":"/Products/Tire-Changers/TCX54.html",
        "AutoComp Elite":"/Products/Brake-Lathes/AutoComp-Elite.html",
        "BL Series":"/Products/Brake-Lathes/BL-Series.html",
        "Scissor Alignment Lifts":"/Products/Alignment-Racks/Scissor-Alignment-Lifts.html",
        "Four-Post Lifts":"/Products/Alignment-Racks/Four-Post-Lifts.html",
        "Hunter Quick Check Inspection":"/Products/Vehicle-Inspection/Hunter-Quick-Check-Inspection.html",
        "Hunter Quick Check Commercial":"/Products/Vehicle-Inspection/Hunter-Quick-Check-Commercial.html",
        "HawkEye XL":"/Products/Heavy-Duty/HawkEye-XL.html",
        "HD Elite":"/Products/Heavy-Duty/HD-Elite.html",
        "TCX635 HD":"/Products/Heavy-Duty/TCX635-PHD.html",
        "Heavy-Duty Four-Post":"/Products/Heavy-Duty/Heavy-Duty-Four-Post.html"
    };

    const categoryItems=[...section.querySelectorAll(".sub-products-category-list li")];
    const productGroups=[...section.querySelectorAll(".sub-products-group")];
    const visualImage=section.querySelector(".sub-products-visual-bg img");
    const visualMobileSource=section.querySelector(".sub-products-visual-bg source");
    const mobileVisualIndexes=[18,19,20,21,15,16,17,1,10,11,12,13,14,4,9,5,8,2,3,6,7];
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
        const mobileIndex=mobileVisualIndexes[index-1]||index;
        const mobileSrc=`/images/products/item/item_m_${mobileIndex}.png`;

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
            const productMore=document.createElement("a");
            const productName=info.closest(".swiper-slide")?.querySelector(".sub-products-image img")?.alt||"";

            mobileCategory.className="sub-products-mobile-category";
            mobileCategory.textContent=categoryName;
            productMore.className="sub-button-more sub-products-more";
            productMore.textContent="more";
            productMore.href=productDetailUrls[productName]||"/Products/products.html";
            productMore.setAttribute("aria-label",`${productName||"제품"} 상세 페이지로 이동`);
            info.prepend(mobileCategory);
            info.appendChild(productMore);
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
