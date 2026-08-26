(async function () {
    "use strict";

    const api = window.HunterFrontAPI?.vehicles;
    const data = { brands: [], models: {}, results: {} };

    const RECENT_STORAGE_KEY = "hunter-wheel-alignment-recent";

    function loadRecent() {
        try {
            const saved = JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY));
            return Array.isArray(saved) ? saved.filter(Boolean).slice(0, 5) : [];
        } catch (error) {
            return [];
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
        requestButton: document.querySelector(".sub-specification-submit"),
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

    const emptyResultMarkup = () => `
        <div class="sub-specification-empty">
            <strong>선택하신 제조사에<br>등록된 차종이 없습니다.</strong>
            <p>필요한 차량 정보는 제원 찾기 요청을 통해<br>등록을 요청해 주세요.</p>
        </div>
    `;

    const brandLogoMarkup = (brand, decorative) => `
        <img src="${escapeHtml(brand.logo || "/images/img_placeholder.png")}" alt="${decorative ? "" : escapeHtml(brand.name)}"
            onerror="this.onerror=null;this.src='/images/img_placeholder.png'">
    `;

    function renderBrandSelect() {
        elements.brandSelect.insertAdjacentHTML("beforeend", data.brands.map((brand) => (
            `<option value="${brand.id}">${escapeHtml(brand.name)}</option>`
        )).join(""));
    }

    function renderBrands() {
        const createCards = (type) => data.brands
            .filter((brand) => brand.type === type)
            .map((brand) => `
                <button type="button" class="sub-specification-brand-card" data-brand-id="${brand.id}">
                    <span class="sub-specification-brand-logo">${brandLogoMarkup(brand, false)}</span>
                    <span class="sub-specification-brand-name">${escapeHtml(brand.name)}</span>
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
                    <span class="sub-specification-selected-logo">${brandLogoMarkup(brand, true)}</span>
                    <strong>${escapeHtml(brand.name)}</strong>
                    <span class="sub-specification-chip-close" aria-hidden="true"></span>
                </button>
            `;
        }
        if (model) {
            html += `
                <button type="button" class="sub-specification-selected-chip" data-remove="model">
                    <img src="${model.image && model.image !== "/images/car_default.png" ? model.image : "/images/car_default2.png"}" alt="" onerror="this.onerror=null;this.src='/images/car_default2.png'">
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
                    <span class="sub-specification-model-image"><img src="${model.image && model.image !== "/images/car_default.png" ? model.image : "/images/car_default2.png"}" alt="${model.name}" onerror="this.onerror=null;this.src='/images/car_default2.png'"></span>
                    <strong>${model.name}</strong>
                </button>
            `).join("")
            : emptyResultMarkup();
    }

    function renderResults() {
        const key = `${state.brandId}:${state.modelId}`;
        const rows = data.results[key] || [];
        elements.resultBody.innerHTML = rows.length ? rows.map((row, index) => {
            const hasSpecification = Array.isArray(row.specifications) && row.specifications.length > 0;
            return `
            <tr class="sub-specification-result-row${hasSpecification ? " has-specification" : ""}"
                ${hasSpecification ? `data-result-index="${index}" tabindex="0" role="button" aria-label="${row.modelName} 제원 상세 보기"` : ""}>
                <td><img src="${row.image || "/images/car_default.png"}" alt="${row.modelName}" onerror="this.onerror=null;this.src='/images/car_default.png'"></td>
                <td>${escapeHtml(row.year)}</td>
                <td>${escapeHtml(row.modelName)}</td>
                <td>${escapeHtml(row.model)}</td>
                <td>${escapeHtml(row.detail)}</td>
                <td>${escapeHtml(row.note)}</td>
            </tr>
        `;
        }).join("") : `<tr><td colspan="6">${emptyResultMarkup()}</td></tr>`;
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

    async function selectModel(modelId) {
        state.modelId = modelId;
        const model = getModel();
        if (model && !state.recent.includes(model.name)) {
            state.recent.unshift(model.name);
            state.recent = state.recent.slice(0, 5);
            saveRecent();
            renderRecent();
        }
        renderStep();
        await loadSpecifications();
    }

    function addRecentKeyword(keyword) {
        if (!keyword) return;
        state.recent = [keyword, ...state.recent.filter((item) => item !== keyword)].slice(0, 5);
        saveRecent();
        renderRecent();
    }

    function searchSpecification(keyword) {
        const query = String(keyword || "").trim();
        if (!query) return;

        const normalizedQuery = query.toLocaleLowerCase("ko-KR");
        const brand = data.brands.find((item) => [item.id, item.manufacturerCode, item.name, item.nameKo, item.logoText, ...(item.keywords || [])]
            .some((value) => String(value || "").toLocaleLowerCase("ko-KR").includes(normalizedQuery)));

        let matchedModel = null;
        let matchedBrand = null;
        Object.entries(data.models).some(([brandId, models]) => {
            const model = models.find((item) => [item.id, item.modelCode, item.name, item.nameEn]
                .some((value) => String(value || "").toLocaleLowerCase("ko-KR").includes(normalizedQuery)));
            if (!model) return false;
            matchedModel = model;
            matchedBrand = data.brands.find((item) => item.id === brandId) || null;
            return true;
        });

        addRecentKeyword(query);

        if (matchedModel && matchedBrand) {
            state.brandId = matchedBrand.id;
            state.modelId = matchedModel.id;
            renderStep();
            loadSpecifications();
            return;
        }

        if (brand) {
            selectBrand(brand.id);
            return;
        }

        state.brandId = "";
        state.modelId = "";
        elements.selectedList.innerHTML = "";
        elements.brandPanel.hidden = true;
        elements.modelPanel.hidden = false;
        elements.resultPanel.hidden = true;
        elements.modelPanelTitle.innerHTML = `검색 결과<span>.</span>`;
        elements.modelGrid.innerHTML = `
            <div class="sub-specification-empty">
                <strong>검색하신 차량 정보를<br>찾을 수 없습니다.</strong>
                <p>필요한 차량 정보는 제원 찾기 요청을 통해<br>등록을 요청해 주세요.</p>
            </div>
        `;
        updateUrl();
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
            searchSpecification(recentButton.dataset.recentKeyword);
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
        const rows = data.results[`${state.brandId}:${state.modelId}`] || [];
        const result = rows[resultIndex];
        if (!brand || !model || !result || !Array.isArray(result.specifications) || !result.specifications.length) return;

        elements.modalBrand.innerHTML = brandLogoMarkup(brand, false);
        elements.modalMeta.innerHTML = `
            <div><dt>제조사</dt><dd>${escapeHtml(brand.nameKo || brand.name)}</dd></div>
            <div><dt>모델명</dt><dd>${escapeHtml(result.modelName)}</dd></div>
            <div><dt>세부명</dt><dd>${escapeHtml(result.detail)}</dd></div>
            <div><dt>비고</dt><dd>${escapeHtml(result.note || "-")}</dd></div>
            <div><dt>Maker</dt><dd>${escapeHtml(result.manufacturerNameEn || brand.name)}</dd></div>
            <div><dt>Model</dt><dd>${escapeHtml(result.model)}</dd></div>
            <div><dt>연식</dt><dd>${escapeHtml(result.year)}</dd></div>
        `;
        elements.modalImage.src = result.image || model.image || "/images/car_default.png";
        elements.modalImage.alt = result.modelName;
        elements.modalImage.onerror = function () {
            this.onerror = null;
            this.src = "/images/car_default.png";
        };
        const sectionCounts = result.specifications.reduce((counts, item) => {
            counts[item.section] = (counts[item.section] || 0) + 1;
            return counts;
        }, {});
        const renderedSections = new Set();
        elements.modalSpecs.innerHTML = result.specifications.map((item) => {
            const isFirstSectionRow = !renderedSections.has(item.section);
            const mobileSectionRows = isFirstSectionRow ? `
                <tr class="specification-modal-mobile-section">
                    <th colspan="4">${escapeHtml(item.section)}</th>
                </tr>
                <tr class="specification-modal-mobile-head">
                    <th>구분</th><th>규격</th><th>허용치</th>
                </tr>
            ` : "";
            const sectionCell = isFirstSectionRow
                ? `<th rowspan="${sectionCounts[item.section]}" class="specification-modal-section">${escapeHtml(item.section)}</th>`
                : "";
            renderedSections.add(item.section);
            return `
                ${mobileSectionRows}
                <tr>
                    ${sectionCell}
                    <th>${escapeHtml(item.label)}</th>
                    <td>${escapeHtml(item.value)}</td>
                    <td>${escapeHtml(item.min)} ~ ${escapeHtml(item.max)}</td>
                </tr>
            `;
        }).join("");

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
        searchSpecification(elements.keyword.value);
    });

    elements.keyword.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        searchSpecification(elements.keyword.value);
    });

    elements.requestButton?.addEventListener("click", () => {
        window.location.href = "/Support/Vehicle-Specification-Request.html";
    });

    function isDomesticManufacturer(manufacturer) {
        if (manufacturer.manufacturerType) {
            return manufacturer.manufacturerType === "DOMESTIC";
        }
        return /^(현대|기아|제네시스|쉐보레|한국GM|대우|르노|르노코리아|르노삼성|삼성|쌍용|KG모빌리티|KGM)/i.test(manufacturer.manufacturerName || "");
    }

    function getManufacturerLogo(manufacturer) {
        const englishName = String(manufacturer.manufacturerNameEn || "").trim();
        if (!englishName) return manufacturer.logoUrl || "";
        return `/images/standard/${encodeURIComponent(englishName)}.png`;
    }

    function mapCatalog(response) {
        const manufacturers = Array.isArray(response?.manufacturers) ? response.manufacturers : [];
        manufacturers.forEach((manufacturer) => {
            const brandId = String(manufacturer.manufacturerId);
            const brandName = manufacturer.manufacturerName || manufacturer.manufacturerNameEn || manufacturer.manufacturerCode || "-";
            data.brands.push({
                id: brandId,
                manufacturerId: manufacturer.manufacturerId,
                manufacturerCode: manufacturer.manufacturerCode,
                name: brandName,
                nameKo: manufacturer.manufacturerName || brandName,
                logoText: manufacturer.manufacturerNameEn || brandName,
                logo: getManufacturerLogo(manufacturer),
                type: isDomesticManufacturer(manufacturer) ? "domestic" : "import",
                keywords: [manufacturer.manufacturerNameEn]
            });
            data.models[brandId] = (manufacturer.models || []).map((model) => ({
                id: String(model.modelId),
                modelId: model.modelId,
                modelCode: model.modelCode,
                name: model.modelName || model.modelNameEn || model.modelCode || "-",
                nameEn: model.modelNameEn || "",
                image: model.imageUrl || "/images/car_default2.png"
            }));
        });
    }

    function formatSpecValue(item) {
        const value = item?.specValue ?? "-";
        return item?.unitName ? `${value} ${item.unitName}` : String(value);
    }

    function mapSpecification(row) {
        const specifications = [];
        const extra = {};
        (row.specValues || []).slice().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).forEach((item) => {
            const isFront = String(item.specKey || "").startsWith("F_");
            const isRear = String(item.specKey || "").startsWith("R_");
            if (isFront || isRear) {
                specifications.push({
                    section: isFront ? "전륜" : "후륜",
                    label: String(item.specName || item.specKey || "-").replace(/^(전륜|후륜)\s*/, ""),
                    value: formatSpecValue(item),
                    min: item.minValue ?? "-",
                    max: item.maxValue ?? "-"
                });
            } else {
                extra[item.specName || item.specKey || "기타"] = formatSpecValue(item);
            }
        });

        return {
            vehicleSpecId: row.vehicleSpecId,
            year: row.modelYearRange || row.modelYear || "-",
            modelName: row.modelName || "-",
            model: row.modelNameEn || row.modelName || "-",
            detail: row.trimName || "-",
            note: row.description || "-",
            manufacturerNameEn: row.manufacturerNameEn || "",
            image: row.imageUrl || getModel()?.image || "/images/car_default.png",
            specifications,
            extra
        };
    }

    async function loadSpecifications() {
        const brand = getBrand();
        const model = getModel();
        if (!api || !brand || !model) return;
        const key = `${state.brandId}:${state.modelId}`;
        try {
            const response = await api.getSpecifications({
                manufacturerId: brand.manufacturerId,
                modelId: model.modelId
            });
            data.results[key] = (Array.isArray(response) ? response : []).map(mapSpecification);
        } catch (error) {
            console.error("차량 제원 조회에 실패했습니다.", error);
            data.results[key] = [];
        }
        if (key === `${state.brandId}:${state.modelId}`) renderResults();
    }

    async function loadCatalog() {
        if (!api) throw new Error("차량 제원 API를 불러올 수 없습니다.");
        const response = await api.getCatalog();
        mapCatalog(response);
    }

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

    try {
        await loadCatalog();
    } catch (error) {
        console.error("차량 카탈로그 조회에 실패했습니다.", error);
        elements.domesticGrid.innerHTML = emptyResultMarkup();
        elements.importGrid.innerHTML = emptyResultMarkup();
        renderRecent();
        return;
    }

    restoreFromUrl();
    renderBrandSelect();
    renderBrands();
    renderRecent();
    renderStep();
    if (state.modelId) await loadSpecifications();
})();
