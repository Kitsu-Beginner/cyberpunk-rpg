# app.py
import os
from flask import Flask, render_template, jsonify
from db import get_conn
from items_weapons_routes import items_weapons_bp
from items_cyberware_routes import cyberware_bp
from items_commlinks_routes import items_commlinks_bp
from auth import auth_bp, login_manager
from characters_routes import characters_bp
from level_skills_routes import level_skills_bp
from level_shop_routes import level_shop_bp
from level_stash_routes import level_stash_bp
from level_cyberware_routes import level_cyberware_bp
from features_routes import features_bp
from magic_routes import magic_bp
from skill_routes import skill_bp



def create_app():
    app = Flask(__name__)

    # SECRET_KEY should be set in the environment in production.
    # For local dev, we fall back to a simple default.
    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY",
        "dev-secret-change-me"
    )

    # Register blueprints
    app.register_blueprint(items_weapons_bp)
    app.register_blueprint(cyberware_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(characters_bp)
    app.register_blueprint(items_commlinks_bp)
    app.register_blueprint(level_skills_bp)
    app.register_blueprint(level_shop_bp)
    app.register_blueprint(level_stash_bp)
    app.register_blueprint(level_cyberware_bp)
    app.register_blueprint(features_bp)
    app.register_blueprint(magic_bp)
    app.register_blueprint(skill_bp)



    # Flask-Login setup
    login_manager.init_app(app)

    # ---- Routes ----

    @app.route("/")
    def home():
        return render_template("index.html")

    @app.route("/ping")
    def ping():
        """
        Simple health check that also verifies DB connectivity.
        """
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1;")
        result = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify({"ping": result[0]})

    return app


# WSGI entry point for production (gunicorn, render, etc.)
app = create_app()

if __name__ == "__main__":
    # Local development server
    debug_flag = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(debug=debug_flag)
