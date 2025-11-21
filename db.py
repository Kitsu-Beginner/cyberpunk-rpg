# db.py
import os
import psycopg2
import psycopg2.extras


def get_conn():
    """
    Create and return a new PostgreSQL connection.

    Priority:
    1) If DATABASE_URL is set (e.g. on Render/Heroku), use that directly.
    2) Otherwise, use individual environment variables (local development).
    """
    db_url = os.environ.get("DATABASE_URL")

    if db_url:
        # Typical in hosted environments: full DSN URL
        return psycopg2.connect(
            db_url,
            cursor_factory=psycopg2.extras.RealDictCursor
        )

    # Local development fallback: use separate env vars with sensible defaults
    db_name = os.environ.get("DB_NAME", "Cyberpunk_rpg")
    db_user = os.environ.get("DB_USER", "postgres")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = int(os.environ.get("DB_PORT", "5432"))

    return psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port,
        cursor_factory=psycopg2.extras.RealDictCursor
    )
