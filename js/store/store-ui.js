/* products-HunterPride-Map.html , Store UI. */

window.StoreUI={
    section:null,
    list:null,
    count:null,
    detail:null,

    init(section){
        this.section=section;
        this.list=section.querySelector(".sub-pride-store-list");
        this.count=section.querySelector(".sub-pride-map-count");
        this.detail=section.querySelector(".sub-pride-store-detail");
    },

    renderStoreList(stores){
        if(!this.list)return;

        if(!stores.length){
            this.list.innerHTML='<p class="sub-pride-store-empty">검색 결과가 없습니다.</p>';
            return;
        }

        this.list.innerHTML=stores.map(store=>`
            <button type="button" class="sub-pride-store-item" data-store-id="${store.id}">
                <span class="sub-pride-store-region">${store.region}</span>
                <strong>${store.name}</strong>
                <span class="sub-pride-store-address">${store.roadAddress}</span>
                <i aria-hidden="true"></i>
            </button>
        `).join("");
    },

    renderCount(totalCount){
        if(!this.count)return;

        this.count.innerHTML=`총 <strong>${totalCount}</strong>개의 매장이 있습니다.`;
    },

    renderDetail(store){
        if(!this.detail||!store)return;

        const photo=this.detail.querySelector(".sub-pride-store-photo");
        const region=this.detail.querySelector(".sub-pride-store-region");
        const title=this.detail.querySelector("h4");
        const meta=this.detail.querySelector(".sub-pride-store-meta");
        const productList=this.detail.querySelector(".sub-pride-store-products ul");

        photo.style.backgroundImage=store.image?`url("${store.image}")`:"";
        photo.classList.toggle("has-image",Boolean(store.image));
        region.textContent=store.region;
        title.textContent=store.name;

        meta.innerHTML=`
            <div><dt>도로명</dt><dd>${store.roadAddress}</dd></div>
            <div><dt>지번</dt><dd>${store.jibunAddress}</dd></div>
            <div><dt>전화번호</dt><dd>${store.phone}</dd></div>
        `;

        productList.innerHTML=store.products.map(product=>`
            <li>
                <span class="sub-pride-product-icon"></span>
                <p>${product.category}<strong>${product.name}</strong></p>
            </li>
        `).join("");

        this.detail.classList.add("is-open");
        this.detail.setAttribute("aria-hidden","false");
    },

    closeDetail(){
        if(!this.detail)return;

        this.detail.classList.remove("is-open");
        this.detail.setAttribute("aria-hidden","true");
        this.section.querySelectorAll(".sub-pride-store-item").forEach(item=>{
            item.classList.remove("is-active");
        });
    }
};
