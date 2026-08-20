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
            }
        }),
        member: Object.freeze({
            getMe: function () { return client.get('/api/v1/me'); }
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
                return client.get('/api/v1/contents', { query: params || {}, auth: false });
            },
            getDetail: function (contentId) {
                return client.get('/api/v1/contents/' + encodeURIComponent(contentId), { auth: false });
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
