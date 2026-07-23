const operationGuideData = {
    manual: [
        {
            title: "WinAlign®",
            items: [
                { title: "WinAlign® Quick Start Guide", url: "#" },
                { title: "WinAlign® Operations Manual", url: "#" },
                { title: "WinAlign® CE Operations Manual (International)", url: "#" },
                { title: "WinAlign® and ADASLink® Quick Start Guide", url: "#" }
            ]
        },
        {
            title: "WinAlign® Heavy-Duty",
            items: [
                { title: "WinAlign® HD Operations Manual", url: "#" },
                { title: "WinAlign® HD CE Operations Manual (International)", url: "#" }
            ]
        },
        {
            title: "ProAlign® 2",
            items: [
                { title: "ProAlign® 2 Quick Start Guide (English International)", url: "#" },
                { title: "ProAlign® 2 Operations Manual", url: "#" },
                { title: "ProAlign® 2 CE Operations Manual (International)", url: "#" }
            ]
        },
        {
            title: "ProAlign® 2 Heavy-Duty",
            items: [
                { title: "ProAlign® 2 HD Operations Manual", url: "#" },
                { title: "ProAlign® 2 HD CE Operations Manual (International)", url: "#" }
            ]
        },
        {
            title: "Other documents",
            items: [
                { title: "End User License Agreement", url: "#" }
            ]
        }
    ],
    video: []
};

function initOperationGuide() {
    const guideContent = document.querySelector("#sub-guide-content");
    const guideHeading = document.querySelector("#sub-guide-heading");
    const guideTabs = document.querySelectorAll("[data-guide-tab]");

    if (!guideContent || !guideHeading || !guideTabs.length) return;

    function renderGuide(type) {
        const groups = operationGuideData[type] || [];
        const label = type === "manual" ? "Manual" : "Video";

        guideHeading.innerHTML = `${label}<span>.</span>`;

        if (!groups.length) {
            guideContent.innerHTML = `<p class="sub-guide-empty">등록된 ${label.toLowerCase()} 자료가 없습니다.</p>`;
            return;
        }

        guideContent.innerHTML = groups.map(group => `
            <section class="sub-guide-group">
                <h4 class="sub-guide-group-title">${group.title}</h4>
                <ul class="sub-guide-list">
                    ${group.items.map(item => `
                        <li class="sub-guide-item">
                            <span class="sub-guide-item-title">${item.title}</span>
                            <a class="sub-guide-view" href="${item.url}" aria-label="View ${item.title}"
                                <span>view</span>
                            </a>
                        </li>
                    `).join("")}
                </ul>
            </section>
        `).join("");
    }

    guideTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const type = tab.dataset.guideTab;

            guideTabs.forEach(item => {
                const isActive = item === tab;
                item.classList.toggle("is-active", isActive);
                item.setAttribute("aria-selected", String(isActive));
            });

            renderGuide(type);
        });
    });

    renderGuide("manual");
}

document.addEventListener("DOMContentLoaded", initOperationGuide);
