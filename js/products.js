/* products.html , Category. */

const categoryHeading = document.querySelector(
    ".sub-product-category .sub-section-heading"
);

function getCategoryOffset() {
    if (!categoryHeading) return window.innerWidth <= 767 ? 25 : 40;
    return Math.max(0, categoryHeading.getBoundingClientRect().left);
}

function initTcmwSpecSelector(){
    const section=document.querySelector(".tcmw-detail-spec");
    const selector=section?.querySelector(".tcmw-spec-selector");
    const select=selector?.querySelector(".tcmw-spec-select");
    const value=selector?.querySelector(".tcmw-spec-select-value");
    const options=Array.from(selector?.querySelectorAll(".tcmw-spec-option")||[]);
    const optionList=selector?.querySelector(".tcmw-spec-options");
    const image=section?.querySelector("[data-tcmw-spec-image]");
    const depth=section?.querySelector('[data-tcmw-spec-value="depth"]');
    const weight=section?.querySelector('[data-tcmw-spec-value="weight"]');

    if(!selector||!select||!value||!optionList||!options.length||!image||!depth||!weight)return;

    const models={
        tcmw:{
            depth:"1,524 mm (60 in) / 1,803 mm (71 in)",
            weight:"513 kg",
            label:"TCMW",
            image:"/images/products/TCMW_v.png",
            alt:"TCMPRO Maverick™"
        },
        tcmpro:{
            depth:"1,778 mm (70 in) / 2,057 mm (81 in)",
            weight:"520 kg",
            label:"TCMPRO",
            image:"/images/products/TCMPRO_v.png",
            alt:"TCMPRO Maverick™"
        }
    };

    const close=()=>{
        selector.classList.remove("is-open");
        select.setAttribute("aria-expanded","false");
        optionList.hidden=true;
    };

    const open=()=>{
        selector.classList.add("is-open");
        select.setAttribute("aria-expanded","true");
        optionList.hidden=false;
    };

    const changeModel=modelKey=>{
        const model=models[modelKey]||models.tcmw;
        value.textContent=model.label;
        depth.textContent=model.depth;
        weight.textContent=model.weight;
        options.forEach(option=>{
            const isSelected=option.dataset.model===modelKey;
            option.classList.toggle("is-selected",isSelected);
            option.setAttribute("aria-selected",String(isSelected));
        });
        image.classList.add("is-changing");

        window.setTimeout(()=>{
            image.src=model.image;
            image.alt=model.alt;
            image.onload=()=>image.classList.remove("is-changing");
            if(image.complete)image.classList.remove("is-changing");
        },150);
        close();
    };

    select.addEventListener("click",()=>{
        if(selector.classList.contains("is-open"))close();
        else open();
    });

    options.forEach(option=>option.addEventListener("click",()=>changeModel(option.dataset.model)));
    document.addEventListener("click",event=>{
        if(!selector.contains(event.target))close();
    });
    selector.addEventListener("keydown",event=>{
        if(event.key==="Escape"){
            close();
            select.focus();
        }
    });
}

initTcmwSpecSelector();

(function initDetailGuideLinks() {
    const categoryByPath = {
        "Alignment-Systems": "alignment",
        "Wheel-Balancers": "wheel-balancers",
        "Tire-Changers": "tire-changers",
        "Alignment-Racks": "alignment-racks",
        "Brake-Lathes": "brake-lathes",
        "Vehicle-Inspection": "vehicle-inspection",
        "Heavy-Duty": "heavy-duty"
    };
    const productCategoryPath = window.location.pathname.split("/")[2];
    const category = categoryByPath[productCategoryPath];
    if (!category) return;

    const guideUrl = "/Support/equipment-operation-guide-detail.html";
    document.querySelectorAll(".detail-spec-button").forEach(button => {
        const isVideo = button.querySelector(".detail-spec-icon-video");
        button.href = `${guideUrl}?category=${category}${isVideo ? "&type=video" : ""}`;
    });
})();

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

function updateFeaturesLayout(swiper) {
    if (!swiper || swiper.destroyed) return;

    const offset = getFeaturesOffset();
    const activeIndex = swiper.activeIndex;

    swiper.params.slidesOffsetBefore = offset;
    swiper.params.slidesOffsetAfter = offset;
    swiper.originalParams.slidesOffsetBefore = offset;
    swiper.originalParams.slidesOffsetAfter = offset;
    swiper.update();
    swiper.slideTo(activeIndex, 0, false);
}

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
            window.requestAnimationFrame(() => updateFeaturesLayout(swiper));
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

    const mobileSlider=section.querySelector(".mobile-products-swiper");
    if(mobileSlider&&typeof Swiper!=="undefined"){
        const fixedInfo=section.querySelector(".mobile-products-fixed-info");
        const mobileProducts=[
            {title:"Alignment<br>Systems",href:"/Products/Alignment-Systems/list.html"},
            {title:"Wheel<br>Balancers",href:"/Products/Wheel-Balancers/list.html"},
            {title:"Tire<br>Changers",href:"/Products/Tire-Changers/list.html"},
            {title:"Brake<br>Lathes",href:"/Products/Brake-Lathes/list.html"},
            {title:"Alignment<br>racks",href:"/Products/Alignment-Racks/list.html"},
            {title:"Vehicle<br>Inspection",href:"/Products/Vehicle-Inspection/list.html"},
            {title:"Heavy-<br>Duty",href:"/Products/Heavy-Duty/list.html"}
        ];
        const updateMobileInfo=index=>{
            const product=mobileProducts[index];
            if(!fixedInfo||!product)return;
            fixedInfo.querySelector("h3").innerHTML=product.title;
            fixedInfo.querySelector("a").href=product.href;
        };

        new Swiper(mobileSlider,{
            slidesPerView:1,
            speed:700,
            effect:"fade",
            fadeEffect:{
                crossFade:true
            },
            observer:true,
            observeParents:true,
            resizeObserver:true,
            pagination:{
                el:section.querySelector(".mobile-products-pagination"),
                clickable:true
            },
            on:{
                init(swiper){
                    updateMobileInfo(swiper.realIndex);
                },
                slideChange(swiper){
                    updateMobileInfo(swiper.realIndex);
                }
            }
        });
    }

    const categoryItems=[...section.querySelectorAll(".sub-products-category-list li")];
    const productGroups=[...section.querySelectorAll(".sub-products-group")];

    productGroups.forEach(group=>{
        const slider=group.querySelector(".sub-products-swiper");
        const prevButton=group.querySelector(".sub-products-prev");
        const nextButton=group.querySelector(".sub-products-next");
        const pagination=group.querySelector(".sub-products-pagination");

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

(function initDetailTopButton() {
    const detailVisual = document.querySelector(".detail-visual");
    if (!detailVisual || document.querySelector(".detail-top-button")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "detail-top-button";
    button.setAttribute("aria-label", "페이지 맨 위로 이동");
    button.innerHTML = '<img src="/images/icon/TOP.png" alt="">';
    document.body.appendChild(button);

    let detailVisualBottom = 0;
    let ticking = false;

    function measureDetailVisualBottom() {
        const rect = detailVisual.getBoundingClientRect();
        detailVisualBottom = rect.bottom + window.scrollY;
    }

    function updateButtonVisibility() {
        button.classList.toggle("is-visible", window.scrollY >= detailVisualBottom);
        ticking = false;
    }

    function requestVisibilityUpdate() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateButtonVisibility);
    }

    measureDetailVisualBottom();
    updateButtonVisibility();

    window.addEventListener("scroll", requestVisibilityUpdate, { passive: true });
    window.addEventListener("resize", function () {
        measureDetailVisualBottom();
        requestVisibilityUpdate();
    });
    window.addEventListener("load", function () {
        measureDetailVisualBottom();
        requestVisibilityUpdate();
    }, { once: true });

    if ("ResizeObserver" in window) {
        new ResizeObserver(function () {
            measureDetailVisualBottom();
            requestVisibilityUpdate();
        }).observe(detailVisual);
    }

    button.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
    });
})();
