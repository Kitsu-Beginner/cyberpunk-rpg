from flask import Blueprint, jsonify
from db import get_conn
import psycopg2.extras


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
            c.encryption,
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
            d.encryption,
            d.signal,
            d.speed,
            d.slots,
            d.hull,
            d.size    
            
        FROM drones d
        JOIN items i ON d.item_id = i.id
        ORDER BY d.id;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)