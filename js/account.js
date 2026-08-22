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
        var verificationId = '';
        var requesting = false;
        var loggingIn = false;
        var authApi = window.HunterFrontAPI && window.HunterFrontAPI.auth;
        var memberApi = window.HunterFrontAPI && window.HunterFrontAPI.member;
        var returnTarget = getLoginReturnTarget();
        var devBypassToken = 'DEV_BYPASS_2026';
        var devTestPhones = [
            '01090010001',
            '01090010002',
            '01090010003',
            '01090010004',
            '01090010005'
        ];

        function isDevBypassLogin(phoneNumber) {
            var apiBaseUrl = window.HunterAPIConfig && window.HunterAPIConfig.baseUrl;
            var isDevelopmentApi = String(apiBaseUrl || '').replace(/\/$/, '') === 'https://api-dev.hunterkorea.com';

            return isDevelopmentApi && devTestPhones.indexOf(phoneNumber) !== -1;
        }

        function formatPhoneNumber(phoneNumber) {
            return phoneNumber.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
        }

        async function completeLogin(credentials, rememberLogin) {
            await authApi.login(credentials, rememberLogin);
            var member = await memberApi.getMe();
            window.localStorage.removeItem('hunter.member');
            window.sessionStorage.removeItem('hunter.member');
            var storage = rememberLogin ? window.localStorage : window.sessionStorage;
            storage.setItem('hunter.member', JSON.stringify(member || {}));
            moveToPreviousPage();
        }

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
            window.location.href = '/index.html';
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

        function startTimer(seconds) {
            window.clearInterval(timerId);
            remainingSeconds = Number(seconds) || 599;
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
            verificationId = '';
        });
        code.addEventListener('input', function () {
            code.value = code.value.replace(/\D/g, '').slice(0, 6);
            status.hidden = true;
            status.textContent = '';
            code.disabled = false;
            codeGroup.classList.remove('is-error');
            codeGroup.classList.remove('is-verified');
            submitButton.disabled = code.value.length !== 6 || remainingSeconds <= 0;
        });
        keepPhone.addEventListener('change', function () { keepCode.checked = keepPhone.checked; });
        keepCode.addEventListener('change', function () { keepPhone.checked = keepCode.checked; });

        async function requestLoginCode() {
            if (requesting) return;
            var digits = phone.value.replace(/\D/g, '');
            if (digits.length < 10 || digits.length > 11) {
                setFieldError(phone.closest('.sub-form-group'), '올바른 휴대전화번호를 입력해 주세요.');
                phone.focus();
                return;
            }
            if (!authApi || !authApi.requestPhoneVerification || !authApi.login || !memberApi || !memberApi.getMe) {
                await showAccountAlert('로그인 인증 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }

            clearFieldState(phone.closest('.sub-form-group'));
            requesting = true;
            requestButton.disabled = true;
            resendButton.disabled = true;
            try {
                if (isDevBypassLogin(digits)) {
                    requestButton.setAttribute('aria-busy', 'true');
                    await completeLogin({
                        verificationToken: devBypassToken,
                        phoneNumber: formatPhoneNumber(digits)
                    }, keepPhone.checked);
                    return;
                }

                var response = await authApi.requestPhoneVerification(digits, 'LOGIN');
                verificationId = String(response && response.verificationId || '');
                if (!verificationId) throw new Error('인증 요청 정보를 확인할 수 없습니다.');
                code.disabled = false;
                code.value = '';
                status.hidden = true;
                status.className = 'sub-account-code-status';
                status.textContent = '';
                codeGroup.classList.remove('is-error', 'is-verified');
                submitButton.disabled = true;
                showStep('code');
                startTimer(response.expiresIn);
            } catch (error) {
                if (isDevBypassLogin(digits)) {
                    authApi.clearTokens();
                    window.localStorage.removeItem('hunter.member');
                    window.sessionStorage.removeItem('hunter.member');
                }
                await showAccountAlert(error && error.message ? error.message : '인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
                requesting = false;
                requestButton.disabled = false;
                requestButton.removeAttribute('aria-busy');
                resendButton.disabled = false;
            }
        }

        requestButton.addEventListener('click', requestLoginCode);
        resendButton.addEventListener('click', requestLoginCode);

        backButton.addEventListener('click', function () {
            window.clearInterval(timerId);
            verificationId = '';
            showStep('phone');
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (submitButton.disabled || loggingIn || code.value.length !== 6 || !verificationId) return;
            if (!authApi || !authApi.confirmPhoneVerification || !authApi.login || !memberApi || !memberApi.getMe) return;

            loggingIn = true;
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
            try {
                var confirmation = await authApi.confirmPhoneVerification(verificationId, code.value);
                if (!confirmation || !confirmation.verificationToken) throw new Error('휴대전화 인증 정보를 확인할 수 없습니다.');
                window.clearInterval(timerId);
                status.hidden = false;
                status.className = 'sub-account-code-status is-success';
                status.textContent = '인증되었습니다.';
                codeGroup.classList.remove('is-error');
                codeGroup.classList.add('is-verified');

                await completeLogin({ verificationToken: confirmation.verificationToken }, keepCode.checked);
            } catch (error) {
                if (window.HunterAPI && window.HunterAPI.auth) window.HunterAPI.auth.clearTokens();
                status.hidden = false;
                status.className = 'sub-account-code-status is-error';
                status.textContent = error && error.message ? error.message : '로그인에 실패했습니다.';
                codeGroup.classList.add('is-error');
                codeGroup.classList.remove('is-verified');
                code.focus();
                code.select();
                loggingIn = false;
                submitButton.disabled = code.value.length !== 6 || remainingSeconds <= 0;
                submitButton.removeAttribute('aria-busy');
            }
        });
    }

    function initJoinSubmit() {
        var form = document.getElementById('join-form');
        if (!form) return;
        var submitButton = form.querySelector('[type="submit"]');
        var api = window.HunterFrontAPI && window.HunterFrontAPI.members;
        var submitting = false;

        form.addEventListener('submit', async function (event) {
            if (event.defaultPrevented) return;
            event.preventDefault();

            if (!validateUploadedFile()) {
                return;
            }

            if (!api || !api.create) {
                await showAccountAlert('회원가입 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }

            if (submitting) return;
            submitting = true;
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');

            var businessType = form.querySelector('input[name="businessType"]:checked').value;
            var payload = new FormData();
            payload.append('memberName', form.elements.name.value.trim());
            payload.append('phoneNumber', form.elements.phone.value.trim());
            payload.append('verificationToken', document.getElementById('phone-authenticated').value);
            payload.append('agreeTerms', String(form.elements.agreeTerms.checked));
            payload.append('agreePrivacy', String(form.elements.agreePrivacy.checked));
            payload.append('agreeMarketing', String(form.elements.agreeMarketing.checked));
            payload.append('businessType', businessType === 'corporation' ? 'CORPORATION' : 'SOLE_PROPRIETOR');
            payload.append('businessNumber', form.elements.businessNumber.value.trim());
            if (businessType === 'corporation') {
                payload.append('corporationNumber', form.elements.corporationNumber.value.trim());
            }
            payload.append('businessName', form.elements.businessName.value.trim());
            payload.append('openingDate', form.elements.openingDate.value);
            payload.append('representativeName', form.elements.representativeName.value.trim());
            payload.append('postalCode', form.elements.postalCode.value);
            payload.append('businessAddress', form.elements.businessAddress.value.trim());
            payload.append('businessAddressDetail', form.elements.businessAddressDetail.value.trim());
            payload.append('businessFile', form.elements.businessFile.files[0]);

            try {
                await api.create(payload);
                sessionStorage.setItem('joinUserName', form.elements.name.value.trim());
                window.location.href = '/account/join-complete.html';
            } catch (error) {
                await showAccountAlert(error && error.message ? error.message : '회원가입 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
                submitting = false;
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
            }
        });
    }

    async function showAccountAlert(message) {
        if (window.HunterAlert && window.HunterAlert.open) {
            return window.HunterAlert.open({ message: message });
        }
        window.alert(message);
        return true;
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
        var fileGuide = document.getElementById('business-file-guide');

        if (!radios.length || !corporationField || !corporationInput) return;

        function update() {
            var checked = document.querySelector('input[name="businessType"]:checked');
            var isCorporation = checked && checked.value === 'corporation';

            corporationField.classList.toggle('is-hidden', !isCorporation);
            corporationInput.disabled = !isCorporation;

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
        var businessNumber = document.getElementById('business-number');
        var businessAuth = document.getElementById('business-authenticated');
        var businessStatus = document.getElementById('business-auth-status');
        var openingDate = document.getElementById('opening-date');
        var representativeName = document.getElementById('representative-name');
        var businessName = document.getElementById('business-name');
        var corporationNumber = document.getElementById('corporation-number');
        var businessAddress = document.getElementById('business-address');
        var serviceKey = 'c43099117f7a32bacb563e8aad7893df567f7d7a426d94b4ef94bd3f97e7a711';
        var apiBaseUrl = 'https://api.odcloud.kr/api/nts-businessman/v1';

        if (businessButton && businessNumber && businessAuth) {
            businessButton.addEventListener('businessInfoMismatch', function () {
                window.HunterAlert?.open({
                    message: '입력하신 사업자 정보가 맞지 않습니다.\n다시 한번 확인해 주세요.'
                });
            });
            function resetBusinessAuthentication() {
                if (!businessAuth.value) return;
                businessAuth.value = '';
                businessAuth.dispatchEvent(new Event('change', { bubbles: true }));
                businessButton.textContent = '사업자 인증';
                businessButton.disabled = false;
                businessButton.classList.remove('is-complete');
                if (businessStatus) {
                    businessStatus.hidden = true;
                    businessStatus.className = 'sub-account-code-status';
                    businessStatus.textContent = '';
                }
            }

            function showBusinessMismatch() {
                return showAccountAlert('입력하신 사업자 정보가 맞지 않습니다.\n다시 한번 확인해 주세요.');
            }

            businessButton.addEventListener('click', async function () {
                var number = businessNumber.value.replace(/\D/g, '');
                var selectedType = document.querySelector('input[name="businessType"]:checked');
                var isCorporation = selectedType && selectedType.value === 'corporation';

                if (number.length !== 10) {
                    setFieldError(businessNumber.closest('.sub-form-group'), '10자리 사업자등록번호를 입력해 주세요.');
                    businessStatus.hidden = true;
                    businessStatus.className = 'sub-account-code-status';
                    businessStatus.textContent = '';
                    businessNumber.focus();
                    return;
                }

                if (!openingDate.value || !representativeName.value.trim() || !businessName.value.trim()) {
                    await showAccountAlert('개업일, 기업/사업체명, 대표자명을 먼저 입력해 주세요.');
                    (!businessName.value.trim() ? businessName : !openingDate.value ? openingDate : representativeName).focus();
                    return;
                }

                var corporationDigits = corporationNumber.value.replace(/\D/g, '');
                if (isCorporation && corporationDigits.length !== 13) {
                    setFieldError(corporationNumber.closest('.sub-form-group'), '13자리 법인등록번호를 입력해 주세요.');
                    corporationNumber.focus();
                    return;
                }

                clearFieldState(businessNumber.closest('.sub-form-group'));
                businessButton.disabled = true;
                businessButton.textContent = '인증 중';

                var validationBody = {
                    businesses: [{
                        b_no: number,
                        start_dt: openingDate.value.replace(/\D/g, ''),
                        p_nm: representativeName.value.trim(),
                        b_nm: businessName.value.trim(),
                        corp_no: isCorporation ? corporationDigits : '',
                        b_sector: '',
                        b_type: '',
                        b_adr: businessAddress.value.trim()
                    }]
                };
                var requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
                };

                try {
                    var responses = await Promise.all([
                        fetch(apiBaseUrl + '/validate?serviceKey=' + encodeURIComponent(serviceKey), Object.assign({}, requestOptions, {
                            body: JSON.stringify(validationBody)
                        })),
                        fetch(apiBaseUrl + '/status?serviceKey=' + encodeURIComponent(serviceKey), Object.assign({}, requestOptions, {
                            body: JSON.stringify({ b_no: [number] })
                        }))
                    ]);
                    var payloads = await Promise.all(responses.map(function (response) { return response.json(); }));
                    if (!responses[0].ok || !responses[1].ok) throw new Error('사업자 정보를 확인하지 못했습니다.');

                    var validation = payloads[0] && payloads[0].data && payloads[0].data[0];
                    var statusResult = payloads[1] && payloads[1].data && payloads[1].data[0];
                    if (!validation || validation.valid !== '01' || !statusResult || statusResult.b_stt_cd !== '01') {
                        resetBusinessAuthentication();
                        await showBusinessMismatch();
                        return;
                    }

                    markAuthenticated('business-authenticated', businessButton, 'business-auth-status', '사업자 인증이 완료되었습니다.');
                } catch (error) {
                    resetBusinessAuthentication();
                    await showAccountAlert(error && error.message ? error.message : '사업자 인증 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
                } finally {
                    if (!businessAuth.value) {
                        businessButton.disabled = false;
                        businessButton.textContent = '사업자 인증';
                    }
                }
            });

            businessNumber.addEventListener('input', function () {
                resetBusinessAuthentication();
            });
            [openingDate, representativeName, businessName, corporationNumber, businessAddress].forEach(function (field) {
                field.addEventListener('input', resetBusinessAuthentication);
                field.addEventListener('change', resetBusinessAuthentication);
            });
            document.querySelectorAll('input[name="businessType"]').forEach(function (radio) {
                radio.addEventListener('change', resetBusinessAuthentication);
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
        var verificationId = '';
        var authApi = window.HunterFrontAPI && window.HunterFrontAPI.auth;

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
            verificationId = '';
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

        function startTimer(seconds) {
            stopTimer();
            remainingSeconds = Number(seconds) || 599;
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

        async function requestCode() {
            var numbers = phone.value.replace(/\D/g, '');
            if (numbers.length < 10 || numbers.length > 11) {
                setFieldError(group, '올바른 휴대전화번호를 입력해 주세요.');
                phone.focus();
                return;
            }

            if (!authApi || !authApi.requestPhoneVerification) {
                await showAccountAlert('SMS 인증 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }

            clearFieldState(group);
            requestButton.disabled = true;
            resend.disabled = true;
            try {
                var response = await authApi.requestPhoneVerification(phone.value.trim());
                verificationId = String(response && response.verificationId || '');
                if (!verificationId) throw new Error('인증 요청 정보를 확인할 수 없습니다.');
                requestedPhone = numbers;
                authenticated.value = '';
                authenticated.dispatchEvent(new Event('change', { bubbles: true }));
                codeArea.hidden = false;
                code.disabled = false;
                code.value = '';
                confirmButton.disabled = true;
                requestButton.textContent = '코드 요청';
                resend.hidden = false;
                group.classList.remove('is-verified');
                setStatus('', '');
                startTimer(response.expiresIn || response.expiresInSeconds);
                code.focus();
            } catch (error) {
                setStatus('error', error && error.message ? error.message : '인증번호 발송에 실패했습니다.');
            } finally {
                requestButton.disabled = false;
                resend.disabled = false;
            }
        }

        async function verifyCode() {
            if (code.value.length !== 6 || remainingSeconds <= 0) return;
            if (!verificationId || !authApi || !authApi.confirmPhoneVerification) return;

            confirmButton.disabled = true;
            try {
                var response = await authApi.confirmPhoneVerification(verificationId, code.value);
                var token = response && response.verificationToken;
                if (!token) throw new Error('인증 완료 정보를 확인할 수 없습니다.');
                stopTimer();
                authenticated.value = token;
                authenticated.dispatchEvent(new Event('change', { bubbles: true }));
                code.disabled = true;
                resend.hidden = true;
                group.classList.add('is-verified');
                clearFieldState(group);
                setStatus('success', '인증되었습니다.');
            } catch (error) {
                setStatus('error', error && error.message ? error.message : '인증번호가 틀립니다.');
                code.focus();
                code.select();
                confirmButton.disabled = false;
            }
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
        button.disabled = true;
        button.classList.add('is-complete');
        if (status) {
            status.hidden = false;
            status.className = 'sub-account-code-status is-success';
            status.textContent = message;
        }
    }

    function initAddressSearch() {
        var button = document.getElementById('address-search-button');
        var address = document.getElementById('business-address');
        var postalCode = document.getElementById('postal-code');
        var detail = document.getElementById('business-address-detail');
        if (!button || !address || !postalCode) return;

        function openPostcode() {
            if (!window.daum || !window.daum.Postcode) {
                showAccountAlert('주소 검색 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }

            new window.daum.Postcode({
                oncomplete: function (data) {
                    postalCode.value = data.zonecode || '';
                    address.value = data.roadAddress || data.jibunAddress || '';
                    postalCode.dispatchEvent(new Event('change', { bubbles: true }));
                    address.dispatchEvent(new Event('input', { bubbles: true }));
                    address.dispatchEvent(new Event('change', { bubbles: true }));
                    clearFieldState(address.closest('.sub-form-group'));
                    detail.focus();
                }
            }).open();
        }

        button.addEventListener('click', openPostcode);
        address.addEventListener('click', openPostcode);
        address.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openPostcode();
        });
    }

    function initPlaceholderLinks() {
        document.querySelectorAll('.sub-account-view-link').forEach(function (link) {
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
