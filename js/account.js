(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initLoginForm();
        initJoinSubmit();
        initAgreementControls();
        initBusinessType();
        initFileInput();
        initJoinPhoneVerification();
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

        var phoneStep = form.querySelector('[data-login-step="phone"]');
        var codeStep = form.querySelector('[data-login-step="code"]');
        var phone = document.getElementById('login-phone');
        var code = document.getElementById('login-code');
        var codeGroup = code.closest('.sub-form-group');
        var requestButton = form.querySelector('[data-login-request]');
        var resendButton = form.querySelector('[data-login-resend]');
        var backButton = form.querySelector('[data-login-back]');
        var submitButton = form.querySelector('[data-login-submit]');
        var timer = form.querySelector('[data-login-timer]');
        var status = form.querySelector('[data-login-status]');
        var keepPhone = document.getElementById('login-keep');
        var keepCode = document.getElementById('login-keep-code');
        var timerId = null;
        var remainingSeconds = 599;
        var verified = false;
        var TEST_LOGIN_CODE = '111111';
        var returnTarget = getLoginReturnTarget();

        function getLoginReturnTarget() {
            var params = new URLSearchParams(window.location.search);
            var requestedTarget = params.get('returnUrl');
            var candidate = requestedTarget || document.referrer;

            if (!candidate) return '';

            try {
                var target = new URL(candidate, window.location.href);
                var isSameOrigin = target.origin === window.location.origin;
                var isLoginPage = /\/account\/login\.html$/i.test(target.pathname);

                return isSameOrigin && !isLoginPage ? target.href : '';
            } catch (error) {
                return '';
            }
        }

        function moveToPreviousPage() {
            if (returnTarget) {
                window.location.href = returnTarget;
                return;
            }

            if (window.history.length > 1) {
                window.history.back();
                return;
            }

            window.location.href = new URL('../index.html', window.location.href).href;
        }

        function showStep(step) {
            var isPhone = step === 'phone';
            phoneStep.hidden = !isPhone;
            codeStep.hidden = isPhone;
            phoneStep.classList.toggle('is-active', isPhone);
            codeStep.classList.toggle('is-active', !isPhone);
            if (isPhone) phone.focus(); else code.focus();
        }

        function renderTimer() {
            var minutes = Math.floor(remainingSeconds / 60);
            var seconds = remainingSeconds % 60;
            timer.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        }

        function startTimer() {
            window.clearInterval(timerId);
            remainingSeconds = 599;
            renderTimer();
            timerId = window.setInterval(function () {
                remainingSeconds -= 1;
                renderTimer();
                if (remainingSeconds <= 0) {
                    window.clearInterval(timerId);
                    submitButton.disabled = true;
                    status.hidden = false;
                    status.className = 'sub-account-code-status is-error';
                    status.textContent = '인증시간이 만료되었습니다.';
                    codeGroup.classList.add('is-error');
                }
            }, 1000);
        }

        phone.addEventListener('input', function () {
            phone.value = phone.value.replace(/\D/g, '').slice(0, 11);
        });
        code.addEventListener('input', function () {
            code.value = code.value.replace(/\D/g, '').slice(0, 6);
            verified = false;
            status.hidden = true;
            status.textContent = '';
            code.disabled = false;
            codeGroup.classList.remove('is-error');
            codeGroup.classList.remove('is-verified');
            submitButton.textContent = '확인';
            submitButton.disabled = code.value.length !== 6 || remainingSeconds <= 0;
        });
        keepPhone.addEventListener('change', function () { keepCode.checked = keepPhone.checked; });
        keepCode.addEventListener('change', function () { keepPhone.checked = keepCode.checked; });

        requestButton.addEventListener('click', function () {
            var digits = phone.value.replace(/\D/g, '');
            if (digits.length < 10 || digits.length > 11) {
                setFieldError(phone.closest('.sub-form-group'), '올바른 휴대전화번호를 입력해 주세요.');
                phone.focus();
                return;
            }
            clearFieldState(phone.closest('.sub-form-group'));
            verified = false;
            code.disabled = false;
            code.value = '';
            status.hidden = true;
            status.className = 'sub-account-code-status';
            status.textContent = '';
            codeGroup.classList.remove('is-error');
            codeGroup.classList.remove('is-verified');
            submitButton.textContent = '확인';
            submitButton.disabled = true;
            showStep('code');
            startTimer();
        });

        resendButton.addEventListener('click', function () {
            verified = false;
            code.disabled = false;
            code.value = '';
            status.hidden = true;
            status.textContent = '';
            codeGroup.classList.remove('is-error');
            codeGroup.classList.remove('is-verified');
            submitButton.textContent = '확인';
            submitButton.disabled = true;
            startTimer();
            code.focus();
        });

        backButton.addEventListener('click', function () {
            window.clearInterval(timerId);
            showStep('phone');
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (submitButton.disabled) return;

            if (verified) {
                var shouldMove = form.dispatchEvent(new CustomEvent('phoneLoginSubmit', {
                    bubbles: true,
                    cancelable: true,
                    detail: { phone: phone.value, keepLogin: keepCode.checked }
                }));
                // API 연동 시 이벤트에서 preventDefault()한 뒤 로그인 성공 시 이동 처리합니다.
                if (shouldMove) moveToPreviousPage();
                return;
            }

            if (code.value.length !== 6) return;

            if (code.value !== TEST_LOGIN_CODE) {
                verified = false;
                status.hidden = false;
                status.className = 'sub-account-code-status is-error';
                status.textContent = '인증번호가 틀립니다.';
                codeGroup.classList.add('is-error');
                codeGroup.classList.remove('is-verified');
                code.focus();
                code.select();
                return;
            }

            verified = true;
            window.clearInterval(timerId);
            code.disabled = true;
            status.hidden = false;
            status.className = 'sub-account-code-status is-success';
            status.textContent = '인증되었습니다.';
            codeGroup.classList.remove('is-error');
            codeGroup.classList.add('is-verified');
            submitButton.textContent = '로그인';
            submitButton.disabled = false;
            form.dispatchEvent(new CustomEvent('phoneLoginVerified', {
                bubbles: true,
                detail: { phone: phone.value, keepLogin: keepCode.checked }
            }));
            // phoneLoginVerified는 인증 성공 상태 알림용 이벤트입니다.
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
        var businessButton = document.getElementById('business-auth-button');

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

    function initJoinPhoneVerification() {
        var group = document.getElementById('join-phone-verification');
        if (!group) return;

        var phone = document.getElementById('join-phone');
        var requestButton = document.getElementById('phone-auth-button');
        var codeArea = document.getElementById('join-phone-code-area');
        var code = document.getElementById('join-phone-code');
        var confirmButton = document.getElementById('join-phone-confirm');
        var timer = document.getElementById('join-phone-timer');
        var status = document.getElementById('phone-auth-status');
        var resend = document.getElementById('join-phone-resend');
        var authenticated = document.getElementById('phone-authenticated');
        var intervalId = null;
        var remainingSeconds = 599;
        var requestedPhone = '';
        var TEST_CODE = '123456';

        function renderTimer() {
            var minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
            var seconds = String(remainingSeconds % 60).padStart(2, '0');
            timer.textContent = minutes + ':' + seconds;
        }

        function stopTimer() {
            if (intervalId) window.clearInterval(intervalId);
            intervalId = null;
        }

        function setStatus(type, message) {
            status.hidden = !message;
            status.className = 'sub-account-code-status' + (type ? ' is-' + type : '');
            status.textContent = message || '';
            code.classList.toggle('is-error', type === 'error');
        }

        function resetVerification(hideCodeArea) {
            stopTimer();
            authenticated.value = '';
            code.disabled = false;
            code.value = '';
            confirmButton.disabled = true;
            codeArea.hidden = Boolean(hideCodeArea);
            requestButton.textContent = '코드 요청';
            requestButton.disabled = false;
            resend.hidden = false;
            group.classList.remove('is-verified');
            clearFieldState(group);
            setStatus('', '');
        }

        function startTimer() {
            stopTimer();
            remainingSeconds = 599;
            renderTimer();
            intervalId = window.setInterval(function () {
                remainingSeconds -= 1;
                renderTimer();
                if (remainingSeconds <= 0) {
                    stopTimer();
                    code.disabled = true;
                    confirmButton.disabled = true;
                    setStatus('error', '인증시간이 만료되었습니다.');
                }
            }, 1000);
        }

        function requestCode() {
            var numbers = phone.value.replace(/\D/g, '');
            if (numbers.length < 10 || numbers.length > 11) {
                setFieldError(group, '올바른 휴대전화번호를 입력해 주세요.');
                phone.focus();
                return;
            }

            clearFieldState(group);
            requestedPhone = numbers;
            authenticated.value = '';
            codeArea.hidden = false;
            code.disabled = false;
            code.value = '';
            confirmButton.disabled = true;
            requestButton.textContent = '코드 요청';
            resend.hidden = false;
            group.classList.remove('is-verified');
            setStatus('', '');
            startTimer();
            code.focus();
        }

        function verifyCode() {
            if (code.value.length !== 6 || remainingSeconds <= 0) return;

            if (code.value !== TEST_CODE) {
                setStatus('error', '인증번호가 틀립니다.');
                code.focus();
                code.select();
                return;
            }

            stopTimer();
            authenticated.value = 'true';
            authenticated.dispatchEvent(new Event('change', { bubbles: true }));
            code.disabled = true;
            confirmButton.disabled = true;
            resend.hidden = true;
            group.classList.add('is-verified');
            clearFieldState(group);
            setStatus('success', '인증되었습니다.');
        }

        requestButton.addEventListener('click', requestCode);
        resend.addEventListener('click', requestCode);
        confirmButton.addEventListener('click', verifyCode);

        code.addEventListener('input', function () {
            code.value = code.value.replace(/\D/g, '').slice(0, 6);
            if (status.classList.contains('is-error')) setStatus('', '');
            confirmButton.disabled = code.value.length !== 6 || remainingSeconds <= 0;
        });

        phone.addEventListener('input', function () {
            var numbers = phone.value.replace(/\D/g, '');
            if (requestedPhone && numbers !== requestedPhone) resetVerification(true);
        });

        resetVerification(true);
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
