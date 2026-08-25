document.addEventListener("DOMContentLoaded", () => {
    initFormComponents();
});

function initFormComponents() {
    initInputState();
    initPhoneInput();
    initTextareaCount();
    initCustomSelect();
    initContactInquiryCategory();
    initCsRequestContext();
    initCsProductFields();

    document.querySelectorAll("form[data-form]").forEach(form => {
        new FormValidator(form);
    });

    initVehicleSpecificationRequest();
    initContactFormSubmission();
    initCompletionAlerts();
}

function initVehicleSpecificationRequest() {
    const form = document.querySelector("#vehicle-specification-form");
    const submitButton = form?.querySelector('[type="submit"]');
    const api = window.HunterFrontAPI?.vehicles;
    if (!form || !submitButton) return;

    const requiredFields = [...form.querySelectorAll("[data-required]")];
    let isSubmitting = false;

    const isFieldComplete = field => {
        if (field.type === "checkbox") return field.checked;

        const value = field.value.trim();
        if (!value) return false;

        if (field.dataset.pattern) {
            try {
                return new RegExp(field.dataset.pattern).test(value);
            } catch (error) {
                return false;
            }
        }

        return true;
    };

    const updateSubmitState = () => {
        submitButton.disabled = isSubmitting || !requiredFields.every(isFieldComplete);
    };

    requiredFields.forEach(field => {
        field.addEventListener(field.type === "checkbox" ? "change" : "input", updateSubmitState);
    });

    form.addEventListener("submit", async event => {
        if (event.defaultPrevented) return;
        event.preventDefault();

        const emailId = form.elements.email_id.value.trim();
        const emailDomain = form.elements.email_domain.value.trim();
        if ((emailId && !emailDomain) || (!emailId && emailDomain)) {
            await showContactAlert("이메일 주소를 확인해주세요.");
            (emailId ? form.elements.email_domain : form.elements.email_id).focus();
            return;
        }

        if (!api?.createSpecificationRequest) {
            await showContactAlert("차량제원 요청 기능을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        const payload = {
            vehicleInfo: form.elements.vehicle_name.value.trim(),
            additionalInfo: form.elements.vehicle_detail.value.trim(),
            companyName: form.elements.company_name.value.trim(),
            requesterName: form.elements.requester_name.value.trim(),
            phoneNumber: form.elements.phone_number.value.trim(),
            marketingAgreed: form.elements.marketing_agree.checked
        };
        if (emailId && emailDomain) payload.email = `${emailId}@${emailDomain}`;

        isSubmitting = true;
        updateSubmitState();
        submitButton.setAttribute("aria-busy", "true");

        try {
            await api.createSpecificationRequest(payload);
            const confirmed = await showContactAlert("차량제원 추가 등록 요청이 완료되었습니다.");
            if (confirmed !== false) {
                window.location.href = "/Support/Wheel-Alignment-Specification.html";
            }
        } catch (error) {
            await showContactAlert(error?.message || "차량제원 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            isSubmitting = false;
            updateSubmitState();
            submitButton.removeAttribute("aria-busy");
        }
    });

    updateSubmitState();
}

function initCompletionAlerts() {
    document.querySelectorAll(".sub-mypage-cs-form").forEach(form => {
        let isSubmitted = false;
        form.addEventListener("submit", async event => {
            if (isSubmitted) {
                event.preventDefault();
                return;
            }
            if (event.defaultPrevented) return;
            event.preventDefault();
            const api = window.HunterFrontAPI?.csRequests;
            if (!api?.create) return;
            const emailId = form.elements.email_id.value.trim();
            const emailDomain = form.elements.email_domain.value.trim();
            const category = String(form.elements.category.value || "").toUpperCase();
            const typeMap = { PURCHASE: "PURCHASE", AS: "AS", TRANSFER: "TRANSFER", BUSINESS: "BUSINESS", TRAINING: "TRAINING" };
            const businessId = localStorage.getItem("hunter.selectedBusinessId") || "";
            if (!businessId) {
                await showContactAlert("선택된 사업체 정보를 불러오지 못했습니다. 페이지를 새로고침한 후 다시 시도해주세요.");
                return;
            }
            const payload = {
                businessId: Number(businessId),
                companyName: form.elements.company.value.trim(),
                requesterName: form.elements.name.value.trim(),
                phoneNumber: form.elements.phone.value.trim(),
                csTypeCode: typeMap[category] || category,
                title: form.elements.title.value.trim(),
                content: form.elements.message.value.trim(),
                privacyAgreed: form.elements.privacy_agree.checked
            };
            if (emailId && emailDomain) payload.email = `${emailId}@${emailDomain}`;
            if (["AS", "TRANSFER"].includes(payload.csTypeCode)) payload.ownedProductId = Number(form.elements.owned_product_id.value);
            const submit = form.querySelector('[type="submit"]');
            isSubmitted = true;
            submit.disabled = true;
            try {
                await api.create(payload);
                await showContactAlert("CS문의접수가 완료되었습니다.\n입력하신 연락처로 회신드리겠습니다.\n감사합니다.");
                form.reset();
                window.location.reload();
            } catch (error) {
                isSubmitted = false;
                await showContactAlert(error?.message || "CS 문의를 접수하지 못했습니다.");
            } finally {
                submit.disabled = isSubmitted;
            }
        });
    });
}

async function showContactAlert(message) {
    if (window.HunterAlert?.open) {
        return await window.HunterAlert.open({ message });
    }

    window.alert(message);
    return true;
}

function initContactFormSubmission() {
    const form = document.querySelector("#contact-form");
    const submitButton = form?.querySelector('[type="submit"]');
    const api = window.HunterFrontAPI?.csRequests;
    let isSubmitted = false;

    if (!form || !submitButton) return;

    form.addEventListener("submit", async event => {
        if (isSubmitted) {
            event.preventDefault();
            return;
        }
        const companyName = form.elements.company_name.value.trim();
        const requesterName = form.elements.user_name.value.trim();
        const emailId = form.elements.email_id.value.trim();
        const emailDomain = form.elements.email_domain.value.trim();
        const emailIdPattern = /^[^@\s]+$/;
        const emailDomainPattern = /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const hasInvalidEmail = Boolean(emailId || emailDomain)
            && (!emailId || !emailDomain || !emailIdPattern.test(emailId) || !emailDomainPattern.test(emailDomain));

        if (companyName && !requesterName) {
            event.preventDefault();
            const nameGroup = form.elements.user_name.closest(".sub-form-group");
            setFieldError(nameGroup, "성함을 입력해주세요.");
            form.elements.user_name.focus();
            return;
        }

        if (hasInvalidEmail) {
            const wasPrevented = event.defaultPrevented;
            event.preventDefault();
            const emailGroup = form.elements.email_id.closest(".sub-form-group");
            setFieldError(emailGroup, "이메일 주소를 확인해주세요.");
            if (!wasPrevented) {
                (!emailId || !emailIdPattern.test(emailId)
                    ? form.elements.email_id
                    : form.elements.email_domain).focus();
            }
            return;
        }

        if (event.defaultPrevented) return;
        event.preventDefault();

        if (!api?.create) {
            await showContactAlert("문의 접수 기능을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        const businessId = localStorage.getItem("hunter.selectedBusinessId") || "";
        const isAuthenticated = Boolean(window.HunterAPI?.auth?.getAccessToken?.());
        if (isAuthenticated && !businessId) {
            await showContactAlert("선택된 사업체 정보를 불러오지 못했습니다. 페이지를 새로고침한 후 다시 시도해주세요.");
            return;
        }

        const payload = {
            companyName,
            requesterName,
            phoneNumber: form.elements.user_phone.value.trim(),
            csTypeCode: form.elements.inquiry_category.value,
            title: form.elements.inquiry_title.value.trim(),
            content: form.elements.message.value.trim(),
            privacyAgreed: form.elements.agree.checked
        };
        if (businessId) payload.businessId = Number(businessId);

        if (emailId && emailDomain) {
            payload.email = `${emailId}@${emailDomain}`;
        }
        if (["AS", "TRANSFER"].includes(payload.csTypeCode)) {
            payload.ownedProductId = Number(form.elements.owned_product_id.value);
        }

        isSubmitted = true;
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");

        try {
            await api.create(payload);
            await showContactAlert(
                "CS 문의접수가 완료되었습니다.\n입력하신 연락처로 회신드리겠습니다.\n감사합니다."
            );
            form.reset();
            window.location.reload();
        } catch (error) {
            isSubmitted = false;
            await showContactAlert(error?.message || "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            submitButton.disabled = isSubmitted;
            submitButton.removeAttribute("aria-busy");
        }
    });
}

/* ========================================
CS Product Category / Serial Selection
======================================== */

function initCsProductFields() {
    document.querySelectorAll("#contact-form, .sub-mypage-cs-form").forEach(form => {
        const inquiryInput = form.querySelector('input[name="inquiry_category"], input[name="category"]');
        const categoryGroup = form.querySelector("[data-cs-product-category]");
        const serialGroup = form.querySelector("[data-cs-product-serial]");
        const categoryInput = form.elements.product_category_code;
        const productInput = form.elements.owned_product_id;
        const memberApi = window.HunterFrontAPI?.member;
        const isContact = form.id === "contact-form";
        const isAuthenticated = !isContact || Boolean(window.HunterAPI?.auth?.getAccessToken?.());
        const requestedProductId = new URLSearchParams(location.search).get("ownedProductId") || "";
        let products = [];
        let loadingPromise = null;

        if (!inquiryInput || !categoryGroup || !serialGroup || !categoryInput || !productInput) return;

        if (isContact) {
            form.querySelectorAll("[data-auth-inquiry]").forEach(item => { item.hidden = !isAuthenticated; });
            const type = String(inquiryInput.value || "").toUpperCase();
            if (!isAuthenticated && ["AS", "TRANSFER"].includes(type)) resetSelect(inquiryInput.closest(".sub-form-select"), "카테고리를 선택해 주세요.");
        }

        const categorySelect = categoryInput.closest(".sub-form-select");
        const productSelect = productInput.closest(".sub-form-select");

        function needsProduct() {
            return ["AS", "TRANSFER"].includes(String(inquiryInput.value || "").toUpperCase());
        }

        async function ensureProducts() {
            if (products.length || loadingPromise || !memberApi || !isAuthenticated) return loadingPromise;
            loadingPromise = (async () => {
                const params = { page: 1, size: 100 };
                const businessId = localStorage.getItem("hunter.selectedBusinessId") || "";
                if (businessId) params.businessId = businessId;
                const response = await memberApi.getProducts(params);
                products = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
                if (requestedProductId && !products.some(item => String(item.ownedProductId) === requestedProductId)) {
                    try {
                        const detail = await memberApi.getProduct(requestedProductId);
                        if (detail) products.push(detail);
                    } catch (error) {
                        // 선택 사업체 소유가 아닌 제품은 목록에 추가하지 않습니다.
                    }
                }
                renderCategories();
                if (requestedProductId) preselectProduct(requestedProductId);
            })().catch(error => {
                categorySelect.querySelector(".sub-form-select-value").textContent = error?.message || "제품을 불러오지 못했습니다.";
            }).finally(() => { loadingPromise = null; });
            return loadingPromise;
        }

        function renderCategories() {
            const categories = new Map();
            products.forEach(item => {
                if (item.productCategoryCode) categories.set(item.productCategoryCode, item.productCategoryName || item.productCategoryCode);
            });
            categorySelect.querySelector(".sub-form-select-options").innerHTML = [...categories].map(([code, name]) =>
                `<li><button type="button" class="sub-form-select-option" data-value="${escapeFormHtml(code)}">${escapeFormHtml(name)}</button></li>`
            ).join("");
            initCustomSelect();
        }

        function renderProducts(categoryCode) {
            const filtered = products.filter(item => item.productCategoryCode === categoryCode);
            productSelect.querySelector(".sub-form-select-options").innerHTML = filtered.map(item =>
                `<li><button type="button" class="sub-form-select-option sub-form-select-option-product" data-value="${escapeFormHtml(item.ownedProductId)}" data-serial="${escapeFormHtml(item.serialNumber || "시리얼번호 없음")}" data-product-name="${escapeFormHtml(item.productName || "-")}"><span class="sub-form-product-serial">${escapeFormHtml(item.serialNumber || "시리얼번호 없음")}</span><span class="sub-form-product-name">${escapeFormHtml(item.productName || "-")}</span></button></li>`
            ).join("");
            resetSelect(productSelect, filtered.length ? "제품 시리얼번호를 선택해 주세요." : "등록된 제품이 없습니다.");
            initCustomSelect();
        }

        function preselectProduct(id) {
            const product = products.find(item => String(item.ownedProductId) === String(id));
            if (!product) return;
            const categoryOption = [...categorySelect.querySelectorAll(".sub-form-select-option")].find(option => option.dataset.value === product.productCategoryCode);
            if (categoryOption) selectOption(categorySelect, categoryOption, false);
            renderProducts(product.productCategoryCode);
            const productOption = [...productSelect.querySelectorAll(".sub-form-select-option")].find(option => option.dataset.value === String(id));
            if (productOption) selectOption(productSelect, productOption, false);
            syncLegacyFields(product);
        }

        function toggleFields() {
            const show = needsProduct() && isAuthenticated;
            categoryGroup.hidden = !show;
            serialGroup.hidden = !show;
            if (show) ensureProducts();
            else {
                resetSelect(categorySelect, "제품 카테고리를 선택해 주세요.");
                resetSelect(productSelect, "제품 시리얼번호를 선택해 주세요.");
            }
        }

        categoryInput.addEventListener("change", () => renderProducts(categoryInput.value));
        productInput.addEventListener("change", () => {
            const product = products.find(item => String(item.ownedProductId) === productInput.value);
            if (product) syncLegacyFields(product);
        });
        inquiryInput.addEventListener("change", toggleFields);
        toggleFields();

        function syncLegacyFields(product) {
            const legacyId = form.elements.product_id;
            const legacyName = form.elements.product_name;
            const legacyCategory = form.elements.product_category;
            const legacySerial = form.elements.product_serial;
            if (legacyId) legacyId.value = product.ownedProductId || "";
            if (legacyName) legacyName.value = product.productName || "";
            if (legacyCategory) legacyCategory.value = product.productCategoryName || "";
            if (legacySerial) legacySerial.value = product.serialNumber || "";
        }
    });
}

function resetSelect(select, placeholder) {
    if (!select) return;
    const input = select.querySelector('input[type="hidden"]');
    const value = select.querySelector(".sub-form-select-value");
    select.querySelectorAll(".sub-form-select-option.is-selected").forEach(option => option.classList.remove("is-selected"));
    if (input) {
        input.value = "";
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (value) {
        value.textContent = placeholder;
        value.classList.add("is-placeholder");
    }
}

function escapeFormHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

/* ========================================
CS Request Category / Selected Product
======================================== */

function initCsRequestContext() {
    const form = document.querySelector(".sub-mypage-cs-form, #contact-form");
    if (!form) return;

    fillCsRequester(form);
    window.addEventListener("hunterBusinessChanged", () => fillCsRequester(form));
    window.addEventListener("includeLoaded", () => {
        applyCsSidebarMember(readStoredCsMember());
    });

    const params = new URLSearchParams(window.location.search);
    const requestedCategory = (params.get("category") || "").toLowerCase();
    const categoryInput = form.querySelector('input[name="category"]');
    const categorySelect = categoryInput?.closest(".sub-form-select");
    const categoryOption = categorySelect
        ? [...categorySelect.querySelectorAll(".sub-form-select-option")]
            .find(option => option.dataset.value === requestedCategory)
        : null;

    if (categorySelect && categoryOption) {
        selectOption(categorySelect, categoryOption, false);
    }

    const productId = params.get("ownedProductId") || params.get("product") || "";
    const productName = params.get("productName") || "";
    const productCategory = params.get("productCategory") || "";
    const productSerial = params.get("productSerial") || productId;

    if (!productId) return;

    form.querySelector('input[name="product_id"]').value = productId;
    form.querySelector('input[name="product_name"]').value = productName;
    form.querySelector('input[name="product_category"]').value = productCategory;
    form.querySelector('input[name="product_serial"]').value = productSerial;
}

async function fillCsRequester(form) {
    const companyInput = form.elements.company || form.elements.company_name;
    const nameInput = form.elements.name || form.elements.user_name;
    const phoneInput = form.elements.phone || form.elements.user_phone;
    const storedMember = readStoredCsMember();
    const isAuthenticated = Boolean(window.HunterAPI?.auth?.getAccessToken?.());

    if (!isAuthenticated) return;
    applyCsRequesterValues(storedMember);

    try {
        const memberApi = window.HunterFrontAPI?.member;
        const [member, businessResponse] = await Promise.all([
            memberApi?.getMe?.(),
            memberApi?.getBusinesses?.(false)
        ]);
        if (!member) return;
        const businessData = businessResponse?.data || businessResponse || {};
        const businesses = Array.isArray(businessData)
            ? businessData
            : (Array.isArray(businessData.businesses) ? businessData.businesses : []);
        const storedBusinessId = localStorage.getItem("hunter.selectedBusinessId") || "";
        const responseSelectedId = businessData.selectedBusiness?.businessId;
        const selectedBusiness = businesses.find(item => responseSelectedId && String(item.businessId) === String(responseSelectedId))
            || businesses.find(item => item.selected === true || item.isSelected === true)
            || businesses.find(item => String(item.businessId) === String(storedBusinessId))
            || businesses.find(item => String(item.approvalStatusCode || "").toUpperCase() === "APPROVED")
            || businesses[0]
            || null;
        if (selectedBusiness?.businessId) {
            localStorage.setItem("hunter.selectedBusinessId", String(selectedBusiness.businessId));
            localStorage.setItem("hunter.selectedBusinessName", selectedBusiness.businessName || "");
        }
        applyCsRequesterValues(member.member || member.data?.member || member.data || member, selectedBusiness);
    } catch (error) {
        if (error?.status !== 401) console.error("CS 문의자 정보를 불러오지 못했습니다.", error);
    }

    function applyCsRequesterValues(member, selectedBusiness) {
        const selectedBusinessName = window.localStorage.getItem("hunter.selectedBusinessName");

        if (companyInput) companyInput.value = selectedBusiness?.businessName || selectedBusinessName || member?.businessName || member?.companyName || "";
        if (nameInput) nameInput.value = member?.memberName || "";
        if (phoneInput) phoneInput.value = member?.phoneNumber || "";
        [companyInput, nameInput, phoneInput].forEach(input => {
            if (input) input.disabled = true;
        });
        applyCsSidebarMember(member);
        [companyInput, nameInput, phoneInput].forEach(input => {
            input?.closest(".sub-form-group")?.classList.toggle("is-filled", Boolean(input.value));
        });
    }
}

function applyCsSidebarMember(member) {
    document.querySelectorAll(".sub-mypage-user-row strong").forEach(element => {
        element.textContent = member?.memberName ? `${member.memberName}님` : "회원님";
    });
}

function readStoredCsMember() {
    for (const storage of [window.sessionStorage, window.localStorage]) {
        try {
            const value = JSON.parse(storage.getItem("hunter.member") || "null");
            if (value) return value.member || value;
        } catch (error) {
            // 손상된 임시 저장값은 무시합니다.
        }
    }
    return null;
}

/* ========================================
Contact Inquiry Category
======================================== */

function initContactInquiryCategory() {
    const form = document.querySelector("#contact-form");
    const hidden = form?.querySelector('input[name="inquiry_category"]');
    const select = hidden?.closest(".sub-form-select");

    if (!select || !hidden) return;

    const aliases = {
        product: "PURCHASE",
        parts: "PURCHASE",
        purchase: "PURCHASE",
        service: "AS",
        as: "AS",
        installation: "TRANSFER",
        transfer: "TRANSFER",
        business: "BUSINESS",
        education: "TRAINING",
        training: "TRAINING",
    };
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = (params.get("category") || params.get("type") || "").toLowerCase();
    if (!requestedCategory) return;
    const category = aliases[requestedCategory];
    if (!category) return;
    const option = [...select.querySelectorAll(".sub-form-select-option")]
        .find(item => item.dataset.value === category);

    if (option) {
        selectOption(select, option, false);
    }
}

/* ========================================
Input / Textarea State
======================================== */

function initInputState() {
    document.querySelectorAll(".sub-form-input, .sub-form-textarea").forEach(control => {
        const group = control.closest(".sub-form-group");
        if (!group) return;

        const updateFilledState = () => {
            group.classList.toggle("is-filled", control.value.trim() !== "");
        };

        control.addEventListener("focus", () => {
            group.classList.add("is-focus");
            group.classList.remove("is-filled");
        });

        control.addEventListener("blur", () => {
            group.classList.remove("is-focus");
            updateFilledState();
        });

        control.addEventListener("input", () => {
            if (group.classList.contains("is-error")) {
                clearFieldState(group);
            }
        });

        updateFilledState();

        if (control.disabled) {
            group.classList.add("is-disabled");
        }
    });
}


/* ========================================
Phone Number
======================================== */

function initPhoneInput() {
    document.querySelectorAll("[data-phone]").forEach(input => {
        const formatPhoneNumber = value => {
            const numbers = value.replace(/\D/g, "").slice(0, 11);

            if (numbers.length <= 3) return numbers;
            if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
            if (numbers.length === 10) {
                return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
            }

            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        };

        const update = () => {
            input.value = formatPhoneNumber(input.value);
        };

        input.addEventListener("input", update);
        input.addEventListener("paste", () => requestAnimationFrame(update));
        update();
    });
}

/* ========================================
Textarea Count
======================================== */

function initTextareaCount() {
    document.querySelectorAll(".sub-form-textarea").forEach(textarea => {
        const wrap = textarea.closest(".sub-form-textarea-wrap");
        const count = wrap?.querySelector(".sub-form-text-count strong");

        if (!count) return;

        const update = () => {
            if (textarea.maxLength > -1 && textarea.value.length > textarea.maxLength) {
                textarea.value = textarea.value.slice(0, textarea.maxLength);
            }
            count.textContent = textarea.value.length;
        };

        textarea.addEventListener("input", update);
        update();
    });
}

/* ========================================
Custom Select
======================================== */

function initCustomSelect() {
    const selects = document.querySelectorAll(".sub-form-select[data-select]");

    selects.forEach(select => {
        if (select.dataset.selectInitialized === "true") return;

        const trigger = select.querySelector(".sub-form-select-trigger");
        const value = select.querySelector(".sub-form-select-value");
        const hidden = select.querySelector('input[type="hidden"]');

        if (!trigger || !value || !hidden || !select.querySelector(".sub-form-select-option")) return;
        select.dataset.selectInitialized = "true";

        trigger.addEventListener("click", event => {
            event.stopPropagation();

            const wasOpen = select.classList.contains("is-open");
            closeAllSelects();

            if (!wasOpen && !select.classList.contains("is-disabled")) {
                openSelect(select);
            }
        });

        trigger.addEventListener("keydown", event => {
            if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;

            event.preventDefault();
            openSelect(select);

            const options = [...select.querySelectorAll(".sub-form-select-option")];

            const selectedIndex = Math.max(
                0,
                options.findIndex(option => option.classList.contains("is-selected"))
            );
            const nextIndex = event.key === "ArrowDown"
                ? Math.min(selectedIndex + 1, options.length - 1)
                : Math.max(selectedIndex - 1, 0);

            options[nextIndex]?.focus();
        });

        select.addEventListener("click", event => {
            const option = event.target.closest(".sub-form-select-option");
            if (option) selectOption(select, option);
        });

        select.addEventListener("keydown", event => {
            const option = event.target.closest(".sub-form-select-option");
            if (!option) return;

            const options = [...select.querySelectorAll(".sub-form-select-option")];
            const index = options.indexOf(option);

            if (event.key === "ArrowDown") {
                event.preventDefault();
                options[Math.min(index + 1, options.length - 1)]?.focus();
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                options[Math.max(index - 1, 0)]?.focus();
            }

            if (event.key === "Escape") {
                closeSelect(select);
                trigger.focus();
            }
        });
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".sub-form-select")) {
            closeAllSelects();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeAllSelects();
        }
    });
}

function openSelect(select) {
    const trigger = select.querySelector(".sub-form-select-trigger");

    select.classList.add("is-open", "is-focus");
    trigger?.setAttribute("aria-expanded", "true");
}

function closeSelect(select) {
    const trigger = select.querySelector(".sub-form-select-trigger");

    select.classList.remove("is-open", "is-focus");
    trigger?.setAttribute("aria-expanded", "false");
}

function closeAllSelects() {
    document.querySelectorAll(".sub-form-select.is-open").forEach(closeSelect);
}

function selectOption(select, option, shouldFocus = true) {
    const trigger = select.querySelector(".sub-form-select-trigger");
    const value = select.querySelector(".sub-form-select-value");
    const hidden = select.querySelector('input[type="hidden"]');
    const selectedValue = option.dataset.value ?? "";
    const group = select.closest(".sub-form-group");

    select.querySelectorAll(".sub-form-select-option").forEach(item => {
        item.classList.toggle("is-selected", item === option);
    });

    if (option.dataset.serial !== undefined) {
        const serial = document.createElement("span");
        const productName = document.createElement("span");
        serial.className = "sub-form-product-serial";
        productName.className = "sub-form-product-name";
        serial.textContent = option.dataset.serial;
        productName.textContent = option.dataset.productName || "-";
        value.replaceChildren(serial, productName);
    } else {
        value.textContent = option.textContent.trim();
    }
    value.classList.toggle("is-placeholder", selectedValue === "");
    hidden.value = selectedValue;
    hidden.dispatchEvent(new Event("change", { bubbles: true }));

    const targetSelector = select.dataset.target;
    const target = targetSelector ? document.querySelector(targetSelector) : null;

    if (target) {
        target.value = selectedValue;
        target.readOnly = selectedValue !== "";
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));

        if (selectedValue === "") {
            target.focus();
        }
    }

    if (group) {
        clearFieldState(group);
        group.classList.toggle("is-filled", selectedValue !== "");
    }

    closeSelect(select);
    if (shouldFocus) {
        trigger?.focus();
    }
}

/* ========================================
Validation State
======================================== */

function setFieldError(group, message = "") {
    if (!group) return;

    group.classList.add("is-error");

    const field = group.querySelector("[data-required]");
    const text = group.querySelector(".sub-form-message");

    field?.setAttribute("aria-invalid", "true");

    if (text && message) {
        text.textContent = message;
    }
}

function clearFieldState(group) {
    if (!group) return;

    group.classList.remove("is-error");

    group.querySelectorAll('[aria-invalid="true"]').forEach(field => {
        field.setAttribute("aria-invalid", "false");
    });
}

/* ========================================
Form Validator
======================================== */

class FormValidator {
    constructor(form) {
        this.form = form;
        this.fields = [...form.querySelectorAll("[data-required]")];
        this.bind();
    }

    bind() {
        this.fields.forEach(field => {
            const eventName = field.type === "checkbox" || field.type === "hidden"
                ? "change"
                : "blur";

            field.addEventListener(eventName, () => {
                this.validateField(field);
            });
        });

        this.form.addEventListener("submit", event => {
            if (!this.validateForm()) {
                event.preventDefault();
            }
        });
    }

    validateForm() {
        let isValid = true;
        let firstInvalid = null;

        this.fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                firstInvalid ??= field;
            }
        });

        if (firstInvalid) {
            const selectTrigger = firstInvalid
                .closest(".sub-form-select")
                ?.querySelector(".sub-form-select-trigger");

            (selectTrigger || firstInvalid).focus?.();
        }

        return isValid;
    }

    validateField(field) {
        const group = field.closest(".sub-form-group");

        if (field.disabled || field.closest("[hidden], .is-hidden")) {
            clearFieldState(group);
            return true;
        }

        const message = field.dataset.message || "필수 입력입니다.";
        const value = field.type === "checkbox"
            ? field.checked
            : field.value.trim();

        if (!value) {
            setFieldError(group, message);
            return false;
        }

        if (field.dataset.pattern) {
            let pattern;

            try {
                pattern = new RegExp(field.dataset.pattern);
            } catch (error) {
                console.error("Invalid validation pattern:", field.dataset.pattern, error);
                setFieldError(group, message);
                return false;
            }

            if (!pattern.test(field.value.trim())) {
                setFieldError(group, message);
                return false;
            }
        }

        clearFieldState(group);
        return true;
    }
}
