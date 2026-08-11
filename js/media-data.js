const MEDIA_CONFIG = {
    archive: {
        title: "Archive",
        download: true,
        categories: [
            "전체",
            "잡지 광고",
            "캘린더",
            "종합 카탈로그",
            "현수막/배너",
            "리플렛/브로슈어"
        ]
    },
    news: {
        title: "News",
        download: false,
        categories: [
            "전체",
            "제품/기술",
            "공헌/환경",
            "기타/마케팅"
        ]
    },
    promotion: {
        title: "Promotion & Event",
        download: false,
        categories: [
            "전체",
            "Promotion",
            "Event"
        ]
    }
};

const MEDIA_DATA = {
    archive: [
        {
            id: 1,
            category: "캘린더",
            title: "썸네일 없 내용이미지 있 캘린더",
            thumbnail: "",
            date: "2026.07.15",
            content: `
                <div class="sub-media-view-image">
                    <img src="/images/main_banner.png">
                </div>
                <div class="sub-media-view-text">
                    <p>썸네일 없 내용이미지 있 썸네일 없 내용이미지 있 썸네일 없 내용이미지 있 썸네일 없 내용이미지 있 캘린더 썸네일 없 내용이미지 있 캘린더 썸네일 없 내용이미지 있 캘린더 썸네일 없 내용이미지 있 캘린더 썸네일 없 내용이미지 있 캘린더 썸네일 없 내용이미지 있 캘린더 썸네일 없 내용이미지 있 캘린더 썸네일 없 내용이미지 있 캘린더</p>
                </div>
            `,
            file: "/download/#"
        },
        {
            id: 2,
            category: "종합 카탈로그",
            title: "썸네일 없 내용이미지 없 종합 카탈로그",
            thumbnail: "",
            date: "2026.05.20",
            content: `
                <div class="sub-media-view-text">
                    <p>썸네일 없 내용이미지 없 종합 카탈로그</p>
                    <p>썸네일 없 내용이미지 없 종합 카탈로그</p>
                </div>
            `,
            file: "#"
        },
        {
            id: 3,
            category: "잡지 광고",
            title: "썸네일 있 내용이미지 있 잡지 광고",
            thumbnail: "/images/main_banner.png",
            date: "2026.04.08",
            content: `
                <div class="sub-media-view-image">
                    <img src="/images/main_banner.png">
                </div>
                <div class="sub-media-view-text">
                    <p>썸네일 있 내용이미지 있 잡지 광고</p>
                </div>
            `,
            file: "#"
        }
    ],
    news: [
        {
            id: 1,
            category: "제품/기술",
            title: "리스트에서는 4",
            thumbnail: "",
            date: "2026.04.15",
            content: `
                <div class="sub-media-view-text">
                    <p>뉴스 뉴스 뉴스 뉴스 스 뉴스 뉴스 뉴스 뉴스</p>
                </div>
            `
        },
        {
            id: 2,
            category: "제품/기술",
            title: "게시글이 보입니다 5",
            thumbnail: "",
            date: "2026.05.15",
            content: `
                <div class="sub-media-view-text">
                    <p>뉴스 뉴스 뉴스 뉴스 스 뉴스</p>
                </div>
            `
        },
        {
            id: 3,
            category: "제품/기술",
            title: "글쓴 순서로 3",
            thumbnail: "",
            date: "2026.03.15",
            content: `
                <div class="sub-media-view-text">
                    <p>뉴스 뉴스 뉴스 뉴스 스 뉴스</p>
                </div>
            `
        },
        {
            id: 4,
            category: "제품/기술",
            title: "게시글 최신순으로 6",
            thumbnail: "",
            date: "2026.06.15",
            content: `
                <div class="sub-media-view-text">
                    <p>뉴스 뉴스 뉴스 뉴스 스 뉴스</p>
                </div>
            `
        },
        {
            id: 5,
            category: "제품/기술",
            title: "media 메인에서는 media 메인에서는 media 메인에서는 media 메인에서는 media 메인에서는 media 메인에서는 media 메인에서는 7",
            thumbnail: "",
            date: "2026.07.15",
            content: `
                <div class="sub-media-view-text">
                    <p>뉴스 뉴스 뉴스 뉴스 스 뉴스 뉴스 스 뉴스 뉴스 뉴스 뉴스 뉴스 스 뉴스 뉴스 뉴스 뉴스 뉴스 스 뉴스 뉴스 뉴스 뉴스 뉴스 스 뉴스 뉴스 뉴스 뉴스 뉴스 스 뉴스 뉴스 뉴스 뉴스 뉴스 스 뉴스 뉴스 뉴스 뉴스 뉴스 스 뉴스</p>
                </div>
            `
        }
    ],
    promotion: [
        {
            id: 1,
            category: "Promotion",
            title: "썸네일 있 내용이미지 있 프로모션 5",
            thumbnail: "/images/main_banner.png",
            date: "2026.06.12",
            content: `
                <div class="sub-media-view-image">
                    <img src="/images/main_banner.png">
                </div>
                <div class="sub-media-view-text">
                    <p>Promotion Promotion 프로모션</p>
                </div>
            `
        },
        {
            id: 2,
            category: "Promotion",
            title: "썸네일 없 내용이미지 있 프로모션 프로모션 프로모션7",
            thumbnail: "",
            date: "2026.04.15",
            content: `
                <div class="sub-media-view-image">
                    <img src="/images/main_banner.png">
                </div>
                <div class="sub-media-view-text">
                    <p>Promotion Promotion 프로모션 Promotion Promotion 프로모션 Promotion Promotion 프로모션 Promotion Promotion 프로모션 Promotion Promotion 프로모션 Promotion Promotion 프로모션</p>
                </div>
            `
        },
        {
            id: 3,
            category: "Event",
            title: "썸네일 없 내용이미지 없 이벤트 6",
            thumbnail: "",
            date: "2026.05.15",
            content: `
                <div class="sub-media-view-text">
                    <p>Event Event 이벤트 Event Event 이벤트</p>
                </div>
            `
        },
        {
            id: 4,
            category: "Promotion",
            title: "썸네일 있 내용이미지 있 프로모션 4",
            thumbnail: "/images/main_banner.png",
            date: "2026.07.15",
            content: `
                <div class="sub-media-view-image">
                    <img src="/images/main_banner.png">
                </div>
                <div class="sub-media-view-text">
                    <p>Promotion Promotion 프로모션</p>
                </div>
            `
        }
    ]
};
