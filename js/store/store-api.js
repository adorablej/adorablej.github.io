/* products-HunterPride-Map.html , Store API. */

window.StoreAPI = {
    // 실제 API를 우선 사용하고, 개발 서버 연결 실패 시에만 퍼블리싱용 데이터를 표시합니다.
    useMock: false,
    fallbackToMock: true,

    async getStores(params = {}) {
        if (this.useMock) return this.getMockStores(params);
        try {
            const data = await window.HunterFrontAPI.prideStores.getList({
                keyword: params.keyword,
                page: params.page || 1,
                size: params.size || 100
            });
            const items = Array.isArray(data) ? data : (data?.content || data?.items || []);
            const stores = items
                .map(this.normalizeStore)
                .filter(store => !params.region || store.region === params.region)
                .filter(store => !params.city || store.city === params.city)
                .filter(store => !params.mainOnly || store.mainExposed)
                .filter(store => !params.mapOnly || store.mapExposed)
                .sort((a, b) => a.displayOrder - b.displayOrder);

            return { totalCount: stores.length, stores, source: "api" };
        } catch (error) {
            if (!this.fallbackToMock) throw error;
            console.warn("매장 API 연결 실패로 임시 데이터를 표시합니다.", error);
            const result = await this.getMockStores(params);
            return { ...result, source: "mock", error };
        }
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
        const detailAddress = store.detailAddress || "";
        const addressParts = address.trim().split(/\s+/);
        return {
            id: store.prideStoreId,
            region: addressParts[0] || "",
            city: addressParts[1] || "",
            name: store.displayName || store.storeName || "",
            address,
            detailAddress,
            phone: store.phoneNumber || "",
            latitude: store.latitude,
            longitude: store.longitude,
            image: store.imageUrl || "",
            businessHours: store.businessHours || "",
            products: (store.products || []).map(product => ({
                category: product.categoryName || product.category || "",
                name: product.productName || product.name || ""
            })),
            mainExposed: store.mainExposed !== false,
            mapExposed: store.mapExposed !== false,
            displayOrder: Number(store.displayOrder) || Number.MAX_SAFE_INTEGER
        };
    },

    getMockStores(params = {}) {
        const keyword = (params.keyword || "").trim().toLowerCase();
        const region = params.region || "";
        const city = params.city || "";

        const stores = window.MOCK_STORES.filter(store => {
            const keywordTarget = [
                store.name, store.region, store.city, store.district,
                store.address, store.detailAddress
            ].join(" ").toLowerCase();

            return (!keyword || keywordTarget.includes(keyword))
                && (!region || store.region === region)
                && (!city || store.city === city)
                && (!params.mainOnly || store.mainExposed !== false)
                && (!params.mapOnly || store.mapExposed !== false);
        }).sort((a, b) => (a.displayOrder || 9999) - (b.displayOrder || 9999));

        return Promise.resolve({ totalCount: stores.length, stores });
    }
};
