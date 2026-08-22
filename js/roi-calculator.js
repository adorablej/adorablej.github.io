/* ROI Calculator */

document.addEventListener("DOMContentLoaded", initRoiCalculator);

function initRoiCalculator() {
    const calculator = document.querySelector("[data-roi-calculator]");
    if (!calculator) return;

    const numberFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
    const getNumber = (input) => {
        const number = Number((input?.value || "").replace(/,/g, "").trim());
        return Number.isFinite(number) ? number : 0;
    };
    const setResult = (element, value) => {
        if (element) element.textContent = numberFormatter.format(Math.max(0, Math.round(value)));
    };
    const formatIntegerInput = (input) => {
        const digits = input.value.replace(/[^0-9]/g, "");
        input.value = digits ? numberFormatter.format(Number(digits)) : "";
    };
    const formatDecimalInput = (input, maxValue) => {
        let value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
        if (value.startsWith(".")) value = `0${value}`;
        if (value !== "" && Number(value) > maxValue) value = String(maxValue);
        input.value = value;
    };

    const inputs = Object.fromEntries(["investment", "jobCost", "marginRate", "dailyJobs", "workDays"].map((key) => [key, calculator.querySelector(`[data-roi-input="${key}"]`)]));
    const results = Object.fromEntries(["annualRevenue", "annualDepreciation", "annualProfit", "paybackMonths", "tenYearProfit"].map((key) => [key, document.querySelector(`[data-roi-result="${key}"]`)]));
    const changerInputs = Object.fromEntries(["hunterInvestment", "otherInvestment", "hunterLife", "otherLife"].map((key) => [key, document.querySelector(`[data-changer-input="${key}"]`)]));
    const changerResults = Object.fromEntries(["hunterAnnualCost", "otherAnnualCost", "hunterDepreciation", "otherDepreciation", "hunterTco", "otherTco"].map((key) => [key, document.querySelector(`[data-changer-result="${key}"]`)]));

    function calculateStandard() {
        const investment = getNumber(inputs.investment);
        const annualRevenue = getNumber(inputs.dailyJobs) * getNumber(inputs.jobCost) * (getNumber(inputs.marginRate) / 100) * getNumber(inputs.workDays) * 52;
        const annualDepreciation = investment / 10;
        const annualProfit = annualRevenue - annualDepreciation;
        const monthlyRevenue = annualRevenue / 12;
        setResult(results.annualRevenue, annualRevenue);
        setResult(results.annualDepreciation, annualDepreciation);
        setResult(results.annualProfit, annualProfit);
        setResult(results.paybackMonths, monthlyRevenue > 0 ? Math.ceil(investment / monthlyRevenue) : 0);
        setResult(results.tenYearProfit, annualProfit * 10);
    }

    function calculateChanger() {
        const hunterInvestment = getNumber(changerInputs.hunterInvestment);
        const otherInvestment = getNumber(changerInputs.otherInvestment);
        const hunterLife = getNumber(changerInputs.hunterLife);
        const otherLife = getNumber(changerInputs.otherLife);
        const hunterAnnualCost = 1120000;
        const otherAnnualCost = 8400000;
        setResult(changerResults.hunterAnnualCost, hunterAnnualCost);
        setResult(changerResults.otherAnnualCost, otherAnnualCost);
        setResult(changerResults.hunterDepreciation, hunterLife > 0 ? hunterInvestment / hunterLife : 0);
        setResult(changerResults.otherDepreciation, otherLife > 0 ? otherInvestment / otherLife : 0);
        setResult(changerResults.hunterTco, hunterInvestment + (hunterAnnualCost * hunterLife));
        setResult(changerResults.otherTco, otherInvestment + (otherAnnualCost * otherLife));
    }

    [inputs.investment, inputs.jobCost, inputs.dailyJobs, changerInputs.hunterInvestment, changerInputs.otherInvestment].forEach((input) => input?.addEventListener("input", () => {
        formatIntegerInput(input);
        calculateStandard();
        calculateChanger();
    }));
    inputs.marginRate?.addEventListener("input", () => { formatDecimalInput(inputs.marginRate, 100); calculateStandard(); });
    inputs.workDays?.addEventListener("input", () => { formatDecimalInput(inputs.workDays, 7); calculateStandard(); });
    [changerInputs.hunterLife, changerInputs.otherLife].forEach((input) => input?.addEventListener("input", () => { formatDecimalInput(input, 100); calculateChanger(); }));

    [...Object.values(inputs), ...Object.values(changerInputs)].forEach((input) => {
        input?.addEventListener("focus", () => input.classList.add("is-active"));
        input?.addEventListener("blur", () => input.classList.toggle("is-active", input.value.trim() !== ""));
    });

    document.querySelectorAll("[data-roi-product]").forEach((button) => button.addEventListener("click", () => {
        const isChanger = button.dataset.roiProduct === "changer";
        document.querySelectorAll("[data-roi-product]").forEach((item) => {
            const selected = item === button;
            item.classList.toggle("is-active", selected);
            item.setAttribute("aria-selected", String(selected));
        });
        document.querySelector('[data-roi-panel="standard"]').hidden = isChanger;
        document.querySelector('[data-roi-panel="changer"]').hidden = !isChanger;
        document.querySelector('[data-roi-result-panel="standard"]').hidden = isChanger;
        document.querySelector('[data-roi-result-panel="changer"]').hidden = !isChanger;
    }));

    calculateStandard();
    calculateChanger();
}
