import sqlite3
import datetime

# Connect to the database
conn = sqlite3.connect('assets/data.db')
c = conn.cursor()

# Find a checking or savings account to use for the paycheck deposit
c.execute("SELECT id FROM accounts WHERE type='Checking' OR type='Savings' ORDER BY id LIMIT 1;")
acc = c.fetchone()
acc_id = acc[0] if acc else 1  # Default to 1 if not found

# Calculate the next Friday from today
# (biweekly paychecks, but for test just add one upcoming)
today = datetime.date.today()
days_ahead = (4 - today.weekday() + 7) % 7
if days_ahead == 0:
    days_ahead = 7
next_friday = today + datetime.timedelta(days=days_ahead)

# Insert a realistic paycheck for a ~$60k/year family (biweekly: $60,000/26 ≈ $2307)
paycheck_amount = 2307.00
c.execute('INSERT INTO transactions (accountId, date, amount, category, description) VALUES (?, ?, ?, ?, ?);',
          (acc_id, next_friday.isoformat(), paycheck_amount, "Income", "Biweekly Paycheck"))

conn.commit()
conn.close()
print(f"Inserted paycheck for {next_friday} into account {acc_id}")
