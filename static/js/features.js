// static/js/features.js

document.addEventListener("DOMContentLoaded", () => {
    const featuresLink = document.querySelector('nav a[data-shows="content-list-features"]');
    if (featuresLink) {
        featuresLink.addEventListener("click", () => {
            loadFeaturesTable("features-table-container");
        });
    }
});

async function loadFeaturesTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p style="color: var(--neon-cyan); font-style: italic;">Decrypting and Alphabetizing...</p>';

    try {
        const response = await fetch("/api/features_description");
        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.details || `HTTP Error ${response.status}`);
        }

        let data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<p style="color: #888;">No data found.</p>';
            return;
        }

        // ZUSÄTZLICHE SICHERHEIT: Alphabetische Sortierung im Frontend
        data.sort((a, b) => a.feature_name.localeCompare(b.feature_name));

        container.innerHTML = ""; // Container leeren

        let html = `
            <table class="character-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="width: 25%; color: var(--neon-magenta); text-align: left; border-bottom: 2px solid var(--neon-magenta); padding: 10px;">Feature (A-Z)</th>
                        <th style="color: var(--neon-magenta); text-align: left; border-bottom: 2px solid var(--neon-magenta); padding: 10px;">Description</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(item => {
            html += `
                <tr>
                    <td style="font-weight: bold; color: var(--neon-cyan); vertical-align: top; padding: 12px; border-bottom: 1px solid rgba(0, 243, 255, 0.1);">
                        ${item.feature_name}
                    </td>
                    <td style="color: var(--text-primary); line-height: 1.6; padding: 12px; border-bottom: 1px solid rgba(0, 243, 255, 0.1);">
                        ${item.description}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (err) {
        console.error("Critical Failure:", err);
        container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
}