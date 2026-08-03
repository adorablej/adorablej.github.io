(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initLoginForm();
        initJoinSubmit();
        initAgreementControls();
        initBusinessType();
        initFileInput();
        initAuthButtons();
        initAddressSearch();
        initPlaceholderLinks();
        initCompletePage();
        initNumericOnlyInputs();
    });

    function initNumericOnlyInputs() {
        document.querySelectorAll('input[inputmode="numeric"]:not([data-phone])').forEach(function (input) {
            input.addEventListener('input', function () {
                input.value = input.value.replace(/\D/g, '');
            });
        });
    }

    function initLoginForm() {
        var form = document.getElementById('login-form');
        if (!form) return;

        form.addEventListener('submit', function (event) {
            if (event.defaultPrevented) return;
            event.preventDefault();
            window.location.href = '/';
        });
    }

    function initJoinSubmit() {
        var form = document.getElementById('join-form');
        if (!form) return;

        form.addEventListener('submit', function (event) {
            if (event.defaultPrevented) return;

            if (!validateUploadedFile()) {
                event.preventDefault();
                return;
            }

            event.preventDefault();
            var name = document.getElementById('join-name');
            sessionStorage.setItem('joinUserName', name ? name.value.trim() : '');
            window.location.href = '/Account/join-complete.html';
        });
    }

    function initAgreementControls() {
        var all = document.getElementById('agree-all');
        var items = Array.prototype.slice.call(document.querySelectorAll('.sub-account-agree-item'));
        if (!all || !items.length) return;

        all.addEventListener('change', function () {
            var isChecked = all.checked;

            all.indeterminate = false;

            items.forEach(function (item) {
                item.checked = isChecked;
                item.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });

        items.forEach(function (item) {
            item.addEventListener('change', function () {
                var checkedCount = items.filter(function (checkbox) {
                    return checkbox.checked;
                }).length;

                all.checked = checkedCount === items.length;
                all.indeterminate = checkedCount > 0 && checkedCount < items.length;
            });
        });
    }

    function initBusinessType() {
        var radios = document.querySelectorAll('input[name="businessType"]');
        var corporationField = document.getElementById('corporation-number-field');
        var corporationInput = document.getElementById('corporation-number');
        var businessAuth = document.getElementById('business-authenticated');
        var businessButton = document.getElementById('business-auth-button');
        var fileGuide = document.getElementById('business-file-guide');

        if (!radios.length || !corporationField || !corporationInput) return;

        function update() {
            var checked = document.querySelector('input[name="businessType"]:checked');
            var isCorporation = checked && checked.value === 'corporation';

            corporationField.classList.toggle('is-hidden', !isCorporation);
            corporationInput.disabled = !isCorporation;

            if (businessAuth) {
                businessAuth.disabled = !isCorporation;
                if (!isCorporation) {
                    businessAuth.value = '';
                    clearFieldState(businessAuth.closest('.sub-form-group'));
                } else if (!businessButton.classList.contains('is-complete')) {
                    businessAuth.value = '';
                }
            }

            if (businessButton) businessButton.hidden = !isCorporation;

            if (fileGuide && fileGuide.firstElementChild) {
                fileGuide.firstElementChild.textContent = isCorporation
                    ? '10MB 이하의 이미지파일(JPG, PNG), PDF 파일 1개만 첨부할 수 있습니다.'
                    : '개인사업자는 생년월일이 포함된 등록증만 인정됩니다. PDF/JPG/PNG, 10MB 이하 1개';
            }

            clearFieldState(corporationField);
        }

        radios.forEach(function (radio) {
            radio.addEventListener('change', update);
        });

        update();
    }

    function initFileInput() {
        var input = document.getElementById('business-file');
        var name = document.getElementById('business-file-name');
        if (!input || !name) return;

        var dropArea = input.closest('.sub-account-field').querySelector('.sub-account-file');

        input.addEventListener('change', function () {
            updateFileName(input, name, dropArea);
            validateUploadedFile();
        });

        ['dragenter', 'dragover'].forEach(function (eventName) {
            dropArea.addEventListener(eventName, function (event) {
                event.preventDefault();
                dropArea.classList.add('is-dragover');
            });
        });

        ['dragleave', 'drop'].forEach(function (eventName) {
            dropArea.addEventListener(eventName, function (event) {
                event.preventDefault();
                dropArea.classList.remove('is-dragover');
            });
        });

        dropArea.addEventListener('drop', function (event) {
            if (!event.dataTransfer || !event.dataTransfer.files.length) return;
            input.files = event.dataTransfer.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    function updateFileName(input, name, label) {
        if (input.files && input.files[0]) {
            name.textContent = input.files[0].name;
            label.classList.add('has-file');
        } else {
            name.textContent = '클릭하거나 파일을 끌어다 놓으세요';
            label.classList.remove('has-file');
        }
    }

    function validateUploadedFile() {
        var input = document.getElementById('business-file');
        if (!input || !input.files || !input.files.length) return true;

        var file = input.files[0];
        var allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        var group = input.closest('.sub-form-group');

        if (allowed.indexOf(file.type) === -1) {
            setFieldError(group, 'JPG, PNG, PDF 파일만 첨부할 수 있습니다.');
            input.setAttribute('aria-invalid', 'true');
            return false;
        }

        if (file.size > 10 * 1024 * 1024) {
            setFieldError(group, '10MB 이하의 파일만 첨부할 수 있습니다.');
            input.setAttribute('aria-invalid', 'true');
            return false;
        }

        clearFieldState(group);
        input.setAttribute('aria-invalid', 'false');
        return true;
    }

    function initAuthButtons() {
        var phoneButton = document.getElementById('phone-auth-button');
        var businessButton = document.getElementById('business-auth-button');

        if (phoneButton) {
            phoneButton.addEventListener('click', function () {
                var phone = document.getElementById('join-phone');
                var numbers = phone.value.replace(/\D/g, '');

                if (numbers.length < 10) {
                    setFieldError(phone.closest('.sub-form-group'), '본인 인증을 위해 휴대전화번호를 먼저 입력해 주세요.');
                    phone.focus();
                    return;
                }

                markAuthenticated('phone-authenticated', phoneButton, 'phone-auth-status', '휴대폰 본인 인증이 완료되었습니다.');
            });
        }

        if (businessButton) {
            businessButton.addEventListener('click', function () {
                var ids = ['business-number', 'business-name', 'opening-date', 'representative-name'];
                var missing = ids.map(function (id) { return document.getElementById(id); })
                    .find(function (input) { return !input || !input.value.trim(); });

                if (missing) {
                    setFieldError(missing.closest('.sub-form-group'), '사업자 인증에 필요한 정보를 먼저 입력해 주세요.');
                    missing.focus();
                    return;
                }

                markAuthenticated('business-authenticated', businessButton, 'business-auth-status', '사업자 인증이 완료되었습니다.');
            });
        }
    }

    function markAuthenticated(hiddenId, button, statusId, message) {
        var hidden = document.getElementById(hiddenId);
        var status = document.getElementById(statusId);
        if (!hidden) return;

        hidden.value = 'true';
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
        button.textContent = '인증 완료';
        button.classList.add('is-complete');
        if (status) status.textContent = message;
    }

    function initAddressSearch() {
        var button = document.getElementById('address-search-button');
        var address = document.getElementById('business-address');
        if (!button || !address) return;

        button.addEventListener('click', function () {
            // 실제 적용 시 우편번호 API 호출 코드로 교체합니다.
            address.value = '서울시 마포구 토정로 137';
            address.dispatchEvent(new Event('input', { bubbles: true }));
            address.dispatchEvent(new Event('change', { bubbles: true }));
            document.getElementById('business-address-detail').focus();
        });
    }

    function initPlaceholderLinks() {
        document.querySelectorAll('.sub-account-view-link, #file-example-link').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
            });
        });
    }

    function initCompletePage() {
        var nameTarget = document.getElementById('complete-user-name');
        if (!nameTarget) return;

        var savedName = sessionStorage.getItem('joinUserName');
        if (savedName) nameTarget.textContent = savedName;
        sessionStorage.removeItem('joinUserName');
    }
})();
