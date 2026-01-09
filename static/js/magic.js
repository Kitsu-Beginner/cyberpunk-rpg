// static/js/magic.js

document.addEventListener("DOMContentLoaded", () => {
    const magicLink = document.querySelector('nav a[data-shows="content-list-magic"]');
    if (magicLink) {
        magicLink.addEventListener("click", () => {
            loadSpellsTable("magic-table-container");
        });
    }
});

async function loadSpellsTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p style="color: var(--neon-cyan); font-style: italic;">Accessing Arcane Archives...</p>';

    try {
        const response = await fetch("/api/spells");
        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.details || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<p style="color: #888;">No spells found.</p>';
            return;
        }

        container.innerHTML = ""; // Container leeren

        const table = document.createElement("table");
        table.className = "magic-spell-table"; // Eigene Klasse für das neue Design
        table.style.width = "100%";
        table.style.borderCollapse = "separate";
        table.style.borderSpacing = "0 15px"; // Abstand zwischen den Zauber-Blöcken

        data.forEach(spell => {
            const spellBody = document.createElement("tbody");
            spellBody.className = "spell-block";

            // Zeile 1: Technische Werte
            const statsRow = document.createElement("tr");
            statsRow.className = "spell-stats-row";
            statsRow.innerHTML = `
                <td style="width: 25%; font-weight: bold; color: var(--neon-cyan); font-size: 1.2rem;">${spell.name}</td>
                <td title="Action Cost"><span class="stat-label">AP:</span> ${spell.action_cost}</td>
                <td title="Range"><span class="stat-label">Range:</span> ${spell.range || '-'}</td>
                <td title="Drain Logic"><span class="stat-label">Logic:</span> ${spell.drain_logic}</td>
                <td title="Drain Base"><span class="stat-label">Base:</span> ${spell.drain_base_value}</td>
                <td style="text-align: right;">
                    ${spell.concentration ? '<span style="color: var(--neon-yellow); border: 1px solid var(--neon-yellow); padding: 2px 5px; font-size: 0.7em;">CONCENTRATION</span>' : ''}
                </td>
            `;

            // Zeile 2: Beschreibung (geht über alle Spalten)
            const descRow = document.createElement("tr");
            descRow.className = "spell-desc-row";
            descRow.innerHTML = `
                <td colspan="6" style="padding: 15px; color: var(--text-primary); line-height: 1.6; border-top: 1px solid rgba(255, 0, 255, 0.2);">
                    <div style="color: var(--text-secondary); font-size: 0.85em; margin-bottom: 5px; text-transform: uppercase;">
                        Description & Effect (${spell.specialization || 'General'})
                    </div>
                    ${spell.description}
                </td>
            `;

            spellBody.appendChild(statsRow);
            spellBody.appendChild(descRow);
            table.appendChild(spellBody);
        });

        container.appendChild(table);

    } catch (err) {
        console.error("Spellbook Error:", err);
        container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
}