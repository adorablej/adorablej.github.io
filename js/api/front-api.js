(function (window) {
    'use strict';

    var client = window.HunterAPI;
    if (!client) throw new Error('HunterAPI를 먼저 불러와야 합니다.');

    window.HunterFrontAPI = Object.freeze({
        auth: Object.freeze({
            login: function (credentials, remember) {
                return client.post('/api/v1/auth/login', credentials, { auth: false }).then(function (tokens) {
                    client.auth.setTokens(tokens, remember);
                    return tokens;
                });
            },
            refresh: function () {
                var remember = Boolean(window.localStorage.getItem(window.HunterAPIConfig.tokenKeys.refresh));
                return client.post('/api/v1/auth/token', {
                    refreshToken: client.auth.getRefreshToken()
                }, { auth: false }).then(function (tokens) {
                    client.auth.setTokens(tokens, remember);
                    return tokens;
                });
            },
            logout: function () {
                var refreshToken = client.auth.getRefreshToken();
                return client.post('/api/v1/auth/logout', null, {
                    headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : {}
                }).finally(function () { client.auth.clearTokens(); });
            },
            requestPhoneVerification: function (phoneNumber, purpose) {
                return client.post('/api/v1/auth/phone-verifications', {
                    phoneNumber: phoneNumber,
                    purpose: purpose
                }, { auth: false });
            },
            confirmPhoneVerification: function (verificationId, verificationCode) {
                return client.post('/api/v1/auth/phone-verifications/' + encodeURIComponent(verificationId) + '/confirm', {
                    code: verificationCode
                }, { auth: false });
            }
        }),
        members: Object.freeze({
            create: function (formData) {
                return client.post('/api/v1/members', formData, { auth: false });
            }
        }),
        member: Object.freeze({
            getMe: function () { return client.get('/api/v1/me'); },
            getProfile: function () { return client.get('/api/v1/me/profile'); },
            getProducts: function (params) {
                return client.get('/api/v1/me/products', { query: params || {} });
            },
            getOrders: function (params) {
                return client.get('/api/v1/me/orders', { query: params || {} });
            },
            getTrainingApplications: function (params) {
                return client.get('/api/v1/me/training-applications', { query: params || {} });
            },
            withdraw: function () {
                return client.post('/api/v1/me/withdrawal');
            },
            getNotifications: function (params) {
                return client.get('/api/v1/me/notifications', { query: params || {}, raw: true });
            },
            readNotifications: function (notificationIds, readAll) {
                return client.patch('/api/v1/me/notifications/read-status', {
                    notificationIds: notificationIds || [],
                    readAll: Boolean(readAll)
                });
            }
        }),
        prideStores: Object.freeze({
            getList: function (params) {
                return client.get('/api/v1/pride-stores', { query: params || {}, auth: false });
            }
        }),
        fieldReviews: Object.freeze({
            getList: function (params) {
                return client.get('/api/v1/field-reviews', { query: params || {}, auth: false });
            }
        }),
        contents: Object.freeze({
            getList: function (params) {
                return client.get('/api/v1/contents', { query: params || {}, auth: false, raw: true });
            },
            getDetail: function (contentId) {
                return client.get('/api/v1/contents/' + encodeURIComponent(contentId), { auth: false });
            }
        }),
        eog: Object.freeze({
            getCategories: function () {
                return client.get('/api/v1/eog-categories', { auth: false });
            },
            getCategory: function (categoryKey) {
                return client.get('/api/v1/eog-categories/' + encodeURIComponent(categoryKey), { auth: false });
            }
        }),
        training: Object.freeze({
            getSchedules: function (params) {
                return client.get('/api/v1/training-schedules', { query: params || {}, raw: true });
            },
            getSchedule: function (scheduleId) {
                return client.get('/api/v1/training-schedules/' + encodeURIComponent(scheduleId));
            },
            apply: function (scheduleId) {
                return client.post('/api/v1/training-schedules/' + encodeURIComponent(scheduleId) + '/applications/actions', {
                    action: 'APPLY'
                });
            }
        }),
        vehicles: Object.freeze({
            getCatalog: function () {
                return client.get('/api/v1/vehicle-catalog', { auth: false });
            },
            getSpecifications: function (params) {
                return client.get('/api/v1/vehicle-specs', { query: params || {}, auth: false });
            },
            createSpecificationRequest: function (payload) {
                return client.post('/api/v1/vehicle-spec-requests', payload, { auth: false });
            }
        }),
        search: Object.freeze({
            getResults: function (params) {
                return client.get('/api/v1/search', { query: params || {}, auth: false, raw: true });
            },
            getRecommendations: function () {
                return client.get('/api/v1/search/recommendations', { auth: false });
            }
        }),
        popups: Object.freeze({
            getActive: function () {
                return client.get('/api/v1/popups', { auth: false });
            }
        }),
        csRequests: Object.freeze({
            create: function (payload) {
                // 로그인 상태면 Authorization 헤더가 자동으로 포함되고,
                // 비회원이면 헤더 없이 같은 엔드포인트를 호출합니다.
                return client.post('/api/v1/me/cs-requests', payload);
            }
        })
    });
})(window);
