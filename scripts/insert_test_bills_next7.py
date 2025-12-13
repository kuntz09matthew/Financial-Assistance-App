import sqlite3
import datetime
import os

# Use the user data path for the Electron app
db_path = os.path.expanduser(r'C:/Users/kuntz/AppData/Roaming/Financial Assistance App/data.db')
db = sqlite3.connect(db_path)
c = db.cursor()
today = datetime.date.today()
for i in range(1, 8):
    d = (today + datetime.timedelta(days=i)).isoformat()
    c.execute('INSERT INTO transactions (accountId, date, amount, category, description, paid, auto_pay) VALUES (?, ?, ?, ?, ?, ?, ?)',
              (1, d, -100*i, 'Test Bill', f'Bill due in {i} days', 0, 1 if i % 2 == 0 else 0))
db.commit()
db.close()
print('Inserted test bills for next 7 days.')
