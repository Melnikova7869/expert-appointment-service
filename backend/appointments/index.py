"""Запись на приём и история записей пользователя"""
import json
import os
import psycopg2

SCHEMA = "t_p60955846_expert_appointment_s"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_from_token(cur, token):
    cur.execute(
        f"SELECT u.id, u.full_name, u.phone FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > now()",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = (event.get("headers") or {}).get("X-Auth-Token", "")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # POST — создать запись
    if method == "POST":
        specialist_id = body.get("specialist_id")
        schedule_id = body.get("schedule_id")
        appointment_date = body.get("appointment_date")
        appointment_time = body.get("appointment_time")
        patient_name = body.get("patient_name", "").strip()
        patient_phone = body.get("patient_phone", "").strip()
        patient_comment = body.get("patient_comment", "")

        if not all([specialist_id, appointment_date, appointment_time, patient_name, patient_phone]):
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}

        conn = get_conn()
        cur = conn.cursor()

        if schedule_id:
            cur.execute(f"SELECT is_booked FROM {SCHEMA}.schedules WHERE id = %s", (schedule_id,))
            slot = cur.fetchone()
            if slot and slot[0]:
                conn.close()
                return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Это время уже занято, выберите другое"})}

        cur.execute(
            f"INSERT INTO {SCHEMA}.appointments (specialist_id, patient_name, patient_phone, patient_comment, appointment_date, appointment_time) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (specialist_id, patient_name, patient_phone, patient_comment, appointment_date, appointment_time)
        )
        appt_id = cur.fetchone()[0]

        if schedule_id:
            cur.execute(f"UPDATE {SCHEMA}.schedules SET is_booked = true WHERE id = %s", (schedule_id,))

        conn.commit()
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"id": appt_id, "status": "pending", "message": "Запись успешно создана!"})
        }

    # GET ?action=my — история записей авторизованного пользователя
    if method == "GET" and action == "my":
        if not token:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Требуется авторизация"})}

        conn = get_conn()
        cur = conn.cursor()
        user = get_user_from_token(cur, token)
        if not user:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

        user_id, full_name, phone = user
        cur.execute(
            f"""SELECT a.id, a.appointment_date::text, a.appointment_time::text, a.status,
                       a.patient_comment, s.name, s.specialty, s.emoji, s.price
                FROM {SCHEMA}.appointments a
                JOIN {SCHEMA}.specialists s ON s.id = a.specialist_id
                WHERE a.patient_name = %s OR (a.patient_phone = %s AND %s != '')
                ORDER BY a.appointment_date DESC, a.appointment_time DESC""",
            (full_name, phone or "", phone or "")
        )
        rows = cur.fetchall()
        conn.close()
        appointments = [
            {
                "id": r[0], "date": r[1], "time": r[2][:5], "status": r[3],
                "comment": r[4] or "",
                "specialist_name": r[5], "specialist_specialty": r[6],
                "specialist_emoji": r[7], "price": r[8]
            }
            for r in rows
        ]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(appointments)}

    # GET / — все записи
    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT a.id, a.patient_name, a.patient_phone, a.appointment_date::text,
                       a.appointment_time::text, a.status, a.patient_comment, s.name, s.specialty
                FROM {SCHEMA}.appointments a
                JOIN {SCHEMA}.specialists s ON s.id = a.specialist_id
                ORDER BY a.appointment_date, a.appointment_time"""
        )
        rows = cur.fetchall()
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps([
                {"id": r[0], "patient_name": r[1], "patient_phone": r[2],
                 "date": r[3], "time": r[4][:5], "status": r[5],
                 "comment": r[6] or "", "specialist_name": r[7], "specialty": r[8]}
                for r in rows
            ])
        }

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
