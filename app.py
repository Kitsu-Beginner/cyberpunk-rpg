# app.py
from flask import Flask, render_template, jsonify
from db import get_conn
from items_weapons_routes import items_weapons_bp  # <-- NEW
from items_cyberware_routes import cyberware_bp
from auth import auth_bp, login_manager
from characters_routes import characters_bp


app = Flask(__name__)


# Register the blueprint
app.register_blueprint(items_weapons_bp)
app.register_blueprint(cyberware_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(characters_bp)

app.secret_key = "something secure"   # make sure it exists!

login_manager.init_app(app)





# existing home route:
@app.route("/")
def home():
    return render_template("index.html")



# you can still have /ping etc. here if you like
@app.route("/ping")
def ping():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    result = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify({"ping": result[0]})

if __name__ == "__main__":
    app.run(debug=True)
