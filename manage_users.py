# manage_users.py
from getpass import getpass
from werkzeug.security import generate_password_hash
from db import get_conn

def create_user():
    print("Create a new user")
    email = input("Email: ").strip().lower()
    password = getpass("Password (input hidden): ")
    password_confirm = getpass("Confirm password: ")

    if password != password_confirm:
        print("Passwords do not match. Aborting.")
        return

    role = input("Role (viewer/editor/admin) [editor]: ").strip().lower()
    if role == "":
        role = "editor"

    if role not in ("viewer", "editor", "admin"):
        print("Invalid role. Use viewer/editor/admin.")
        return

    password_hash = generate_password_hash(password)

    conn = get_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (email, password_hash, role)
                    VALUES (%s, %s, %s)
                    RETURNING id;
                    """,
                    (email, password_hash, role),
                )
                user_id = cur.fetchone()['id']
        print(f"User created with id={user_id}, email={email}, role={role}")
    except Exception as e:
        print("Error creating user:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    create_user()
