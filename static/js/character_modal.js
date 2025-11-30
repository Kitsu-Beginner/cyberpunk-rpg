// ===============================
// Character Modal - Brute Force
// ===============================

// Called from characters.js when user clicks "View"
function openCharacterModal(characterRow) {
  const modal = document.getElementById("character-modal");
  if (!modal) return;

  // Safety: we need an ID to load full details
  const charId = characterRow.id;
  if (!charId) {
    console.error("No character id in row:", characterRow);
    return;
  }

  // First: fill some header fields from the row if present
  fillCharacterHeaderFromRow(characterRow);

  // Reset all tab buttons and panels to Attributes
  resetCharacterTabsToAttributes();

  // Clear (or reset) boxes if you want; for now we just overwrite later

  // Show the modal immediately (so user sees something)
  modal.classList.remove("hidden");

  // Then fetch full details and fill everything
  fetch("/api/character/" + encodeURIComponent(charId) + "/details")
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then(data => {
      fillCharacterHeaderFromDetails(data);
      fillCharacterAttributes(data);
      fillCharacterDerived(data);
      // Skills / Cyberware / Inventory / Stash will be added later
      loadCharacterSkills(charId, data);

      loadCharacterCyberware(charId);

      loadCharacterInventory(charId);
      loadCharacterStash(charId);

    })
    .catch(err => {
      console.error("Error loading character details:", err);
      // You might want to show an error message somewhere in the modal
    });
}

function closeCharacterModal() {
  const modal = document.getElementById("character-modal");
  if (!modal) return;
  modal.classList.add("hidden");
}

// ===============================
// DOM Ready: wire close + subtabs
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("character-modal-close");
  const modal    = document.getElementById("character-modal");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeCharacterModal();
    });
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      // Click on the dark area closes, click inside content does not
      if (event.target.classList.contains("modal-backdrop")) {
        closeCharacterModal();
      }
    });
  }

  // Internal subtabs (Attributes / Skills / Cyberware / Magic / Inventory / Stash)
  const tabButtons = document.querySelectorAll(".character-tabs .subtab-button");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-char-tab");
      if (!tabName) return;

      // Remove active from all buttons and panels
      tabButtons.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".character-tab-panel").forEach(panel => {
        panel.classList.remove("active");
      });

      // Activate clicked button and its panel
      btn.classList.add("active");
      const panel = document.getElementById("char-tab-" + tabName);
      if (panel) {
        panel.classList.add("active");
      }
    });
  });
});

// ===============================
// Helper: reset tabs to Attributes
// ===============================
function resetCharacterTabsToAttributes() {
  const tabButtons = document.querySelectorAll(".character-tabs .subtab-button");
  const tabPanels  = document.querySelectorAll(".character-tab-panel");

  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabPanels.forEach(panel => panel.classList.remove("active"));

  const defaultBtn   = document.querySelector('.character-tabs .subtab-button[data-char-tab="attributes"]');
  const defaultPanel = document.getElementById("char-tab-attributes");

  if (defaultBtn)   defaultBtn.classList.add("active");
  if (defaultPanel) defaultPanel.classList.add("active");
}

// ===============================
// Header filling (brute force)
// ===============================

// From the row in /api/characters (may not have all fields)
function fillCharacterHeaderFromRow(row) {
  const nameEl     = document.getElementById("char-name-display");
  const classEl    = document.getElementById("char-class-display");
  const playerEl   = document.getElementById("char-player-display");

  if (nameEl)   nameEl.textContent   = row.name       || "";
  if (classEl)  classEl.textContent  = row.char_class || "";
  if (playerEl) playerEl.textContent = row.player     || "";
}

// From /api/character/<id>/details (has all columns)
function fillCharacterHeaderFromDetails(data) {
  const xpEl       = document.getElementById("char-xp-display");
  const moneyEl    = document.getElementById("char-money-display");
  const humanityEl = document.getElementById("char-humanity-display");

  // xp, money, humanity are column names in your characters table
  if (xpEl)       xpEl.textContent       = data.xp       != null ? data.xp       : "";
  if (moneyEl)    moneyEl.textContent    = data.money    != null ? data.money    : "";
  if (humanityEl) humanityEl.textContent = data.humanity != null ? data.humanity : "";
}

// ===============================
// Attributes filling (brute force)
// ===============================
function fillCharacterAttributes(data) {
  // Stamina: 3 boxes → base / value / mod
  setBox("attr-stamina-1", data.stamina_base);
  setBox("attr-stamina-2", data.stamina_mod);
  setBox("attr-stamina-3", data.stamina);

  // Strength
  setBox("attr-strength-1", data.strength_base);
  setBox("attr-strength-2", data.strength_mod);
  setBox("attr-strength-3", data.strength);

  // Agility
  setBox("attr-agility-1", data.agility_base);
  setBox("attr-agility-2", data.agility_mod);
  setBox("attr-agility-3", data.agility);

  // Reaction
  setBox("attr-reaction-1", data.reaction_base);
  setBox("attr-reaction-2", data.reaction_mod);
  setBox("attr-reaction-3", data.reaction);

  // Intuition
  setBox("attr-intuition-1", data.intuition_base);
  setBox("attr-intuition-2", data.intuition_mod);
  setBox("attr-intuition-3", data.intuition);

  // Logic
  setBox("attr-logic-1", data.logic_base);
  setBox("attr-logic-2", data.logic_mod);
  setBox("attr-logic-3", data.logic);

  // Composure
  setBox("attr-composure-1", data.composure_base);
  setBox("attr-composure-2", data.composure_mod);
  setBox("attr-composure-3", data.composure);

  // Charisma
  setBox("attr-charisma-1", data.charisma_base);
  setBox("attr-charisma-2", data.charisma_mod);
  setBox("attr-charisma-3", data.charisma);

  // Humanity: your table has humanity (numeric) and humanity_int, but no base/mod.
  // For brute force we can do e.g. value, int, (leave third empty or same as int).
  setBox("attr-humanity-1", data.humanity_int);
  setBox("attr-humanity-2", data.humanity_int);
  setBox("attr-humanity-3", ""); // or data.humanity_int again if you like
}

// ===============================
// Derived attributes filling
// ===============================
function fillCharacterDerived(data) {
  // Defense Pool, Initiative, Speed, Carry Weight, Armor, ShockArmor, Action Points
  setBox("derived-defense-pool", data.defense_pool);
  setBox("derived-defense-pool-halved", data.agility_intuition);
  setBox("derived-initiative",   data.initiative);
  setBox("derived-speed",        data.speed);
  setBox("derived-carry-weight", data.carry_weight);

  // For "Armor" & "ShockArmor" you said you have armor_total and shock_absorption_total
  setBox("derived-armor",        data.armor_total);
  setBox("derived-shock-armor",  data.shock_absorption_total);

  // You may not have action_points yet; will be blank if undefined
  setBox("derived-action-points", data.action_points);
}


//SKILLS Tabs Funktion---funktioniert noch nicht





async function loadCharacterSkills(characterId, detailsData) {
  console.log("--- START: Loading Skills ---");
  console.log("Character ID:", characterId);
  console.log("Details Data vorhanden?", !!detailsData);

  // 1. Prüfen, ob Slots im HTML gefunden werden
  const slots = document.querySelectorAll(".skill-slot");
  console.log(`HTML Check: ${slots.length} Skill-Slots im Modal gefunden.`);

  if (slots.length === 0) {
    console.warn("WARNUNG: Keine Elemente mit Klasse '.skill-slot' gefunden! HTML-Struktur prüfen.");
    return;
  }

  try {
    // 2. API Abruf
    console.log("Fetching skills from API...");
    const response = await fetch(`/api/character/${encodeURIComponent(characterId)}/skills`);
    
    if (!response.ok) {
      console.error("API Error:", response.status);
      return;
    }
    
    const skillsList = await response.json();
    console.log(`API Check: ${skillsList.length} Skills aus der Datenbank geladen.`);

    // 3. Abgleich & Befüllen
    let matchCount = 0;

    slots.forEach(slot => {
      const nameEl = slot.querySelector(".skill-name");
      if (!nameEl) return;

      const htmlName = nameEl.textContent.trim();
      // Normalisierung für den Vergleich (kleinschreiben, keine Leerzeichen)
      const normalizedHtmlName = htmlName.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');

      // Suchen in der API-Liste
      const skillData = skillsList.find(s => {
        const normalizedApiName = s.skill_name.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
        return normalizedApiName === normalizedHtmlName;
      });

      const boxes = slot.querySelectorAll(".skill-box");

      if (skillData) {
        matchCount++;
        // Daten vorhanden -> Boxen füllen
        const level = skillData.skill_level || 0;
        const attrKey = skillData.linked_attribute_pair; 
        
        // Wert aus detailsData holen (falls vorhanden)
        let attrVal = 0;
        if (detailsData && detailsData[attrKey] !== undefined) {
            attrVal = detailsData[attrKey];
        } else {
            console.warn(`Fehlendes Attribut in detailsData für: ${attrKey}`);
        }

        const pool = level + attrVal;

        // Boxen füllen
        if (boxes.length === 3) {
            boxes[0].textContent = level;
            boxes[1].textContent = attrVal;
            boxes[2].textContent = pool;
            
            // Styling
            boxes[2].style.fontWeight = "bold";
            boxes[2].style.color = "#fff";
        }
      } else {
        // Kein Treffer für diesen Namen
        console.log(`Kein DB-Treffer für HTML-Skill: "${htmlName}" (Norm: ${normalizedHtmlName})`);
      }
    });

    console.log(`--- FERTIG: ${matchCount} von ${slots.length} Slots erfolgreich befüllt. ---`);

  } catch (err) {
    console.error("CRITICAL ERROR in loadCharacterSkills:", err);
  }
}



// ===============================
// Cyberware Loading
// ===============================
async function loadCharacterCyberware(characterId) {
  const tableBody = document.querySelector("#char-cyberware-table tbody");
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5">Loading cyberware...</td></tr>';

  try {
    const response = await fetch(`/api/character/${encodeURIComponent(characterId)}/cyberware`);
    if (!response.ok) throw new Error("HTTP error " + response.status);

    const data = await response.json();
    tableBody.innerHTML = ""; 

    if (!Array.isArray(data) || data.length === 0) {
      // colspan muss jetzt 5 sein, da wir 5 Spalten haben
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No cyberware installed.</td></tr>';
      return;
    }

    data.forEach(item => {
      const row = document.createElement("tr");

      // --- 1. SLOT ---
      const tdSlot = document.createElement("td");
      tdSlot.textContent = item.cyberware_type || "-";
      tdSlot.style.textTransform = "capitalize";
      tdSlot.style.color = "#aaa";
      row.appendChild(tdSlot);

      // --- 2. NAME ---
      const tdName = document.createElement("td");
      tdName.textContent = item.name || "Unknown";
      tdName.style.fontWeight = "bold";
      row.appendChild(tdName);

      // --- 3. HL (Humanity Loss) ---
      const tdHL = document.createElement("td");
      tdHL.textContent = item.humanity_cost || "-";
      tdHL.style.textAlign = "center"; 
      tdHL.style.color = "#ff8888"; // Leicht rötlich, da es Kosten sind
      row.appendChild(tdHL);

      // --- 4. STATS (Nur die numerischen Boni) ---
      const tdStats = document.createElement("td");
      const statsList = [];

      // Mapping der Datenbank-Spalten zu Kürzeln
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

      for (const [label, val] of Object.entries(bonusMap)) {
        if (val && val !== 0) {
          const sign = val > 0 ? "+" : "";
          // Erstellt z.B.: "AGI +1"
          statsList.push(`${label} ${sign}${val}`);
        }
      }
      tdStats.textContent = statsList.join(", ");
      tdStats.style.fontSize = "0.9em";
      row.appendChild(tdStats);

      // --- 5. FEATURES (Textuelle Beschreibungen) ---
      const tdFeatures = document.createElement("td");
      const featuresList = [];
      
      if (Array.isArray(item.features) && item.features.length > 0) {
        item.features.forEach(f => featuresList.push(f));
      } else if (typeof item.features === 'string' && item.features.length > 0) {
        // Falls DB String statt Array liefert (Clean up curly braces)
        featuresList.push(item.features.replace(/[{"}]/g, '')); 
      }
      
      tdFeatures.textContent = featuresList.join(", ");
      tdFeatures.style.fontSize = "0.9em";
      tdFeatures.style.fontStyle = "italic";
      row.appendChild(tdFeatures);

      // Zeile zur Tabelle hinzufügen
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading cyberware:", err);
    tableBody.innerHTML = '<tr><td colspan="5" style="color:red;">Error loading data.</td></tr>';
  }
}


// ===============================
// Inventory & Stash Loading
// ===============================

// Lädt das Inventar
async function loadCharacterInventory(characterId) {
  await loadItemTable(characterId, "inventory", "char-inventory-table");
}

// Lädt den Stash
async function loadCharacterStash(characterId) {
  await loadItemTable(characterId, "stash", "char-stash-table");
}

/**
 * Generische Funktion zum Laden von Item-Listen (Inventory & Stash)
 */
async function loadItemTable(charId, endpointType, tableId) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  if (!tableBody) return;

  // colspan auf 5 erhöht wegen der neuen Spalte
  tableBody.innerHTML = `<tr><td colspan="5">Loading ${endpointType}...</td></tr>`;

  try {
    const response = await fetch(`/api/character/${encodeURIComponent(charId)}/${endpointType}`);
    if (!response.ok) throw new Error("HTTP error " + response.status);

    const data = await response.json();
    tableBody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">${endpointType} is empty.</td></tr>`;
      return;
    }

    data.forEach(item => {
      const row = document.createElement("tr");

      // --- 1. VIEW BUTTON (NEU) ---
      const tdView = document.createElement("td");
      const btnView = document.createElement("button");
      btnView.textContent = "View";
      // Styling direkt hier, damit der Button gut aussieht
      btnView.style.fontSize = "0.8rem";
      btnView.style.padding = "2px 8px";
      btnView.style.cursor = "pointer";
      btnView.style.background = "rgba(0, 243, 255, 0.1)";
      btnView.style.border = "1px solid #00f3ff";
      btnView.style.color = "#00f3ff";
      btnView.style.borderRadius = "4px";

      btnView.addEventListener("click", () => {
        // Pfad für das Bild bauen
        let imagePath = "/static/img/placeholder.png";
        if (item.image_url) {
          imagePath = "/static/img/" + item.image_url;
        }

        // Das Item-Modal über das globale window-Objekt öffnen
        if (window.openItemModal) {
            window.openItemModal({
              name: item.name,
              description: item.description,
              image: imagePath
            });
        } else {
            console.error("openItemModal function not found!");
        }
      });

      tdView.appendChild(btnView);
      row.appendChild(tdView);


      // --- 2. NAME ---
      const tdName = document.createElement("td");
      tdName.textContent = item.name || "Unknown";
      tdName.style.fontWeight = "bold";
      row.appendChild(tdName);

      // --- 3. WEIGHT ---
      const tdWeight = document.createElement("td");
      const singleWeight = parseFloat(item.weight) || 0;
      const totalWeight = (singleWeight * item.quantity).toFixed(1);
      tdWeight.textContent = totalWeight > 0 ? `${totalWeight} kg` : "-";
      row.appendChild(tdWeight);

      // --- 4. FEATURES ---
      const tdFeatures = document.createElement("td");
      let featuresText = "";

      if (Array.isArray(item.features)) {
        // Fall 1: Es ist ein sauberes Array -> Einfach verbinden
        featuresText = item.features.join(", ");
      
      } else if (typeof item.features === 'string' && item.features.length > 0) {
        // Fall 2: Es ist ein String (z.B. "{nightvision,smartlink}" aus Postgres)
        
        // Schritt A: Entferne {, }, [, ] und "
        let clean = item.features.replace(/[{"}\[\]]/g, '');
        
        // Schritt B: Ersetze jedes Komma durch "Komma + Leerzeichen"
        featuresText = clean.replace(/,/g, ', ');
      }

      tdFeatures.textContent = featuresText;
      
      // Styling für bessere Lesbarkeit
      tdFeatures.style.fontSize = "0.9em";
      tdFeatures.style.fontStyle = "italic";
      tdFeatures.style.color = "#bbb";
      // Optional: Macht den ersten Buchstaben groß (sieht oft besser aus)
      tdFeatures.style.textTransform = "capitalize"; 

      row.appendChild(tdFeatures);

      // --- 5. QUANTITY ---
      const tdQty = document.createElement("td");
      tdQty.textContent = item.quantity;
      tdQty.style.textAlign = "center";
      row.appendChild(tdQty);

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error(`Error loading ${endpointType}:`, err);
    tableBody.innerHTML = '<tr><td colspan="5" style="color:red;">Error loading data.</td></tr>';
  }
}


// ===============================
// Small helper to avoid repetition
// ===============================
function setBox(elementId, value) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = (value != null) ? value : "";
}
