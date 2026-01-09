// ==========================================
// LEVEL MODAL LOGIC (static/js/level_modal.js)
// ==========================================

// Globaler State
window.currentLevelCharId = null;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("level-modal");
  const closeBtn = document.getElementById("level-modal-close");

  // 1. Schließen-Logik (Level Modal)
  if (closeBtn) {
    closeBtn.addEventListener("click", closeLevelModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal-backdrop")) {
        closeLevelModal();
      }
    });
  }

  // 2. Tab-Logik
  const tabButtons = document.querySelectorAll(".character-tabs button[data-level-tab]");
  
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // A. UI Reset (alte Tabs deaktivieren)
      tabButtons.forEach(b => b.classList.remove("active"));
      document.querySelectorAll("#level-modal .character-tab-panel").forEach(p => p.classList.remove("active"));

      // B. UI Set (neuen Tab aktivieren)
      btn.classList.add("active");
      const tabName = btn.getAttribute("data-level-tab");
      const targetPanel = document.getElementById(`level-tab-${tabName}`);
      
      if (targetPanel) {
        targetPanel.classList.add("active");
      }

      // C. DATEN LADEN (Spezifische Logik für Tabs)
      
      // Stash Tab: Inventar neu laden
      if (tabName === "stash" && window.loadStashData) {
          window.loadStashData();
      }

      // Cyberware Tab: Implantate neu laden
      if (tabName === "cyberware" && window.loadCyberwareData) {
          window.loadCyberwareData();
      }
      
    });
  });

  // 3. Würfel-Modal Öffnen (Button Listener)
  const diceBtn = document.getElementById('open-dice-btn');
  if (diceBtn) {
      diceBtn.addEventListener('click', () => {
          const diceModal = document.getElementById('dice-modal');
          if (diceModal) {
            diceModal.style.display = 'block';
            // Fokus auf das Eingabefeld setzen (kleine Verzögerung für Rendering)
            setTimeout(() => {
                const noteInput = document.getElementById('dice-note-input');
                if (noteInput) noteInput.focus();
            }, 100);
          }
      });
  }
});

// ==========================================
// HAUPTFUNKTION: Öffnen & Daten laden
// ==========================================
window.openLevelModal = function(row) {
  const modal = document.getElementById("level-modal");
  if (!modal) return;

  window.currentLevelCharId = row.id;

  setText("level-char-name", row.name);
  setText("level-char-class", row.char_class);
  setText("level-char-player", row.player);

  resetLevelTabs();
  modal.classList.remove("hidden");

  // Daten laden
  fetchCharacterLevelDetails(row.id);
  
  // Log laden (NEU: Damit alte Würfe sichtbar sind)
  if (typeof window.loadLevelLog === "function") {
      window.loadLevelLog(row.id);
  }
};

function closeLevelModal() {
  const modal = document.getElementById("level-modal");
  if (modal) modal.classList.add("hidden");
  window.currentLevelCharId = null;
}

// ==========================================
// DATEN LADEN & ANZEIGEN (Details)
// ==========================================
async function fetchCharacterLevelDetails(charId) {
  try {
    const response = await fetch(`/api/character/${charId}/details`);
    if (!response.ok) throw new Error("Network error");
    
    const data = await response.json();
    
    // Header Stats füllen
    setText("level-xp-display", data.xp);
    setText("level-money-display", data.money);
    setText("level-humanity-display", data.humanity);

    // Attribute füllen
    fillLevelAttributes(data);

    // Skills laden (falls externe Funktion vorhanden)
    if (window.loadLevelSkills) {
        window.loadLevelSkills(charId, data);
    }

  } catch (err) {
    console.error("Error loading level details:", err);
  }
}

function fillLevelAttributes(data) {
  const attributes = [
    "stamina", "strength", "agility", "reaction", 
    "intuition", "logic", "composure", "charisma"
  ];

  attributes.forEach(attr => {
    setText(`level-attr-${attr}-base`, data[`${attr}_base`]);
    
    const mod = data[`${attr}_mod`];
    setText(`level-attr-${attr}-mod`, mod !== 0 ? mod : "");

    setText(`level-attr-${attr}-total`, data[attr]);
  });

  // Derived Attributes
  setText("level-derived-defense-pool", data.defense_pool);
  setText("level-derived-initiative", data.initiative);
  setText("level-derived-speed", data.speed);
  setText("level-derived-carry-weight", data.carry_weight);
  setText("level-derived-action-points", data.action_points);
}

// ==========================================
// HELFER
// ==========================================
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = (text != null) ? text : "";
}

function resetLevelTabs() {
  const tabButtons = document.querySelectorAll(".character-tabs button[data-level-tab]");
  const panels = document.querySelectorAll("#level-modal .character-tab-panel");

  tabButtons.forEach(b => b.classList.remove("active"));
  panels.forEach(p => p.classList.remove("active"));

  const defaultBtn = document.querySelector("button[data-level-tab='attributes']");
  const defaultPanel = document.getElementById("level-tab-attributes");
  
  if (defaultBtn) defaultBtn.classList.add("active");
  if (defaultPanel) defaultPanel.classList.add("active");
}

// ==========================================
// INTERAKTION: Attribute ändern
// ==========================================
window.changeStat = async function(attrName, type, change) {
  if (!window.currentLevelCharId) {
    console.error("No character ID found.");
    return;
  }

  try {
    const response = await fetch(`/api/character/${window.currentLevelCharId}/attribute/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attribute: attrName, 
        type: type,          
        change: change       
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === "Not enough XP") {
        alert(`Nicht genug XP!\nKosten: ${data.required} XP\nVerfügbar: ${data.current} XP`);
      } else {
        alert("Fehler beim Update: " + (data.description || "Unbekannter Fehler"));
      }
      return;
    }

    // Erfolg! 
    
    // 1. Header Update
    setText("level-xp-display", data.xp);
    setText("level-money-display", data.money);
    
    // 2. Attribute Update
    fillLevelAttributes(data);

    // 3. Skills aktualisieren (da Attribute Einfluss haben)
    if (window.refreshSkillValuesOnly) {
        window.refreshSkillValuesOnly(data);
    }
    
    // 4. Log neu laden (da XP Änderung im Log stehen sollte)
    if (typeof window.loadLevelLog === "function") {
        window.loadLevelLog(window.currentLevelCharId);
    }

  } catch (err) {
    console.error("Network error executing changeStat:", err);
    alert("Netzwerkfehler beim Speichern.");
  }
};


// ==========================================
// INTERAKTION: Money Exchange
// ==========================================
window.exchangeMoney = async function(direction) {
  if (!window.currentLevelCharId) return;

  try {
    const response = await fetch(`/api/character/${window.currentLevelCharId}/exchange/money`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction: direction })
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.error === "Not enough XP") {
            alert("Nicht genug XP für diesen Tausch!");
        } else if (data.error === "Not enough Money") {
            alert("Nicht genug Geld (benötigt 5000¥)!");
        } else {
            alert("Fehler: " + (data.description || "Unbekannt"));
        }
        return;
    }

    // Erfolg: UI Update
    setText("level-xp-display", data.xp);
    setText("level-money-display", data.money);
    
    // Log Update
    if (typeof window.loadLevelLog === "function") {
        window.loadLevelLog(window.currentLevelCharId);
    }

  } catch (err) {
    console.error("Error executing exchangeMoney:", err);
  }
};


// ==========================================
// DICE MODAL LOGIK (Global)
// ==========================================

window.closeDiceModal = function() {
    const diceModal = document.getElementById('dice-modal');
    if (diceModal) diceModal.style.display = 'none';
};

window.performDiceRoll = async function() {
    const poolInput = document.getElementById('dice-pool-input');
    const noteInput = document.getElementById('dice-note-input');
    
    const pool = parseInt(poolInput.value) || 1;
    const note = noteInput.value || "Check";
    
    // 1. Würfeln (Shadowrun Style: 5 und 6 sind Erfolge => p=0.33)
    let hits = 0;
    let ones = 0;

    for (let i = 0; i < pool; i++) {
        const result = Math.floor(Math.random() * 6) + 1;
        if (result >= 5) hits++;
        if (result === 1) ones++;
    }

    // Optional: Glitch Erkennung (mehr als die Hälfte sind 1en)
    let glitchText = "";
    if (ones > pool / 2) {
        glitchText = (hits === 0) ? " [CRITICAL GLITCH!]" : " [Glitch]";
    }

    // 2. String für das Log bauen
    const logText = `🎲 ${hits} Hits (Pool: ${pool})${glitchText} — ${note}`;

    // 3. An die Datenbank senden
    const charId = window.currentLevelCharId; 

    if (!charId) {
        alert("Fehler: Kein Charakter geladen.");
        return;
    }

    try {
        const response = await fetch(`/api/add_level_entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                character_id: charId,
                change_value: 0,       // Keine Änderung am Karma
                reason: logText        // Unser Ergebnis als Text
            })
        });

        if (response.ok) {
            // Modal schließen
            window.closeDiceModal();
            
            // Log sofort neu laden
            if (typeof window.loadLevelLog === "function") {
                window.loadLevelLog(charId);
            } else {
                alert(`Wurf gespeichert: ${hits} Erfolge\n(Bitte Seite neu laden)`);
            }
            
        } else {
            const errData = await response.json();
            alert("Error saving dice roll: " + (errData.error || "Unknown error"));
        }
    } catch (err) {
        console.error(err);
        alert("System error communicating with server.");
    }
};

// ==========================================
// LOG LADEN & ANZEIGEN (NEU!)
// ==========================================
window.loadLevelLog = async function(charId) {
    const container = document.getElementById("level-log-container");
    if (!container) return;

    // Lade-Animation
    container.innerHTML = '<p style="color:#666; font-style:italic; padding: 5px;">Loading history...</p>';

    try {
        const response = await fetch(`/api/character/${charId}/level_log`);
        if (!response.ok) throw new Error("Failed to load log");

        const logs = await response.json();

        // Container leeren
        container.innerHTML = "";

        if (logs.length === 0) {
            container.innerHTML = '<p style="padding: 5px; color:#888;">No entries yet.</p>';
            return;
        }

        // Liste aufbauen
        logs.forEach(entry => {
            const row = document.createElement("div");
            row.style.borderBottom = "1px solid #333";
            row.style.padding = "6px 4px";
            row.style.fontSize = "0.9em";
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "center";

            // Linke Seite: Grund + Datum
            const leftCol = document.createElement("div");
            
            // Datum stylen
            const dateSpan = document.createElement("span");
            dateSpan.textContent = `[${entry.date}] `;
            dateSpan.style.color = "#666";
            dateSpan.style.fontSize = "0.8em";
            dateSpan.style.marginRight = "6px";
            dateSpan.style.fontFamily = "monospace";

            // Grund (Reason) stylen
            const reasonSpan = document.createElement("span");
            reasonSpan.textContent = entry.reason;
            reasonSpan.style.color = "#ccc";
            
            // Highlight für Würfelwürfe
            if (entry.reason.includes("🎲")) {
                reasonSpan.style.color = "var(--neon-magenta)";
                reasonSpan.style.fontWeight = "bold";
            }

            leftCol.appendChild(dateSpan);
            leftCol.appendChild(reasonSpan);

            // Rechte Seite: XP/Karma Änderung
            const rightCol = document.createElement("div");
            if (entry.change !== 0) {
                const sign = entry.change > 0 ? "+" : "";
                const color = entry.change > 0 ? "var(--neon-green)" : "var(--neon-red)";
                rightCol.innerHTML = `<span style="color:${color}; font-weight:bold; font-family: monospace;">${sign}${entry.change} XP</span>`;
            } else {
                 // Platzhalter bei 0 XP Änderung
                 rightCol.innerHTML = `<span style="color:#333;">-</span>`;
            }

            row.appendChild(leftCol);
            row.appendChild(rightCol);

            container.appendChild(row);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:var(--neon-red);">Error loading log.</p>';
    }
};