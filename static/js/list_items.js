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

const combatDronesLink = document.querySelector('nav a[data-shows="content-list-combat-drones"]');
if (combatDronesLink) {
    combatDronesLink.addEventListener("click", () => {
        loadCombatDronesTable("combat-drones-table-container");
    });
}




const cyberdecksLink = document.querySelector('nav a[data-shows="content-list-cyberdecks"]');
  if (cyberdecksLink) {
    cyberdecksLink.addEventListener("click", () => {
      loadCyberdecksTable("cyberdecks-table-container");
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



// Helper: Formatiert Attributs-Boni wie im Character Modal
function formatAttributeBonuses(item) {
    const attrMap = {
        stamina_bonus: "STA",
        strength_bonus: "STR",
        agility_bonus: "AGI",
        reaction_bonus: "REA",
        intuition_bonus: "INT",
        logic_bonus: "LOG",
        composure_bonus: "COM",
        charisma_bonus: "CHA"
    };

    let badges = [];

    for (const [key, label] of Object.entries(attrMap)) {
        const val = item[key];
        if (val && val !== 0) {
            const sign = val > 0 ? "+" : "";
            const color = val > 0 ? "var(--neon-green)" : "var(--neon-red)";
            // Erstellt ein Badge im Stil: [STR +1]
            badges.push(
                `<span style="color: ${color}; font-weight: bold; margin-right: 8px; white-space: nowrap;">
                    ${label} ${sign}${val}
                </span>`
            );
        }
    }

    return badges.length > 0 ? badges.join("") : '<span style="color: #555;">-</span>';
}







  // ===============================
// Cyberware table loader (FIXED)
// ===============================
// ===============================
// Cyberware table loader (UPDATED with Legality)
// ===============================
async function loadCyberwareTable(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<p style="color:var(--neon-cyan);">Accessing ${category} cyberware database...</p>`;

    try {
        const url = "/api/cyberware_with_items/" + encodeURIComponent(category);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const data = await response.json();
        container.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `<p class="placeholder">No cyberware found for '${category}'.</p>`;
            return;
        }

        const table = document.createElement("table");
        table.className = "item-table"; 

        // --- THEAD ---
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        // HIER WURDE "Legality" EINGEFÜGT
        const headers = ["View", "Name", "Stats", "Humanity", "Price", "Legality", "Features"];
        
        headers.forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            
            // Breiten anpassen
            if (text === "Stats") th.style.width = "12%";
            else if (text === "Humanity") th.style.width = "8%";
            else if (text === "Name") th.style.width = "20%";
            else if (text === "Legality") th.style.width = "10%"; // Neue Spalte
            else if (text === "Features") th.style.width = "30%"; // Etwas reduziert für Platz
            
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // --- TBODY ---
        const tbody = document.createElement("tbody");

        data.forEach(item => {
            const row = document.createElement("tr");

            // 1. View Button
            const tdView = document.createElement("td");
            const viewBtn = document.createElement("button");
            viewBtn.textContent = "View";
            viewBtn.className = "btn-small";
            viewBtn.onclick = () => {
                let imagePath = "/static/img/placeholder.png";
                if (item.image_url) imagePath = "/static/img/" + item.image_url;
                if (typeof openItemModal === "function") {
                    openItemModal({
                        name: item.name,
                        description: item.description,
                        image: imagePath
                    });
                }
            };
            tdView.appendChild(viewBtn);
            row.appendChild(tdView);

            // 2. Name
            const tdName = document.createElement("td");
            tdName.textContent = item.name;
            tdName.style.fontWeight = "bold";
            tdName.style.color = "var(--neon-cyan)";
            row.appendChild(tdName);

            // 3. Stats (Kompakt)
            const tdStats = document.createElement("td");
            const statsList = [];
            const bonusMap = {
                "STR": item.strength_bonus, "AGI": item.agility_bonus, "REA": item.reaction_bonus,
                "STA": item.stamina_bonus, "INT": item.intuition_bonus, "LOG": item.logic_bonus,
                "COM": item.composure_bonus, "CHA": item.charisma_bonus, "Armor": item.armor_bonus,
                "Shock": item.shock_absorption, "AP": item.action_bonus
            };

            for (const [label, val] of Object.entries(bonusMap)) {
                if (val && val !== 0) {
                    const sign = val > 0 ? "+" : "";
                    const color = val > 0 ? "var(--neon-green)" : "var(--neon-red)";
                    statsList.push(`<span style="color:${color}; margin-right:4px; white-space:nowrap;">${label}${sign}${val}</span>`);
                }
            }
            tdStats.innerHTML = statsList.length > 0 ? statsList.join(" ") : '<span style="color:#555;">-</span>';
            tdStats.style.fontSize = "0.85em";
            row.appendChild(tdStats);

            // 4. Humanity
            const tdHL = document.createElement("td");
            tdHL.textContent = item.humanity_cost || "0";
            tdHL.style.textAlign = "center";
            tdHL.style.color = "var(--neon-red)";
            row.appendChild(tdHL);

            // 5. Price
            const tdPrice = document.createElement("td");
            tdPrice.textContent = item.price ? item.price + " ¥" : "-";
            tdPrice.style.whiteSpace = "nowrap";
            row.appendChild(tdPrice);

            // 6. Legality (NEU EINGEFÜGT)
            const tdLegality = document.createElement("td");
            tdLegality.textContent = item.legality || "-";
            tdLegality.style.textTransform = "capitalize"; // "restricted" -> "Restricted"
            
            // Optional: Einfärbung je nach Status
            // if (item.legality === 'restricted') tdLegality.style.color = "var(--neon-yellow)";
            // if (item.legality === 'illegal' || item.legality === 'military') tdLegality.style.color = "var(--neon-red)";
            
            row.appendChild(tdLegality);


            // 7. Features (Badges)
            const tdFeatures = document.createElement("td");
            let featuresArray = [];
            
            if (Array.isArray(item.features)) {
                featuresArray = item.features;
            } else if (typeof item.features === 'string') {
                featuresArray = item.features.replace(/[{}"']/g, '').split(',');
            }

            if (featuresArray.length > 0 && featuresArray[0] !== "") {
                const badgeContainer = document.createElement("div");
                badgeContainer.style.display = "flex";
                badgeContainer.style.flexWrap = "wrap";
                badgeContainer.style.gap = "4px";

                featuresArray.forEach(feature => {
                    const cleanFeature = feature.trim();
                    if (cleanFeature) {
                        const badge = document.createElement("span");
                        badge.textContent = cleanFeature;
                        
                        badge.style.display = "inline-block";
                        badge.style.padding = "4px 8px";
                        badge.style.fontSize = "0.9em";
                        badge.style.border = "1px solid rgba(0, 243, 255, 0.3)";
                        badge.style.borderRadius = "4px";
                        badge.style.backgroundColor = "rgba(0, 20, 40, 0.6)";
                        badge.style.color = "#ccc";
                        badge.style.whiteSpace = "nowrap";
                        
                        badgeContainer.appendChild(badge);
                    }
                });
                tdFeatures.appendChild(badgeContainer);
            } else {
                 tdFeatures.textContent = "-";
                 tdFeatures.style.color = "#555";
            }
            row.appendChild(tdFeatures);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.appendChild(table);

    } catch (err) {
        console.error("Error loading cyberware:", err);
        container.innerHTML = `<p style="color:var(--neon-red);">Error loading data: ${err.message}</p>`;
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
      //  { key: "mask",       label: "Mask" },
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

// Tabelle für cyberdecks



// ===============================
  // Cyberdecks Loader
  // ===============================
  function loadCyberdecksTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = "Loading cyberdecks...";

    fetch("/api/cyberdecks")
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          container.textContent = "No cyberdecks found.";
          return;
        }

        container.textContent = "";

        // Spalten-Definition passend zu deiner SQL-Abfrage
        const columns = [
          { key: "name",       label: "Name" },
          { key: "compute",    label: "Compute" },
          { key: "firewall",   label: "Firewall" },
          { key: "signal",    label: "Range (m)" },
          { key: "price",      label: "Price" },
          { key: "weight",     label: "Weight" },
          { key: "legality",   label: "Legality" },
          { key: "features",   label: "Features" }
          // Features/Legality optional, falls in SQL View vorhanden
        ];

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        // --- Header ---
        const headerRow = document.createElement("tr");

        // View Header
        const viewTh = document.createElement("th");
        viewTh.textContent = "View";
        headerRow.appendChild(viewTh);

        columns.forEach(col => {
          const th = document.createElement("th");
          th.textContent = col.label;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // --- Rows ---
        data.forEach(row => {
          const tr = document.createElement("tr");

          // View Button
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

          // Data Columns
          columns.forEach(col => {
            const td = document.createElement("td");
            let value = row[col.key];

            if (Array.isArray(value)) {
              value = value.join(", ");
            }

            td.textContent = value != null ? value : "";
            
            // Optional: Einfärbung für wichtige Hacking-Werte
            if (col.key === "compute") td.style.color = "#ffff00"; // Gelb
            if (col.key === "firewall") td.style.color = "#ff4444"; // Rot

            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);

      })
      .catch(err => {
        console.error("Error loading cyberdecks:", err);
        container.textContent = "Error loading cyberdecks.";
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
        { key: "hull",       label: "Hull" },
        { key: "firewall",   label: "Firewall" },
        { key: "signal",     label: "Range" },
        { key: "autopilot",  label: "Auto" },
        { key: "speed",      label: "Speed" },
      //  { key: "mask",       label: "Mask"nance },
        { key: "ordnance",   label: "Ordnance" },
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

// Kampfdrohenn

function loadCombatDronesTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.textContent = "Loading combat drones...";

    fetch("/api/combat_drones")
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.textContent = "No combat drones found.";
                return;
            }
            container.textContent = "";

            const columns = [
                { key: "name", label: "Name" },
                { key: "firewall", label: "Fwl" },
                { key: "signal", label: "Range" },
                { key: "speed", label: "Spd" },
                { key: "ordnance", label: "Ord" },
                { key: "hp", label: "HP" },
                { key: "stun_hp", label: "Stun" },
                { key: "armor", label: "Arm" },
                { key: "price", label: "Price" }
            ];

            const table = document.createElement("table");
            table.className = "character-table";
            const thead = document.createElement("thead");
            const tbody = document.createElement("tbody");

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

            data.forEach(row => {
                const tr = document.createElement("tr");
                const viewTd = document.createElement("td");
                const viewBtn = document.createElement("button");
                viewBtn.textContent = "View";
                viewBtn.onclick = () => openItemModal({
                    name: row.name,
                    description: row.description,
                    image: row.image_url ? `/static/img/${row.image_url}` : "/static/img/placeholder.png"
                });
                viewTd.appendChild(viewBtn);
                tr.appendChild(viewTd);

                columns.forEach(col => {
                    const td = document.createElement("td");
                    td.textContent = row[col.key] ?? "";
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            container.appendChild(table);
        })
        .catch(err => {
            console.error(err);
            container.textContent = "Error loading combat drones.";
        });
}


});











