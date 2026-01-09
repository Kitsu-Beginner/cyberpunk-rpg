# skill_routes.py
from flask import Blueprint, jsonify
from db import get_conn
import psycopg2.extras
import sys

# Blueprint for Skill routes
skill_bp = Blueprint("skills", __name__, url_prefix="/api")

@skill_bp.get("/skills")
def api_list_skills():
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # Fetching all relevant skill data
                # Sort alphabetically for the UI
                cur.execute("""
                    SELECT 
                        id, 
                        name, 
                        description, 
                        specializations, 
                        linked_attribute_pair, 
                        always_learned, 
                        learning_cost
                    FROM skills 
                    ORDER BY name ASC
                """)
                skills = cur.fetchall()
                return jsonify(skills)
    except Exception as e:
        print("DATABASE ERROR in skill_routes:", file=sys.stderr)
        print(e, file=sys.stderr)
        return jsonify({"error": "Database Error", "details": str(e)}), 500