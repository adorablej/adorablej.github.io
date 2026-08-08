(function () {
    "use strict";

    const data = window.WHEEL_ALIGNMENT_DATA;
    if (!data) return;

    const RECENT_STORAGE_KEY = "hunter-wheel-alignment-recent";

    function loadRecent() {
        try {
            const saved = JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY));
            return Array.isArray(saved) ? saved.filter(Boolean).slice(0, 5) : ["아반떼", "쏘나타", "K5"];
        } catch (error) {
            return ["아반떼", "쏘나타", "K5"];
        }
    }

    function saveRecent() {
        try {
            localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(state.recent));
        } catch (error) {
            // 저장소를 사용할 수 없는 환경에서도 화면 기능은 유지한다.
        }
    }

    const state = {
        brandId: "",
        modelId: "",
        recent: loadRecent()
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
        resultBody: document.getElementById("specification-result-body"),
        modal: document.getElementById("specification-modal"),
        modalDialog: document.querySelector(".specification-modal-dialog"),
        modalBody: document.querySelector(".specification-modal-body"),
        modalBrand: document.getElementById("specification-modal-brand"),
        modalMeta: document.getElementById("specification-modal-meta"),
        modalImage: document.getElementById("specification-modal-image"),
        modalSpecs: document.getElementById("specification-modal-specs"),
        modalExtra: document.getElementById("specification-modal-extra"),
        modalPrint: document.getElementById("specification-modal-print")
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
                <span class="sub-specification-recent-chip">
                    <button type="button" class="sub-specification-recent-keyword" data-recent-keyword="${keyword}">${keyword}</button>
                    <button type="button" class="sub-specification-recent-delete" data-delete-recent="${keyword}" aria-label="${keyword} 최근 검색어 삭제"></button>
                </span>
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
                    <img src="${model.image || "/images/car_default.png"}" alt="" onerror="this.onerror=null;this.src='/images/car_default.png'">
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
                    <span class="sub-specification-model-image"><img src="${model.image || "/images/car_default.png"}" alt="${model.name}" onerror="this.onerror=null;this.src='/images/car_default.png'"></span>
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
        elements.resultBody.innerHTML = rows.map((row, index) => {
            const hasSpecification = Array.isArray(row.specifications) && row.specifications.length > 0;
            return `
            <tr class="sub-specification-result-row${hasSpecification ? " has-specification" : ""}"
                ${hasSpecification ? `data-result-index="${index}" tabindex="0" role="button" aria-label="${row.modelName} 제원 상세 보기"` : ""}>
                <td><img src="${row.image || "/images/car_default.png"}" alt="${row.modelName}" onerror="this.onerror=null;this.src='/images/car_default.png'"></td>
                <td>${row.year}</td>
                <td>${row.modelName}</td>
                <td>${row.model}</td>
                <td>${row.detail}</td>
                <td>${row.note}</td>
            </tr>
        `;
        }).join("");
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
            saveRecent();
            renderRecent();
        }
        renderStep();
    }

    document.addEventListener("click", (event) => {
        const brandButton = event.target.closest("[data-brand-id]");
        const modelButton = event.target.closest("[data-model-id]");
        const removeButton = event.target.closest("[data-remove]");
        const recentButton = event.target.closest("[data-recent-keyword]");
        const recentDeleteButton = event.target.closest("[data-delete-recent]");
        const resultRow = event.target.closest("[data-result-index]");

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

        if (recentDeleteButton) {
            state.recent = state.recent.filter((keyword) => keyword !== recentDeleteButton.dataset.deleteRecent);
            saveRecent();
            renderRecent();
            return;
        }

        if (recentButton) {
            elements.keyword.value = recentButton.dataset.recentKeyword;
        }

        if (resultRow) openSpecificationModal(Number(resultRow.dataset.resultIndex));
    });

    elements.resultBody.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const resultRow = event.target.closest("[data-result-index]");
        if (!resultRow) return;
        event.preventDefault();
        openSpecificationModal(Number(resultRow.dataset.resultIndex));
    });

    function openSpecificationModal(resultIndex) {
        const brand = getBrand();
        const model = getModel();
        const rows = data.results[`${state.brandId}:${state.modelId}`] || createFallbackResults();
        const result = rows[resultIndex];
        if (!brand || !model || !result || !Array.isArray(result.specifications) || !result.specifications.length) return;

        elements.modalBrand.textContent = brand.logoText;
        elements.modalMeta.innerHTML = `
            <div><dt>제조사</dt><dd>${escapeHtml(brand.name)}</dd></div>
            <div><dt>모델명</dt><dd>${escapeHtml(result.modelName)}</dd></div>
            <div><dt>세부명</dt><dd>${escapeHtml(result.model)}</dd></div>
            <div><dt>연식</dt><dd>${escapeHtml(result.year)}</dd></div>
            <div><dt>비고</dt><dd>${escapeHtml(result.note || "-")}</dd></div>
        `;
        elements.modalImage.src = result.image || model.image || "/images/car_default.png";
        elements.modalImage.alt = result.modelName;
        elements.modalImage.onerror = function () {
            this.onerror = null;
            this.src = "/images/car_default.png";
        };
        elements.modalSpecs.innerHTML = result.specifications.map((item) => `
            <tr>
                <th><span>${escapeHtml(item.section)}</span> ${escapeHtml(item.label)}</th>
                <td>${escapeHtml(item.value)}</td>
                <td>${escapeHtml(item.min)} ~ ${escapeHtml(item.max)}</td>
            </tr>
        `).join("");

        const extraEntries = Object.entries(result.extra || {});
        elements.modalExtra.innerHTML = extraEntries.length ? `
            <h3>추가정보</h3>
            <dl>${extraEntries.map(([label, value]) => `
                <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>
            `).join("")}</dl>
        ` : "";

        elements.modal.hidden = false;
        document.documentElement.classList.add("is-specification-modal-open");
        requestAnimationFrame(() => elements.modal.classList.add("is-open"));
        elements.modalDialog.focus({ preventScroll: true });
    }

    function closeSpecificationModal() {
        if (elements.modal.hidden) return;
        elements.modal.classList.remove("is-open");
        document.documentElement.classList.remove("is-specification-modal-open");
        window.setTimeout(() => { elements.modal.hidden = true; }, 200);
    }

    document.querySelectorAll("[data-specification-modal-close]").forEach((button) => {
        button.addEventListener("click", closeSpecificationModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !elements.modal.hidden) closeSpecificationModal();
    });

    elements.modalPrint.addEventListener("click", () => window.print());

    elements.modalBody.addEventListener("copy", (event) => {
        const warning = "무단 복제를 금지합니다.";
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : "";
        let selectedHtml = escapeHtml(selectedText);

        if (selection && selection.rangeCount > 0) {
            const wrapper = document.createElement("div");
            wrapper.appendChild(selection.getRangeAt(0).cloneContents());
            selectedHtml = wrapper.innerHTML || selectedHtml;
        }

        event.preventDefault();
        event.clipboardData.setData("text/plain", `${warning}\n${selectedText}\n${warning}`);
        event.clipboardData.setData("text/html", `<p>${warning}</p>${selectedHtml}<p>${warning}</p>`);
    });

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

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
        saveRecent();
        renderRecent();
    });

    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();
        window.location.href = "/Support/Vehicle-Specification-Request.html";
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
