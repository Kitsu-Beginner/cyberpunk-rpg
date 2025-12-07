# level_shop_routes.py
from flask import Blueprint, jsonify, request, abort
from psycopg2.extras import RealDictCursor
from db import get_conn

level_shop_bp = Blueprint("level_shop_bp", __name__)

@level_shop_bp.post("/api/character/<int:char_id>/shop/buy")
def api_shop_buy(char_id: int):
    # Payload: { "item_id": 123, "category": "weapon", "qty": 10 }
    data = request.json
    item_id = int(data.get("item_id"))
    category = data.get("category") 
    qty = int(data.get("qty", 1))

    if qty < 1:
        return jsonify({"error": "Quantity must be positive"}), 400

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                
                # 1. Preis holen
                cur.execute("SELECT price, name FROM items WHERE id = %s", (item_id,))
                item_row = cur.fetchone()
                
                if not item_row:
                    abort(404, description="Item not found")
                
                price_per_unit = item_row['price']
                total_cost = price_per_unit * qty

                # 2. Geld checken & abziehen
                cur.execute("SELECT money FROM characters WHERE id = %s FOR UPDATE", (char_id,))
                char_row = cur.fetchone()
                
                current_money = char_row['money']
                
                if current_money < total_cost:
                    return jsonify({
                        "error": "Not enough Money",
                        "required": total_cost,
                        "current": current_money
                    }), 400

                # Geld abziehen
                cur.execute("""
                    UPDATE characters 
                    SET money = money - %s 
                    WHERE id = %s
                """, (total_cost, char_id))

                # 3. Item einfügen
                if category == "cyberware":
                    # KORREKTUR HIER:
                    # 1. Wir entfernen 'item_id' aus dem INSERT.
                    # 2. Wir fügen 'ON CONFLICT DO NOTHING' hinzu, damit kein Fehler kommt, 
                    #    wenn man das Teil schon hat.
                    for _ in range(qty):
                        cur.execute("""
                            INSERT INTO characters_cyberware (character_id, cyberware_id)
                            SELECT %s, c.id
                            FROM cyberware c WHERE c.item_id = %s
                            ON CONFLICT (character_id, cyberware_id) DO NOTHING
                        """, (char_id, item_id))

                else:
                    # Stash Logic (bleibt gleich)
                    cur.execute("""
                        INSERT INTO characters_stash (character_id, item_id, quantity)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (character_id, item_id)
                        DO UPDATE SET quantity = characters_stash.quantity + EXCLUDED.quantity
                    """, (char_id, item_id, qty))

                # 4. Rückgabe
                cur.execute("SELECT money FROM characters WHERE id = %s", (char_id,))
                new_money = cur.fetchone()['money']

                return jsonify({
                    "success": True,
                    "new_money": new_money,
                    "message": f"Bought {qty}x {item_row['name']}"
                })

    except Exception as e:
        print("Error in shop buy:", e)
        abort(500, description="Transaction failed (Database Error)")