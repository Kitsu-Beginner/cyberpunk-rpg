# characters_routes.py
from flask import Blueprint, jsonify, request, abort
from flask_login import login_required, current_user
from psycopg2.extras import RealDictCursor
from db import get_conn

characters_bp = Blueprint("characters_bp", __name__)

@characters_bp.get("/api/characters")
def api_characters_all():
    """
    Return a list of all characters.
    Later we can add filters, pagination, etc.
    """
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

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (limit, offset))
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify(rows)


@characters_bp.get("/api/my_characters")
@login_required
def api_my_characters():
    """
    Return only characters that belong to the logged-in user.
    """
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

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (current_user.id, limit, offset))
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify(rows)



from flask import Blueprint, jsonify, abort
from db import get_conn
import psycopg2.extras

# you **already** have something like this in characters_routes.py:
# characters_bp = Blueprint("characters_bp", __name__)

@characters_bp.get("/api/character/<int:char_id>/details")
def api_character_details(char_id: int):
    """
    Return ALL columns from the characters table for a single character,
    as a flat JSON object. No grouping, no renaming.
    """

    sql = """
        SELECT
            id,
            name,
            char_class,
            player,                


            stamina,
            strength,
            agility,
            reaction,
            intuition,
            logic,
            composure,
            charisma,
            humanity_int,

            -- all attribute-attribute combinations
            agility_charisma,
            agility_composure,
            agility_intuition,
            agility_logic,
            agility_reaction,
            agility_stamina,
            agility_strength,
            charisma_composure,
            charisma_intuition,
            charisma_logic,
            charisma_reaction,
            charisma_stamina,
            charisma_strength,
            composure_intuition,
            composure_logic,
            composure_reaction,
            composure_stamina,
            composure_strength,
            intuition_logic,
            intuition_reaction,
            intuition_stamina,
            intuition_strength,
            logic_reaction,
            logic_stamina,
            logic_strength,
            reaction_stamina,
            reaction_strength,
            stamina_strength,
            agility_humanity,
            charisma_humanity,
            composure_humanity,
            humanity_intuition,
            humanity_logic,
            humanity_reaction,
            humanity_stamina,
            humanity_strength,

            -- base attributes
            stamina_base,
            strength_base,
            agility_base,
            reaction_base,
            intuition_base,
            logic_base,
            composure_base,
            charisma_base,

            -- derived stuff
            action_points,
            initiative,
            speed,
            carry_weight,
            defense_pool,
            humanity,
            magic,
            xp,

            -- attribute mods
            stamina_mod,
            strength_mod,
            agility_mod,
            reaction_mod,
            intuition_mod,
            logic_mod,
            composure_mod,
            charisma_mod,

            -- other totals / economy
            total_weight,
            money,

            -- armor & shock absorption
            shock_absorption,
            natural_armor,
            armor_bonus,
            armor_total,
            shock_absorption_bonus,
            shock_absorption_total       

           
        FROM characters
        WHERE id = %s
    """

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, (char_id,))
                row = cur.fetchone()

        if row is None:
            abort(404, description="Character not found")

        # row is already a dict because of RealDictCursor
        return jsonify(row)

    except Exception as e:
        # For debugging; in production you’d log this
        print("Error in api_character_details:", e)
        abort(500, description="Database error while fetching character details")



@characters_bp.get("/api/character/<int:char_id>/skills")
def api_character_skills(char_id: int):
    """
    Return all skills for a single character as a flat list of rows.
    Uses the characters_skills join table + skills table.
    """
    try:
        conn = get_conn()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    """
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
                    """,
                    (char_id,),
                )

                rows = cur.fetchall()

        return jsonify(rows)

    except Exception as e:
        # optional: log e somewhere
        print("Error in api_character_skills:", e)
        abort(500, description="Database error while fetching character skills")



@characters_bp.get("/api/character/<int:char_id>/cyberware")
def api_character_cyberware(char_id: int):
    """
    Gibt alle Cyberware-Installationen zurück.
    Schema-korrigierte Version.
    """
    sql = """
        SELECT
            -- Basis-IDs
            cc.character_id,
            cw.id AS cyberware_id,
            
            -- Item Details (Name, Beschreibung, Features)
            i.name,
            i.features,
            
            -- Cyberware Stats
            cw.cyberware_type,  -- Nutzen wir als 'Slot'
            cw.humanity_cost,
            
            -- Alle Boni (Exakte Spaltennamen aus Schema)
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
            cw.shock_absorption  -- Hieß im Schema so, nicht _bonus

        FROM characters_cyberware cc
        -- 1. Verknüpfung: cc -> cw (über cyberware_id)
        JOIN cyberware cw ON cc.cyberware_id = cw.id
        -- 2. Verknüpfung: cw -> i (über item_id)
        JOIN items i ON cw.item_id = i.id
        
        WHERE cc.character_id = %s
        ORDER BY cw.cyberware_type, i.name;
    """

    try:
        conn = get_conn()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, (char_id,))
                rows = cur.fetchall()
        return jsonify(rows)

    except Exception as e:
        print("Error in api_character_cyberware:", e)
        abort(500, description="Database error while fetching cyberware")




    # --- INVENTORY (READ ONLY) ---
@characters_bp.get("/api/character/<int:char_id>/inventory")
def api_character_inventory(char_id: int):
    """
    Liest items aus der characters_inventory Tabelle.
    """
    sql = """
        SELECT
            ci.item_id,
            ci.quantity,
            i.name,
            i.weight,
            i.features
        FROM characters_inventory ci
        JOIN items i ON ci.item_id = i.id
        WHERE ci.character_id = %s
        ORDER BY i.name ASC;
    """
    return fetch_items_generic(char_id, sql)


# --- STASH (READ ONLY) ---
@characters_bp.get("/api/character/<int:char_id>/stash")
def api_character_stash(char_id: int):
    """
    Liest items aus der characters_stash Tabelle.
    """
    sql = """
        SELECT
            cs.item_id,
            cs.quantity,
            i.name,
            i.weight,
            i.features
        FROM characters_stash cs
        JOIN items i ON cs.item_id = i.id
        WHERE cs.character_id = %s
        ORDER BY i.name ASC;
    """
    return fetch_items_generic(char_id, sql)


# --- HELPER FUNCTION (um Code-Dopplung zu vermeiden) ---
def fetch_items_generic(char_id, sql):
    conn = get_conn()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(sql, (char_id,))
                rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        print(f"Database error for char {char_id}: {e}")
        abort(500, description="Database error loading items")





 




















