// static/js/level_skills.js

// static/js/level_skills.js

window.loadLevelSkills = async function(charId, charData) {
  const skillSlots = document.querySelectorAll("#level-tab-skills .skill-slot");
  if (skillSlots.length === 0) return;

  try {
    // PARALLEL LADEN: Wir holen beides gleichzeitig
    const [learnedResp, masterResp] = await Promise.all([
        fetch(`/api/character/${charId}/skills`),
        fetch(`/api/skills/master_list`)
    ]);

    const mySkills = await learnedResp.json(); 
    const masterSkills = await masterResp.json();

    skillSlots.forEach(slot => {
        // Wir suchen den Button, um den Skill-Namen aus dem HTML zu lesen
        const btn = slot.querySelector(".lvl-btn-plus");
        if (!btn) return;
        
        const skillName = btn.getAttribute("data-skill");
        
        // 1. Infos aus der Master-Liste holen (Welches Attribut gehört dazu?)
        // (toLowerCase macht den Vergleich sicher gegen Groß-/Kleinschreibung)
        const masterInfo = masterSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
        
        // 2. Infos aus deinen gelernten Skills holen (Welches Level hast du?)
        const learnedInfo = mySkills.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
        
        let level = 0;
        let linkedAttrKey = null;

        // Attribut setzen (IMMERSICHER dank Master-Liste)
        if (masterInfo) {
            linkedAttrKey = masterInfo.linked_attribute_pair;
            // Wir speichern es fest im HTML für spätere Updates
            slot.setAttribute("data-linked-attr", linkedAttrKey);
        }

        // Level setzen
        if (learnedInfo) {
            level = learnedInfo.skill_level;
        }

        // Attribut-WERT aus den Charakter-Daten holen (z.B. Agility = 4)
        let attrVal = 0;
        if (linkedAttrKey && charData && charData[linkedAttrKey] !== undefined) {
             attrVal = charData[linkedAttrKey];
        }

        // Anzeige updaten
        updateSkillSlotUI(slot, level, attrVal, linkedAttrKey);
    });

  } catch (err) {
    console.error("Error loading level skills:", err);
  }
};

// UI Helper (nur lokal in dieser Datei nötig, aber wir lassen ihn global für Debugging)
function updateSkillSlotUI(slot, level, attrVal, linkedAttrKey) {
    const valBox = slot.querySelector(".edit-wrapper .skill-box");
    const attBox = slot.querySelector(".skill-box[title='Attribute Bonus']");
    const totBox = slot.querySelector(".skill-box[title='Total Pool']");

    if (valBox) valBox.textContent = level;
    
    if (attBox) {
        // Zeige Wert nur, wenn wir das Attribut kennen ODER wenn Level > 0
        if (linkedAttrKey || level > 0) {
            attBox.textContent = attrVal;
        } else {
            attBox.textContent = "-";
        }
    }

    if (totBox) {
        if (linkedAttrKey || level > 0) {
            totBox.textContent = level + attrVal;
        } else {
            totBox.textContent = "-";
        }
    }
}

// ==========================================
// INTERAKTION: Skills ändern (+ / - Buttons)
// ==========================================
window.changeSkill = async function(skillName, change, btnElement) {
    // 1. Sicherheitscheck: Haben wir eine Character ID?
    const charId = window.currentLevelCharId;
    if (!charId) {
        console.error("Keine Character ID gefunden!");
        return;
    }

    try {
        // 2. API Aufruf (POST an dein Python Backend)
        const response = await fetch(`/api/character/${charId}/skill/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                skill_name: skillName, 
                change: change 
            })
        });

        const data = await response.json();

        // 3. Fehlerbehandlung (z.B. zu wenig XP)
        if (!response.ok) {
            if (data.error === "Not enough XP") {
                alert(`Zu wenig XP!\nKosten: ${data.required} XP\nVerfügbar: ${data.current} XP`);
            } else {
                alert(data.description || "Fehler beim Skill-Update");
            }
            return;
        }

        // 4. ERFOLG: UI aktualisieren
        
        // A) XP im Header sofort anpassen (Funktion aus level_modal.js)
        if (window.setText) {
            window.setText("level-xp-display", data.new_xp);
        }
        
        // B) Die Skill-Zeile aktualisieren
        // Wenn ein Skill neu gelernt wurde (Level 0 -> 1), laden wir sicherheitshalber 
        // alle Skills neu, damit das verknüpfte Attribut korrekt aus der Master-Liste gezogen wird.
        if (data.new_level === 1 && change > 0) {
             console.log("Neuer Skill gelernt -> Lade Daten neu...");
             // Wir rufen die Haupt-Ladefunktion auf (falls verfügbar)
             if (window.fetchCharacterLevelDetails) {
                 window.fetchCharacterLevelDetails(charId);
             }
        } else {
             // C) Schnelles Update (ohne Neuladen) für flüssiges Gefühl
             const slot = btnElement.closest(".skill-slot");
             
             // Wir lesen den Attribut-Wert aus der mittleren Box aus, um die Summe zu berechnen
             let currentAttVal = 0;
             const attBox = slot.querySelector(".skill-box[title='Attribute Bonus']");
             
             // Nur parsen, wenn dort eine Zahl steht (und kein "-")
             if (attBox && attBox.textContent.trim() !== "-") {
                 currentAttVal = parseInt(attBox.textContent) || 0;
             }
             
             // Helper-Funktion zum Schreiben der neuen Werte
             // "linkedAttrKey" ist hier egal, da wir currentAttVal schon haben
             updateSkillSlotUI(slot, data.new_level, currentAttVal, (data.new_level > 0));
        }

    } catch (err) {
        console.error("Fehler in changeSkill:", err);
    }
};

// GLOBALER REFRESH
// Diese Funktion wird von level_modal.js aufgerufen, wenn sich Attribute ändern!
window.refreshSkillValuesOnly = function(charData) {
    const skillSlots = document.querySelectorAll("#level-tab-skills .skill-slot");
    skillSlots.forEach(slot => {
        // Level auslesen
        const valBox = slot.querySelector(".edit-wrapper .skill-box");
        let level = 0;
        if (valBox) level = parseInt(valBox.textContent) || 0;

        // Attribut Key auslesen (den wir beim Laden gespeichert haben)
        const linkedAttrKey = slot.getAttribute("data-linked-attr");
        
        // Neuen Attributwert holen
        let attrVal = 0;
        if (linkedAttrKey && charData[linkedAttrKey] !== undefined) {
            attrVal = charData[linkedAttrKey];
        }

        updateSkillSlotUI(slot, level, attrVal, linkedAttrKey);
    });
};