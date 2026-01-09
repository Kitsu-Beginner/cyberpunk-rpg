// static/js/level_cyberware.js

window.loadCyberwareData = async function() {
    const charId = window.currentLevelCharId;
    if (!charId) return;

    const container = document.getElementById("cyberware-table-container");
    container.innerHTML = '<p style="color: cyan;">Scanning Body...</p>';

    try {
        const response = await fetch(`/api/character/${charId}/level/cyberware`);
        if (!response.ok) throw new Error("Failed to load cyberware");
        
        const items = await response.json();
        renderCyberwareTable(items);

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color: red;">Error loading cyberware.</p>';
    }
};

function renderCyberwareTable(items) {
    const container = document.getElementById("cyberware-table-container");
    
    if (!items || items.length === 0) {
        container.innerHTML = "<p>No cyberware installed (Pure organic).</p>";
        return;
    }

    // Wir bauen die Tabelle mit GENAU denselben Spalten wie im View Modal
    // + eine Spalte für den Sell-Button
    let html = `
    <table class="character-table" style="width: 100%;">
        <thead>
            <tr>
                <th style="width: 10%;">Slot</th>
                <th style="width: 25%;">Name</th>
                <th style="width: 8%; text-align: center;" title="Humanity Loss">HL</th>
                <th style="width: 22%;">Stats</th>
                <th style="width: 25%;">Features</th>
                <th style="width: 10%; text-align: center;">Action</th>
            </tr>
        </thead>
        <tbody>`;

    items.forEach(item => {
        const safeName = item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

        // 1. STATS ZUSAMMENBAUEN (Logik aus character_modal.js übernommen)
        const bonusMap = {
            "STR": item.strength_bonus,
            "AGI": item.agility_bonus,
            "REA": item.reaction_bonus,
            "STA": item.stamina_bonus,
            "INT": item.intuition_bonus,
            "LOG": item.logic_bonus,
            "WIL": item.composure_bonus,
            "CHA": item.charisma_bonus,
            "Armor": item.armor_bonus,
            "Shock": item.shock_absorption,
            "AP": item.action_bonus
        };
        const statsList = [];
        for (const [label, val] of Object.entries(bonusMap)) {
            if (val && val !== 0) {
                const sign = val > 0 ? "+" : "";
                statsList.push(`${label} ${sign}${val}`);
            }
        }
        const statsStr = statsList.join(", ");

        // 2. FEATURES ZUSAMMENBAUEN (Logik aus character_modal.js übernommen)
        let featuresText = "";
        if (Array.isArray(item.features) && item.features.length > 0) {
            featuresText = item.features.join(", ");
        } else if (typeof item.features === 'string' && item.features.length > 0) {
            let clean = item.features.replace(/[{"}\[\]]/g, '');
            featuresText = clean.replace(/,/g, ', ');
        }

        html += `
        <tr>
            <td style="color: #aaa; text-transform: capitalize;">
                ${item.cyberware_type || '-'}
            </td>
            
            <td>
                <strong style="color: #fff;">${item.name}</strong>
            </td>
            
            <td style="color: #ff8888; text-align: center;">
                ${item.humanity_cost || '-'}
            </td>

            <td style="font-size: 0.9em; color: #ddd;">
                ${statsStr}
            </td>

            <td style="font-size: 0.9em; font-style: italic; color: #bbb;">
                ${featuresText}
            </td>

            <td style="text-align: center;">
                <button class="lvl-btn lvl-btn-minus" 
                        style="width: auto; padding: 4px 10px; border-color: #ff4444; color: #ff4444;"
                        onclick="sellCyberware(${item.cyberware_id}, '${safeName}')"
                        title="Sell for ${item.price} ¥">
                    Sell
                </button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

window.sellCyberware = async function(cyberwareId, itemName) {
    if (!window.currentLevelCharId) return;

    if (!confirm(`Remove "${itemName}" and refund money?`)) return;

    try {
        const response = await fetch(`/api/character/${window.currentLevelCharId}/level/cyberware/sell`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cyberware_id: cyberwareId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Error: " + (data.error || "Could not remove cyberware"));
            return;
        }

        if (window.setText) {
            window.setText("level-money-display", data.new_money);
        }

        loadCyberwareData();

    } catch (err) {
        console.error("Sell error:", err);
    }
};