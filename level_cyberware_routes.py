# level_cyberware_routes.py
from flask import Blueprint, jsonify, request, abort
from psycopg2.extras import RealDictCursor
from db import get_conn

level_cyberware_bp = Blueprint("level_cyberware_bp", __name__)

# 1. Installierte Cyberware laden (Identisch zum View-Modal + Preis)
@level_cyberware_bp.get("/api/character/<int:char_id>/level/cyberware")
def api_get_installed_cyberware(char_id):
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Wir laden ALLE Stats, genau wie im View-Modal, plus 'i.price' für den Verkauf
                cur.execute("""
                    SELECT
                        cc.character_id,
                        cw.id AS cyberware_id,
                        i.name,
                        i.price,
                        i.features,
                        cw.cyberware_type,
                        cw.humanity_cost,
                        cw.stamina_bonus,
                        cw.strength_bonus,
                        cw.agility_bonus,
                        cw.reaction_bonus,
                        cw.intuition_bonus,
                        cw.logic_bonus,
                        cw.composure_bonus,
                        cw.charisma_bonus,
                        cw.action_bonus,
                        cw.armor_bonus,
                        cw.shock_absorption
                    FROM characters_cyberware cc
                    JOIN cyberware cw ON cc.cyberware_id = cw.id
                    JOIN items i ON cw.item_id = i.id
                    WHERE cc.character_id = %s
                    ORDER BY cw.cyberware_type, i.name
                """, (char_id,))
                items = cur.fetchall()
                return jsonify(items)
    except Exception as e:
        print("Error fetching installed cyberware:", e)
        abort(500)

# 2. Cyberware verkaufen (Gleiche Logik wie zuvor)
@level_cyberware_bp.post("/api/character/<int:char_id>/level/cyberware/sell")
def api_sell_cyberware(char_id):
    data = request.json
    cyberware_id = data.get("cyberware_id")

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                
                # A) Preis holen (Sicherheitscheck)
                cur.execute("""
                    SELECT i.price, i.name 
                    FROM characters_cyberware cc
                    JOIN cyberware cw ON cc.cyberware_id = cw.id
                    JOIN items i ON cw.item_id = i.id
                    WHERE cc.character_id = %s AND cc.cyberware_id = %s
                """, (char_id, cyberware_id))
                
                row = cur.fetchone()
                
                if not row:
                    return jsonify({"error": "Cyberware not found"}), 404

                refund_amount = row['price']
                item_name = row['name']

                # B) Geld gutschreiben
                cur.execute("UPDATE characters SET money = money + %s WHERE id = %s", (refund_amount, char_id))

                # C) Zeile löschen
                cur.execute("""
                    DELETE FROM characters_cyberware
                    WHERE character_id = %s AND cyberware_id = %s
                """, (char_id, cyberware_id))

                # D) Neuer Kontostand
                cur.execute("SELECT money FROM characters WHERE id = %s", (char_id,))
                new_money = cur.fetchone()['money']

                return jsonify({
                    "success": True,
                    "new_money": new_money,
                    "message": f"Removed {item_name}"
                })

    except Exception as e:
        print("Error removing cyberware:", e)
        abort(500)