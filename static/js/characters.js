document.addEventListener("DOMContentLoaded", () => {
  // Links in nav for characters
  const viewAllLink = document.querySelector('nav a[data-shows="content-characters-all"]');
  const myCharsLink = document.querySelector('nav a[data-shows="content-characters-mine"]');

  if (viewAllLink) {
    viewAllLink.addEventListener("click", () => {
      loadAllCharactersTable("characters-all-table-container");
    });
  }

  if (myCharsLink) {
    myCharsLink.addEventListener("click", () => {
      loadMyCharactersTable("characters-mine-table-container");
    });
  }

  // ===== Create character buttons (just stubs for now) =====
  const btn200 = document.getElementById("create-char-200");
  const btn250 = document.getElementById("create-char-250");
  const btn300 = document.getElementById("create-char-300");
  const btn500 = document.getElementById("create-char-500");

  if (btn200) {
    btn200.addEventListener("click", () => {
      console.log("Create character with 200 XP (not implemented yet)");
      // later: call a function createCharacter(200);
    });
  }

  if (btn250) {
    btn250.addEventListener("click", () => {
      console.log("Create character with 250 XP (not implemented yet)");
      // later: createCharacter(250);
    });
  }

  if (btn300) {
    btn300.addEventListener("click", () => {
      console.log("Create character with 300 XP (not implemented yet)");
      // later: createCharacter(300);
    });
  }

  if (btn500) {
    btn500.addEventListener("click", () => {
      console.log("Create character with 500 XP (not implemented yet)");
      // later: createCharacter(500);
    });
  }
});


document.getElementById("create-char-200").addEventListener("click", () => {
    createCharacter(200);
});
document.getElementById("create-char-250").addEventListener("click", () => {
    createCharacter(250);
});
document.getElementById("create-char-300").addEventListener("click", () => {
    createCharacter(300);
});
document.getElementById("create-char-500").addEventListener("click", () => {
    createCharacter(500);
});



async function createCharacter(xpValue) {
  console.log("Create character with", xpValue, "XP (not implemented yet)");

  try {
    const response = await fetch("/api/create_character", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ xp: xpValue }),
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const data = await response.json();
    console.log("Character created:", data);

    // After creation, refresh the "my characters" table
    loadMyCharactersTable("characters-mine-table-container");

  } catch (err) {
    console.error("Create character error:", err);
  }
}





// =========================
// Load ALL characters table
// =========================
async function loadAllCharactersTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.textContent = "Loading characters...";

  try {
    const response = await fetch("/api/characters");
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.textContent = "No characters found.";
      return;
    }

    container.textContent = "";

    const columns = [
      { key: "name",       label: "Name" },
      { key: "char_class", label: "Class" },
      { key: "player",     label: "Player" }
    ];

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Header row
    const headerRow = document.createElement("tr");

    // First header cell: View
    const viewTh = document.createElement("th");
    viewTh.textContent = "View";
    headerRow.appendChild(viewTh);

    // Then the data columns
    columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Body rows
    data.forEach(row => {
      const tr = document.createElement("tr");

      // View button cell
      const viewTd = document.createElement("td");
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View";

      viewBtn.addEventListener("click", () => {
        // Just pass the row object to the modal
        openCharacterModal(row);
      });

      viewTd.appendChild(viewBtn);
      tr.appendChild(viewTd);

      // Data cells
      columns.forEach(col => {
        const td = document.createElement("td");
        const value = row[col.key];
        td.textContent = value != null ? value : "";
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);

  } catch (err) {
    console.error("Error loading all characters:", err);
    container.textContent = "Error loading characters.";
  }
}







// =============================
// Load MY characters table only
// =============================
async function loadMyCharactersTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.textContent = "Loading your characters...";

  try {
    const response = await fetch("/api/my_characters");
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.textContent = "You don't have any characters yet.";
      return;
    }

    container.textContent = "";

    const columns = [
      { key: "name",       label: "Name" },
      { key: "char_class", label: "Class" },
      { key: "player",     label: "Player" }
    ];

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");

    // --- ÄNDERUNG: ACTIONS Header statt nur View ---
    const actionTh = document.createElement("th");
    actionTh.textContent = "Actions"; 
    headerRow.appendChild(actionTh);
    // -----------------------------------------------

    columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.forEach(row => {
      const tr = document.createElement("tr");

      // --- ÄNDERUNG: ZWEI BUTTONS ---
      const actionTd = document.createElement("td");
      actionTd.style.display = "flex"; // Damit sie nebeneinander stehen
      actionTd.style.gap = "10px";

      // 1. View Button (Read Only)
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View";
      viewBtn.addEventListener("click", () => {
        // Ruft das alte Modal auf
        if (window.openCharacterModal) window.openCharacterModal(row);
      });

      // 2. Manage / Level Button (New)
      const manageBtn = document.createElement("button");
      manageBtn.textContent = "Manage / Level";
      // Einfaches Styling zur Unterscheidung
      manageBtn.style.borderColor = "#ffff00"; 
      manageBtn.style.color = "#ffff00";
      
      manageBtn.addEventListener("click", () => {
        // Ruft das NEUE Level-Modal auf (Funktion erstellen wir später)
        if (window.openLevelModal) {
            window.openLevelModal(row);
        } else {
            console.log("openLevelModal function not yet defined!");
        }
      });

      actionTd.appendChild(viewBtn);
      actionTd.appendChild(manageBtn);
      tr.appendChild(actionTd);
      // -----------------------------

      // Data
      columns.forEach(col => {
        const td = document.createElement("td");
        const value = row[col.key];
        td.textContent = value != null ? value : "";
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);

  } catch (err) {
    console.error("Error loading my characters:", err);
    container.textContent = "Error loading your characters.";
  }
}
