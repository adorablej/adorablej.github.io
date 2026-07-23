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


/* product-detail.html , Main Features. */
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


/* product-detail.html , Detail Visual. */
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

document.addEventListener("DOMContentLoaded",initProductsHero);

function initProductsHero(){
    const section=document.querySelector(".sub-products-visual");
    if(!section)return;

    const categoryItems=[...section.querySelectorAll(".sub-products-category-list li")];
    const productGroups=[...section.querySelectorAll(".sub-products-group")];

    productGroups.forEach(group=>{
        const slider=group.querySelector(".sub-products-swiper");
        const prevButton=group.querySelector(".sub-products-prev");
        const nextButton=group.querySelector(".sub-products-next");

        if(!slider)return;

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
        });
    });

    const activeButton=section.querySelector(
        ".sub-products-category-list li.is-active .sub-products-category-button"
    );

    changeCategory(activeButton?.dataset.category||"alignment");
}


/* products-HunterPride-Map.html , API-ready Mock Store Map. */

document.addEventListener("DOMContentLoaded",initHunterPrideMap);

function initHunterPrideMap(){
    const section=document.querySelector(".sub-pride-map");
    if(!section)return;

    const MOCK_STORES=[
        {
            id:1,
            region:"경기도",
            city:"수원시",
            district:"영통구",
            name:"(주) 대영오토모티브",
            roadAddress:"경기도 수원시 영통구 매영로 219-8",
            jibunAddress:"경기도 수원시 영통구 원천동 362-11",
            phone:"031-212-4323",
            latitude:37.2635,
            longitude:127.0286,
            image:"",
            products:[
                {category:"휠 얼라인먼트 시스템",name:"HawkEye Elite Premium"},
                {category:"휠 밸런서",name:"Road Force Elite"}
            ]
        },
        {
            id:2,
            region:"경기도",
            city:"성남시",
            district:"분당구",
            name:"한국타이어 분당점",
            roadAddress:"경기도 성남시 분당구 대왕판교로 210",
            jibunAddress:"경기도 성남시 분당구 궁내동 210-3",
            phone:"031-718-7788",
            latitude:37.3697,
            longitude:127.1034,
            image:"",
            products:[
                {category:"타이어 체인저",name:"Revolution Tire Changer"}
            ]
        },
        {
            id:3,
            region:"서울특별시",
            city:"영등포구",
            district:"문래동",
            name:"헌터 모터스 문래점",
            roadAddress:"서울특별시 영등포구 문래로 100",
            jibunAddress:"서울특별시 영등포구 문래동 100-1",
            phone:"02-1234-5678",
            latitude:37.5172,
            longitude:126.8962,
            image:"",
            products:[
                {category:"휠 밸런서",name:"Road Force Elite"}
            ]
        },
        {
            id:4,
            region:"서울특별시",
            city:"강남구",
            district:"논현동",
            name:"강남모터스",
            roadAddress:"서울특별시 강남구 학동로 180",
            jibunAddress:"서울특별시 강남구 논현동 180-4",
            phone:"02-555-7788",
            latitude:37.5148,
            longitude:127.0293,
            image:"",
            products:[
                {category:"휠 얼라인먼트 시스템",name:"HawkEye Elite X"}
            ]
        },
        {
            id:5,
            region:"인천광역시",
            city:"부평구",
            district:"청천동",
            name:"헌터 오토서비스 부평점",
            roadAddress:"인천광역시 부평구 부평대로 250",
            jibunAddress:"인천광역시 부평구 청천동 250-3",
            phone:"032-987-6543",
            latitude:37.5068,
            longitude:126.7219,
            image:"",
            products:[
                {category:"타이어 체인저",name:"Revolution Tire Changer"}
            ]
        },
        {
            id:6,
            region:"인천광역시",
            city:"연수구",
            district:"송도동",
            name:"송도 오토케어",
            roadAddress:"인천광역시 연수구 센트럴로 160",
            jibunAddress:"인천광역시 연수구 송도동 160-2",
            phone:"032-833-4422",
            latitude:37.3923,
            longitude:126.6368,
            image:"",
            products:[
                {category:"휠 얼라인먼트 시스템",name:"HawkEye Elite Premium"},
                {category:"휠 밸런서",name:"SmartWeight Pro"}
            ]
        }
    ];

    const API_CONFIG={
        useMock:true,
        baseUrl:"/api/stores"
    };

    const keywordInput=section.querySelector(".sub-pride-map-keyword input");
    const selects=section.querySelectorAll(".sub-pride-map-selects select");
    const regionSelect=selects[0];
    const citySelect=selects[1];
    const count=section.querySelector(".sub-pride-map-count");
    const list=section.querySelector(".sub-pride-store-list");
    const detail=section.querySelector(".sub-pride-store-detail");
    const closeButton=section.querySelector(".sub-pride-store-close");

    function escapeHtml(value=""){
        return String(value)
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
    }

    async function getStores(params={}){
        if(API_CONFIG.useMock){
            const keyword=(params.keyword||"").trim().toLowerCase();

            const stores=MOCK_STORES.filter(store=>{
                const keywordTarget=[
                    store.name,
                    store.region,
                    store.city,
                    store.district,
                    store.roadAddress,
                    store.jibunAddress
                ].join(" ").toLowerCase();

                return(!keyword||keywordTarget.includes(keyword))
                    &&(!params.region||store.region===params.region)
                    &&(!params.city||store.city===params.city);
            });

            return{
                totalCount:stores.length,
                stores
            };
        }

        const query=new URLSearchParams(params);
        const response=await fetch(`${API_CONFIG.baseUrl}?${query.toString()}`,{
            headers:{Accept:"application/json"}
        });

        if(!response.ok){
            throw new Error(`매장 목록 조회 실패: ${response.status}`);
        }

        return response.json();
    }

    async function getStore(id){
        if(API_CONFIG.useMock){
            return MOCK_STORES.find(store=>store.id===Number(id))||null;
        }

        const response=await fetch(`${API_CONFIG.baseUrl}/${id}`,{
            headers:{Accept:"application/json"}
        });

        if(!response.ok){
            throw new Error(`매장 상세 조회 실패: ${response.status}`);
        }

        return response.json();
    }

    function setRegionOptions(){
        const regions=[...new Set(MOCK_STORES.map(store=>store.region))];

        regionSelect.innerHTML=[
            '<option value="">도/시 선택</option>',
            ...regions.map(region=>`<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`)
        ].join("");
    }

    function setCityOptions(region=""){
        const cities=[...new Set(
            MOCK_STORES
                .filter(store=>!region||store.region===region)
                .map(store=>store.city)
        )];

        citySelect.innerHTML=[
            '<option value="">시/구/군 선택</option>',
            ...cities.map(city=>`<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`)
        ].join("");

        citySelect.disabled=!region;
    }

    function renderList(stores){
        count.innerHTML=`총 <strong>${stores.length}</strong>개의 매장이 있습니다.`;

        if(!stores.length){
            list.innerHTML='<p class="sub-pride-store-empty">검색 결과가 없습니다.</p>';
            closeDetail();
            return;
        }

        list.innerHTML=stores.map(store=>`
            <button type="button" class="sub-pride-store-item" data-store-id="${store.id}">
                <span class="sub-pride-store-region">${escapeHtml(store.region)}</span>
                <strong>${escapeHtml(store.name)}</strong>
                <span class="sub-pride-store-address">${escapeHtml(store.roadAddress)}</span>
                <i aria-hidden="true"></i>
            </button>
        `).join("");
    }

    function renderDetail(store){
        if(!store)return;

        const photo=detail.querySelector(".sub-pride-store-photo");
        const region=detail.querySelector(".sub-pride-store-region");
        const title=detail.querySelector("h4");
        const meta=detail.querySelector(".sub-pride-store-meta");
        const productList=detail.querySelector(".sub-pride-store-products ul");

        photo.style.backgroundImage=store.image?`url("${store.image}")`:"";
        region.textContent=store.region;
        title.textContent=store.name;

        meta.innerHTML=`
            <div><dt>도로명</dt><dd>${escapeHtml(store.roadAddress)}</dd></div>
            <div><dt>지번</dt><dd>${escapeHtml(store.jibunAddress)}</dd></div>
            <div><dt>전화번호</dt><dd>${escapeHtml(store.phone)}</dd></div>
        `;

        productList.innerHTML=store.products.map(product=>`
            <li>
                <span class="sub-pride-product-icon"></span>
                <p>${escapeHtml(product.category)}<span>${escapeHtml(product.name)}</span></p>
            </li>
        `).join("");

        detail.classList.add("is-open");
        detail.setAttribute("aria-hidden","false");
    }

    function closeDetail(){
        detail.classList.remove("is-open");
        detail.setAttribute("aria-hidden","true");

        section.querySelectorAll(".sub-pride-store-item").forEach(item=>{
            item.classList.remove("is-active");
        });
    }

    async function loadStores(){
        try{
            const result=await getStores({
                keyword:keywordInput.value,
                region:regionSelect.value,
                city:citySelect.value
            });

            renderList(result.stores);
        }catch(error){
            console.error(error);
            count.innerHTML="총 <strong>0</strong>개의 매장이 있습니다.";
            list.innerHTML='<p class="sub-pride-store-empty">매장 정보를 불러오지 못했습니다.</p>';
        }
    }

    let searchTimer;

    keywordInput.addEventListener("input",()=>{
        clearTimeout(searchTimer);
        searchTimer=setTimeout(loadStores,200);
    });

    regionSelect.addEventListener("change",()=>{
        setCityOptions(regionSelect.value);
        closeDetail();
        loadStores();
    });

    citySelect.addEventListener("change",()=>{
        closeDetail();
        loadStores();
    });

    list.addEventListener("click",async event=>{
        const item=event.target.closest(".sub-pride-store-item");
        if(!item)return;

        list.querySelectorAll(".sub-pride-store-item").forEach(storeItem=>{
            storeItem.classList.remove("is-active");
        });

        item.classList.add("is-active");

        try{
            const store=await getStore(item.dataset.storeId);
            renderDetail(store);
        }catch(error){
            console.error(error);
        }
    });

    closeButton?.addEventListener("click",closeDetail);

    setRegionOptions();
    setCityOptions();
    loadStores();
}





/* products-HunterPride-Interview.html */

document.addEventListener("DOMContentLoaded",initHunterPrideInterview);

function initHunterPrideInterview(){
    const page=document.querySelector(".sub-pride-interview-page");
    const modal=document.querySelector(".sub-pride-interview-modal");
    if(!page||!modal)return;

    const interviewData={
        1:{
            title:"헌터 도입 후 달라진 우리 정비소",
            description:"헌터 장비 도입 후, 정비의 정확도와 고객 만족도가 함께 높아졌습니다. 장비 사용을 운영하면서 가장 중요하게 생각한 것은 고객이 믿고 맡길 수 있는 정비였습니다.",
            date:"2026.07.07"
        },
        2:{
            title:"성공적인 정비소 운영의 파트너",
            description:"헌터 장비를 사용하면서 가장 크게 느낀 변화는 정비 과정의 신뢰도였습니다. 정확한 측정 데이터와 빠른 작업 흐름 덕분에 정비 품질도 높아졌습니다.",
            date:"2026.07.07"
        },
        3:{
            title:"고객 신뢰를 만든 헌터 솔루션",
            description:"헌터는 단순한 장비가 아니라, 정비소의 경쟁력을 높여주는 파트너입니다. 앞으로도 고객에게 더 정확하고 신뢰할 수 있는 정비 서비스를 제공하겠습니다.",
            date:"2026.07.07"
        }
    };

    const featuredCards=[...page.querySelectorAll(".sub-pride-featured-card")];
    const featuredPrev=page.querySelector(".sub-pride-interview-prev");
    const featuredNext=page.querySelector(".sub-pride-interview-next");
    let featuredIndex=1;

    const featuredStage=page.querySelector(".sub-pride-featured-stage");

    function updateFeaturedStageHeight(){
        if(!featuredStage||!featuredCards.length)return;

        const maxHeight=Math.max(...featuredCards.map(card=>card.offsetHeight));
        featuredStage.style.height=`${Math.ceil(maxHeight)}px`;
    }

    function getFeaturedOffset(index){
        const total=featuredCards.length;
        let offset=index-featuredIndex;

        if(offset>total/2)offset-=total;
        if(offset<-total/2)offset+=total;

        return offset;
    }

    function renderFeatured(immediate=false){
        const sideDistance=window.innerWidth*520/1920;

        featuredCards.forEach((card,index)=>{
            const offset=getFeaturedOffset(index);
            const isActive=offset===0;
            const isSide=Math.abs(offset)===1;

            card.classList.toggle("is-active",isActive);
            card.style.pointerEvents=isActive||isSide?"auto":"none";
            card.style.visibility=isActive||isSide?"visible":"hidden";

            const vars=isActive?{
                xPercent:-50,
                x:0,
                y:0,
                scale:1,
                opacity:1,
                zIndex:5
            }:isSide?{
                xPercent:-50,
                x:offset*sideDistance,
                y:window.innerWidth*40/1920,
                scale:.8,
                opacity:.38,
                zIndex:2
            }:{
                xPercent:-50,
                x:offset<0?-sideDistance:sideDistance,
                y:window.innerWidth*40/1920,
                scale:.72,
                opacity:0,
                zIndex:1
            };

            gsap.killTweensOf(card);

            if(immediate){
                gsap.set(card,vars);
            }else{
                gsap.to(card,{
                    ...vars,
                    duration:.65,
                    ease:"power3.inOut",
                    overwrite:true
                });
            }
        });

        requestAnimationFrame(updateFeaturedStageHeight);
    }

    featuredPrev?.addEventListener("click",()=>{
        featuredIndex=(featuredIndex-1+featuredCards.length)%featuredCards.length;
        renderFeatured();
    });

    featuredNext?.addEventListener("click",()=>{
        featuredIndex=(featuredIndex+1)%featuredCards.length;
        renderFeatured();
    });

    featuredCards.forEach((card,index)=>{
        card.addEventListener("click",event=>{
            if(!card.classList.contains("is-active")){
                event.preventDefault();
                event.stopPropagation();
                featuredIndex=index;
                renderFeatured();
            }
        });
    });

    renderFeatured(true);
    window.addEventListener("load",updateFeaturedStageHeight);
    window.addEventListener("resize",()=>{
        renderFeatured(true);
        updateFeaturedStageHeight();
    });

    featuredCards.forEach(card=>{
        const image=card.querySelector("img");
        if(image&&!image.complete){
            image.addEventListener("load",updateFeaturedStageHeight,{once:true});
        }
    });

    const modalTitle=modal.querySelector(".sub-pride-interview-modal-content h4");
    const modalDescription=modal.querySelector(".sub-pride-interview-modal-content p");
    const modalDate=modal.querySelector(".sub-pride-interview-modal-content time");
    const closeButton=modal.querySelector(".sub-pride-interview-close");
    const overlay=modal.querySelector(".sub-pride-interview-overlay");
    const moreButton=page.querySelector(".sub-pride-more-button");

    function calcSwiperSpace(value){
        return window.innerWidth*value/1920;
    }

    function openModal(id){
        const data=interviewData[id]||interviewData[1];

        modalTitle.textContent=data.title;
        modalDescription.textContent=data.description;
        modalDate.textContent=data.date;
        modalDate.setAttribute("datetime",data.date.replaceAll(".","-"));

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden","false");
        document.body.classList.add("is-modal-open");
    }

    function closeModal(){
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden","true");
        document.body.classList.remove("is-modal-open");
    }

    page.addEventListener("click",event=>{
        const card=event.target.closest("[data-interview-id]");
        if(!card)return;

        openModal(card.dataset.interviewId);
    });

    moreButton?.addEventListener("click",()=>{
        page.querySelectorAll(".sub-pride-interview-card.is-hidden").forEach(card=>{
            card.classList.remove("is-hidden");
        });

        moreButton.classList.add("is-hidden");
    });

    closeButton.addEventListener("click",closeModal);
    overlay.addEventListener("click",closeModal);

    document.addEventListener("keydown",event=>{
        if(event.key==="Escape"&&modal.classList.contains("is-open")){
            closeModal();
        }
    });
}
