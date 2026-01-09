from flask import Blueprint, jsonify
from db import get_conn
import psycopg2.extras

# Der Blueprint hat bereits /api als Präfix
items_commlinks_bp = Blueprint("items_commlinks", __name__, url_prefix="/api")

@items_commlinks_bp.route("/commlinks")
def api_commlinks():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT 
            c.id AS commlinks_id,
            c.item_id,
            i.name,
            i.description,
            i.price,
            i.weight,
            i.legality,
            i.image_url,
            COALESCE(array_to_json(i.features), '[]'::json) AS features,    
            c.firewall,
            c.signal,
            c.compute
        FROM commlinks c
        JOIN items i ON c.item_id = i.id
        ORDER BY c.id;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

@items_commlinks_bp.route("/drones")
def api_drones():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT 
            d.id AS drones_id,
            d.item_id,
            i.name,
            i.description,
            i.price,
            i.weight,
            i.legality,
            i.image_url,
            COALESCE(array_to_json(i.features), '[]'::json) AS features,    
            d.firewall,
            d.signal,
            d.speed,
            d.autopilot,
            d.ordnance,
            d.hull
                    
        FROM drones d
        JOIN items i ON d.item_id = i.id
        ORDER BY i.name ASC;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

@items_commlinks_bp.get("/cyberdecks")
def api_list_cyberdecks():
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute("""
                    SELECT 
                        i.id, i.name, i.price, i.weight, i.description, i.image_url, i.features, i.legality,
                        d.compute, d.firewall, d.signal
                    FROM cyberdecks d
                    JOIN items i ON d.item_id = i.id
                    ORDER BY i.price ASC
                """)
                decks = cur.fetchall()
                return jsonify(decks)
    except Exception as e:
        print("Error fetching cyberdecks:", e)
        return jsonify({"error": "Database error"}), 500

@items_commlinks_bp.get("/combat_drones")
def api_list_combat_drones():
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # Korrektur: cd.signal eingefügt und Syntax gefixt
                cur.execute("""
                    SELECT 
                        i.id, i.name, i.price, i.weight, i.description, i.image_url, i.legality, i.features,
                        cd.firewall, cd.signal, cd.speed, cd.ordnance, cd.hp, cd.stun_hp, cd.armor
                    FROM combat_drones cd
                    JOIN items i ON cd.item_id = i.id
                    ORDER BY i.price ASC
                """)
                drones = cur.fetchall()
                return jsonify(drones)
    except Exception as e:
        print("Error fetching combat drones:", e)
        return jsonify({"error": "Database error"}), 500