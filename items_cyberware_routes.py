# items_cyberware_routes.py
from flask import Blueprint, jsonify, request, abort
from db import get_conn
from psycopg2.extras import RealDictCursor


cyberware_bp = Blueprint("cyberware_bp", __name__)

VALID_CATEGORIES = {"head", "torso", "arms", "legs"}

@cyberware_bp.get("/api/cyberware_with_items/<category>")
def api_cyberware_with_items(category):
    cat = category.lower()
    if cat not in VALID_CATEGORIES:
        abort(404, description="Unknown cyberware category")

    try:
        limit = int(request.args.get("limit", 100))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        limit, offset = 100, 0

    # FINALE ABFRAGE (NACHDEM 'cyberware.features' GELÖSCHT WURDE)
    # Diese Abfrage holt explizit alle 'items'-Spalten, die wir brauchen.
    sql = """
        SELECT
            i.id,
            i.name,
            i.description,
            i.price,
            i.legality,
            i.weight,
            i.image_url,
            
            -- Wählt die features aus der 'items'-Tabelle
            COALESCE(array_to_json(i.features), '[]'::json) AS features,
            
            c.humanity_cost,
            c.cyberware_type,
            c.stamina_bonus,
                        c.strength_bonus,
                        c.agility_bonus,
                        c.reaction_bonus,
                        c.intuition_bonus,
                        c.logic_bonus,
                        c.composure_bonus,
                        c.charisma_bonus,
                        c.armor_bonus,
                        c.shock_absorption,
                        c.action_bonus
            
        FROM cyberware c
        JOIN items i ON i.id = c.item_id
        WHERE LOWER(c.cyberware_type::TEXT) = %s
        ORDER BY i.name ASC
        LIMIT %s OFFSET %s
    """
    
    conn = None 
    try:
        conn = get_conn()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (cat, limit, offset))
            rows = cur.fetchall()
            
    except Exception as e:
        print("ERROR in /api/cyberware_with_items/<category>:", e)
        abort(500, description="Database error while fetching cyberware")
    
    finally:
        if conn:
            conn.close()

    return jsonify(rows)