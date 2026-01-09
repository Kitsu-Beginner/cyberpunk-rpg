# features_routes.py
from flask import Blueprint, jsonify
from db import get_conn
import psycopg2.extras
import sys

features_bp = Blueprint("features", __name__, url_prefix="/api")

@features_bp.get("/features_description")
def api_list_features_description():
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # SQL-Korrektur: Wir erzwingen die alphabetische Sortierung
                query = """
                    SELECT feature_name, description 
                    FROM features_description 
                    ORDER BY feature_name ASC;
                """
                cur.execute(query)
                features = cur.fetchall()
                
                # Debug-Ausgabe im Terminal (optional), um zu sehen was die DB liefert
                # print(f"Fetched {len(features)} features sorted by name.")
                
                return jsonify(features)
    except Exception as e:
        print("DATABASE ERROR in features_routes:", file=sys.stderr)
        print(e, file=sys.stderr)
        return jsonify({"error": "Database Error", "details": str(e)}), 500