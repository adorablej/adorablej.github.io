(() => {
    "use strict";

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getRelativeDate(offset) {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() + offset);
        return formatDate(date);
    }

    const trainingData = [
        {
            id: 1,
            courseName: "Wheel Alignment Basic Training",
            categoryName: "Alignment Systems",
            date: getRelativeDate(3),
            startTime: "10:00",
            endTime: "17:00",
            location: "Hunter Korea Training Center",
            instructorName: "Hunter Korea Technical Team",
            capacity: 20,
            currentApplicants: 12,
            feeType: "free",
            price: 0,
            status: "open",
            registrationEnabled: true,
            description: "This course covers basic wheel alignment theory and hands-on equipment operation."
        },
        {
            id: 2,
            courseName: "Road Force Balancer Operation",
            categoryName: "Wheel Balancers",
            date: getRelativeDate(3),
            startTime: "14:00",
            endTime: "17:00",
            location: "Hunter Korea Training Center",
            instructorName: "Hunter Korea Technical Team",
            capacity: 15,
            currentApplicants: 15,
            feeType: "paid",
            price: 100000,
            status: "closed",
            registrationEnabled: false,
            description: "Learn the core functions and practical operation methods of the Road Force balancer."
        },
        {
            id: 3,
            courseName: "Tire Changer Advanced Training",
            categoryName: "Tire Changers",
            date: getRelativeDate(11),
            startTime: "09:30",
            endTime: "16:30",
            location: "Hunter Korea Training Center",
            instructorName: "Hunter Korea Technical Team",
            capacity: 18,
            currentApplicants: 7,
            feeType: "paid",
            price: 150000,
            status: "open",
            registrationEnabled: true,
            description: "Advanced training focused on safe tire changing procedures and equipment efficiency."
        },
        {
            id: 4,
            courseName: "ADAS Calibration Seminar",
            categoryName: "ADAS",
            date: getRelativeDate(19),
            startTime: "13:00",
            endTime: "17:00",
            location: "Hunter Korea Training Center",
            instructorName: "Hunter Korea Technical Team",
            capacity: 30,
            currentApplicants: 22,
            feeType: "free",
            price: 0,
            status: "open",
            registrationEnabled: true,
            description: "A technical seminar covering ADAS calibration concepts and field applications."
        },
        {
            id: 5,
            courseName: "Alignment System Maintenance",
            categoryName: "Service Training",
            date: getRelativeDate(27),
            startTime: "10:00",
            endTime: "15:00",
            location: "Hunter Korea Training Center",
            instructorName: "Hunter Korea Technical Team",
            capacity: 12,
            currentApplicants: 4,
            feeType: "paid",
            price: 120000,
            status: "open",
            registrationEnabled: true,
            description: "Practice routine inspection and maintenance methods for alignment systems."
        },
        {
            id: 6,
            courseName: "Equipment Introduction Session",
            categoryName: "Product Seminar",
            date: getRelativeDate(32),
            startTime: "15:00",
            endTime: "17:00",
            location: "Online",
            instructorName: "Hunter Korea Product Team",
            capacity: 50,
            currentApplicants: 18,
            feeType: "free",
            price: 0,
            status: "cancelled",
            registrationEnabled: false,
            description: "An online product introduction session. This schedule has been cancelled."
        }
,
        {
            id: 7,
            courseName: "HawkEye Elite X Quick Start",
            categoryName: "Alignment Systems",
            date: getRelativeDate(11),
            startTime: "17:30",
            endTime: "19:00",
            location: "Hunter Korea Training Center",
            instructorName: "Hunter Korea Technical Team",
            capacity: 20,
            currentApplicants: 14,
            feeType: "free",
            price: 0,
            status: "open",
            registrationEnabled: true,
            description: "A short practical session covering initial setup and frequently used functions."
        },
        {
            id: 8,
            courseName: "Wheel Balancer Q&A Session",
            categoryName: "Wheel Balancers",
            date: getRelativeDate(11),
            startTime: "19:30",
            endTime: "20:30",
            location: "Online",
            instructorName: "Hunter Korea Technical Team",
            capacity: 40,
            currentApplicants: 40,
            feeType: "free",
            price: 0,
            status: "closed",
            registrationEnabled: false,
            description: "An online question-and-answer session for wheel balancer operation."
        },
        {
            id: 9,
            courseName: "Past Equipment Safety Training",
            categoryName: "Safety Training",
            date: getRelativeDate(-4),
            startTime: "10:00",
            endTime: "12:00",
            location: "Hunter Korea Training Center",
            instructorName: "Hunter Korea Technical Team",
            capacity: 25,
            currentApplicants: 23,
            feeType: "free",
            price: 0,
            status: "completed",
            registrationEnabled: false,
            description: "This training schedule has been completed."
        }
    ];


    window.TRAINING_DATA = trainingData;
})();
