(() => {
    "use strict";
const trainingData = [
        {
            id: 1,
            courseName: "얼라인먼트 Level 1", //교육과정명
            categoryName: "얼라이먼트 기본 교육", //교육카테고리
            imageUrl: "/images/support/training/training-level-1.jpg", //모달 상단 이미지
            date: "2026-07-29",
            startTime: "10:00", //교육시간
            endTime: "12:00",
            location: "서울 마포 트레이닝센터 3호실", //교육 장소
            instructorName: "김헌터", //강사명
            capacity: 20, //수강 신청 가능 인원
            currentApplicants: 12, //현재 신청 인원
            feeType: "free", //교육비용구분  free | paid
            price: 0, //교육비용
            status: "open", //교육진행상태 waiting :접수대기 | open : 접수중 | closed : 접수마감 | training : 교육중 | completed : 교육완료
description: "휠얼라인먼트 기초이론과 장비운영 실습으로 구성된 입문 과정입니다." //교육상세소개
        },
        {
            id: 2,
            courseName: "얼라인먼트 Level 2", //교육과정명
            categoryName: "얼라이먼트 중급 교육", //교육카테고리
            imageUrl: null, //모달 상단 이미지
            date: "2026-07-29",
            startTime: "13:00", //교육시간
            endTime: "15:00",
            location: "서울 마포 트레이닝센터 3호실", //교육 장소
            instructorName: "김헌터", //강사명
            capacity: 10, //수강 신청 가능 인원
            currentApplicants: 10, //현재 신청 인원
            feeType: "paid", //교육비용구분  free | paid
            price: 15000, //교육비용
            status: "closed", //교육진행상태 waiting :접수대기 | open : 접수중 | closed : 접수마감 | training : 교육중 | completed : 교육완료
description: "휠얼라인먼트 기초이론과 장비운영 실습으로 구성된 입문 과정입니다." //교육상세소개
        },
        {
            id: 3,
            courseName: "얼라인먼트 Level 3", //교육과정명
            categoryName: "얼라이먼트 고급 교육", //교육카테고리
            imageUrl: "/images/support/training/training-level-3.jpg", //모달 상단 이미지
            date: "2026-08-02",
            startTime: "10:00", //교육시간
            endTime: "17:00",
            location: "서울 마포 트레이닝센터 3호실", //교육 장소
            instructorName: "김헌터", //강사명
            capacity: 20, //수강 신청 가능 인원
            currentApplicants: 12, //현재 신청 인원
            feeType: "free", //교육비용구분  free | paid
            price: 0, //교육비용
            status: "waiting", //교육진행상태 waiting :접수대기 | open : 접수중 | closed : 접수마감 | training : 교육중 | completed : 교육완료
description: "얼라인먼트 기초이론과 장비운영 실습으로 구성된 입문 과정입니다." //교육상세소개
        },
        {
            id: 5,
            courseName: "휠 얼라인먼트 Level 1", //교육과정명
            categoryName: "휠 얼라인먼트 기본 교육", //교육카테고리
            imageUrl: null, //모달 상단 이미지
            date: "2026-07-20",
            startTime: "10:00", //교육시간
            endTime: "17:00",
            location: "서울 마포 트레이닝센터 3호실", //교육 장소
            instructorName: "김헌터", //강사명
            capacity: 20, //수강 신청 가능 인원
            currentApplicants: 12, //현재 신청 인원
            feeType: "free", //교육비용구분  free | paid
            price: 0, //교육비용
            status: "completed", //교육진행상태 waiting :접수대기 | open : 접수중 | closed : 접수마감 | training : 교육중 | completed : 교육완료
description: "휠얼라인먼트 기초이론과 장비운영 실습으로 구성된 입문 과정입니다." //교육상세소개
        },
        
    ];


    window.TRAINING_DATA = trainingData;
})();
