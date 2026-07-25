document.addEventListener("DOMContentLoaded", () => {
    initFormComponents();
});

function initFormComponents() {
    initInputState();
    initTextareaCount();
    initCustomSelect();

    document.querySelectorAll("form[data-form]").forEach(form => {
        new FormValidator(form);
    });
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
        });

        control.addEventListener("blur", () => {
            group.classList.remove("is-focus");
            updateFilledState();
        });

        control.addEventListener("input", () => {
            updateFilledState();

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
        const trigger = select.querySelector(".sub-form-select-trigger");
        const value = select.querySelector(".sub-form-select-value");
        const options = [...select.querySelectorAll(".sub-form-select-option")];
        const hidden = select.querySelector('input[type="hidden"]');

        if (!trigger || !value || !hidden) return;

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

            const selectedIndex = Math.max(
                0,
                options.findIndex(option => option.classList.contains("is-selected"))
            );
            const nextIndex = event.key === "ArrowDown"
                ? Math.min(selectedIndex + 1, options.length - 1)
                : Math.max(selectedIndex - 1, 0);

            options[nextIndex]?.focus();
        });

        options.forEach((option, index) => {
            option.addEventListener("click", () => {
                selectOption(select, option);
            });

            option.addEventListener("keydown", event => {
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

function selectOption(select, option) {
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
    trigger?.focus();
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