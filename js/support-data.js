const operationGuideCategories = {
    alignment: {
        title: "Alignment Systems",
        products: ["HawkEye Elite X", "HawkEye Elite Premium", "WinAlign HD"]
    },
    "wheel-balancers": {
        title: "Wheel Balancers",
        products: ["GSP9700", "Road Force Elite"]
    },
    "tire-changers": {
        title: "Tire Changers",
        products: ["Revolution", "TCRH Revolution"]
    },
    "alignment-racks": {
        title: "Alignment Racks",
        products: ["RX45KIS"]
    },
    "brake-lathes": {
        title: "Brake Lathes",
        products: ["BrakeMaster 100"]
    },
    "vehicle-inspection": {
        title: "Vehicle Inspection",
        products: ["InspectPro 3000"]
    }
};

const operationGuideMockYoutubeUrls = [
    "https://youtu.be/tlcEurH9Cpg",
    "https://youtu.be/SgUbLVfzr28",
    "https://youtu.be/sl1relqfdyU",
    "https://youtu.be/tlcEurH9Cpg"
];

let operationGuideMockId = 1;

// 관리자 API가 준비되면 이 배열을 API 응답으로 교체합니다.
// 현재는 관리자에서 가이드 한 건을 등록한 것과 같은 평면 데이터 구조입니다.
const operationGuideData = Object.entries(operationGuideCategories).flatMap(([category, categoryInfo]) => {
    const manuals = categoryInfo.products.map((product, index) => ({
        id: operationGuideMockId++,
        type: "manual",
        category,
        product,
        title: `${product} Operations Manual${index ? "" : " / Quick Start Guide"}`,
        fileUrl: "#",
        youtubeUrl: "",
        visible: true,
        featured: false,
        description: `${product} 제품 매뉴얼 예시 데이터입니다.`
    }));

    const videos = operationGuideMockYoutubeUrls.map((youtubeUrl, index) => {
        const product = categoryInfo.products[index % categoryInfo.products.length];
        return {
            id: operationGuideMockId++,
            type: "video",
            category,
            product,
            title: `${product} Operation Guide ${index + 1}`,
            fileUrl: "",
            youtubeUrl,
            visible: true,
            featured: index < 3,
            description: `${product} 사용 방법을 소개하는 영상 예시 데이터입니다.`
        };
    });

    return [...manuals, ...videos];
});

// 노출 여부 필터가 동작하는지 확인하기 위한 비노출 예시 데이터입니다.
operationGuideData.push({
    id: operationGuideMockId++,
    type: "video",
    category: "alignment",
    product: "HawkEye Elite X",
    title: "비노출 영상 예시",
    fileUrl: "",
    youtubeUrl: "https://youtu.be/tlcEurH9Cpg",
    visible: false,
    featured: true,
    description: "visible 값이 false이므로 프론트에는 표시되지 않습니다."
});
