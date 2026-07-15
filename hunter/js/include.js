document.addEventListener("DOMContentLoaded", async () => {

    const root =
        window.location.pathname.includes("/pages/")
            ? "../"
            : "./";

    const targets = [
        ...document.querySelectorAll("[data-include]")
    ];

    await Promise.all(
        targets.map(async (target) => {

            const path = root + target.dataset.include.replace(/^(\.\/|\.\.\/)+/, "");

            try {

                const response = await fetch(path);

                if (!response.ok) {
                    throw new Error(`${path} 로드 실패 : ${response.status}`);
                }

                target.innerHTML = await response.text();

            } catch (error) {
                console.error(error);
            }

        })
    );

    window.dispatchEvent(
        new CustomEvent("includeLoaded")
    );

});