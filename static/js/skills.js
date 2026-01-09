// static/js/skills.js

document.addEventListener("DOMContentLoaded", () => {
    // Listener für den Navigations-Link
    const skillLink = document.getElementById("nav-link-skills");
    
    if (skillLink) {
        skillLink.addEventListener("click", () => {
            console.log("Skill-Net: Initializing Data Stream...");
            loadAllSkills();
        });
    }
});

const SKILL_CATEGORIES = {
    "Combat Skills": ["Firearms", "Close Combat", "Heavy Weapons", "Throwing and Archery", "Dodge"],
    "Physical Skills": ["Athletics", "Stealth", "Vehicles", "Survival"],
    "Mental Skills": ["Hacking", "Rigging", "Piloting", "Electronics", "Engineering", "Medicine"],
    "Social Skills": ["Persuasion", "Subterfuge", "Streetwise", "Investigation", "Intimidation", "Insight"],
    "Magic Skills": ["Energy Magic", "Material Magic", "Gravity Magic"]
};

async function loadAllSkills() {
    const container = document.getElementById("skills-table-container");
    if (!container) return;

    container.innerHTML = '<p style="color: var(--neon-cyan); font-style: italic;">Syncing Skill Records...</p>';

    try {
        const response = await fetch("/api/skills");
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const allSkills = await response.json();
        
        // Tabellen-HTML generieren
        let fullHtml = "";

        for (const [categoryName, skillNames] of Object.entries(SKILL_CATEGORIES)) {
            const filtered = allSkills.filter(s => skillNames.includes(s.name));
            
            if (filtered.length > 0) {
                fullHtml += `
                    <h3 style="color: var(--neon-cyan); margin-top: 40px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px; border-left: 4px solid var(--neon-cyan); padding-left: 15px;">
                        ${categoryName}
                    </h3>
                    <table class="magic-spell-table" style="width: 100%; border-collapse: separate; border-spacing: 0 10px; margin-bottom: 30px;">
                `;

                filtered.forEach(skill => {
                    // Attribut-Paar hübsch machen
                    const attrDisplay = skill.linked_attribute_pair 
                        ? skill.linked_attribute_pair.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' + ')
                        : 'N/A';

                    fullHtml += `
                        <tbody class="spell-block" style="border: 1px solid rgba(0, 243, 255, 0.3); background: rgba(0, 20, 40, 0.4);">
                            <tr class="spell-stats-row">
                                <td style="width: 25%; font-weight: bold; color: var(--neon-cyan); font-size: 1.1rem; padding: 12px;">${skill.name}</td>
                                <td style="width: 25%; padding: 12px;"><span class="stat-label">Specs:</span> ${skill.specializations || '-'}</td>
                                <td style="width: 30%; padding: 12px;"><span class="stat-label">Attributes:</span> ${attrDisplay}</td>
                                <td style="text-align: right; width: 20%; padding: 12px;">
                                    <span class="stat-label">Cost:</span> <span style="color: var(--neon-yellow);">${skill.learning_cost} XP</span>
                                </td>
                            </tr>
                            <tr class="spell-desc-row">
                                <td colspan="4" style="padding: 15px; color: var(--text-primary); line-height: 1.6; border-top: 1px solid rgba(0, 243, 255, 0.1);">
                                    ${skill.description || 'No database entry available.'}
                                </td>
                            </tr>
                        </tbody>
                    `;
                });
                fullHtml += `</table>`;
            }
        }
        container.innerHTML = fullHtml;

    } catch (err) {
        console.error("Skill Load Error:", err);
        container.innerHTML = `<p style="color: #ff0055; padding: 20px; border: 1px solid #ff0055;">Database Link Severed: ${err.message}</p>`;
    }
}