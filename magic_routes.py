# magic_routes.py
from flask import Blueprint, jsonify
from db import get_conn
import psycopg2.extras
import sys

# Blueprint für Magie-Routen
magic_bp = Blueprint("magic", __name__, url_prefix="/api")

@magic_bp.get("/spells")
def api_list_spells():
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # Wir holen die wichtigsten Felder für die Liste
                # Sortierung erfolgt alphabetisch nach 'name'
                cur.execute("""
                    SELECT 
                        id, name, specialization, action_cost, 
                        description, range, concentration, 
                        drain_logic, drain_base_value, damage_type
                            
                    FROM spells 
                    ORDER BY name ASC
                """)
                spells = cur.fetchall()
                return jsonify(spells)
    except Exception as e:
        print("DATABASE ERROR in magic_routes:", file=sys.stderr)
        print(e, file=sys.stderr)
        return jsonify({"error": "Database Error", "details": str(e)}), 500