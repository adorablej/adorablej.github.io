/* products-HunterPride-Map.html , Store UI + NAVER Map controller. */

(function () {
    "use strict";

    const escapeHtml = (value = "") => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    const getStoreMarkerIcon = () => ({
        url: "/images/icon/store-marker.png",
        size: new naver.maps.Size(isMobile() ? 32 : 48, isMobile() ? 39 : 58),
        scaledSize: new naver.maps.Size(isMobile() ? 32 : 48, isMobile() ? 39 : 58),
        origin: new naver.maps.Point(0, 0),
        anchor: new naver.maps.Point(isMobile() ? 16 : 24, isMobile() ? 39 : 58)
    });

    const PRODUCT_ICON_PATHS = {
        "alignment systems": "/images/icon/icon_Alignment Systems.png",
        "휠 얼라인먼트 시스템": "/images/icon/icon_Alignment Systems.png",
        "wheel balancers": "/images/icon/icon_Wheel Balancers.png",
        "휠 밸런서": "/images/icon/icon_Wheel Balancers.png",
        "tire changers": "/images/icon/icon_Tire Changers.png",
        "타이어 체인저": "/images/icon/icon_Tire Changers.png",
        "brake lathes": "/images/icon/icon_Brake Lathes.png",
        "브레이크 선반": "/images/icon/icon_Brake Lathes.png",
        "alignment racks": "/images/icon/icon_Alignment racks.png",
        "얼라인먼트 리프트": "/images/icon/icon_Alignment racks.png",
        "vehicle inspection": "/images/icon/icon_Vehicle Inspection.png",
        "차량 검사": "/images/icon/icon_Vehicle Inspection.png",
        "heavy-duty": "/images/icon/icon_Heavy-Duty.png",
        "대형차": "/images/icon/icon_Heavy-Duty.png"
    };

    const getProductIconPath = category => {
        const normalizedCategory = String(category || "").trim().toLowerCase();
        return PRODUCT_ICON_PATHS[normalizedCategory]
            || "/images/icon/icon_Alignment Systems.png";
    };

    window.StoreUI = {
        section: null,
        list: null,
        count: null,
        detail: null,
        map: null,
        markers: new Map(),
        visibleStores: [],
        activeStoreId: null,

        init(section) {
            this.section = section;
            this.list = section.querySelector(".sub-pride-store-list");
            this.count = section.querySelector(".sub-pride-map-count");
            this.detail = section.querySelector(".sub-pride-store-detail");
        },

        initMap() {
            const mapElement = this.section?.querySelector("#naverStoreMap");
            const mapScript = document.querySelector('script[src*="oapi.map.naver.com/openapi/v3/maps.js"]');
            const hasPlaceholder = mapScript?.src.includes("NAVER_MAP_CLIENT_ID_PLACEHOLDER");
            if (!mapElement || !window.naver?.maps || hasPlaceholder) {
                console.error("네이버 지도 API를 불러오지 못했습니다. Client ID와 Web 서비스 URL을 확인하세요.");
                return false;
            }

            this.map = new naver.maps.Map(mapElement, {
                center: new naver.maps.LatLng(37.4563, 126.7052),
                zoom: 9,
                minZoom: 6,
                zoomControl: !isMobile(),
                zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT }
            });
            return true;
        },

        renderStoreList(stores) {
            if (!this.list) return;
            if (!stores.length) {
                this.list.innerHTML = `
                    <div class="sub-pride-store-empty" role="status">
                        <span class="sub-pride-store-empty-icon" aria-hidden="true">!</span>
                        <strong>검색 결과가 없습니다.</strong>
                        <span>다른 매장명 또는 주소를 입력해주세요</span>
                    </div>
                `;
                return;
            }

            this.list.innerHTML = stores.map(store => `
                <button type="button" class="sub-pride-store-item" data-store-id="${escapeHtml(store.id)}">
                    <span class="sub-pride-store-region">${escapeHtml(store.region)}</span>
                    <strong>${escapeHtml(store.name)}</strong>
                    <span class="sub-pride-store-address">${escapeHtml(store.roadAddress)}</span>
                    <i aria-hidden="true"></i>
                </button>
            `).join("");
        },

        renderCount(totalCount) {
            if (this.count) this.count.innerHTML = `총 <strong>${Number(totalCount) || 0}</strong>개의 매장이 있습니다.`;
        },

        renderMarkers(stores, onMarkerClick) {
            this.visibleStores = stores;
            this.markers.forEach(({ marker }) => marker.setMap(null));
            this.markers.clear();
            if (!this.map) return;

            const bounds = new naver.maps.LatLngBounds();
            stores.forEach(store => {
                const position = new naver.maps.LatLng(Number(store.latitude), Number(store.longitude));
                const marker = new naver.maps.Marker({
                    map: this.map,
                    position,
                    title: store.name,
                    icon: getStoreMarkerIcon()
                });
                naver.maps.Event.addListener(marker, "click", () => onMarkerClick(store));
                this.markers.set(String(store.id), { marker, store });
                bounds.extend(position);
            });

            if (stores.length > 1) this.map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
            else if (stores.length === 1) {
                this.map.setCenter(bounds.getCenter());
                this.map.setZoom(15);
            }
        },

        setActiveStore(store, options = {}) {
            if (!store) return;
            const id = String(store.id);
            this.activeStoreId = id;

            this.list?.querySelectorAll(".sub-pride-store-item").forEach(item => {
                const active = item.dataset.storeId === id;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
                if (active && options.scrollList) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            });

            this.markers.forEach(({ marker }, markerId) => {
                marker.setZIndex(markerId === id ? 100 : 1);
                marker.setAnimation(markerId === id ? naver.maps.Animation.BOUNCE : null);
            });

            const markerEntry = this.markers.get(id);
            if (this.map && markerEntry && options.moveMap !== false) {
                this.map.panTo(markerEntry.marker.getPosition());
                if (this.map.getZoom() < 14) this.map.setZoom(14);
            }
            this.renderDetail(store);
        },

        renderDetail(store) {
            if (!this.detail || !store) return;
            const photo = this.detail.querySelector(".sub-pride-store-photo");
            photo.style.backgroundImage = store.image ? `url("${encodeURI(store.image)}")` : "";
            photo.classList.toggle("has-image", Boolean(store.image));
            this.detail.querySelector(".sub-pride-store-region").textContent = store.region || "";
            this.detail.querySelector("h4").textContent = store.name || "";
            this.detail.querySelector(".sub-pride-store-meta").innerHTML = `
                <div><dt>도로명</dt><dd>${escapeHtml(store.roadAddress)}</dd></div>
                <div><dt>지번</dt><dd>${escapeHtml(store.jibunAddress)}</dd></div>
                <div><dt>전화번호</dt><dd>${escapeHtml(store.phone)}</dd></div>
            `;
            this.detail.querySelector(".sub-pride-store-products ul").innerHTML = (store.products || []).map(product => `
                <li>
                    <span class="sub-pride-product-icon" aria-hidden="true" style="background-image:url('${encodeURI(getProductIconPath(product.category))}')"></span>
                    <p><strong>${escapeHtml(product.category)}</strong><span>${escapeHtml(product.name)}</span></p>
                </li>
            `).join("");
            this.detail.classList.add("is-open");
            this.detail.setAttribute("aria-hidden", "false");
        },

        closeDetail() {
            if (!this.detail) return;
            this.activeStoreId = null;
            this.detail.classList.remove("is-open");
            this.detail.setAttribute("aria-hidden", "true");
            this.section.querySelectorAll(".sub-pride-store-item").forEach(item => {
                item.classList.remove("is-active");
                item.setAttribute("aria-pressed", "false");
            });
            this.markers.forEach(({ marker }) => {
                marker.setZIndex(1);
                marker.setAnimation(null);
            });
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const section = document.querySelector(".sub-pride-map");
        if (!section || !window.StoreAPI) return;

        const keywordInput = section.querySelector(".sub-pride-map-keyword input");
        const regionSelect = section.querySelector('[data-store-select="region"]');
        const citySelect = section.querySelector('[data-store-select="city"]');
        const regionInput = regionSelect?.querySelector('input[type="hidden"]');
        const cityInput = citySelect?.querySelector('input[type="hidden"]');
        const closeButton = section.querySelector(".sub-pride-store-close");
        if (!keywordInput || !regionSelect || !citySelect || !regionInput || !cityInput) return;

        StoreUI.init(section);
        StoreUI.initMap();

        const allStores = Array.isArray(window.MOCK_STORES) ? window.MOCK_STORES : [];
        const setSelectOptions = (select, placeholder, options, disabled = false) => {
            const list = select.querySelector(".sub-form-select-options");
            const value = select.querySelector(".sub-form-select-value");
            const input = select.querySelector('input[type="hidden"]');
            const trigger = select.querySelector(".sub-form-select-trigger");

            list.innerHTML = `
                <li><button type="button" class="sub-form-select-option is-selected" data-value="">${placeholder}</button></li>
                ${options.map(option => `
                    <li><button type="button" class="sub-form-select-option" data-value="${escapeHtml(option)}">${escapeHtml(option)}</button></li>
                `).join("")}
            `;
            value.textContent = placeholder;
            value.classList.add("is-placeholder");
            input.value = "";
            input.disabled = disabled;
            trigger.disabled = disabled;
            trigger.setAttribute("aria-expanded", "false");
            select.classList.toggle("is-disabled", disabled);
            select.classList.remove("is-open", "is-focus");
        };

        const setRegionOptions = () => {
            const regions = [...new Set(allStores.map(store => store.region))];
            setSelectOptions(regionSelect, "도/시 선택", regions);
        };
        const setCityOptions = region => {
            const cities = [...new Set(allStores.filter(store => !region || store.region === region).map(store => store.city))];
            setSelectOptions(citySelect, "시/구/군 선택", cities, !region);
        };

        const selectStore = async (id, options) => {
            try {
                const store = await StoreAPI.getStore(id);
                if (store) StoreUI.setActiveStore(store, options);
            } catch (error) {
                console.error(error);
            }
        };

        const loadStores = async () => {
            try {
                const result = await StoreAPI.getStores({
                    keyword: keywordInput.value,
                    region: regionInput.value,
                    city: cityInput.value
                });
                StoreUI.closeDetail();
                StoreUI.renderCount(result.totalCount);
                StoreUI.renderStoreList(result.stores);
                StoreUI.renderMarkers(result.stores, store => {
                    StoreUI.setActiveStore(store, { scrollList: true, moveMap: true });
                });
            } catch (error) {
                console.error(error);
                StoreUI.renderCount(0);
                StoreUI.renderStoreList([]);
                StoreUI.renderMarkers([], () => {});
            }
        };

        let searchTimer;
        keywordInput.addEventListener("input", () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(loadStores, 200);
        });
        regionInput.addEventListener("change", () => {
            setCityOptions(regionInput.value);
            loadStores();
        });
        cityInput.addEventListener("change", loadStores);
        StoreUI.list.addEventListener("click", event => {
            const item = event.target.closest(".sub-pride-store-item");
            if (item) selectStore(item.dataset.storeId, { scrollList: false, moveMap: true });
        });
        closeButton?.addEventListener("click", () => StoreUI.closeDetail());

        setRegionOptions();
        setCityOptions("");
        loadStores();
    });
})();
