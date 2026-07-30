(function () {
    "use strict";

    const data = window.WHEEL_ALIGNMENT_DATA;
    if (!data) return;

    const state = {
        brandId: "",
        modelId: "",
        recent: ["아반떼", "쏘나타", "K5"]
    };

    const elements = {
        form: document.getElementById("specification-search-form"),
        keyword: document.getElementById("specification-keyword"),
        recentList: document.getElementById("recent-search-list"),
        recentReset: document.getElementById("recent-reset"),
        brandSelect: document.getElementById("specification-brand-select"),
        modelSelect: document.getElementById("specification-model-select"),
        selectedList: document.getElementById("selected-list"),
        domesticGrid: document.getElementById("domestic-brand-grid"),
        importGrid: document.getElementById("import-brand-grid"),
        brandPanel: document.getElementById("brand-panel"),
        modelPanel: document.getElementById("model-panel"),
        modelPanelTitle: document.getElementById("model-panel-title"),
        modelGrid: document.getElementById("model-grid"),
        resultPanel: document.getElementById("result-panel"),
        resultBody: document.getElementById("specification-result-body")
    };

    const getBrand = () => data.brands.find((brand) => brand.id === state.brandId);
    const getModel = () => (data.models[state.brandId] || []).find((model) => model.id === state.modelId);

    function renderBrandSelect() {
        elements.brandSelect.insertAdjacentHTML("beforeend", data.brands.map((brand) => (
            `<option value="${brand.id}">${brand.name}</option>`
        )).join(""));
    }

    function renderBrands() {
        const createCards = (type) => data.brands
            .filter((brand) => brand.type === type)
            .map((brand) => `
                <button type="button" class="sub-specification-brand-card" data-brand-id="${brand.id}">
                    <span class="sub-specification-brand-logo">${brand.logoText}</span>
                    <span class="sub-specification-brand-name">${brand.name}</span>
                </button>
            `).join("");

        elements.domesticGrid.innerHTML = createCards("domestic");
        elements.importGrid.innerHTML = createCards("import");
    }

    function renderRecent() {
        elements.recentList.innerHTML = state.recent.length
            ? state.recent.map((keyword) => `
                <button type="button" class="sub-specification-recent-chip" data-recent-keyword="${keyword}">
                    ${keyword}<span aria-hidden="true"></span>
                </button>
            `).join("")
            : '<span class="sub-specification-recent-empty">최근 검색어가 없습니다.</span>';
    }

    function renderSelected() {
        const brand = getBrand();
        const model = getModel();
        let html = "";

        if (brand) {
            html += `
                <button type="button" class="sub-specification-selected-chip" data-remove="brand">
                    <span class="sub-specification-selected-logo">${brand.logoText}</span>
                    <strong>${brand.name}</strong>
                    <span class="sub-specification-chip-close" aria-hidden="true"></span>
                </button>
            `;
        }
        if (model) {
            html += `
                <button type="button" class="sub-specification-selected-chip" data-remove="model">
                    <img src="${model.image}" alt="">
                    <strong>${model.name}</strong>
                    <span class="sub-specification-chip-close" aria-hidden="true"></span>
                </button>
            `;
        }
        elements.selectedList.innerHTML = html;
    }

    function renderModelSelect() {
        const models = data.models[state.brandId] || [];
        elements.modelSelect.innerHTML = '<option value="">차종을 선택해 주세요</option>' + models.map((model) => (
            `<option value="${model.id}">${model.name}</option>`
        )).join("");
        elements.modelSelect.disabled = models.length === 0;
        elements.modelSelect.value = state.modelId;
    }

    function renderModels() {
        const brand = getBrand();
        const models = data.models[state.brandId] || [];
        elements.modelPanelTitle.innerHTML = `${brand ? brand.name : "차종"} 차량을 선택해 주세요<span>.</span>`;
        elements.modelGrid.innerHTML = models.length
            ? models.map((model) => `
                <button type="button" class="sub-specification-model-card${model.id === state.modelId ? " is-active" : ""}" data-model-id="${model.id}">
                    <span class="sub-specification-model-image"><img src="${model.image}" alt="${model.name}"></span>
                    <strong>${model.name}</strong>
                </button>
            `).join("")
            : '<p class="sub-specification-empty">등록된 차종 정보가 없습니다.</p>';
    }

    function createFallbackResults() {
        const model = getModel();
        return model ? [{
            year: "2020-2024",
            modelName: model.name,
            model: model.name,
            detail: "All Models",
            note: "관리자 데이터 연결 예정",
            image: model.image
        }] : [];
    }

    function renderResults() {
        const key = `${state.brandId}:${state.modelId}`;
        const rows = data.results[key] || createFallbackResults();
        elements.resultBody.innerHTML = rows.map((row) => `
            <tr>
                <td><img src="${row.image}" alt="${row.modelName}"></td>
                <td>${row.year}</td>
                <td>${row.modelName}</td>
                <td>${row.model}</td>
                <td>${row.detail}</td>
                <td>${row.note}</td>
            </tr>
        `).join("");
    }

    function updateUrl() {
        const params = new URLSearchParams();
        if (state.brandId) params.set("brand", state.brandId);
        if (state.modelId) params.set("model", state.modelId);
        const query = params.toString();
        history.replaceState(null, "", query ? `?${query}` : location.pathname);
    }

    function renderStep() {
        const hasBrand = Boolean(state.brandId);
        const hasModel = Boolean(state.modelId);

        elements.brandPanel.hidden = hasBrand;
        elements.modelPanel.hidden = !hasBrand || hasModel;
        elements.resultPanel.hidden = !hasModel;

        renderSelected();
        renderModelSelect();
        elements.brandSelect.value = state.brandId;

        if (hasBrand && !hasModel) renderModels();
        if (hasModel) renderResults();
        updateUrl();
    }

    function selectBrand(brandId) {
        state.brandId = brandId;
        state.modelId = "";
        renderStep();
    }

    function selectModel(modelId) {
        state.modelId = modelId;
        const model = getModel();
        if (model && !state.recent.includes(model.name)) {
            state.recent.unshift(model.name);
            state.recent = state.recent.slice(0, 5);
            renderRecent();
        }
        renderStep();
    }

    document.addEventListener("click", (event) => {
        const brandButton = event.target.closest("[data-brand-id]");
        const modelButton = event.target.closest("[data-model-id]");
        const removeButton = event.target.closest("[data-remove]");
        const recentButton = event.target.closest("[data-recent-keyword]");

        if (brandButton) selectBrand(brandButton.dataset.brandId);
        if (modelButton) selectModel(modelButton.dataset.modelId);

        if (removeButton) {
            if (removeButton.dataset.remove === "brand") {
                state.brandId = "";
                state.modelId = "";
            } else {
                state.modelId = "";
            }
            renderStep();
        }

        if (recentButton) {
            elements.keyword.value = recentButton.dataset.recentKeyword;
        }
    });

    elements.brandSelect.addEventListener("change", (event) => {
        selectBrand(event.target.value);
    });

    elements.modelSelect.addEventListener("change", (event) => {
        state.modelId = event.target.value;
        if (state.modelId) selectModel(state.modelId);
        else renderStep();
    });

    elements.recentReset.addEventListener("click", () => {
        state.recent = [];
        renderRecent();
    });

    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (state.brandId && state.modelId) renderStep();
    });

    function restoreFromUrl() {
        const params = new URLSearchParams(location.search);
        const brandId = params.get("brand") || "";
        const modelId = params.get("model") || "";
        if (data.brands.some((brand) => brand.id === brandId)) {
            state.brandId = brandId;
            if ((data.models[brandId] || []).some((model) => model.id === modelId)) {
                state.modelId = modelId;
            }
        }
    }

    restoreFromUrl();
    renderBrandSelect();
    renderBrands();
    renderRecent();
    renderStep();
})();
