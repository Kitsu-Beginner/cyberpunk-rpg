# level_skills_routes.py
from flask import Blueprint, jsonify, request, abort
from psycopg2.extras import RealDictCursor
from db import get_conn

# Wir definieren einen eigenen Blueprint
level_skills_bp = Blueprint("level_skills_bp", __name__)


#########################################################################

@level_skills_bp.get("/api/skills/master_list")
def api_get_master_skill_list():
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Wir holen Name und verknüpftes Attribut für ALLE Skills
                cur.execute("SELECT name, linked_attribute_pair FROM skills")
                rows = cur.fetchall()
                return jsonify(rows)
    except Exception as e:
        print("Error fetching master skill list:", e)
        abort(500, description="Database error")

#########################################################################


@level_skills_bp.post("/api/character/<int:char_id>/skill/update")
def api_update_skill(char_id: int):
    data = request.json
    skill_name = data.get("skill_name")
    change = int(data.get("change", 0))

    if change == 0:
        return jsonify({"message": "No change requested"}), 200

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # 1. Skill Stammdaten holen
                cur.execute("SELECT id, learning_cost FROM skills WHERE name = %s", (skill_name,))
                skill_master = cur.fetchone()
                
                if not skill_master:
                    abort(404, description=f"Skill '{skill_name}' not found")
                
                skill_id = skill_master['id']
                learning_cost = skill_master['learning_cost']

                # 2. Aktuellen Charakter-Status holen (mit Lock auf 'characters')
                cur.execute("""
                    SELECT c.xp, COALESCE(cs.skill_level, 0) as current_level
                    FROM characters c
                    LEFT JOIN characters_skills cs ON c.id = cs.character_id AND cs.skill_id = %s
                    WHERE c.id = %s 
                    FOR UPDATE OF c
                """, (skill_id, char_id))
                
                char_data = cur.fetchone()
                if not char_data:
                    abort(404, description="Character not found")

                current_xp = char_data['xp']
                current_level = char_data['current_level']
                new_level = current_level + change
                xp_cost = 0

                # 3. Logik: Kosten & Refund
                if change > 0:
                    # STEIGERN
                    # Neu lernen (0->1): learning_cost
                    # Steigern (1->2): Level * 1
                    xp_cost = learning_cost if new_level == 1 else new_level
                    
                    if current_xp < xp_cost:
                        return jsonify({
                            "error": "Not enough XP",
                            "required": xp_cost,
                            "current": current_xp
                        }), 400

                elif change < 0:
                    # SENKEN (Refund)
                    if new_level < 0:
                         return jsonify({"description": "Cannot go below 0"}), 400
                    
                    refund = learning_cost if current_level == 1 else current_level
                    xp_cost = -refund # Negative Kosten = Gutschrift

                # 4. Updates durchführen
                
                # A) XP
                cur.execute("UPDATE characters SET xp = xp - %s WHERE id = %s", (xp_cost, char_id))

                # B) Skill (Upsert / Delete)
                if new_level == 0:
                    cur.execute("""
                        DELETE FROM characters_skills 
                        WHERE character_id = %s AND skill_id = %s
                    """, (char_id, skill_id))
                else:
                    # ON CONFLICT löst das Problem, falls der Skill (Level 0) schon da war
                    cur.execute("""
                        INSERT INTO characters_skills (character_id, skill_id, skill_level)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (character_id, skill_id) 
                        DO UPDATE SET skill_level = EXCLUDED.skill_level
                    """, (char_id, skill_id, new_level))

                # C) Rückgabe der neuen Daten
                cur.execute("SELECT xp FROM characters WHERE id = %s", (char_id,))
                new_xp = cur.fetchone()['xp']

                return jsonify({
                    "skill_name": skill_name,
                    "new_level": new_level,
                    "new_xp": new_xp
                })

    except Exception as e:
        print("Error in level_skills_routes:", e)
        abort(500, description=str(e))