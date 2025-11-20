# db.py
import psycopg2
import psycopg2.extras

DB_CONFIG = {
    "dbname": "Cyberpunk_rpg",
    "user": "postgres",
    "password": "CA-520sql",  # later we can move this to env vars
    "host": "localhost",
    "port": 5432,
}

def get_conn():
    return psycopg2.connect(**DB_CONFIG)
