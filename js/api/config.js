(function (window) {
    'use strict';

    window.HunterAPIConfig = Object.freeze({
        // 개발계 Swagger: http://115.68.192.132:8080/swagger-ui/index.html
        baseUrl: 'http://115.68.192.132:8080',
        timeout: 15000,
        tokenKeys: Object.freeze({
            access: 'hunter.accessToken',
            refresh: 'hunter.refreshToken'
        })
    });
})(window);
