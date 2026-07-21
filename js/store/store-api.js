/* products-HunterPride-Map.html , Store API. */

window.StoreAPI={
    useMock:true,
    baseUrl:"/api/stores",

    async getStores(params={}){
        if(this.useMock){
            return this.getMockStores(params);
        }

        const query=new URLSearchParams();

        Object.entries(params).forEach(([key,value])=>{
            if(value!==undefined&&value!==null&&value!==""){
                query.set(key,value);
            }
        });

        const response=await fetch(`${this.baseUrl}?${query.toString()}`,{
            method:"GET",
            headers:{
                Accept:"application/json"
            }
        });

        if(!response.ok){
            throw new Error(`매장 목록을 불러오지 못했습니다. (${response.status})`);
        }

        return response.json();
    },

    async getStore(id){
        if(this.useMock){
            return window.MOCK_STORES.find(store=>store.id===Number(id))||null;
        }

        const response=await fetch(`${this.baseUrl}/${id}`,{
            method:"GET",
            headers:{
                Accept:"application/json"
            }
        });

        if(!response.ok){
            throw new Error(`매장 상세정보를 불러오지 못했습니다. (${response.status})`);
        }

        return response.json();
    },

    getMockStores(params={}){
        const keyword=(params.keyword||"").trim().toLowerCase();
        const city=params.city||"";
        const district=params.district||"";

        const stores=window.MOCK_STORES.filter(store=>{
            const matchesKeyword=!keyword||[
                store.name,
                store.roadAddress,
                store.jibunAddress
            ].some(value=>value.toLowerCase().includes(keyword));

            const matchesCity=!city||store.region===city||store.city===city;
            const matchesDistrict=!district||store.city===district||store.district===district;

            return matchesKeyword&&matchesCity&&matchesDistrict;
        });

        return Promise.resolve({
            totalCount:stores.length,
            stores
        });
    }
};
