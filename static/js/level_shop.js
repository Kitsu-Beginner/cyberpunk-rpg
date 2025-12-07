// static/js/level_shop.js

// 1. Navigation Logik (Sub-Menus anzeigen)
window.showShopSub = function(category) {
    // Erstmal alle Sub-Bars verstecken
    const allSubs = document.querySelectorAll('.shop-sub-bar');
    allSubs.forEach(el => el.classList.add('hidden'));

    // Dann die gewählte anzeigen
    const target = document.getElementById(`shop-sub-${category}`);
    if (target) {
        target.classList.remove('hidden');
    }
    
    // Optional: Container leeren oder Hinweis anzeigen
    const container = document.getElementById("shop-table-container");
    container.innerHTML = '<p style="color: #888;">Select a sub-category...</p>';
};

// 2. Daten laden (basierend auf Drill-Down Auswahl)
window.loadShopData = async function(mainType, subType) {
    const container = document.getElementById("shop-table-container");
    container.innerHTML = '<p style="color: cyan;">Loading Market Data...</p>';

    let apiUrl = "";
    let dbCategory = "stash"; // 'stash' oder 'cyberware' (für die Kauf-Logik im Backend)

    // URL Bauen basierend auf den Parametern
    if (mainType === 'weapons') {
        // subType ist z.B. 'Pistol', 'SMG' -> Wir nutzen die gefilterte Route
        apiUrl = `/api/weapons_with_items/${encodeURIComponent(subType)}`;
        dbCategory = "stash";
    } 
    else if (mainType === 'ammo') {
        // subType ist 'rounds', 'grenades'
        apiUrl = `/api/ammunition_with_items/${subType}`;
        dbCategory = "stash";
    }
    else if (mainType === 'armor') {
        if (subType === 'armor') apiUrl = "/api/armor_with_items";
        if (subType === 'head') apiUrl = "/api/headware_with_items"; // Falls du diese Route hast
        dbCategory = "stash";
    }
    else if (mainType === 'cyberware') {
        // subType ist 'head', 'torso', etc.
        apiUrl = `/api/cyberware_with_items/${subType}`;
        dbCategory = "cyberware";
    }
    else if (mainType === 'tech') {
        if (subType === 'commlinks') apiUrl = "/api/commlinks";
        if (subType === 'drones') apiUrl = "/api/drones";
        dbCategory = "stash";
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("API Error: " + response.status);
        
        const items = await response.json();
        renderShopTable(items, dbCategory);

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color: red;">Error loading items (Check Console).</p>';
    }
};

// 3. Tabelle Rendern
function renderShopTable(items, dbCategory) {
    const container = document.getElementById("shop-table-container");
    
    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p>No items found in this category.</p>";
        return;
    }

    let html = `
    <table class="character-table" style="width: 100%;">
        <thead>
            <tr>
                <th style="width: 45%;">Item</th>
                <th style="width: 20%;">Price</th>
                <th style="width: 35%; text-align: center;">Action</th>
            </tr>
        </thead>
        <tbody>`;

    items.forEach(item => {
        // ID Mapping Sicherheit
        const realItemId = item.item_id || item.id;
        const price = item.price || 0;
        
        // Features hübsch machen (optional)
        let featuresStr = "";
        if (Array.isArray(item.features)) featuresStr = item.features.join(", ");

        html += `
        <tr>
            <td>
                <div style="font-weight: bold; color: #fff;">${item.name}</div>
                <div style="font-size: 0.8em; color: #aaa;">${item.legality || ''} | Weight: ${item.weight || 0}</div>
                <div style="font-size: 0.75em; color: #888; font-style: italic;">${featuresStr}</div>
            </td>
            <td style="color: #ffff00; font-family: monospace; font-size: 1.1em;">
                ${price} ¥
            </td>
            <td style="text-align: center;">
                <button class="lvl-btn" style="width: auto; padding: 4px 8px; border-color: #00ff00; color: #00ff00;"
                        onclick="buyItem(${realItemId}, 1, '${dbCategory}', '${item.name.replace(/'/g, "\\'")}')">
                    Buy 1
                </button>
                
                ${dbCategory !== 'cyberware' ? `
                <button class="lvl-btn" style="width: auto; padding: 4px 8px; border-color: #00ff00; color: #00ff00; margin-left: 5px;"
                        onclick="buyItem(${realItemId}, 10, '${dbCategory}', '${item.name.replace(/'/g, "\\'")}')">
                    Buy 10
                </button>
                ` : ''}
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// 4. Kaufen (Sendet an Backend)
window.buyItem = async function(itemId, qty, category, itemName) {
    if (!window.currentLevelCharId) return;

    try {
        const response = await fetch(`/api/character/${window.currentLevelCharId}/shop/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item_id: itemId,
                category: category,
                qty: qty
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error === "Not enough Money") {
                alert(`Nicht genug Geld!\nBenötigt: ${data.required}¥\nVorhanden: ${data.current}¥`);
            } else {
                alert("Fehler: " + (data.description || "Unbekannt"));
            }
            return;
        }

        // Erfolg: Geld im Header updaten
        if (window.setText) {
            window.setText("level-money-display", data.new_money);
        }
        
        // Kleines visuelles Feedback (optional: Toast Notification wäre besser)
        console.log(data.message);

    } catch (err) {
        console.error("Buy error:", err);
    }
};