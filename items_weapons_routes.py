# items_weapons_routes.py
from flask import Blueprint, jsonify
from db import get_conn
import psycopg2.extras

# Create a blueprint.
# The name "items_weapons" is just an internal name; the url_prefix decides the URL path.
items_weapons_bp = Blueprint("items_weapons", __name__, url_prefix="/api")

@items_weapons_bp.route("/weapons")
def api_weapons():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM weapons ORDER BY id LIMIT 100;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

# later you can add more routes here, e.g.:
# @items_weapons_bp.route("/armor")
# def api_armor():
#     ...












@items_weapons_bp.route("/weapons_with_items")
def api_weapons_with_items():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT 
            w.id AS weapon_id,
            w.item_id,
            i.name,
            i.description,
            i.price,
            i.weight,
            i.legality,
            i.image_url,
            COALESCE(array_to_json(i.features), '[]'::json) AS features,    
            w.type,
            w.calibr,
            w.damage,
            w.penetration,
            w.max_range,
            w.ammo,
            w.auto_bonus,
            w.damage_type
        FROM weapons w
        JOIN items i ON w.item_id = i.id
        ORDER BY w.id;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)












@items_weapons_bp.route("/weapons_with_items/<weapon_type>")
def api_weapons_with_items_filtered(weapon_type):
    """
    Return only weapons of a given type (e.g. pistol, rifle, shotgun).
    The type is read from the URL as <weapon_type>.
    """
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT 
            w.id AS weapon_id,
            w.item_id,
            i.name,
            i.description,
            i.price,
            i.weight,
            i.legality,
            i.image_url, 
            COALESCE(array_to_json(i.features), '[]'::json) AS features,   
            w.type,
            w.calibr,
            w.damage,
            w.penetration,
            w.max_range,
            w.ammo,
            w.auto_bonus,
            w.damage_type
        FROM weapons w
        JOIN items i ON w.item_id = i.id
        WHERE w.type = %s
        ORDER BY w.id;
    """, (weapon_type,))

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)










@items_weapons_bp.route("/ammunition_with_items/<category>")
def api_ammunition_with_items(category):
    """
    Return ammunition joined with items, filtered by category:
    - 'rounds'   -> all ammo where weapon_caliber NOT IN ('40mm LV', 'grenade')
    - 'grenades' -> ammo where weapon_caliber IN ('40mm LV', 'grenade')
    - 'rockets'  -> currently nothing (no data yet), returns empty list
    """
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cat = category.lower()

    if cat == "grenades":
        where_clause = "a.weapon_caliber IN ('40mm LV', 'grenade')"
    elif cat == "rounds":
        where_clause = "a.weapon_caliber NOT IN ('40mm LV', 'grenade')"
    elif cat == "rockets":
        # no rocket ammo yet -> return empty result on purpose
        cur.close()
        conn.close()
        return jsonify([])
    else:
        # unknown category -> empty result
        cur.close()
        conn.close()
        return jsonify([])

    cur.execute(f"""
        SELECT
            a.id AS ammo_id,
            a.item_id,
            i.name,
            i.description,
            i.price,
            i.weight,
            i.legality,
            i.image_url,
            COALESCE(array_to_json(i.features), '[]'::json) AS features,
            a.damage_modifier,
            a.penetration_modifier,
            a.auto_bonus,
            a.weapon_caliber,
            a.damage_type
        FROM ammunition a
        JOIN items i ON a.item_id = i.id
        WHERE {where_clause}
        ORDER BY a.id;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)












@items_weapons_bp.route("/armor_with_items")
def api_armor_with_items():
    """
    Return all armor entries joined with items.
    Assumes a table `armor` with a column `item_id` referencing items.id.
    """
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            a.id AS armor_id,
            a.item_id,
            a.armor_value,
            a.shock_absorption,
            a.coverage_area,
            i.name,
            i.description,
            i.price,
            i.weight,
            i.legality,
            i.image_url,
            COALESCE(array_to_json(i.features), '[]'::json) AS features,
            a.*  -- includes all armor-specific columns
        FROM armor a
        JOIN items i ON a.item_id = i.id
        ORDER BY a.id;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)














@items_weapons_bp.route("/headware_with_items")
def api_headware_with_items():
    """
    Return all headware entries joined with items.
    Assumes a table `headware` with a column `item_id` referencing items.id.
    """
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            h.id AS headware_id,
            h.item_id,
            h.armor_value,
            h.shock_absorption,
            i.name,
            i.description,
            i.price,
            i.weight,
            i.legality,
            i.image_url,
            COALESCE(array_to_json(i.features), '[]'::json) AS features,
            h.*  -- includes all headware-specific columns
        FROM headware h
        JOIN items i ON h.item_id = i.id
        ORDER BY h.id;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)












