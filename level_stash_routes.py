# level_stash_routes.py
from flask import Blueprint, jsonify, request, abort
from psycopg2.extras import RealDictCursor
from db import get_conn

level_stash_bp = Blueprint("level_stash_bp", __name__)

# level_stash_routes.py (Nur diesen Teil austauschen)

@level_stash_bp.get("/api/character/<int:char_id>/stash/list")
def api_get_stash(char_id):
    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # KORREKTUR: 'i.category' wurde hier entfernt
                cur.execute("""
                    SELECT cs.item_id, cs.quantity, i.name, i.price
                    FROM characters_stash cs
                    JOIN items i ON cs.item_id = i.id
                    WHERE cs.character_id = %s
                    ORDER BY i.name
                """, (char_id,))
                items = cur.fetchall()
                return jsonify(items)
    except Exception as e:
        print("Error fetching stash:", e)
        abort(500)

# 2. Item verkaufen
@level_stash_bp.post("/api/character/<int:char_id>/stash/sell")
def api_sell_item(char_id):
    data = request.json
    item_id = data.get("item_id")
    qty_to_sell = int(data.get("qty", 1))

    try:
        with get_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # A) Prüfen: Besitzt der Spieler das Item und genug davon?
                cur.execute("""
                    SELECT quantity FROM characters_stash 
                    WHERE character_id = %s AND item_id = %s 
                    FOR UPDATE
                """, (char_id, item_id))
                row = cur.fetchone()

                if not row or row['quantity'] < qty_to_sell:
                    return jsonify({"error": "Not enough items to sell"}), 400

                current_qty = row['quantity']

                # B) Preis ermitteln
                cur.execute("SELECT price, name FROM items WHERE id = %s", (item_id,))
                item_info = cur.fetchone()
                item_price = item_info['price']

                # Hier kannst du den Faktor ändern (z.B. * 0.5 für halben Preis)
                refund_amount = item_price * qty_to_sell

                # C) Transaktion durchführen
                
                # 1. Geld geben
                cur.execute("UPDATE characters SET money = money + %s WHERE id = %s", (refund_amount, char_id))

                # 2. Item abziehen oder löschen
                new_qty = current_qty - qty_to_sell
                if new_qty > 0:
                    cur.execute("""
                        UPDATE characters_stash SET quantity = %s 
                        WHERE character_id = %s AND item_id = %s
                    """, (new_qty, char_id, item_id))
                else:
                    # Wenn Menge auf 0 fällt, Zeile komplett löschen
                    cur.execute("""
                        DELETE FROM characters_stash 
                        WHERE character_id = %s AND item_id = %s
                    """, (char_id, item_id))

                # D) Neuen Kontostand holen
                cur.execute("SELECT money FROM characters WHERE id = %s", (char_id,))
                new_money = cur.fetchone()['money']

                return jsonify({
                    "success": True,
                    "new_money": new_money,
                    "message": f"Sold {qty_to_sell}x {item_info['name']}"
                })

    except Exception as e:
        print("Error selling item:", e)
        abort(500, description="Database error")