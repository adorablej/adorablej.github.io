(() => {
    "use strict";

    // API 응답 구조를 기준으로 한 퍼블리싱용 임시 데이터입니다.
    // categoryName, imageUrl, instructorName, feeType, price, description은
    // 현재 화면 표시에 필요하지만 API 명세에는 없어 협의가 필요한 항목입니다.
    const trainingData = [
        {
            scheduleId: 1,
            scheduleName: "얼라인먼트 Level 1",
            courseTitle: "얼라인먼트 Level 1",
            courseCode: "ALIGN-LV1",
            startAt: "2026-08-01T09:00:00",
            endAt: "2026-08-01T12:00:00",
            location: "서울 마포 트레이닝센터 3호실",
            capacity: 20,
            applicationCount: 12,
            statusCode: "RECRUITING",
            applied: false,
            categoryName: "얼라이먼트 기본 교육",
            imageUrl: "",
            instructorName: "김헌터",
            feeType: "FREE",
            price: 0,
            description: "휠얼라인먼트 기초이론과 장비운영 실습으로 구성된 입문 과정입니다."
        },
        {
            scheduleId: 2,
            scheduleName: "얼라인먼트 Level 2",
            courseTitle: "얼라인먼트 Level 2",
            courseCode: "ALIGN-LV2",
            startAt: "2026-08-07T14:00:00",
            endAt: "2026-08-07T15:00:00",
            location: "서울 마포 트레이닝센터 3호실",
            capacity: 20,
            applicationCount: 0,
            statusCode: "RECRUITING",
            applied: false,
            categoryName: "얼라이먼트 중급 교육",
            imageUrl: null,
            instructorName: "김헌터",
            feeType: "PAID",
            price: 15000,
            description: "얼라인먼트 측정 결과 분석과 보정 실습을 진행하는 중급 과정입니다."
        },
        {
            scheduleId: 3,
            scheduleName: "얼라인먼트 Level 3",
            courseTitle: "얼라인먼트 Level 3",
            courseCode: "ALIGN-LV3",
            startAt: "2026-08-19T10:00:00",
            endAt: "2026-08-19T17:00:00",
            location: "서울 마포 트레이닝센터 3호실",
            capacity: 20,
            applicationCount: 12,
            statusCode: "IN_PROGRESS",
            applied: false,
            categoryName: "얼라이먼트 고급 교육",
            imageUrl: "",
            instructorName: "김헌터",
            feeType: "FREE",
            price: 0,
            description: "복합 진단과 현장 사례 중심으로 진행되는 고급 실무 과정입니다."
        },
        {
            scheduleId: 4,
            scheduleName: "휠 얼라인먼트 Level 1",
            courseTitle: "휠 얼라인먼트 Level 1",
            courseCode: "WHEEL-ALIGN-LV1",
            startAt: "2026-08-27T16:00:00",
            endAt: "2026-08-27T17:00:00",
            location: "서울 마포 트레이닝센터 3호실",
            capacity: 20,
            applicationCount: 20,
            statusCode: "CLOSED",
            applied: false,
            categoryName: "휠 얼라인먼트 기본 교육",
            imageUrl: null,
            instructorName: "김헌터",
            feeType: "FREE",
            price: 0,
            description: "휠 얼라인먼트 기본 점검과 장비 사용 방법을 익히는 과정입니다."
        },
        {
            scheduleId: 5,
            scheduleName: "ADAS 캘리브레이션 실무",
            courseTitle: "ADAS 캘리브레이션 실무",
            courseCode: "ADAS-CAL",
            startAt: "2026-08-29T13:00:00",
            endAt: "2026-08-29T16:00:00",
            location: "서울 마포 트레이닝센터 2호실",
            capacity: 15,
            applicationCount: 4,
            statusCode: "CANCELED",
            applied: false,
            categoryName: "ADAS 장비 교육",
            imageUrl: null,
            instructorName: "이헌터",
            feeType: "FREE",
            price: 0,
            description: "운영상 사유로 취소된 교육 일정의 표시 예시입니다."
        }
    ];

    window.TRAINING_DATA = trainingData;
})();
