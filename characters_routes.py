# characters_routes.py
from flask import Blueprint, jsonify, request, abort
from flask_login import login_required, current_user
from psycopg2.extras import RealDictCursor
import psycopg2.extras
from db import get_conn

characters_bp = Blueprint("characters_bp", __name__)


# ---------------------------------------------------------
# GET /api/characters
# ---------------------------------------------------------
@characters_bp.get("/api/characters")
def api_characters_all():
    try:
        limit = int(request.args.get("limit", 100))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        limit, offset = 100, 0

    sql = """
        SELECT
            id,
            name,
            char_class,
            player,
            user_id
        FROM characters
        ORDER BY name ASC
        LIMIT %s OFFSET %s
    """

    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (limit, offset))
            rows = cur.fetchall()

    return jsonify(rows)


# ---------------------------------------------------------
# GET /api/my_characters
# ---------------------------------------------------------
@characters_bp.get("/api/my_characters")
@login_required
def api_my_characters():
    try:
        limit = int(request.args.get("limit", 100))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        limit, offset = 100, 0

    sql = """
        SELECT
            id,
            name,
            char_class,
            player,
            user_id
        FROM characters
        WHERE user_id = %s
        ORDER BY name ASC
        LIMIT %s OFFSET %s
    """

    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (current_user.id, limit, offset))
            rows = cur.fetchall()

    return jsonify(rows)


# ---------------------------------------------------------
# GET /api/character/<id>/details
# ---------------------------------------------------------
@characters_bp.get("/api/character/<int:char_id>/details")
def api_character_details(char_id: int):

    sql = """  -- shortened here for readability
        SELECT *
        FROM characters
        WHERE id = %s
    """

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, (char_id,))
                row = cur.fetchone()

        if row is None:
            abort(404, description="Character not found")

        return jsonify(row)

    except Exception as e:
        print("Error in api_character_details:", e)
        abort(500, description="Database error while fetching character details")


# ---------------------------------------------------------
# GET /api/character/<id>/skills
# ---------------------------------------------------------
@characters_bp.get("/api/character/<int:char_id>/skills")
def api_character_skills(char_id: int):

    sql = """
        SELECT
            cs.skill_id,
            cs.skill_level,
            s.name AS skill_name,
            s.specializations,
            s.linked_attribute_pair,
            s.learning_cost
        FROM characters_skills AS cs
        JOIN skills AS s
          ON s.id = cs.skill_id
        WHERE cs.character_id = %s
        ORDER BY s.name;
    """

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, (char_id,))
                rows = cur.fetchall()

        return jsonify(rows)

    except Exception as e:
        print("Error in api_character_skills:", e)
        abort(500, description="Database error while fetching character skills")


# ---------------------------------------------------------
# GET /api/character/<id>/cyberware
# ---------------------------------------------------------
@characters_bp.get("/api/character/<int:char_id>/cyberware")
def api_character_cyberware(char_id: int):

    sql = """
        SELECT
            cc.character_id,
            cw.id AS cyberware_id,
            i.name,
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
        ORDER BY cw.cyberware_type, i.name;
    """

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, (char_id,))
                rows = cur.fetchall()

        return jsonify(rows)

    except Exception as e:
        print("Error in api_character_cyberware:", e)
        abort(500, description="Database error while fetching cyberware")


# ---------------------------------------------------------
# Inventory & Stash (Generic Handler)
# ---------------------------------------------------------
@characters_bp.get("/api/character/<int:char_id>/inventory")
def api_character_inventory(char_id: int):
    # HIER description und image_url hinzugefügt:
    sql = """
        SELECT ci.item_id, ci.quantity, i.name, i.weight, i.features, i.description, i.image_url
        FROM characters_inventory ci
        JOIN items i ON ci.item_id = i.id
        WHERE ci.character_id = %s
        ORDER BY i.name ASC;
    """
    return fetch_items_generic(char_id, sql)


@characters_bp.get("/api/character/<int:char_id>/stash")
def api_character_stash(char_id: int):
    # HIER description und image_url hinzugefügt:
    sql = """
        SELECT cs.item_id, cs.quantity, i.name, i.weight, i.features, i.description, i.image_url
        FROM characters_stash cs
        JOIN items i ON cs.item_id = i.id
        WHERE cs.character_id = %s
        ORDER BY i.name ASC;
    """
    return fetch_items_generic(char_id, sql)


def fetch_items_generic(char_id, sql):
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, (char_id,))
                rows = cur.fetchall()

        return jsonify(rows)

    except Exception as e:
        print(f"Database error for character {char_id}: {e}")
        abort(500, description="Database error loading items")
