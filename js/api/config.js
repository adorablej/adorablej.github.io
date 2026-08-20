(function (window) {
    'use strict';

    window.HunterAPIConfig = Object.freeze({
        // 개발계 Swagger: https://api-dev.hunterkorea.com/swagger-ui/index.html
        baseUrl: 'https://api-dev.hunterkorea.com',
        timeout: 15000,
        tokenKeys: Object.freeze({
            access: 'hunter.accessToken',
            refresh: 'hunter.refreshToken'
        })
    });
})(window);
