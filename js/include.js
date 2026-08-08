document.addEventListener("DOMContentLoaded", async () => {
    const targets = document.querySelectorAll("[data-include]");

    await Promise.all(
        [...targets].map(async target => {
            const path = target.dataset.include;

            try {
                const response = await fetch(path);

                if (!response.ok) {
                    throw new Error(`${path} 로드 실패 : ${response.status}`);
                }

                const html = await response.text();
                const selector = target.dataset.includeSelector;

                if (!selector) {
                    target.innerHTML = html;
                    return;
                }

                const documentFragment = new DOMParser().parseFromString(
                    html,
                    "text/html"
                );
                const source = documentFragment.querySelector(selector);

                if (!source) {
                    throw new Error(`${path}에서 ${selector}를 찾을 수 없습니다.`);
                }

                if (target.dataset.includeMode === "replace") {
                    target.replaceWith(source);
                    return;
                }

                target.innerHTML = source.innerHTML;
            } catch (error) {
                console.error(error);
            }
        })
    );

    window.dispatchEvent(new CustomEvent("includeLoaded"));
});
