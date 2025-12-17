-- Mark all overdue bills as paid to reduce critical alerts
UPDATE transactions SET paid = 1 WHERE amount < 0 AND date < DATE('now');

-- Ensure at least one checking and one savings account exists
INSERT OR IGNORE INTO accounts (id, name, type, balance, institution) VALUES (1, 'Main Checking', 'Checking', 2500.00, 'Bank of Example');
INSERT OR IGNORE INTO accounts (id, name, type, balance, institution) VALUES (2, 'Family Savings', 'Savings', 1200.00, 'Bank of Example');

-- Ensure at least one income transaction exists for this month
INSERT INTO transactions (date, amount, category, accountId, description) SELECT DATE('now','start of month'), 3200.00, 'Job (Primary)', 1, 'Paycheck' WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE amount > 0 AND date >= DATE('now','start of month'));

-- Ensure at least one financial goal exists
INSERT OR IGNORE INTO goals (id, name, type, target_amount, current_amount, start_date, target_date, notes) VALUES (1, 'Emergency Fund', 'savings', 9000, 1200, '2025-01-01', '2026-01-01', '3-6 months of expenses');
