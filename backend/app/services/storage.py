"""Per-workspace SQLite report history. No raw images or API keys are stored.

Each browser stores a random workspace UUID locally and sends it with requests.
This is lightweight separation for a demonstration, NOT authentication or a
replacement for a private database and user login system.
"""
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(os.getenv('HISTORY_DB_PATH', str(Path(__file__).resolve().parents[2] / 'storage' / 'history.sqlite3')))


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.execute('''CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_key TEXT NOT NULL,
        kind TEXT NOT NULL,
        label TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )''')
    return connection


def save_report(kind: str, label: str, payload, workspace_key: str = ''):
    if not workspace_key:
        return
    if hasattr(payload, 'model_dump'):
        payload = payload.model_dump(mode='json')
    with connect() as conn:
        conn.execute(
            'INSERT INTO reports(workspace_key,kind,label,payload_json,created_at) VALUES(?,?,?,?,?)',
            (workspace_key, kind, label, json.dumps(payload), datetime.now(timezone.utc).isoformat())
        )
        conn.execute('''DELETE FROM reports WHERE id IN (
            SELECT id FROM reports WHERE workspace_key = ? ORDER BY id DESC LIMIT -1 OFFSET 200
        )''', (workspace_key,))


def recent_reports(limit=30, workspace_key=''):
    if not workspace_key:
        return []
    with connect() as conn:
        rows = conn.execute(
            '''SELECT id, kind, label, payload_json, created_at FROM reports
            WHERE workspace_key = ? ORDER BY id DESC LIMIT ?''',
            (workspace_key, limit)
        ).fetchall()
    return [{'id': row[0], 'kind': row[1], 'label': row[2],
             'payload': json.loads(row[3]), 'created_at': row[4]} for row in rows]
