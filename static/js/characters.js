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
});

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

    // View column
    const viewTh = document.createElement("th");
    viewTh.textContent = "View";
    headerRow.appendChild(viewTh);

    // Data columns
    columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.forEach(row => {
      const tr = document.createElement("tr");

      // View button
      const viewTd = document.createElement("td");
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View";
      viewBtn.addEventListener("click", () => {
        openCharacterModal(row);
      });
      viewTd.appendChild(viewBtn);
      tr.appendChild(viewTd);

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
