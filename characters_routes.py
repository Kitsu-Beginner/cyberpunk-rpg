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
# POST /api/character/<id>/attribute/update
# ---------------------------------------------------------
@characters_bp.post("/api/character/<int:char_id>/attribute/update")
def api_update_attribute(char_id: int):
    # 1. Daten aus dem Request holen
    data = request.json
    attr_name = data.get("attribute")
    edit_type = data.get("type")       
    change = int(data.get("change", 0))

    # 2. Whitelist
    ALLOWED_ATTRS = {
        "stamina", "strength", "agility", "reaction", 
        "intuition", "logic", "composure", "charisma"
    }

    if attr_name not in ALLOWED_ATTRS:
        abort(400, description="Invalid attribute name")

    if change == 0:
        return jsonify({"message": "No change requested"}), 200

    # 3. Datenbank-Transaktion
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                
                col_base = f"{attr_name}_base"
                col_mod = f"{attr_name}_mod"
                # HIER: Wir holen jetzt auch den Total-Wert (der heißt genau wie attr_name)
                cur.execute(f"SELECT xp, {col_base}, {col_mod}, {attr_name} FROM characters WHERE id = %s FOR UPDATE", (char_id,))
                char_data = cur.fetchone()

                if not char_data:
                    abort(404, description="Character not found")

                current_xp = char_data["xp"]
                current_base = char_data[col_base]
                current_mod = char_data[col_mod]
                current_total = char_data[attr_name] # Das ist z.B. der Wert in 'strength'

                # B) Logik berechnen
                xp_cost_delta = 0
                new_base = current_base
                new_mod = current_mod
                new_total = current_total

                if edit_type == "base":
                    # --- BASE ÄNDERN (Kostet XP) ---
                    # Wenn wir Base ändern, ändern wir logischerweise auch Total mit
                    # (Total = Base + Mod). Da Total keine generated column ist, müssen wir beides updaten.
                    
                    new_base = current_base + change
                    new_total = new_base + current_mod # Total zieht mit
                    
                    # Sicherheits-Check
                    if new_base < 1:
                         return jsonify({"description": "Attribute base cannot go below 1"}), 400

                    if change > 0:
                        # KAUFEN
                        cost = new_base * 2
                        if current_xp < cost:
                            return jsonify({
                                "error": "Not enough XP",
                                "required": cost,
                                "current": current_xp
                            }), 400
                        xp_cost_delta = cost

                    elif change < 0:
                        # REFUND
                        refund = current_base * 2
                        xp_cost_delta = -refund

                elif edit_type == "total":
                    # --- TOTAL DIREKT ÄNDERN (Kostenlos) ---
                    # Hier ändern wir NUR den Total-Wert. 
                    # Base und Mod bleiben gleich. (Damit kann Base + Mod != Total sein, was gewollt ist)
                    new_total = current_total + change
                    
                    # Optionaler Safety Check: Attribut sollte nicht negativ sein
                    if new_total < 1:
                         return jsonify({"description": "Total attribute cannot go below 1"}), 400

                else:
                    abort(400, description="Invalid edit type")

                # C) Update durchführen
                # Wir schreiben jetzt explizit auch in die Spalte {attr_name} (Total)
                update_sql = f"""
                    UPDATE characters 
                    SET xp = xp - %s,
                        {col_base} = %s,
                        {col_mod} = %s,
                        {attr_name} = %s
                    WHERE id = %s
                    RETURNING *;
                """
                
                cur.execute(update_sql, (xp_cost_delta, new_base, new_mod, new_total, char_id))
                updated_row = cur.fetchone()
                
                return jsonify(updated_row)

    except Exception as e:
        print("Error updating attribute:", e)
        abort(500, description="Database error during update")




# ---------------------------------------------------------
# POST /api/character/<id>/exchange/money
# ---------------------------------------------------------
@characters_bp.post("/api/character/<int:char_id>/exchange/money")
def api_exchange_money(char_id: int):
    # direction: "buy" (+Money, -XP) oder "sell" (-Money, +XP)
    data = request.json
    direction = data.get("direction")
    
    if not direction:
        abort(400, description="Missing direction")

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Aktuelle Werte holen und sperren
                cur.execute("SELECT xp, money FROM characters WHERE id = %s FOR UPDATE", (char_id,))
                char_data = cur.fetchone()
                
                if not char_data:
                    abort(404, description="Character not found")

                current_xp = char_data["xp"]
                current_money = char_data["money"]
                
                xp_change = 0
                money_change = 0

                if direction == "buy":
                    # Button [+]: +5000 Money, -1 XP
                    if current_xp < 1:
                        return jsonify({"error": "Not enough XP", "current_xp": current_xp}), 400
                    
                    xp_change = -1
                    money_change = 5000

                elif direction == "sell":
                    # Button [-]: -5000 Money, +1 XP
                    if current_money < 5000:
                        return jsonify({"error": "Not enough Money", "current_money": current_money}), 400
                    
                    xp_change = 1
                    money_change = -5000
                
                else:
                    abort(400, description="Invalid direction")

                # Update durchführen
                update_sql = """
                    UPDATE characters 
                    SET xp = xp + %s, money = money + %s
                    WHERE id = %s
                    RETURNING xp, money;
                """
                cur.execute(update_sql, (xp_change, money_change, char_id))
                updated_row = cur.fetchone()
                
                return jsonify(updated_row)

    except Exception as e:
        print("Error exchanging money:", e)
        abort(500, description="Database error")







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
