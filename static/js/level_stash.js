// static/js/level_stash.js

// Diese Funktion wird aufgerufen, wenn man auf den Tab klickt (müssen wir noch verknüpfen)
// oder manuell über den Refresh Button.
window.loadStashData = async function() {
    const charId = window.currentLevelCharId;
    if (!charId) return;

    const container = document.getElementById("stash-table-container");
    container.innerHTML = '<p style="color: cyan;">Loading Inventory...</p>';

    try {
        const response = await fetch(`/api/character/${charId}/stash/list`);
        if (!response.ok) throw new Error("Failed to load stash");
        
        const items = await response.json();
        renderStashTable(items);

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color: red;">Error loading stash.</p>';
    }
};

function renderStashTable(items) {
    const container = document.getElementById("stash-table-container");
    
    if (!items || items.length === 0) {
        container.innerHTML = "<p>Stash is empty.</p>";
        return;
    }

    let html = `
    <table class="character-table" style="width: 100%;">
        <thead>
            <tr>
                <th style="width: 45%;">Item</th>
                <th style="width: 15%;">Qty</th>
                <th style="width: 20%;">Value (Unit)</th>
                <th style="width: 20%; text-align: center;">Action</th>
            </tr>
        </thead>
        <tbody>`;

    items.forEach(item => {
        // Safe Name für HTML
        const safeName = item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

        html += `
        <tr>
            <td>
                <strong style="color: #fff;">${item.name}</strong><br>
                <span style="font-size: 0.8em; color: #aaa;">${item.category || 'Item'}</span>
            </td>
            <td style="font-size: 1.1em; color: #fff;">
                x${item.quantity}
            </td>
            <td style="color: #ffff00;">
                ${item.price} ¥
            </td>
            <td style="text-align: center;">
                <button class="lvl-btn lvl-btn-minus" 
                        style="width: auto; padding: 4px 10px; border-color: #ff4444; color: #ff4444;"
                        onclick="sellItem(${item.item_id}, 1, '${safeName}')"
                        title="Sell 1 Item">
                    Sell 1
                </button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

window.sellItem = async function(itemId, qty, itemName) {
    if (!window.currentLevelCharId) return;

    // Optional: Sicherheitsabfrage
    // if (!confirm(`Sell 1x ${itemName}?`)) return;

    try {
        const response = await fetch(`/api/character/${window.currentLevelCharId}/stash/sell`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item_id: itemId,
                qty: qty
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Error: " + (data.error || "Could not sell item"));
            return;
        }

        // Erfolg!
        
        // 1. Geld im Header updaten
        if (window.setText) {
            window.setText("level-money-display", data.new_money);
        }

        // 2. Tabelle neu laden (damit die Anzahl sinkt oder das Item verschwindet)
        loadStashData();

    } catch (err) {
        console.error("Sell error:", err);
    }
};