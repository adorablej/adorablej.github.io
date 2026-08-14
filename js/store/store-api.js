/* products-HunterPride-Map.html , Store API. */

window.StoreAPI = {
    // 개발계 API 연동 전까지 퍼블리싱 확인용 임시 데이터를 사용합니다.
    useMock: true,

    async getStores(params = {}) {
        if (this.useMock) return this.getMockStores(params);
        const data = await window.HunterFrontAPI.prideStores.getList({
            keyword: params.keyword,
            regionCode: params.regionCode || params.region,
            page: params.page || 1,
            size: params.size || 100
        });
        const items = Array.isArray(data) ? data : (data.content || data.items || []);
        const stores = items.map(this.normalizeStore);
        return {
            totalCount: data.totalCount || data.totalElements || stores.length,
            stores
        };
    },

    async getStore(id) {
        if (this.useMock) {
            return window.MOCK_STORES.find(store => String(store.id) === String(id)) || null;
        }

        // 드래프트에는 프론트 매장 상세 API가 없어 목록 결과에서 조회합니다.
        const result = await this.getStores({ size: 100 });
        return result.stores.find(store => String(store.id) === String(id)) || null;
    },

    normalizeStore(store) {
        const address = store.address || "";
        return {
            id: store.prideStoreId,
            region: address.split(" ")[0] || "",
            city: address.split(" ")[1] || "",
            name: store.displayName || store.storeName || "",
            roadAddress: address,
            jibunAddress: address,
            phone: store.phoneNumber || "",
            latitude: store.latitude,
            longitude: store.longitude,
            image: store.imageUrl || "",
            products: store.products || []
        };
    },

    getMockStores(params = {}) {
        const keyword = (params.keyword || "").trim().toLowerCase();
        const region = params.region || "";
        const city = params.city || "";

        const stores = window.MOCK_STORES.filter(store => {
            const keywordTarget = [
                store.name, store.region, store.city, store.district,
                store.roadAddress, store.jibunAddress
            ].join(" ").toLowerCase();

            return (!keyword || keywordTarget.includes(keyword))
                && (!region || store.region === region)
                && (!city || store.city === city);
        });

        return Promise.resolve({ totalCount: stores.length, stores });
    }
};
