"""Список специалистов и свободные слоты расписания"""
import json
import os
import psycopg2

SCHEMA = "t_p60955846_expert_appointment_s"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "list")

    # action=slots&specialist_id=X&date=YYYY-MM-DD
    if action == "slots":
        specialist_id = params.get("specialist_id")
        date = params.get("date", "")
        if not specialist_id or not date:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите specialist_id и date"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, slot_time::text, is_booked FROM {SCHEMA}.schedules WHERE specialist_id = %s AND work_date = %s ORDER BY slot_time",
            (specialist_id, date)
        )
        rows = cur.fetchall()
        conn.close()
        slots = [{"id": r[0], "time": r[1][:5], "is_booked": r[2]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(slots)}

    # action=list (default) — все специалисты
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, name, specialty, experience_years, rating, reviews_count, price, emoji, is_available FROM {SCHEMA}.specialists ORDER BY is_available DESC, rating DESC"
    )
    rows = cur.fetchall()
    conn.close()
    specialists = [
        {
            "id": r[0], "name": r[1], "specialty": r[2],
            "experience_years": r[3], "rating": float(r[4]),
            "reviews_count": r[5], "price": r[6],
            "emoji": r[7], "is_available": r[8]
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(specialists)}
