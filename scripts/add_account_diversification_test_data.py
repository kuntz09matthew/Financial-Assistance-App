import sqlite3

# Add missing account types for diversification test data
conn = sqlite3.connect('assets/data.db')
c = conn.cursor()

# Add a retirement account if not present
c.execute("SELECT COUNT(*) FROM accounts WHERE type LIKE '%Retirement%'")
if c.fetchone()[0] == 0:

    import datetime
    now = datetime.datetime.now().isoformat(sep=' ', timespec='seconds')
    c.execute("INSERT INTO accounts (name, type, balance, institution, lastUpdated) VALUES (?, ?, ?, ?, ?)",
                  ('Family IRA', 'Retirement', 3500.00, 'Vanguard', now))

# Add an investment account if not present
c.execute("SELECT COUNT(*) FROM accounts WHERE type LIKE '%Investment%'")
if c.fetchone()[0] == 0:
    c.execute("INSERT INTO accounts (name, type, balance, institution, lastUpdated) VALUES (?, ?, ?, ?, ?)",
                  ('Brokerage', 'Investment', 2100.00, 'Fidelity', now))

conn.commit()
conn.close()
print('Added retirement and investment accounts for diversification test.')
