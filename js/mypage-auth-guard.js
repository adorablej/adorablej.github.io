(function () {
    "use strict";

    const storages = [window.sessionStorage, window.localStorage];
    const hasAccessToken = storages.some((storage) => storage.getItem("hunter.accessToken"));
    const hasRefreshToken = storages.some((storage) => storage.getItem("hunter.refreshToken"));

    if (hasAccessToken || hasRefreshToken) return;

    const loginUrl = new URL("/account/login.html", window.location.origin);
    loginUrl.searchParams.set("returnUrl", `${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.location.replace(loginUrl.toString());
})();
