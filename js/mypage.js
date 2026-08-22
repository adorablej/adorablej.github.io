document.addEventListener("DOMContentLoaded", () => {
    initMypageSidebar();
    initMypageAccordion();
    initMypageProductSlider();
    initMypageOrderToggle();
    initMypageBusinessAddModal();
    initMypageWithdrawModal();
    initMypageMobileMenu();
    initMypagePagination();
});

function initMypageSidebar() {
    document.querySelectorAll(".sub-mypage-sidebar").forEach(sidebar => {
        if (sidebar.dataset.initialized === "true") return;

        const rawPath = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        const currentPath = rawPath === "/mypage/product-detail.html"
            ? "/mypage/products.html"
            : rawPath;
        const links = [...sidebar.querySelectorAll(".sub-mypage-nav a[href]")];
        const activeLink = links.find(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "").toLowerCase();
            return linkPath === currentPath;
        });

        if (activeLink) {
            activeLink.classList.add("is-active");
            activeLink.setAttribute("aria-current", "page");

            const group = activeLink.closest("[data-mypage-accordion]");
            if (group) {
                group.classList.add("is-open");
                const toggle = group.querySelector(".sub-mypage-nav-toggle");
                toggle?.classList.add("is-active");
                toggle?.setAttribute("aria-expanded", "true");
            }
        }

        sidebar.dataset.initialized = "true";
    });
}

function initMypagePagination() {
    document.querySelectorAll('.sub-mypage-pagination-row:not([data-server-pagination])').forEach(row => {
        if (row.dataset.paginationInitialized === 'true') return;

        const pagination = row.querySelector('.sub-pagination');
        const list = row.previousElementSibling;
        if (!pagination || !list) return;

        const itemSelector = '.sub-mypage-product-row, .sub-mypage-part-row';
        const itemsPerPage = 10;
        const pageScope = row.closest('.sub-mypage-products, .sub-mypage-cart-page, .sub-mypage-content');
        const totalElement = pageScope?.querySelector('.sub-mypage-list-actions strong em');
        let currentPage = Number(new URLSearchParams(window.location.search).get('page')) || 1;
        let currentGroupSize = window.innerWidth <= 767 ? 3 : 10;

        const render = () => {
            const items = [...list.querySelectorAll(itemSelector)];
            const declaredTotal = Number(String(totalElement?.textContent || '').replace(/[^0-9]/g, ''));
            const totalItems = declaredTotal > 0 ? Math.max(declaredTotal, items.length) : items.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const hasAllItems = totalItems === items.length;

            if (totalPages <= 1) {
                items.forEach(item => { item.hidden = false; });
                pagination.innerHTML = '';
                row.hidden = true;
                return;
            }

            currentPage = Math.min(Math.max(1, currentPage), totalPages);
            const startIndex = (currentPage - 1) * itemsPerPage;
            items.forEach((item, index) => {
                item.hidden = hasAllItems && (index < startIndex || index >= startIndex + itemsPerPage);
            });

            const groupSize = window.innerWidth <= 767 ? 3 : 10;
            currentGroupSize = groupSize;
            const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
            const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
            const pageButtons = [];

            for (let page = groupStart; page <= groupEnd; page += 1) {
                pageButtons.push(`<button type="button" data-page="${page}" class="${page === currentPage ? 'is-active' : ''}" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</button>`);
            }

            pagination.innerHTML = `
                <button type="button" class="sub-pagination-arrow is-prev" data-page="${Math.max(1, groupStart - groupSize)}" aria-label="이전 페이지 묶음" ${groupStart === 1 ? 'disabled' : ''}></button>
                ${pageButtons.join('')}
                <button type="button" class="sub-pagination-arrow is-next" data-page="${groupEnd + 1}" aria-label="다음 페이지 묶음" ${groupEnd === totalPages ? 'disabled' : ''}></button>
            `;
            row.hidden = false;

            pagination.querySelectorAll('[data-page]:not(:disabled)').forEach(button => {
                button.addEventListener('click', () => {
                    currentPage = Number(button.dataset.page);
                    render();

                    const url = new URL(window.location.href);
                    if (currentPage === 1) url.searchParams.delete('page');
                    else url.searchParams.set('page', currentPage);
                    window.history.replaceState({}, '', url);
                    pagination.dispatchEvent(new CustomEvent('paginationchange', {
                        bubbles: true,
                        detail: { page: currentPage, itemsPerPage }
                    }));
                    list.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        };

        window.addEventListener('resize', () => {
            const nextGroupSize = window.innerWidth <= 767 ? 3 : 10;
            if (nextGroupSize !== currentGroupSize) render();
        });

        new MutationObserver(mutations => {
            if (mutations.some(mutation => mutation.type === 'childList')) render();
        }).observe(list, { childList: true, subtree: true });

        row.dataset.paginationInitialized = 'true';
        render();
    });
}

function initMypageMobileMenu() {
    document.querySelectorAll("[data-mypage-mobile-menu]").forEach(menu => {
        if (menu.dataset.initialized === "true") return;
        const currentPath = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        const groupPaths = {
            parts: ["/mypage/parts-list.html", "/mypage/cart.html", "/mypage/order-list.html"],
            training: ["/mypage/training-apply.html", "/mypage/training-history.html"]
        };
        const activeGroup = Object.keys(groupPaths).find(group => groupPaths[group].includes(currentPath));
        const primary = menu.querySelector("[data-mypage-primary-select]");

        menu.querySelectorAll("[data-mypage-secondary]").forEach(select => {
            select.hidden = select.dataset.mypageSecondary !== activeGroup;
        });

        const closeAll = () => menu.querySelectorAll(".sub-mypage-mobile-select").forEach(select => {
            select.classList.remove("is-open");
            select.querySelector(".sub-mypage-mobile-select-trigger")?.setAttribute("aria-expanded", "false");
        });

        menu.querySelectorAll(".sub-mypage-mobile-select").forEach(select => {
            if (select.hidden) return;
            const trigger = select.querySelector(".sub-mypage-mobile-select-trigger");
            const value = select.querySelector(".sub-mypage-mobile-select-value");
            const options = select.querySelector(".sub-mypage-mobile-select-options");
            const links = options ? [...options.querySelectorAll("a")] : [];
            if (!trigger || !value || !links.length) return;

            let current;
            if (select === primary && activeGroup) {
                current = links.find(link => link.dataset.mypageGroup === activeGroup);
            } else {
                const menuPath = select === primary && currentPath === "/mypage/product-detail.html"
                    ? "/mypage/products.html"
                    : currentPath;
                current = links.find(link => new URL(link.href).pathname.replace(/\/+$/, "").toLowerCase() === menuPath);
            }
            if (current) {
                value.textContent = current.textContent.trim();
                current.classList.add("is-current");
                current.setAttribute("aria-current", "page");
            }

            trigger.addEventListener("click", () => {
                const open = !select.classList.contains("is-open");
                closeAll();
                select.classList.toggle("is-open", open);
                trigger.setAttribute("aria-expanded", String(open));
            });
        });

        document.addEventListener("click", event => {
            if (!menu.contains(event.target)) closeAll();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeAll();
        });

        menu.dataset.initialized = "true";
    });
}

window.addEventListener("includeLoaded", () => {
    initMypageSidebar();
    initMypageAccordion();
    initMypageMobileMenu();
});

function initMypageAccordion() {
    const groups = [...document.querySelectorAll("[data-mypage-accordion]")];

    const updateNavOpenState = nav => {
        if (!nav) return;
        nav.classList.toggle("has-open-group", Boolean(nav.querySelector("[data-mypage-accordion].is-open")));
    };

    groups.forEach(group => {
        if (group.dataset.accordionInitialized === "true") return;
        const button = group.querySelector(".sub-mypage-nav-toggle");
        const depth = group.querySelector(".sub-mypage-nav-depth");
        const inner = group.querySelector(".sub-mypage-nav-depth-inner");
        const nav = group.closest(".sub-mypage-nav");

        if (!button || !depth || !inner) return;

        const updateHeight = () => {
            depth.style.height = group.classList.contains("is-open")
                ? `${inner.scrollHeight}px`
                : "0px";
        };

        button.addEventListener("click", () => {
            const willOpen = !group.classList.contains("is-open");

            document.querySelectorAll("[data-mypage-accordion].is-open").forEach(item => {
                if (item === group) return;
                item.classList.remove("is-open");
                item.querySelector(".sub-mypage-nav-toggle")?.setAttribute("aria-expanded", "false");
                const itemDepth = item.querySelector(".sub-mypage-nav-depth");
                if (itemDepth) itemDepth.style.height = "0px";
            });

            group.classList.toggle("is-open", willOpen);
            button.setAttribute("aria-expanded", String(willOpen));
            updateHeight();
            updateNavOpenState(nav);
        });

        updateHeight();
        updateNavOpenState(nav);
        window.addEventListener("resize", updateHeight);
        group.dataset.accordionInitialized = "true";
    });
}

function initMypageProductSlider() {
    const slider = document.querySelector(".sub-mypage-product-slider");
    if (!slider || typeof Swiper === "undefined") return;

    new Swiper(slider, {
        slidesPerView: 3,
        spaceBetween: 20,
        speed: 650,
        navigation: {
            prevEl: ".sub-mypage-product-prev",
            nextEl: ".sub-mypage-product-next"
        },
        breakpoints: {
            0: { slidesPerView: "auto", spaceBetween: 15 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 }
        }
    });
}

function initMypageOrderToggle() {
    document.querySelectorAll(".sub-mypage-order-toggle").forEach(button => {
        if (button.dataset.initialized === "true") return;
        const card = button.closest(".sub-mypage-order-card, .sub-mypage-order-history");
        const text = button.querySelector("span");
        if (!card || !text) return;
        const count = card.querySelectorAll(".sub-mypage-order-history-item").length;

        button.addEventListener("click", () => {
            const collapsed = card.classList.toggle("is-collapsed");
            button.setAttribute("aria-expanded", String(!collapsed));
            text.textContent = collapsed ? `총 ${count}건 주문 펼치기` : `총 ${count}건 주문 접기`;
        });
        button.dataset.initialized = "true";
    });
}

function initMypageBusinessAddModal() {
    const modal = document.querySelector("[data-business-add-modal]");
    const completeModal = document.querySelector("[data-business-complete-modal]");
    const openButton = document.querySelector("[data-business-add-open]");
    const form = document.querySelector("[data-business-add-form]");
    if (!modal || !completeModal || !openButton || !form) return;

    const closeButtons = modal.querySelectorAll("[data-business-add-close]");
    const completeCloseButtons = completeModal.querySelectorAll("[data-business-complete-close]");
    const fileInput = form.querySelector("[data-business-file]");
    const fileName = form.querySelector("[data-business-file-name]");
    const fileOpenButtons = form.querySelectorAll("[data-business-file-open]");
    const postcodeButton = form.querySelector("[data-business-postcode]");
    const postalCodeInput = form.querySelector("[data-business-postal-code]");
    const authButton = form.querySelector("[data-business-auth]");
    const authenticatedInput = form.querySelector("[data-business-authenticated]");
    const authStatus = form.querySelector("[data-business-auth-status]");
    const corporationField = form.querySelector("[data-corporation-number-field]");
    const businessTypeInputs = form.querySelectorAll('input[name="businessType"]');
    let lastFocusedElement = null;

    const setPageLocked = locked => {
        document.documentElement.classList.toggle("is-modal-open", locked);
        document.body.classList.toggle("is-modal-open", locked);
    };

    const clearValidation = () => {
        form.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute("aria-invalid"));
        form.querySelectorAll(".sub-form-group.is-error").forEach(group => group.classList.remove("is-error"));
        form.querySelectorAll(".sub-form-message").forEach(message => message.textContent = "");
    };

    const setFieldError = (field, message) => {
        const group = field.closest(".sub-form-group");
        field.setAttribute("aria-invalid", "true");
        group?.classList.add("is-error");
        const messageElement = group?.querySelector(".sub-form-message");
        if (messageElement) messageElement.textContent = message || field.dataset.message || "필수 정보를 입력해 주세요.";
    };

    const syncBusinessType = () => {
        const isCorporation = form.elements.businessType.value === "corporation";
        corporationField?.classList.toggle("is-hidden", !isCorporation);
        const corporationNumber = form.elements.corporationNumber;
        if (!isCorporation && corporationNumber) {
            corporationNumber.value = "";
            corporationNumber.removeAttribute("data-required");
            corporationNumber.removeAttribute("aria-invalid");
            corporationField?.classList.remove("is-error");
        } else {
            corporationNumber?.setAttribute("data-required", "");
        }
    };

    const resetForm = () => {
        form.reset();
        clearValidation();
        if (fileName) {
            fileName.textContent = "파일을 첨부해주세요.";
            fileName.removeAttribute("aria-invalid");
            fileName.closest(".sub-account-file")?.classList.remove("has-file");
        }
        if (authButton) {
            authButton.textContent = "사업자 인증";
            authButton.disabled = false;
            authButton.classList.remove("is-complete");
            delete authButton.dataset.verified;
        }
        if (authenticatedInput) authenticatedInput.value = "";
        if (authStatus) {
            authStatus.hidden = true;
            authStatus.className = "sub-account-code-status";
            authStatus.textContent = "";
        }
        syncBusinessType();
    };

    const openModal = () => {
        lastFocusedElement = document.activeElement;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        setPageLocked(true);
        modal.querySelector("input")?.focus();
    };

    const closeModal = (restoreFocus = true) => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        if (!completeModal.classList.contains("is-open")) setPageLocked(false);
        if (restoreFocus) lastFocusedElement?.focus?.();
    };

    const openCompleteModal = () => {
        closeModal(false);
        completeModal.classList.add("is-open");
        completeModal.setAttribute("aria-hidden", "false");
        setPageLocked(true);
        completeModal.querySelector("[data-business-complete-close]")?.focus();
    };

    const closeCompleteModal = () => {
        completeModal.classList.remove("is-open");
        completeModal.setAttribute("aria-hidden", "true");
        setPageLocked(false);
        resetForm();
        lastFocusedElement?.focus?.();
    };

    const validateForm = () => {
        clearValidation();
        const requiredFields = [...form.querySelectorAll("input[required], input[data-required]")];
        let firstInvalid = null;

        requiredFields.forEach(field => {
            const isFile = field.type === "file";
            const valid = isFile ? Boolean(field.files?.length || field.value) : Boolean(field.value.trim()) && field.checkValidity();
            if (valid) return;
            const errorTarget = isFile ? fileName : field;
            if (errorTarget) setFieldError(errorTarget, field.dataset.message);
            if (!firstInvalid) firstInvalid = isFile ? fileName : field;
        });

        firstInvalid?.focus?.();
        return !firstInvalid;
    };

    openButton.addEventListener("click", openModal);
    closeButtons.forEach(button => button.addEventListener("click", () => closeModal()));
    completeCloseButtons.forEach(button => button.addEventListener("click", closeCompleteModal));

    form.querySelectorAll("input").forEach(input => {
        const clearInputError = () => {
            input.removeAttribute("aria-invalid");
            input.closest(".sub-form-group")?.classList.remove("is-error");
            const message = input.closest(".sub-form-group")?.querySelector(".sub-form-message");
            if (message) message.textContent = "";
        };
        input.addEventListener("input", clearInputError);
        input.addEventListener("change", clearInputError);
    });

    businessTypeInputs.forEach(input => input.addEventListener("change", syncBusinessType));

    fileOpenButtons.forEach(button => button.addEventListener("click", () => fileInput?.click()));
    fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) {
            fileName.textContent = "파일을 첨부해주세요.";
            return;
        }
        const allowed = /\.(jpe?g|png|pdf)$/i.test(file.name);
        const validSize = file.size <= 10 * 1024 * 1024;
        if (!allowed || !validSize) {
            fileInput.value = "";
            fileName.textContent = "JPG, PNG, PDF 파일을 10MB 이하로 첨부해주세요.";
            fileName.setAttribute("aria-invalid", "true");
            return;
        }
        fileName.textContent = file.name;
        fileName.removeAttribute("aria-invalid");
        fileName.closest(".sub-account-file")?.classList.add("has-file");
    });

    const openPostcode = () => {
        const address = form.elements.businessAddress;
        if (!window.daum?.Postcode) {
            window.HunterAlert?.open({ message: "주소 검색 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." });
            return;
        }

        new window.daum.Postcode({
            oncomplete(data) {
                const postalCode = data.zonecode || "";
                address.value = data.roadAddress || data.jibunAddress || "";
                address.dataset.postalCode = postalCode;
                if (postalCodeInput) postalCodeInput.value = postalCode;
                postalCodeInput?.dispatchEvent(new Event("change", { bubbles: true }));
                address.dispatchEvent(new Event("input", { bubbles: true }));
                address.dispatchEvent(new Event("change", { bubbles: true }));
                address.removeAttribute("aria-invalid");
                address.closest(".sub-form-group")?.classList.remove("is-error");
                form.elements.businessAddressDetail?.focus();
            }
        }).open();
    };

    postcodeButton?.addEventListener("click", openPostcode);
    form.elements.businessAddress?.addEventListener("click", openPostcode);

    const resetBusinessAuthentication = () => {
        if (authenticatedInput) authenticatedInput.value = "";
        if (authButton) {
            authButton.textContent = "사업자 인증";
            authButton.disabled = false;
            authButton.classList.remove("is-complete");
            delete authButton.dataset.verified;
        }
        if (authStatus) {
            authStatus.hidden = true;
            authStatus.className = "sub-account-code-status";
            authStatus.textContent = "";
        }
    };

    [form.elements.businessNumber, form.elements.openingDate, form.elements.representativeName,
        form.elements.businessName, form.elements.corporationNumber, form.elements.businessAddress]
        .filter(Boolean)
        .forEach(field => {
            field.addEventListener("input", resetBusinessAuthentication);
            field.addEventListener("change", resetBusinessAuthentication);
        });
    businessTypeInputs.forEach(input => input.addEventListener("change", resetBusinessAuthentication));

    authButton?.addEventListener("click", async () => {
        const businessNumber = form.elements.businessNumber;
        const number = businessNumber.value.replace(/\D/g, "");
        const isCorporation = form.elements.businessType.value === "corporation";
        const corporationDigits = form.elements.corporationNumber.value.replace(/\D/g, "");

        if (!/^\d{10}$/.test(number)) {
            setFieldError(businessNumber, "10자리 사업자등록번호를 입력해 주세요.");
            businessNumber.focus();
            return;
        }

        if (!form.elements.openingDate.value || !form.elements.representativeName.value.trim() || !form.elements.businessName.value.trim()) {
            await window.HunterAlert?.open({ message: "개업일, 기업/사업체명, 대표자명을 먼저 입력해 주세요." });
            return;
        }

        if (isCorporation && corporationDigits.length !== 13) {
            setFieldError(form.elements.corporationNumber, "13자리 법인등록번호를 입력해 주세요.");
            form.elements.corporationNumber.focus();
            return;
        }

        authButton.disabled = true;
        authButton.textContent = "인증 중";
        const serviceKey = "c43099117f7a32bacb563e8aad7893df567f7d7a426d94b4ef94bd3f97e7a711";
        const apiBaseUrl = "https://api.odcloud.kr/api/nts-businessman/v1";
        const requestOptions = { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" } };
        const validationBody = {
            businesses: [{
                b_no: number,
                start_dt: form.elements.openingDate.value.replace(/\D/g, ""),
                p_nm: form.elements.representativeName.value.trim(),
                b_nm: form.elements.businessName.value.trim(),
                corp_no: isCorporation ? corporationDigits : "",
                b_sector: "",
                b_type: "",
                b_adr: form.elements.businessAddress.value.trim()
            }]
        };

        try {
            const responses = await Promise.all([
                fetch(`${apiBaseUrl}/validate?serviceKey=${encodeURIComponent(serviceKey)}`, { ...requestOptions, body: JSON.stringify(validationBody) }),
                fetch(`${apiBaseUrl}/status?serviceKey=${encodeURIComponent(serviceKey)}`, { ...requestOptions, body: JSON.stringify({ b_no: [number] }) })
            ]);
            const payloads = await Promise.all(responses.map(response => response.json()));
            if (!responses[0].ok || !responses[1].ok) throw new Error("사업자 정보를 확인하지 못했습니다.");

            const validation = payloads[0]?.data?.[0];
            const statusResult = payloads[1]?.data?.[0];
            if (!validation || validation.valid !== "01" || !statusResult || statusResult.b_stt_cd !== "01") {
                resetBusinessAuthentication();
                await window.HunterAlert?.open({ message: "입력하신 사업자 정보가 맞지 않습니다.\n다시 한번 확인해 주세요." });
                return;
            }

            authenticatedInput.value = "true";
            authenticatedInput.removeAttribute("aria-invalid");
            authButton.textContent = "인증 완료";
            authButton.classList.add("is-complete");
            authButton.dataset.verified = "true";
            authStatus.hidden = false;
            authStatus.className = "sub-account-code-status is-success";
            authStatus.textContent = "사업자 인증이 완료되었습니다.";
            authButton.closest(".sub-form-group")?.classList.remove("is-error");
        } catch (error) {
            resetBusinessAuthentication();
            await window.HunterAlert?.open({ message: error?.message || "사업자 인증 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
        } finally {
            if (!authenticatedInput.value) {
                authButton.disabled = false;
                authButton.textContent = "사업자 인증";
            }
        }
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!validateForm()) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const addressValue = form.elements.businessAddress.value.trim();
        const addressMatch = addressValue.match(/^\((\d{5})\)\s*(.*)$/);
        const businessNumber = form.elements.businessNumber.value.trim();
        const corporationNumber = form.elements.corporationNumber?.value.trim() || "";
        const formatBusinessNumber = value => value.length === 10
            ? `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`
            : value;
        const formatCorporationNumber = value => value.length === 13
            ? `${value.slice(0, 6)}-${value.slice(6)}`
            : value;
        const request = {
            businessTypeCode: form.elements.businessType.value === "corporation" ? "CORPORATION" : "INDIVIDUAL",
            businessNumber: formatBusinessNumber(businessNumber),
            corporationNumber: formatCorporationNumber(corporationNumber),
            businessName: form.elements.businessName.value.trim(),
            openingDate: form.elements.openingDate.value,
            representativeName: form.elements.representativeName.value.trim(),
            postalCode: postalCodeInput?.value || form.elements.businessAddress.dataset.postalCode || addressMatch?.[1] || "",
            address1: addressMatch?.[2] || addressValue,
            address2: form.elements.businessAddressDetail.value.trim()
        };
        const formData = new FormData();
        formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
        formData.append("businessLicenseFile", fileInput.files[0]);

        if (submitButton) submitButton.disabled = true;
        try {
            await window.HunterFrontAPI.member.addBusiness(formData);
            window.dispatchEvent(new CustomEvent("hunterBusinessesUpdated"));
            openCompleteModal();
        } catch (error) {
            const message = error?.message || "기업/사업체 추가 신청을 처리하지 못했습니다.";
            if (window.HunterAlert?.alert) await window.HunterAlert.alert(message);
            else await window.HunterAlert?.open({ message });
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    window.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        if (completeModal.classList.contains("is-open")) closeCompleteModal();
        else if (modal.classList.contains("is-open")) closeModal();
    });
}


function initMypageWithdrawModal() {
    const modal = document.querySelector("[data-withdraw-modal]");
    const openButton = document.querySelector("[data-withdraw-open]");

    if (!modal || !openButton) return;

    const closeButtons = modal.querySelectorAll("[data-withdraw-close]");
    const agree = modal.querySelector("[data-withdraw-agree]");
    const submit = modal.querySelector("[data-withdraw-submit]");
    let lastFocusedElement = null;

    const openModal = () => {
        lastFocusedElement = document.activeElement;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("is-modal-open");
        document.body.classList.add("is-modal-open");
        agree?.focus();
    };

    const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-modal-open");
        document.body.classList.remove("is-modal-open");

        if (agree) agree.checked = false;
        if (submit) submit.disabled = true;

        lastFocusedElement?.focus?.();
    };

    const openCompleteModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-modal-open");
        document.body.classList.remove("is-modal-open");
        if (agree) agree.checked = false;
        if (submit) submit.disabled = true;
        return window.HunterAlert?.open({
            message: "회원 탈퇴 신청이 완료되었습니다.\n더 나은 서비스로 찾아뵙겠습니다.\n감사합니다."
        });
    };

    openButton.addEventListener("click", openModal);
    closeButtons.forEach(button => button.addEventListener("click", closeModal));

    agree?.addEventListener("change", () => {
        if (submit) submit.disabled = !agree.checked;
    });

    submit?.addEventListener("click", async () => {
        if (!agree?.checked) return;
        submit.disabled = true;
        try {
            const result = await window.HunterFrontAPI.member.withdraw();
            if (result?.withdrawn !== true) throw new Error("회원탈퇴 응답을 확인할 수 없습니다.");
            window.HunterAPI.auth.clearTokens();
            await openCompleteModal();
            window.location.replace("/account/login.html");
        } catch (error) {
            submit.disabled = false;
            await window.HunterAlert?.open({
                message: error?.message || "회원탈퇴 요청을 처리하지 못했습니다."
            });
        }
    });

    window.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        if (modal.classList.contains("is-open")) {
            closeModal();
        }
    });
}

function initMypageProductMoreMenus() {
    const buttons = document.querySelectorAll('[data-product-more]');
    if (!buttons.length) return;

    const closeAll = except => {
        document.querySelectorAll('.sub-mypage-more-wrap.is-open').forEach(wrap => {
            if (wrap === except) return;
            wrap.classList.remove('is-open');
            wrap.querySelector('[data-product-more]')?.setAttribute('aria-expanded', 'false');
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', event => {
            event.stopPropagation();
            const wrap = button.closest('.sub-mypage-more-wrap');
            const willOpen = !wrap.classList.contains('is-open');
            closeAll(wrap);
            wrap.classList.toggle('is-open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));
        });
    });

    document.addEventListener('click', () => closeAll());
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeAll();
    });
}

function initMypagePartControls() {
    const rows = document.querySelectorAll('.sub-mypage-part-row');
    if (!rows.length) return;

    const checkAll = document.querySelector('[data-check-all]');
    const checks = [...document.querySelectorAll('.sub-mypage-part-check')];

    const updateRowTotal = row => {
        const price = Number(row.querySelector('[data-price]')?.dataset.price || 0);
        const quantity = Number(row.querySelector('.sub-mypage-quantity input')?.value || 1);
        const total = row.querySelector('.sub-mypage-part-total');
        if (total) total.textContent = `₩${(price * quantity).toLocaleString('ko-KR')}`;
    };

    rows.forEach(row => {
        const input = row.querySelector('.sub-mypage-quantity input');
        row.querySelector('[data-qty-minus]')?.addEventListener('click', () => {
            input.value = Math.max(Number(input.min || 1), Number(input.value) - 1);
            updateRowTotal(row);
        });
        row.querySelector('[data-qty-plus]')?.addEventListener('click', () => {
            input.value = Math.min(Number(input.max || 99), Number(input.value) + 1);
            updateRowTotal(row);
        });
        updateRowTotal(row);
    });

    checkAll?.addEventListener('change', () => {
        checks.forEach(check => check.checked = checkAll.checked);
    });
    checks.forEach(check => check.addEventListener('change', () => {
        if (checkAll) checkAll.checked = checks.every(item => item.checked);
    }));
}

function initCsRequestProductLinks() {
    document.querySelectorAll('.sub-mypage-product-row').forEach(row => {
        const productName = row.querySelector('.sub-mypage-list-product-text strong')?.textContent.trim() || '';
        const productCategory = row.querySelector('.sub-mypage-list-product-text small')?.textContent.trim() || '';
        const cells = [...row.children];
        const productSerial = cells[1]?.textContent.trim() || '';

        row.querySelectorAll('a[href*="/Mypage/cs-request.html"][href*="category="]').forEach(link => {
            const url = new URL(link.href, window.location.origin);
            const productId = url.searchParams.get('product') || productSerial;

            url.searchParams.set('product', productId);
            url.searchParams.set('productName', productName);
            url.searchParams.set('productCategory', productCategory);
            url.searchParams.set('productSerial', productSerial);
            link.href = `${url.pathname}?${url.searchParams.toString()}`;
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initCsRequestProductLinks();
        initMypageProductMoreMenus();
        initMypagePartControls();
    });
} else {
    initCsRequestProductLinks();
    initMypageProductMoreMenus();
    initMypagePartControls();
}

function initMypagePartDetailModal() {
    const modal = document.querySelector('[data-part-modal]');
    const openButtons = document.querySelectorAll('[data-part-modal-open]');

    if (!modal || !openButtons.length) return;

    const closeButtons = modal.querySelectorAll('[data-part-modal-close]');
    const dialog = modal.querySelector('.sub-mypage-part-modal-dialog');
    let lastFocusedElement = null;

    const openModal = button => {
        lastFocusedElement = button;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('is-modal-open');
        document.body.classList.add('is-modal-open');
        dialog?.focus?.();
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('is-modal-open');
        document.body.classList.remove('is-modal-open');
        lastFocusedElement?.focus?.();
    };

    openButtons.forEach(button => {
        button.addEventListener('click', () => openModal(button));
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    window.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMypagePartDetailModal);
} else {
    initMypagePartDetailModal();
}



function initMypageHomeLists() {
    document.querySelectorAll('[data-mypage-list]').forEach(region => {
        const selector = region.dataset.itemSelector;
        const empty = region.querySelector('[data-mypage-empty]');
        if (!selector || !empty) return;

        const update = () => {
            const hasItems = region.querySelectorAll(selector).length > 0;
            empty.hidden = hasItems;
            region.classList.toggle('is-empty', !hasItems);

            [...region.children].forEach(child => {
                if (child === empty) return;
                child.hidden = !hasItems;
            });
        };

        update();
        new MutationObserver(update).observe(region, { childList: true, subtree: true });
    });
}

function initMypageHomeTrainingModal() {
    const page = document.querySelector('.sub-mypage-home-page');
    const modal = document.querySelector('#mypage-home-training-modal');
    if (!page || !modal) return;

    const date = modal.querySelector('[data-home-training-date]');
    const course = modal.querySelector('[data-home-training-course]');
    const dot = modal.querySelector('[data-home-training-dot]');
    const cancelButton = modal.querySelector('[data-home-training-cancel]');
    const colorMap = {
        'training-color-1': '#3ccba1', 'training-color-2': '#ec45ad',
        'training-color-3': '#19a8e6', 'training-color-4': '#9566e9',
        'training-color-5': '#ff8d3a'
    };
    let activeRow = null;
    let lastFocusedElement = null;

    const close = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-mypage-home-modal-open');
        lastFocusedElement?.focus?.();
    };

    page.addEventListener('click', event => {
        const button = event.target.closest('[data-training-history-open]');
        if (!button) return;

        const row = button.closest('[data-training-history]');
        if (!row) return;
        activeRow = row;
        lastFocusedElement = button;
        date.textContent = `${row.dataset.date} / ${row.dataset.time}`;
        course.textContent = `${row.dataset.course} (${row.dataset.count})`;
        dot.style.setProperty('--training-color', colorMap[row.dataset.color] || colorMap['training-color-1']);

        const cancelled = row.dataset.status === '신청취소';
        cancelButton.textContent = cancelled ? '취소 완료' : '신청 취소하기';
        cancelButton.disabled = cancelled;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-mypage-home-modal-open');
        modal.querySelector('[data-home-training-close]')?.focus();
    });

    modal.querySelectorAll('[data-home-training-close]').forEach(button => button.addEventListener('click', close));
    cancelButton?.addEventListener('click', () => {
        if (!activeRow || activeRow.dataset.status === '신청취소') return;
        activeRow.dataset.status = '신청취소';
        activeRow.querySelector('[data-history-status]').textContent = '신청취소';
        cancelButton.textContent = '취소 완료';
        cancelButton.disabled = true;
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMypageHomeLists();
        initMypageHomeTrainingModal();
    });
} else {
    initMypageHomeLists();
    initMypageHomeTrainingModal();
}
