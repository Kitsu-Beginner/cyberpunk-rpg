document.addEventListener("DOMContentLoaded", () => {
  const pistolsLink  = document.querySelector('nav a[data-shows="content-list-weapons-pistols"]');
  const smgLink      = document.querySelector('nav a[data-shows="content-list-weapons-smg"]');
  const arLink       = document.querySelector('nav a[data-shows="content-list-weapons-ar"]');
  const sniperLink   = document.querySelector('nav a[data-shows="content-list-weapons-sniper"]');
  const mgLink       = document.querySelector('nav a[data-shows="content-list-weapons-mg"]');
  const launcherLink = document.querySelector('nav a[data-shows="content-list-weapons-launcher"]');

  const ammoRoundsLink   = document.querySelector('nav a[data-shows="content-list-ammunition-rounds"]');
  const ammoGrenadesLink = document.querySelector('nav a[data-shows="content-list-ammunition-grenades"]');
  const ammoRocketsLink  = document.querySelector('nav a[data-shows="content-list-ammunition-rockets"]');
  
  const armorLink    = document.querySelector('nav a[data-shows="content-list-armor-armor"]');
  const headwareLink = document.querySelector('nav a[data-shows="content-list-armor-headware"]');

  const cyberHeadLink  = document.querySelector('nav a[data-shows="content-list-cyberware-head"]');
  const cyberTorsoLink = document.querySelector('nav a[data-shows="content-list-cyberware-torso"]');
  const cyberArmsLink  = document.querySelector('nav a[data-shows="content-list-cyberware-arms"]');
  const cyberLegsLink  = document.querySelector('nav a[data-shows="content-list-cyberware-legs"]');

  const commlinksLink = document.querySelector('nav a[data-shows="content-list-commlinks-general"]');
if (commlinksLink) {
  commlinksLink.addEventListener("click", () => {
    loadCommlinksTable("commlinks-general-table-container");
  });
}

  const dronesLink = document.querySelector('nav a[data-shows="content-list-Mini-Drones"]');
if (dronesLink) {
  dronesLink.addEventListener("click", () => {
    loaddronesTable("Mini-Drones-table-container");
  });
}




  async function loadWeaponsTable(weaponType, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous content and show a loading message
    container.textContent = "Loading " + weaponType + " data...";

    try {
      const response = await fetch("/api/weapons_with_items/" + encodeURIComponent(weaponType));
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();

      // If no data, show a friendly message
      if (!Array.isArray(data) || data.length === 0) {
        container.textContent = "No weapons of type " + weaponType + " found.";
        return;
      }

      // Clear the loading text
      container.textContent = "";

      // Define the columns and their labels, in the order you wanted
      const columns = [
        { key: "name",       label: "Name" },
        { key: "calibr",     label: "Caliber" },
        { key: "damage",     label: "Damage" },
        { key: "penetration",label: "Penetration" },
        { key: "auto_bonus", label: "Auto Bonus" },
        { key: "ammo",       label: "Ammo" },
        { key: "weight",     label: "Weight" },
        { key: "price",      label: "Price" },
        { key: "legality",   label: "Legality" },
        { key: "features",   label: "Features" }
      ];

      // Create table elements
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Build the header row
      const headerRow = document.createElement("tr");

      // First header cell: "View"
      const viewTh = document.createElement("th");
      viewTh.textContent = "View";
      headerRow.appendChild(viewTh);

      // Then the rest of the columns
      columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      // Build the body rows
      data.forEach(row => {
        const tr = document.createElement("tr");

        // First cell: "View" button
        const viewTd = document.createElement("td");
        const viewBtn = document.createElement("button");
        viewBtn.textContent = "View";

        viewBtn.addEventListener("click", () => {
          // Build full image path from image_url, if present
          let imagePath = "/static/img/placeholder.png";
          if (row.image_url) {
            imagePath = "/static/img/" + row.image_url;
          }

          // openItemModal comes from item_view_modal.js
          openItemModal({
            name: row.name,
            description: row.description,
            image: imagePath
          });
        });

        viewTd.appendChild(viewBtn);
        tr.appendChild(viewTd);

        // Then the normal data columns
        columns.forEach(col => {
          const td = document.createElement("td");
          let value = row[col.key];

          // If the value is an array (like features), join it nicely
          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          td.textContent = value != null ? value : "";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);

    } catch (err) {
      console.error(err);
      container.textContent = "Error loading data.";
    }
  }








    async function loadAmmoTable(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = "Loading " + category + " ammunition...";

    try {
      const response = await fetch("/api/ammunition_with_items/" + encodeURIComponent(category));
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        container.textContent = "No ammunition of category '" + category + "' found.";
        return;
      }

      container.textContent = "";

      // Choose columns for ammo
      const columns = [
        { key: "name",               label: "Name" },
        { key: "weapon_caliber",     label: "Caliber" },
        { key: "damage_modifier",    label: "Damage" },
        { key: "penetration_modifier", label: "Penetration" },
      //  { key: "auto_bonus",         label: "Auto Bonus" },
        { key: "damage_type",        label: "Damage Type" },
        { key: "weight",             label: "Weight" },
        { key: "price",              label: "Price" },
        { key: "legality",           label: "Legality" },
        { key: "features",           label: "Features" }
      ];

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header row
      const headerRow = document.createElement("tr");

      const viewTh = document.createElement("th");
      viewTh.textContent = "View";
      headerRow.appendChild(viewTh);

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
          let imagePath = "/static/img/placeholder.png";
          if (row.image_url) {
            imagePath = "/static/img/" + row.image_url;
          }

          openItemModal({
            name: row.name,
            description: row.description,
            image: imagePath
          });
        });

        viewTd.appendChild(viewBtn);
        tr.appendChild(viewTd);

        // Data cells
        columns.forEach(col => {
          const td = document.createElement("td");
          let value = row[col.key];

          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          td.textContent = value != null ? value : "";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);

    } catch (err) {
      console.error(err);
      container.textContent = "Error loading ammunition data.";
    }
  }



  // ===============================
  // Generic loader for simple tables
  // ===============================


  



  // ===============================
  // Armor table loader
  // ===============================
  async function loadArmorTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = "Loading armor data...";

    try {
      const response = await fetch("/api/armor_with_items");
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        container.textContent = "No armor found.";
        return;
      }

      container.textContent = "";

      const columns = [
        { key: "name",         label: "Name" },
        { key: "armor_value", label: "Armor Rating" },   // adjust if your JSON uses a different key
        { key: "shock_absorption", label: "Shock Absorption" },
        { key: "coverage",     label: "Coverage" },       // adjust if needed
        { key: "weight",       label: "Weight" },
        { key: "price",        label: "Price" },
        { key: "legality",     label: "Legality" },
        { key: "features",     label: "Features" }
      ];

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header row
      const headerRow = document.createElement("tr");

      const viewTh = document.createElement("th");
      viewTh.textContent = "View";
      headerRow.appendChild(viewTh);

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
          let imagePath = "/static/img/placeholder.png";
          if (row.image_url) {
            imagePath = "/static/img/" + row.image_url;
          }

          openItemModal({
            name: row.name,
            description: row.description,
            image: imagePath
          });
        });

        viewTd.appendChild(viewBtn);
        tr.appendChild(viewTd);

        // Data cells
        columns.forEach(col => {
          const td = document.createElement("td");
          let value = row[col.key];

          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          td.textContent = value != null ? value : "";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);

    } catch (err) {
      console.error(err);
      container.textContent = "Error loading armor data.";
    }
  }






  // ===============================
  // Headware table loader
  // ===============================
  async function loadHeadwareTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = "Loading headware data...";

    try {
      const response = await fetch("/api/headware_with_items");
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        container.textContent = "No headware found.";
        return;
      }

      container.textContent = "";

      const columns = [
        { key: "name",         label: "Name" },
        { key: "armor_value", label: "Armor Rating" },   // adjust if needed
        { key: "shock_absorption", label: "Shock Absorption" },
        { key: "weight",       label: "Weight" },
        { key: "price",        label: "Price" },
        { key: "legality",     label: "Legality" },
        { key: "features",     label: "Features" }
        
      ];

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header row
      const headerRow = document.createElement("tr");

      const viewTh = document.createElement("th");
      viewTh.textContent = "View";
      headerRow.appendChild(viewTh);

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
          let imagePath = "/static/img/placeholder.png";
          if (row.image_url) {
            imagePath = "/static/img/" + row.image_url;
          }

          openItemModal({
            name: row.name,
            description: row.description,
            image: imagePath
          });
        });

        viewTd.appendChild(viewBtn);
        tr.appendChild(viewTd);

        // Data cells
        columns.forEach(col => {
          const td = document.createElement("td");
          let value = row[col.key];

          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          td.textContent = value != null ? value : "";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);

    } catch (err) {
      console.error(err);
      container.textContent = "Error loading headware data.";
    }
  }



  // ===============================
  // Cyberware table loader
  // ===============================
  async function loadCyberwareTable(category, containerId) {

    console.log("loadCyberwareTable called with", category, containerId);

    // category expected: "head" | "torso" | "arms" | "legs"
    const container = document.getElementById(containerId);

    console.log("container exists?", !!container);

    if (!container) return;

    container.textContent = "Loading " + category + " cyberware...";

    try {
      // *** KORREKTUR HIER ***
      // 1. Definiere die URL in einer Variable
      const url = "/api/cyberware_with_items/" + encodeURIComponent(category);
      
      // 2. Verwende die Variable im Log
      console.log("fetching", url);
      
      // 3. Verwende die Variable im Fetch
      const response = await fetch(url);
      
      if (!response.ok) {
         throw new Error("HTTP error " + response.status);
        }



// ... (der Rest deines try-Blocks bleibt gleich)

      const data = await response.json();

      console.log("Data received:", data); // <-- DIE NEUE ZEILE

      if (!Array.isArray(data) || data.length === 0) {
        container.textContent = "No cyberware found for '" + category + "'.";
        return;
      }

      container.textContent = "";

      // Adjust column keys to match your actual JSON fields from the API
      // (we'll fine-tune after we see a sample row)
      const columns = [

        { key: "name",          label: "Name" },
               
        { key: "humanity_cost",  label: "Humanity" },         // adjust if your key differs
        { key: "price",         label: "Price" },
        { key: "legality",      label: "Legality" },
        { key: "features",      label: "Features" }

      ];

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header row
      const headerRow = document.createElement("tr");

      // "View" column like your other tables
      const viewTh = document.createElement("th");
      viewTh.textContent = "View";
      headerRow.appendChild(viewTh);

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
          let imagePath = "/static/img/placeholder.png";
          if (row.image_url) {
            imagePath = "/static/img/" + row.image_url;
          }

          openItemModal({
            name: row.name,
            description: row.description,
            image: imagePath
          });
        });

        viewTd.appendChild(viewBtn);
        tr.appendChild(viewTd);

        // Data cells
        columns.forEach(col => {
          const td = document.createElement("td");
          let value = row[col.key];

          // --- Verbesserte Feature-Behandlung ---
          if (col.key === 'features') {
            if (Array.isArray(value)) {
              // Fall 1: Echtes Array (nach dem SQL-Fix)
              value = value.join(", ");
            } else if (typeof value === 'string' && value.startsWith('{')) {
              // Fall 2: Hässlicher String (vor dem SQL-Fix)
              value = value.replace(/[{}]/g, ''); // Entfernt { und }
            }
          }
          // --- Ende der Feature-Behandlung ---

          td.textContent = value != null ? value : "";

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);

    } catch (err) {
      console.error(err);
      container.textContent = "Error loading cyberware data.";
    }
  }





  // Hook all weapon subtabs to the loader


  if (pistolsLink) {
    pistolsLink.addEventListener("click", () => {
      loadWeaponsTable("Pistol", "weapons-pistols-table-container");
    });
  }

  if (smgLink) {
    smgLink.addEventListener("click", () => {
      loadWeaponsTable("SMG", "weapons-smg-table-container");
    });
  }

  if (arLink) {
    arLink.addEventListener("click", () => {
      loadWeaponsTable("Automatic Rifle", "weapons-ar-table-container");
    });
  }

  if (sniperLink) {
    sniperLink.addEventListener("click", () => {
      loadWeaponsTable("Sniper Rifle", "weapons-sniper-table-container");
    });
  }

  if (mgLink) {
    mgLink.addEventListener("click", () => {
      loadWeaponsTable("Machine Gun", "weapons-mg-table-container");
    });
  }

  if (launcherLink) {
    launcherLink.addEventListener("click", () => {
      loadWeaponsTable("Launcher", "weapons-launcher-table-container");
    });
  }

  if (ammoRoundsLink) {
    ammoRoundsLink.addEventListener("click", () => {
      loadAmmoTable("rounds", "ammunition-rounds-table-container");
    });
  }

  if (ammoGrenadesLink) {
    ammoGrenadesLink.addEventListener("click", () => {
      loadAmmoTable("grenades", "ammunition-grenades-table-container");
    });
  }

  if (ammoRocketsLink) {
    ammoRocketsLink.addEventListener("click", () => {
      loadAmmoTable("rockets", "ammunition-rockets-table-container");
    });
  }



  // Armor subtab
if (armorLink) {
  armorLink.addEventListener("click", () => {

     // Matches HTML: <div id="armor-armor-table-container"></div>
    loadArmorTable("armor-armor-table-container");
  });

}

// Headware subtab
if (headwareLink) {

  headwareLink.addEventListener("click", () => {

    // Matches HTML: <div id="armor-headware-table-container"></div>
    loadHeadwareTable("armor-headware-table-container");
  });

}

  // CYBERWARE — Head
if (cyberHeadLink) {
  console.log("cyberHeadLink found");
  cyberHeadLink.addEventListener("click", () => {
    console.log("Cyberware Head clicked");
    loadCyberwareTable("head", "cyberware-head-table-container");
  });
} else {
  console.log("cyberHeadLink NOT found");
}

// CYBERWARE — Torso
if (cyberTorsoLink) {
  console.log("cyberTorsoLink found");
  cyberTorsoLink.addEventListener("click", () => {
    console.log("Cyberware Torso clicked");
    loadCyberwareTable("torso", "cyberware-torso-table-container");
  });
} else {
  console.log("cyberTorsoLink NOT found");
}

// CYBERWARE — Arms
if (cyberArmsLink) {
  console.log("cyberArmsLink found");
  cyberArmsLink.addEventListener("click", () => {
    console.log("Cyberware Arms clicked");
    loadCyberwareTable("arms", "cyberware-arms-table-container");
  });
} else {
  console.log("cyberArmsLink NOT found");
}

// CYBERWARE — Legs
if (cyberLegsLink) {
  console.log("cyberLegsLink found");
  cyberLegsLink.addEventListener("click", () => {
    console.log("Cyberware Legs clicked");
    loadCyberwareTable("legs", "cyberware-legs-table-container");
  });
} else {
  console.log("cyberLegsLink NOT found");
}

// Commlinks. Alle Commlinks erstmal in commlinks -> commlinks general laden. Später dann auch andere unter specialized


function loadCommlinksTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.textContent = "Loading commlinks...";

  fetch("/api/commlinks")
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        container.textContent = "No commlinks found.";
        return;
      }

      container.textContent = "";

      const columns = [
        { key: "name",       label: "Name" },
        { key: "compute",    label: "Compute" },
        { key: "firewall",   label: "Firewall" },
        { key: "signal",     label: "Range (km)" },
        { key: "mask",       label: "Mask" },
        { key: "price",      label: "Price" },
        { key: "weight",     label: "Weight" },
        { key: "legality",   label: "Legality" },
        { key: "features",   label: "Features" }
      ];

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header
      const headerRow = document.createElement("tr");

      // --- NEU: View Header ---
      const viewTh = document.createElement("th");
      viewTh.textContent = "View";
      headerRow.appendChild(viewTh);
      // ------------------------

      columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      // Rows
      data.forEach(row => {
        const tr = document.createElement("tr");

        // --- NEU: View Button Logic ---
        const viewTd = document.createElement("td");
        const viewBtn = document.createElement("button");
        viewBtn.textContent = "View";

        viewBtn.addEventListener("click", () => {
          let imagePath = "/static/img/placeholder.png";
          if (row.image_url) {
            imagePath = "/static/img/" + row.image_url;
          }
          // Zugriff auf openItemModal (global verfügbar)
          openItemModal({
            name: row.name,
            description: row.description,
            image: imagePath
          });
        });

        viewTd.appendChild(viewBtn);
        tr.appendChild(viewTd);
        // -----------------------------

        columns.forEach(col => {
          const td = document.createElement("td");
          let value = row[col.key];

          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          td.textContent = value != null ? value : "";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);

    })
    .catch(err => {
      console.error("Error loading commlinks:", err);
      container.textContent = "Error loading commlinks.";
    });
}



// Table für Drones und Mini Drones


function loaddronesTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.textContent = "Loading drones...";

  fetch("/api/drones")
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        container.textContent = "No drones found.";
        return;
      }

      container.textContent = "";

      const columns = [
        { key: "name",       label: "Name" },
        { key: "firewall",   label: "Firewall" },
        { key: "signal",     label: "Range (km)" },
        { key: "mask",       label: "Mask" },
        { key: "speed",      label: "Speed" },
        { key: "price",      label: "Price" },
        { key: "weight",     label: "Weight" },
        { key: "legality",   label: "Legality" },
        { key: "features",   label: "Features" }
      ];

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header
      const headerRow = document.createElement("tr");

      // --- NEU: View Header ---
      const viewTh = document.createElement("th");
      viewTh.textContent = "View";
      headerRow.appendChild(viewTh);
      // ------------------------

      columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      // Rows
      data.forEach(row => {
        const tr = document.createElement("tr");

        // --- NEU: View Button Logic ---
        const viewTd = document.createElement("td");
        const viewBtn = document.createElement("button");
        viewBtn.textContent = "View";

        viewBtn.addEventListener("click", () => {
          let imagePath = "/static/img/placeholder.png";
          if (row.image_url) {
            imagePath = "/static/img/" + row.image_url;
          }
          openItemModal({
            name: row.name,
            description: row.description,
            image: imagePath
          });
        });

        viewTd.appendChild(viewBtn);
        tr.appendChild(viewTd);
        // -----------------------------

        columns.forEach(col => {
          const td = document.createElement("td");
          let value = row[col.key];

          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          td.textContent = value != null ? value : "";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);

    })
    .catch(err => {
      console.error("Error loading drones:", err); // Hier habe ich auch den Log-Text von 'commlinks' auf 'drones' korrigiert
      container.textContent = "Error loading drones.";
    });
}


});











