# auth.py
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from werkzeug.security import check_password_hash
from psycopg2.extras import RealDictCursor
from db import get_conn

auth_bp = Blueprint("auth_bp", __name__)

# Flask-Login needs a User class. We use UserMixin which already has the right fields.
class User(UserMixin):
    def __init__(self, id, email, role, is_active=True):
        self.id = id
        self.email = email
        self.role = role
        self.is_active_user = is_active

    def is_active(self):
        return self.is_active_user


# This gets set up in app.py
login_manager = LoginManager()
login_manager.login_view = "auth_bp.login"  # redirect here if user must log in


@login_manager.user_loader
def load_user(user_id):
    """Flask-Login calls this to reload a user from session."""
    try:
        conn = get_conn()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, email, role, is_active
                FROM users
                WHERE id = %s
                LIMIT 1
                """,
                (user_id,),
            )
            row = cur.fetchone()
    except Exception as e:
        print("Error loading user:", e)
        return None

    if not row:
        return None

    return User(
        id=row["id"],
        email=row["email"],
        role=row["role"],
        is_active=row["is_active"],
    )


# -------------------------
# LOGIN ROUTE
# -------------------------
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":

        email = request.form.get("email", "").lower().strip()
        password = request.form.get("password", "")

        # Fetch user by email
        try:
            conn = get_conn()
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id, email, role, password_hash, is_active
                    FROM users
                    WHERE email = %s
                    LIMIT 1
                    """,
                    (email,),
                )
                row = cur.fetchone()
        except Exception as e:
            print("Error querying user:", e)
            flash("Internal error.")
            return redirect(url_for("auth_bp.login"))

        if not row:
            flash("Invalid email or password.")
            return redirect(url_for("auth_bp.login"))

        # Verify password
        if not check_password_hash(row["password_hash"], password):
            flash("Invalid email or password.")
            return redirect(url_for("auth_bp.login"))

        # Check active
        if not row["is_active"]:
            flash("Your account is disabled.")
            return redirect(url_for("auth_bp.login"))

        # Log in the user
        user = User(
            id=row["id"],
            email=row["email"],
            role=row["role"],
            is_active=row["is_active"],
        )
        login_user(user)

        return redirect(url_for("home"))  # Change if index is named differently

    return render_template("login.html")


# -------------------------
# LOGOUT ROUTE
# -------------------------
@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("home"))

