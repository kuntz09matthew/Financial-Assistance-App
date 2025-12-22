
import sqlite3
import datetime
import os

# Determine user database path (matches Electron backend)
appdata = os.getenv('APPDATA') or os.path.expanduser('~')
db_dir = os.path.join(appdata, 'Financial Assistance App')
db_path = os.path.join(db_dir, 'data.db')
if not os.path.exists(db_path):
    raise FileNotFoundError(f"User database not found at {db_path}. Please run the app once to initialize the database.")
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Find a checking or savings account to use for the deposit
c.execute("SELECT id FROM accounts WHERE type='Checking' OR type='Savings' ORDER BY id LIMIT 1;")
acc = c.fetchone()
acc_id = acc[0] if acc else 1  # Default to 1 if not found

# Add variable income sources to income_sources table
sources = [
    ('Freelance Writing', 'freelance', 'Alex', 'monthly', 350, 'Blog articles'),
    ('Side Consulting', 'freelance', 'Jamie', 'monthly', 250, 'Tech consulting'),
    ('Etsy Shop', 'freelance', 'Alex', 'monthly', 180, 'Handmade crafts'),
]
for name, type_, earner, freq, amt, notes in sources:
    c.execute('INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES (?, ?, ?, ?, ?, ?);',
              (name, type_, earner, freq, amt, notes))

# Insert variable income transactions for last 6 months

# Multi-year variable income history: 2023-2025
start_year = 2023
end_year = 2025
for year in range(start_year, end_year + 1):
    for month in range(1, 13):
        date_str = f"{year}-{month:02d}-01"
        # Freelance Writing: moderately variable
        amt_fw = 350 + ((month % 4) * 25) + (year - start_year) * 10
        c.execute('INSERT INTO transactions (accountId, date, amount, category, description) VALUES (?, ?, ?, ?, ?);',
                  (acc_id, date_str, amt_fw, 'freelance', 'Freelance Writing'))
        # Side Consulting: highly variable
        amt_sc = 250 + ((month % 6) * 40) + (year - start_year) * 15
        c.execute('INSERT INTO transactions (accountId, date, amount, category, description) VALUES (?, ?, ?, ?, ?);',
                  (acc_id, date_str, amt_sc, 'freelance', 'Side Consulting'))
        # Etsy Shop: stable
        amt_es = 180 + (year - start_year) * 5
        c.execute('INSERT INTO transactions (accountId, date, amount, category, description) VALUES (?, ?, ?, ?, ?);',
                  (acc_id, date_str, amt_es, 'freelance', 'Etsy Shop'))
        # Investment Income: stable
        c.execute('INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES (?, ?, ?, ?, ?, ?);',
                  ('Bond Interest', 'investment', 'Alex', 'monthly', 120, 'Stable bond interest'))
        c.execute('INSERT INTO transactions (accountId, date, amount, category, description) VALUES (?, ?, ?, ?, ?);',
                  (acc_id, date_str, 120, 'investment', 'Bond Interest'))
        # Other Income: highly variable
        c.execute('INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES (?, ?, ?, ?, ?, ?);',
                  ('Lottery Winnings', 'other', 'Jamie', 'monthly', 0, 'Occasional windfall'))
        amt_lo = 0 if month % 6 else 500 + (year - start_year) * 50
        c.execute('INSERT INTO transactions (accountId, date, amount, category, description) VALUES (?, ?, ?, ?, ?);',
                  (acc_id, date_str, amt_lo, 'other', 'Lottery Winnings'))

conn.commit()
conn.close()
print(f"Inserted variable income sources and transactions into user database: {db_path}")
