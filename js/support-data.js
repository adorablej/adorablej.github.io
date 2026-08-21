const operationGuideCategories = {
    alignment: {
        categoryId: 1,
        categoryKey: "alignment",
        categoryName: "Alignment Systems",
        categoryDisplayOrder: 1,
        products: [
            { productId: 101, productName: "WinAlign®", productDisplayOrder: 1 },
            { productId: 102, productName: "WinAlign® Heavy-Duty", productDisplayOrder: 2 },
            { productId: 103, productName: "ProAlign® 2", productDisplayOrder: 3 },
            { productId: 104, productName: "ProAlign® 2 Heavy-Duty", productDisplayOrder: 4 },
            { productId: 105, productName: "Other documents", productDisplayOrder: 5 }
        ]
    },
    "alignment-racks": {
        categoryId: 2,
        categoryKey: "alignment-racks",
        categoryName: "Alignment Racks",
        categoryDisplayOrder: 2,
        products: [
            { productId: 201, productName: "RX45KIS", productDisplayOrder: 1 }
        ]
    },
    adas: {
        categoryId: 3,
        categoryKey: "adas",
        categoryName: "ADAS Calibration Systems",
        categoryDisplayOrder: 3,
        products: [
            { productId: 301, productName: "ADASLink®", productDisplayOrder: 1 }
        ]
    },
    "vehicle-inspection": {
        categoryId: 4,
        categoryKey: "vehicle-inspection",
        categoryName: "Vehicle Inspection",
        categoryDisplayOrder: 4,
        products: [
            { productId: 401, productName: "Quick Check®", productDisplayOrder: 1 }
        ]
    },
    "wheel-balancers": {
        categoryId: 5,
        categoryKey: "wheel-balancers",
        categoryName: "Wheel Balancers",
        categoryDisplayOrder: 5,
        products: [
            { productId: 501, productName: "Road Force® Elite", productDisplayOrder: 1 },
            { productId: 502, productName: "GSP9700", productDisplayOrder: 2 }
        ]
    },
    "tire-changers": {
        categoryId: 6,
        categoryKey: "tire-changers",
        categoryName: "Tire Changers",
        categoryDisplayOrder: 6,
        products: [
            { productId: 601, productName: "Revolution™", productDisplayOrder: 1 },
            { productId: 602, productName: "TCX635HD", productDisplayOrder: 2 }
        ]
    },
    "brake-lathes": {
        categoryId: 7,
        categoryKey: "brake-lathes",
        categoryName: "Brake Lathes",
        categoryDisplayOrder: 7,
        products: [
            { productId: 701, productName: "AutoComp Elite®", productDisplayOrder: 1 }
        ]
    },
    "overseas-setup": {
        categoryId: 8,
        categoryKey: "overseas-setup",
        categoryName: "Overseas Equipment Data Setup Guide",
        categoryDisplayOrder: 8,
        products: [
            { productId: 801, productName: "Other documents", productDisplayOrder: 1 }
        ]
    }
};

const operationGuideMockYoutubeUrls = [
    "https://youtu.be/tlcEurH9Cpg",
    "https://youtu.be/SgUbLVfzr28",
    "https://youtu.be/sl1relqfdyU",
    "https://youtu.be/tlcEurH9Cpg"
];

const operationGuideManualSource = {
    alignment: [
        [101, "WinAlign® Quick Start Guide", "퀵스타트 가이드", "v1.0"],
        [101, "WinAlign® Operations Manual", "사용 설명서", "v3.8"],
        [101, "WinAlign® CE Operations Manual (International)", "사용 설명서", "v3.8"],
        [101, "WinAlign® and ADASLink® Quick Start Guide", "퀵스타트 가이드", "v1.0"],
        [102, "WinAlign® HD Operations Manual", "사용 설명서", "v2.1"],
        [102, "WinAlign® HD CE Operations Manual (International)", "사용 설명서", "v2.1"],
        [103, "ProAlign® 2 Quick Start Guide (English International)", "퀵스타트 가이드", "v1.0"],
        [103, "ProAlign® 2 Operations Manual", "사용 설명서", "v2.0"],
        [103, "ProAlign® 2 CE Operations Manual (International)", "사용 설명서", "v2.0"],
        [104, "ProAlign® 2 HD Operations Manual", "사용 설명서", "v2.0"],
        [104, "ProAlign® 2 HD CE Operations Manual", "사용 설명서", "v2.0"],
        [105, "End User License Agreement", "기타 문서", ""]
    ]
};

let operationGuideMockId = 1;

const operationGuideManualData = Object.values(operationGuideCategories).flatMap(category => {
    const source = operationGuideManualSource[category.categoryKey]
        || category.products.map(product => [
            product.productId,
            `${product.productName} Operations Manual`,
            "사용 설명서",
            "v1.0"
        ]);

    return source.map((item, index) => ({
        eogGuideId: operationGuideMockId++,
        categoryId: category.categoryId,
        productId: item[0],
        title: item[1],
        documentType: item[2],
        documentVersion: item[3],
        fileUrl: "/images/support/IMG_5191.pdf",
        originalFileName: `${item[1].replaceAll(/[^a-zA-Z0-9]+/g, "_")}.pdf`,
        downloadAllowed: true,
        displayOrder: index + 1,
        isExposed: true
    }));
});

const operationGuideVideoData = Object.values(operationGuideCategories).flatMap(category =>
    operationGuideMockYoutubeUrls.map((youtubeUrl, index) => {
        const product = category.products[index % category.products.length];
        return {
            eogGuideId: operationGuideMockId++,
            categoryId: category.categoryId,
            productId: product.productId,
            title: `${product.productName} Operation Guide ${index + 1}`,
            summary: `${product.productName} 사용 방법을 소개하는 영상 예시 데이터입니다.`,
            youtubeUrl,
            thumbnailUrl: "",
            duration: index % 2 ? "6:52" : "4:09",
            captionSupported: index % 2 === 0,
            isFeatured: index < 3,
            displayOrder: index + 1,
            isExposed: true
        };
    })
);
