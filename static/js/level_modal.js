// ==========================================
// LEVEL MODAL LOGIC (static/js/level_modal.js)
// ==========================================

// Globaler State
window.currentLevelCharId = null;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("level-modal");
  const closeBtn = document.getElementById("level-modal-close");

  // 1. Schließen-Logik
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
      tabButtons.forEach(b => b.classList.remove("active"));
      document.querySelectorAll("#level-modal .character-tab-panel").forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const tabName = btn.getAttribute("data-level-tab");
      const targetPanel = document.getElementById(`level-tab-${tabName}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
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
};

function closeLevelModal() {
  const modal = document.getElementById("level-modal");
  if (modal) modal.classList.add("hidden");
  window.currentLevelCharId = null;
}

// ==========================================
// DATEN LADEN & ANZEIGEN
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

    // HIER IST DIE VERBINDUNG ZU LEVEL_SKILLS.JS:
    // Wir prüfen, ob die Funktion existiert (weil sie in der anderen Datei liegt) und rufen sie auf.
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

    // ERFOLG! 
    
    // 1. Header Update
    setText("level-xp-display", data.xp);
    setText("level-money-display", data.money);
    
    // 2. Attribute Update
    fillLevelAttributes(data);

    // 3. HIER IST DIE VERBINDUNG ZU LEVEL_SKILLS.JS:
    // Wenn sich Attribute ändern (z.B. Agility), müssen sich die Skill-Summen (Box 3) auch ändern.
    if (window.refreshSkillValuesOnly) {
        window.refreshSkillValuesOnly(data);
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

  } catch (err) {
    console.error("Error executing exchangeMoney:", err);
  }
};