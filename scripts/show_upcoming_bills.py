import sqlite3
import os

db_path = os.path.expanduser(r'C:/Users/kuntz/AppData/Roaming/Financial Assistance App/data.db')
db = sqlite3.connect(db_path)
c = db.cursor()
rows = c.execute("""
    SELECT id, date, amount, category, description FROM transactions
    WHERE date > date('now') AND date <= date('now', '+7 days') AND amount < 0
    ORDER BY date ASC
""").fetchall()
for row in rows:
    print(row)
db.close()
