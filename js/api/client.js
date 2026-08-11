(function (window) {
    'use strict';

    var config = window.HunterAPIConfig;

    if (!config) throw new Error('HunterAPIConfig를 먼저 불러와야 합니다.');

    function APIError(message, options) {
        options = options || {};
        this.name = 'APIError';
        this.message = message || 'API 요청 중 오류가 발생했습니다.';
        this.status = options.status || 0;
        this.code = options.code || '';
        this.details = options.details || [];
        this.traceId = options.traceId || '';
        this.response = options.response || null;
    }
    APIError.prototype = Object.create(Error.prototype);
    APIError.prototype.constructor = APIError;

    function getStorage(remember) {
        return remember ? window.localStorage : window.sessionStorage;
    }

    function readToken(key) {
        return window.sessionStorage.getItem(key) || window.localStorage.getItem(key) || '';
    }

    function setTokens(tokens, remember) {
        tokens = tokens || {};
        clearTokens();
        var storage = getStorage(Boolean(remember));
        if (tokens.accessToken) storage.setItem(config.tokenKeys.access, tokens.accessToken);
        if (tokens.refreshToken) storage.setItem(config.tokenKeys.refresh, tokens.refreshToken);
    }

    function clearTokens() {
        [window.localStorage, window.sessionStorage].forEach(function (storage) {
            storage.removeItem(config.tokenKeys.access);
            storage.removeItem(config.tokenKeys.refresh);
        });
    }

    function buildUrl(path, query) {
        var absolute = /^https?:\/\//i.test(path);
        var url = new URL(absolute ? path : config.baseUrl + path, window.location.origin);

        Object.keys(query || {}).forEach(function (key) {
            var value = query[key];
            if (value === undefined || value === null || value === '') return;
            if (Array.isArray(value)) {
                value.forEach(function (item) { url.searchParams.append(key, item); });
            } else {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }

    async function request(path, options) {
        options = options || {};
        var controller = new AbortController();
        var timeoutId = window.setTimeout(function () { controller.abort(); }, options.timeout || config.timeout);
        var headers = new Headers(options.headers || {});
        var accessToken = readToken(config.tokenKeys.access);
        var body = options.body;

        headers.set('Accept', 'application/json');
        if (accessToken && options.auth !== false) headers.set('Authorization', 'Bearer ' + accessToken);
        if (body != null && !(body instanceof FormData) && typeof body !== 'string') {
            headers.set('Content-Type', 'application/json');
            body = JSON.stringify(body);
        }

        try {
            var response = await window.fetch(buildUrl(path, options.query), {
                method: options.method || 'GET',
                headers: headers,
                body: body,
                signal: controller.signal
            });
            var contentType = response.headers.get('content-type') || '';
            var payload = contentType.includes('json') ? await response.json() : await response.text();

            if (!response.ok || (payload && payload.success === false)) {
                var apiError = payload && payload.error ? payload.error : {};
                throw new APIError(apiError.message || '요청을 처리하지 못했습니다. (' + response.status + ')', {
                    status: response.status,
                    code: apiError.code,
                    details: apiError.details,
                    traceId: payload && payload.traceId,
                    response: payload
                });
            }

            // 공통 ApiResponse 형식이면 data만, 파일·문자열 등은 원문을 반환합니다.
            return payload && Object.prototype.hasOwnProperty.call(payload, 'success') ? payload.data : payload;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new APIError('요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.', { code: 'TIMEOUT' });
            }
            if (error instanceof APIError) throw error;
            throw new APIError('서버에 연결할 수 없습니다.', { code: 'NETWORK_ERROR' });
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    window.HunterAPI = Object.freeze({
        request: request,
        get: function (path, options) { return request(path, options); },
        post: function (path, body, options) { return request(path, Object.assign({}, options, { method: 'POST', body: body })); },
        put: function (path, body, options) { return request(path, Object.assign({}, options, { method: 'PUT', body: body })); },
        patch: function (path, body, options) { return request(path, Object.assign({}, options, { method: 'PATCH', body: body })); },
        delete: function (path, options) { return request(path, Object.assign({}, options, { method: 'DELETE' })); },
        auth: Object.freeze({
            getAccessToken: function () { return readToken(config.tokenKeys.access); },
            getRefreshToken: function () { return readToken(config.tokenKeys.refresh); },
            setTokens: setTokens,
            clearTokens: clearTokens
        }),
        APIError: APIError
    });
})(window);
