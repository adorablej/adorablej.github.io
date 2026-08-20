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
    if (!form || !submitButton) return;

    const requiredFields = [...form.querySelectorAll("[data-required]")];

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
        submitButton.disabled = !requiredFields.every(isFieldComplete);
    };

    requiredFields.forEach(field => {
        field.addEventListener(field.type === "checkbox" ? "change" : "input", updateSubmitState);
    });

    updateSubmitState();
}

function initCompletionAlerts() {
    const messages = new Map([
        ["vehicle-specification-form", "차량제원 추가 등록 요청이 완료되었습니다."]
    ]);

    document.querySelectorAll(".sub-mypage-cs-form, #vehicle-specification-form").forEach(form => {
        form.addEventListener("submit", async event => {
            if (event.defaultPrevented) return;
            event.preventDefault();
            const message = form.classList.contains("sub-mypage-cs-form")
                ? "CS문의접수가 완료되었습니다.\n입력하신 연락처로 회신드리겠습니다.\n감사합니다."
                : messages.get(form.id);
            const confirmed = await window.HunterAlert?.open({ message });

            if (form.id === "vehicle-specification-form" && confirmed) {
                window.location.href = "/Support/Wheel-Alignment-Specification.html";
            }
        });
    });
}

async function showContactAlert(message) {
    if (window.HunterAlert?.open) {
        await window.HunterAlert.open({ message });
        return;
    }

    window.alert(message);
}

function initContactFormSubmission() {
    const form = document.querySelector("#contact-form");
    const submitButton = form?.querySelector('[type="submit"]');
    const api = window.HunterFrontAPI?.csRequests;

    if (!form || !submitButton) return;

    form.addEventListener("submit", async event => {
        if (event.defaultPrevented) return;
        event.preventDefault();

        const emailId = form.elements.email_id.value.trim();
        const emailDomain = form.elements.email_domain.value.trim();

        if ((emailId && !emailDomain) || (!emailId && emailDomain)) {
            const emailGroup = form.elements.email_id.closest(".sub-form-group");
            setFieldError(emailGroup, "이메일 주소를 확인해주세요.");
            (emailId ? form.elements.email_domain : form.elements.email_id).focus();
            return;
        }

        if (!api?.create) {
            await showContactAlert("문의 접수 기능을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        const payload = {
            companyName: form.elements.company_name.value.trim(),
            requesterName: form.elements.user_name.value.trim(),
            phoneNumber: form.elements.user_phone.value.trim(),
            csTypeCode: form.elements.inquiry_category.value,
            title: form.elements.inquiry_title.value.trim(),
            content: form.elements.message.value.trim(),
            privacyAgreed: form.elements.agree.checked
        };

        if (emailId && emailDomain) {
            payload.email = `${emailId}@${emailDomain}`;
        }

        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");

        try {
            await api.create(payload);
            await showContactAlert(
                "CS 문의접수가 완료되었습니다.\n입력하신 연락처로 회신드리겠습니다.\n감사합니다."
            );
        } catch (error) {
            await showContactAlert(error?.message || "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
        }
    });
}

/* ========================================
CS Request Category / Selected Product
======================================== */

function initCsRequestContext() {
    const form = document.querySelector(".sub-mypage-cs-form");
    if (!form) return;

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

    const productId = params.get("product") || "";
    const productName = params.get("productName") || "";
    const productCategory = params.get("productCategory") || "";
    const productSerial = params.get("productSerial") || productId;

    if (!productId) return;

    form.querySelector('input[name="product_id"]').value = productId;
    form.querySelector('input[name="product_name"]').value = productName;
    form.querySelector('input[name="product_category"]').value = productCategory;
    form.querySelector('input[name="product_serial"]').value = productSerial;
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

    value.textContent = option.textContent.trim();
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
