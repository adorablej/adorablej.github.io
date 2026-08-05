/* ROI Calculator */

document.addEventListener("DOMContentLoaded", initRoiCalculator);

function initRoiCalculator() {
    const calculator = document.querySelector("[data-roi-calculator]");
    if (!calculator) return;

    const inputs = {
        investment: calculator.querySelector('[data-roi-input="investment"]'),
        jobCost: calculator.querySelector('[data-roi-input="jobCost"]'),
        marginRate: calculator.querySelector('[data-roi-input="marginRate"]'),
        dailyJobs: calculator.querySelector('[data-roi-input="dailyJobs"]'),
        workDays: calculator.querySelector('[data-roi-input="workDays"]')
    };

    const results = {
        annualRevenue: document.querySelector('[data-roi-result="annualRevenue"]'),
        annualDepreciation: document.querySelector('[data-roi-result="annualDepreciation"]'),
        annualProfit: document.querySelector('[data-roi-result="annualProfit"]'),
        paybackMonths: document.querySelector('[data-roi-result="paybackMonths"]'),
        tenYearProfit: document.querySelector('[data-roi-result="tenYearProfit"]')
    };

    const numberFormatter = new Intl.NumberFormat("ko-KR", {
        maximumFractionDigits: 0
    });

    function getNumber(input) {
        if (!input) return 0;
        const value = input.value.replace(/,/g, "").trim();
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function formatIntegerInput(input) {
        const digits = input.value.replace(/[^0-9]/g, "");
        input.value = digits ? numberFormatter.format(Number(digits)) : "";
    }

    function formatDecimalInput(input, maxValue) {
        let value = input.value
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*)\./g, "$1");

        if (value.startsWith(".")) value = `0${value}`;

        const number = Number(value);
        if (value !== "" && Number.isFinite(number) && number > maxValue) {
            value = String(maxValue);
        }

        input.value = value;
    }

    function setResult(element, value) {
        if (!element) return;
        element.textContent = numberFormatter.format(Math.max(0, Math.round(value)));
    }

    function calculate() {
        const investment = getNumber(inputs.investment);
        const jobCost = getNumber(inputs.jobCost);
        const marginRate = getNumber(inputs.marginRate) / 100;
        const dailyJobs = getNumber(inputs.dailyJobs);
        const workDays = getNumber(inputs.workDays);

        // 연간 총매출 마진 = 하루 작업 대수 × 대당 작업 비용 × 마진율 × 주당 근무일수 × 52주
        const annualRevenue = dailyJobs * jobCost * marginRate * workDays * 52;

        // 장비 수명을 10년으로 가정한 연간 감가상각비
        const annualDepreciation = investment / 10;

        // 연간 예상 순이익
        const annualProfit = annualRevenue - annualDepreciation;

        // 투자금 회수 기간은 감가상각 전 월간 총매출 마진 기준이며, 개월 수는 올림 처리
        const monthlyRevenue = annualRevenue / 12;
        const paybackMonths = monthlyRevenue > 0
            ? Math.ceil(investment / monthlyRevenue)
            : 0;

        // 10년간 예상 총수익
        const tenYearProfit = annualProfit * 10;

        setResult(results.annualRevenue, annualRevenue);
        setResult(results.annualDepreciation, annualDepreciation);
        setResult(results.annualProfit, annualProfit);
        setResult(results.paybackMonths, paybackMonths);
        setResult(results.tenYearProfit, tenYearProfit);
    }

    [inputs.investment, inputs.jobCost, inputs.dailyJobs].forEach((input) => {
        input?.addEventListener("input", () => {
            formatIntegerInput(input);
            calculate();
        });
    });

    inputs.marginRate?.addEventListener("input", () => {
        formatDecimalInput(inputs.marginRate, 100);
        calculate();
    });

    inputs.workDays?.addEventListener("input", () => {
        formatDecimalInput(inputs.workDays, 7);
        calculate();
    });

    Object.values(inputs).forEach((input) => {
        input?.addEventListener("focus", () => {
            input.classList.add("is-active");
        });

        input?.addEventListener("blur", () => {
            input.classList.toggle("is-active", input.value.trim() !== "");
        });
    });

    calculate();
}
